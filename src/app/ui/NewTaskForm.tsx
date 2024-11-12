import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { SelectorType } from '@/components/inputs/Selector'
import Selector from '@/components/inputs/Selector'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { ArrowLinkIcon, AssigneePlaceholderSmall, CloseIcon, TemplateIconSm } from '@/icons'
import {
  clearCreateTaskFields,
  removeOneAttachment,
  selectCreateTask,
  setCreateTaskFields,
  setErrors,
  setShowModal,
} from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { Box, Stack, Typography, styled } from '@mui/material'
import { useEffect, useState } from 'react'
import {
  CreateTaskErrors,
  FilterOptions,
  IAssigneeCombined,
  ISignedUrlUpload,
  ITemplate,
  HandleSelectorComponentModes,
} from '@/types/interfaces'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard, setAssigneeList } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { useRouter } from 'next/navigation'
import { selectCreateTemplate } from '@/redux/features/templateSlice'
import { NoAssigneeExtraOptions } from '@/utils/noAssignee'
import { upload } from '@vercel/blob/client'
import { AttachmentInput } from '@/components/inputs/AttachmentInput'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { generateRandomString } from '@/utils/generateRandomString'
import { bulkRemoveAttachments } from '@/utils/bulkRemoveAttachments'
import { advancedFeatureFlag } from '@/config'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { Tapwrite } from 'tapwrite'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { z } from 'zod'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { getAssigneeName } from '@/utils/assignee'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import AttachmentLayout from '@/components/AttachmentLayout'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'

const supabaseActions = new SupabaseActions()

interface NewTaskFormProps {
  handleCreate: () => void
  handleClose: ({ triggeredFrom }: { triggeredFrom: 'MOUSE' | 'KEYBOARD' }) => void
  getSignedUrlUpload: (fileName: string) => Promise<ISignedUrlUpload>
}

