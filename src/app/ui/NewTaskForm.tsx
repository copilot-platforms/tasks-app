import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { ArrowLinkIcon, ArrowRightIcon, AssigneePlaceholderSmall, CloseIcon, TemplateIconSm } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectCreateTask, setCreateTaskFields, setErrors, setShowModal } from '@/redux/features/createTaskSlice'
import { selectTaskBoard, setAssigneeList } from '@/redux/features/taskBoardSlice'
import { selectCreateTemplate } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import {
  CreateTaskErrors,
  FilterOptions,
  HandleSelectorComponentModes,
  IAssigneeCombined,
  ITemplate,
} from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import { NoAssigneeExtraOptions } from '@/utils/noAssignee'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { Box, Link, Stack, Typography, styled } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'
import { z } from 'zod'
import AttachmentLayout from '@/components/AttachmentLayout'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { ArrowRight } from '@mui/icons-material'

interface NewTaskFormProps {
  handleCreate: () => void
  handleClose: () => void
}

export const NewTaskForm = ({ handleCreate, handleClose }: NewTaskFormProps) => {
  const { activeWorkflowStateId, errors } = useSelector(selectCreateTask)
  const { workflowStates, assignee, token, filterOptions } = useSelector(selectTaskBoard)
  const [filteredAssignees, setFilteredAssignees] = useState(assignee)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)

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

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting
  // use temp state pattern so that we don't fall into an infinite loop of assigneeValue set -> trigger -> set
  const [tempAssignee, setTempAssignee] = useState<IAssigneeCombined | null>(assigneeValue)

  const [inputStatusValue, setInputStatusValue] = useState('')

  const handleCreateWithAssignee = () => {
    if (!!tempAssignee?.id && !assignee.find((assignee) => assignee.id === tempAssignee.id)) {
      store.dispatch(setAssigneeList([...assignee, tempAssignee]))
    }
    handleCreate()
  }

  useEffect(() => {
    function handleEscPress(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose()
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
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <CloseIcon style={{ cursor: 'pointer' }} onClick={() => handleClose()} />
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
      <NewTaskFooter handleCreate={handleCreateWithAssignee} handleClose={handleClose} />
    </NewTaskContainer>
  )
}

const NewTaskFormInputs = () => {
  const { title, description } = useSelector(selectCreateTask)
  const { errors } = useSelector(selectCreateTask)
  const { token } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)

  const handleDetailChange = (content: string) =>
    store.dispatch(setCreateTaskFields({ targetField: 'description', value: content }))

  const uploadFn =
    token && tokenPayload?.workspaceId
      ? (file: File) => uploadImageHandler(file, token, tokenPayload.workspaceId, null)
      : undefined

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
          uploadFn={uploadFn}
          deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', null)}
          attachmentLayout={AttachmentLayout}
          maxUploadLimit={MAX_UPLOAD_LIMIT}
          parentContainerStyle={{ gap: '0px' }}
        />
      </Stack>
    </>
  )
}

const NewTaskFooter = ({ handleCreate, handleClose }: NewTaskFormProps) => {
  const [inputStatusValue, setInputStatusValue] = useState('')

  const { title, assigneeId } = useSelector(selectCreateTask)
  const { token } = useSelector(selectTaskBoard)
  const { templates } = useSelector(selectCreateTemplate)
  const { renderingItem: _templateValue, updateRenderingItem: updateTemplateValue } = useHandleSelectorComponent({
    item: undefined, //initially we don't want any value to be selected
    type: SelectorType.TEMPLATE_SELECTOR,
  })
  const templateValue = _templateValue as ITemplate //typecasting

  const ManageTemplatesEndOption = () => {
    // IMPORTANT: keep this for the meanwhile to deal with Manage Templates btn click
    // useEffect(() => {
    //   const manageTemplatesBtn = document.getElementById('manage-templates-btn')
    //   const handler = () => {
    //   }
    //   manageTemplatesBtn?.addEventListener('mouseover', handler)
    //   manageTemplatesBtn?.addEventListener('click', handler)
    //   return () => {
    //     document.removeEventListener('mouseover', handler)
    //     document.removeEventListener('click', handler)
    //   }
    // }, [])

    return (
      <Stack
        id="manage-templates-btn"
        key={'Manage templates'}
        direction="row"
        pl="20px"
        py="6px"
        justifyContent="space-between"
        sx={{
          borderTop: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
          borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
          cursor: 'pointer',
          lineHeight: '21px',
          ':hover': (theme) => ({
            zIndex: '999',
            bgcolor: theme.color.background.bgHover,
          }),
        }}
      >
        <Typography variant="sm">
          <Box display="flex" gap="4px" alignItems="center">
            Manage templates
            <ArrowRightIcon />
          </Box>
        </Typography>
      </Stack>
    )
  }

  return (
    <Box sx={{ borderTop: (theme) => `1px solid ${theme.color.borders.border2}` }}>
      <AppMargin size={SizeofAppMargin.MEDIUM} py="21px">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Selector
            inputStatusValue={inputStatusValue}
            setInputStatusValue={setInputStatusValue}
            getSelectedValue={(_newValue) => {
              const newValue = _newValue as ITemplate
              updateTemplateValue(newValue)
            }}
            startIcon={<TemplateIconSm />}
            options={templates || []}
            placeholder="Search..."
            value={templateValue}
            selectorType={SelectorType.TEMPLATE_SELECTOR}
            endOption={<ManageTemplatesEndOption />}
            endOptionHref={`/manage-templates?token=${token}`}
            listAutoHeightMax="147px"
            buttonContent={
              <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[600] }}>
                {'Apply template'}
              </Typography>
            }
          />
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <Stack direction="row" columnGap={4}>
              <SecondaryBtn
                handleClick={() => handleClose()}
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
        </Box>
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