export const NewTaskForm = ({ handleCreate, handleClose, getSignedUrlUpload }: NewTaskFormProps) => {
  const { activeWorkflowStateId, errors } = useSelector(selectCreateTask)
  const { workflowStates, assignee, token, filterOptions } = useSelector(selectTaskBoard)
  const [filteredAssignees, setFilteredAssignees] = useState(assignee)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const { templates } = useSelector(selectCreateTemplate)

  const todoWorkflowState = workflowStates.find((el) => el.key === 'todo') || workflowStates[0]
  const defaultWorkflowState = activeWorkflowStateId
    ? workflowStates.find((state) => state.id === activeWorkflowStateId)
    : todoWorkflowState

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: defaultWorkflowState,
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item:
      filteredAssignees.find(
        (item) => item.id == filterOptions[FilterOptions.ASSIGNEE] || item.id == filterOptions[FilterOptions.TYPE],
      ) ?? null,
    type: SelectorType.ASSIGNEE_SELECTOR,
    mode: HandleSelectorComponentModes.CreateTaskFieldUpdate,
  })
  const { renderingItem: _templateValue, updateRenderingItem: updateTemplateValue } = useHandleSelectorComponent({
    item: undefined, //initially we don't want any value to be selected
    type: SelectorType.TEMPLATE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting
  const templateValue = _templateValue as ITemplate //typecasting
  // use temp state pattern so that we don't fall into an infinite loop of assigneeValue set -> trigger -> set
  const [tempAssignee, setTempAssignee] = useState<IAssigneeCombined | null>(assigneeValue)

  const [inputStatusValue, setInputStatusValue] = useState('')

  const handleCreateWithAssignee = () => {
    if (!!tempAssignee?.id && !assignee.find((assignee) => assignee.id === tempAssignee.id)) {
      store.dispatch(setAssigneeList([...assignee, tempAssignee]))
    }
    handleCreate()
  }
  const router = useRouter()

  useEffect(() => {
    function handleEscPress(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose({ triggeredFrom: 'MOUSE' })
      }
    }
    document.addEventListener('keydown', handleEscPress)
    return () => {
      document.removeEventListener('keydown', handleEscPress)
    }
  }, [handleClose])

  return (
    <NewTaskContainer>
      <Stack
        sx={{
          border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
        }}
      >
        <AppMargin size={SizeofAppMargin.MEDIUM} py="12px">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              {advancedFeatureFlag && (
                <Selector
                  inputStatusValue={inputStatusValue}
                  setInputStatusValue={setInputStatusValue}
                  getSelectedValue={(_newValue) => {
                    const newValue = _newValue as ITemplate
                    updateTemplateValue(newValue)
                    store.dispatch(setCreateTaskFields({ targetField: 'title', value: newValue?.title }))
                    store.dispatch(setCreateTaskFields({ targetField: 'description', value: newValue?.body }))
                    updateStatusValue(todoWorkflowState)
                  }}
                  startIcon={<TemplateIconSm />}
                  options={templates}
                  placeholder="Apply template..."
                  value={templateValue}
                  selectorType={SelectorType.TEMPLATE_SELECTOR}
                  extraOption={{
                    id: '',
                    name: 'Manage templates',
                    value: '',
                    extraOptionFlag: true,
                  }}
                  extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                    return (
                      <Stack
                        key={'Manage templates'}
                        direction="row"
                        pl="20px"
                        py="6px"
                        justifyContent="space-between"
                        sx={{
                          borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setAnchorEl(null)
                          store.dispatch(setShowModal())
                          router.push(`/manage-templates?token=${token}`)
                        }}
                      >
                        <Typography variant="sm">Manage templates</Typography>
                        <Box>
                          <ArrowLinkIcon />
                        </Box>
                      </Stack>
                    )
                  }}
                  buttonContent={
                    <Typography variant="bodySm" sx={{ color: (theme) => theme.color.gray[600] }}>
                      {templateValue ? templateValue.templateName : 'Select template'}
                    </Typography>
                  }
                />
              )}
            </Box>
            <CloseIcon style={{ cursor: 'pointer' }} onClick={() => handleClose({ triggeredFrom: 'MOUSE' })} />
          </Stack>
        </AppMargin>
      </Stack>

      <AppMargin size={SizeofAppMargin.MEDIUM} py="16px">
        <NewTaskFormInputs />

        <Stack direction="row" columnGap={3} position="relative" sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ padding: 0.1 }}>
            <WorkflowStateSelector
              option={workflowStates}
              value={statusValue}
              getValue={(value) => {
                updateStatusValue(value)
                store.dispatch(setCreateTaskFields({ targetField: 'workflowStateId', value: value.id }))
              }}
            />
          </Box>
          <Stack alignSelf="flex-start">
            <Selector
              inputStatusValue={inputStatusValue}
              setInputStatusValue={setInputStatusValue}
              placeholder="Set assignee"
              getSelectedValue={(_newValue) => {
                store.dispatch(setErrors({ key: CreateTaskErrors.ASSIGNEE, value: false }))
                const newValue = _newValue as IAssigneeCombined
                setTempAssignee(newValue)
                updateAssigneeValue(newValue)
                store.dispatch(
                  setCreateTaskFields({
                    targetField: 'assigneeType',
                    value: getAssigneeTypeCorrected(newValue),
                  }),
                )
                store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: newValue?.id }))
              }}
              startIcon={tempAssignee ? <CopilotAvatar currentAssignee={tempAssignee} /> : <AssigneePlaceholderSmall />}
              onClick={() => {
                if (activeDebounceTimeoutId) {
                  clearTimeout(activeDebounceTimeoutId)
                }
                setLoading(true)
                setFilteredAssignees(assignee)
                setLoading(false)
              }}
              options={loading ? [] : filteredAssignees}
              value={tempAssignee}
              extraOption={NoAssigneeExtraOptions}
              extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                return (
                  <>
                    {/* //****Disabling re-assignment completely for now*** */}
                    {/* <ExtraOptionRendererAssignee
                      props={props}
                      onClick={(e) => {
                        updateAssigneeValue({ id: '', name: 'No assignee' })
                        setAnchorEl(anchorEl ? null : e.currentTarget)
                        store.dispatch(setCreateTaskFields({ targetField: 'assigneeType', value: null }))
                        store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: null }))
                      }}
                    /> */}
                    {loading && <MiniLoader />}
                  </>
                )
              }}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              handleInputChange={async (newInputValue: string) => {
                if (!newInputValue) {
                  setFilteredAssignees(assignee)
                  return
                }
                setDebouncedFilteredAssignees(
                  activeDebounceTimeoutId,
                  setActiveDebounceTimeoutId,
                  setLoading,
                  setFilteredAssignees,
                  z.string().parse(token),
                  newInputValue,
                )
              }}
              filterOption={(x: unknown) => x}
              buttonHeight="auto"
              buttonContent={
                <Typography
                  variant="bodySm"
                  sx={{
                    color: (theme) => (tempAssignee ? theme.color.gray[600] : theme.color.gray[550]),
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',

                    overflow: 'hidden',
                    fontSize: '12px',
                    maxWidth: { xs: '60px', sm: '100px' },
                  }}
                >
                  {getAssigneeName(tempAssignee as IAssigneeCombined, 'Assignee')}
                </Typography>
              }
              error={errors.assignee}
            />
          </Stack>
          <Stack alignSelf="flex-start">
            <Box
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: { xs: '102px', sm: 'none' },
              }}
            >
              <DatePickerComponent
                getDate={(value) => store.dispatch(setCreateTaskFields({ targetField: 'dueDate', value: value as string }))}
                isButton={true}
              />
            </Box>
          </Stack>
        </Stack>
      </AppMargin>
      <NewTaskFooter
        handleCreate={handleCreateWithAssignee}
        handleClose={handleClose}
        getSignedUrlUpload={getSignedUrlUpload}
      />
    </NewTaskContainer>
  )
}

const NewTaskFormInputs = () => {
  const { title, description, attachments } = useSelector(selectCreateTask)
  const { errors } = useSelector(selectCreateTask)
  const { token } = useSelector(selectTaskBoard)

  const handleDetailChange = (content: string) =>
    store.dispatch(setCreateTaskFields({ targetField: 'description', value: content }))

  return (
    <>
      <Stack direction="column" rowGap={1}>
        <Typography variant="md">Task name</Typography>
        <StyledTextField
          type="text"
          padding="8px 0px"
          autoFocus={true}
          value={title}
          onChange={(e) => {
            store.dispatch(setCreateTaskFields({ targetField: 'title', value: e.target.value }))
            store.dispatch(setErrors({ key: CreateTaskErrors.TITLE, value: false }))
          }}
          error={errors.title}
          helperText={errors.title && 'Required'}
          inputProps={{
            maxLength: 255,
          }}
        />
      </Stack>
      <Stack direction="column" rowGap={1} m="16px 0px">
        <Typography variant="md">Description</Typography>
        <Tapwrite
          content={description}
          getContent={handleDetailChange}
          placeholder="Add description..."
          editorClass="tapwrite-task-description"
          uploadFn={(file) => uploadImageHandler(file, token ?? '', null)}
          deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', null)}
          attachmentLayout={AttachmentLayout}
          maxUploadLimit={MAX_UPLOAD_LIMIT}
        />
      </Stack>
    </>
  )
}

const NewTaskFooter = ({ handleCreate, handleClose, getSignedUrlUpload }: NewTaskFormProps) => {
  const { attachments, title, assigneeId } = useSelector(selectCreateTask)
  const { filterOptions } = useSelector(selectTaskBoard)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(generateRandomString(file.name))
      const { filePayload, error } = await supabaseActions.uploadAttachment(file, signedUrl, '')
      if (error) {
        console.error('Failed to upload image') //handle error through chip here in the future
      }
      if (filePayload) {
        store.dispatch(setCreateTaskFields({ targetField: 'attachments', value: [...attachments, filePayload] }))
      }
    }
  }

  return (
    <Box sx={{ borderTop: (theme) => `1px solid ${theme.color.borders.border2}` }}>
      <AppMargin size={SizeofAppMargin.MEDIUM} py="21px">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>{advancedFeatureFlag && <AttachmentInput handleFileSelect={handleFileSelect} />}</Box>
          <Stack direction="row" columnGap={4}>
            <SecondaryBtn
              handleClick={() => handleClose({ triggeredFrom: 'MOUSE' })}
              buttonContent={
                <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                  Cancel
                </Typography>
              }
            />
            <PrimaryBtn
              handleClick={() => {
                const hasTitleError = !title.trim()
                const hasAssigneeError = !assigneeId
                if (hasTitleError || hasAssigneeError) {
                  hasTitleError && store.dispatch(setErrors({ key: CreateTaskErrors.TITLE, value: true }))
                  hasAssigneeError && store.dispatch(setErrors({ key: CreateTaskErrors.ASSIGNEE, value: true }))
                } else {
                  handleCreate()
                }
              }}
              buttonText="Create"
            />
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}

const NewTaskContainer = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  background: '#ffffff',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: '0px 16px 70px 0px rgba(0, 0, 0, 0.5)',
  border: `1px solid ${theme.color.borders.border2}`,
  borderRadius: '4px',
  width: '95%',
  maxWidth: '650px',
}))
