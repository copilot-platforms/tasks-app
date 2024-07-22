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
  setShowModal,
} from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { Box, Stack, Typography, styled } from '@mui/material'
import { useEffect, useState } from 'react'
import { FilterOptions, IAssigneeCombined, ISignedUrlUpload, ITemplate } from '@/types/interfaces'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { useRouter } from 'next/navigation'
import { selectCreateTemplate } from '@/redux/features/templateSlice'
import { NoAssigneeExtraOptions } from '@/utils/noAssignee'
import ExtraOptionRendererAssignee from '@/components/inputs/ExtraOptionRendererAssignee'
import { upload } from '@vercel/blob/client'
import { AttachmentInput } from '@/components/inputs/AttachmentInput'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { generateRandomString } from '@/utils/generateRandomString'
import { AttachmentCard } from '@/components/cards/AttachmentCard'
import { bulkRemoveAttachments } from '@/utils/bulkRemoveAttachments'
import { advancedFeatureFlag } from '@/config'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { Tapwrite } from 'tapwrite'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { z } from 'zod'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { formatDate } from '@/utils/dateHelper'

const supabaseActions = new SupabaseActions()

export const NewTaskForm = ({
  handleCreate,
  getSignedUrlUpload,
}: {
  handleCreate: () => void
  getSignedUrlUpload: (fileName: string) => Promise<ISignedUrlUpload>
}) => {
  const { workflowStates, filteredAssigneeList, token, filterOptions } = useSelector(selectTaskBoard)
  const [filteredAssignees, setFilteredAssignees] = useState(filteredAssigneeList)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const { templates } = useSelector(selectCreateTemplate)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: workflowStates[0],
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item:
      filteredAssignees.find(
        (item) => item.id == filterOptions[FilterOptions.ASSIGNEE] || item.id == filterOptions[FilterOptions.TYPE],
      ) ?? null,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })
  const { renderingItem: _templateValue, updateRenderingItem: updateTemplateValue } = useHandleSelectorComponent({
    item: undefined, //initially we don't want any value to be selected
    type: SelectorType.TEMPLATE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting
  const templateValue = _templateValue as ITemplate //typecasting

  const router = useRouter()

  const todoWorkflowState = workflowStates.find((el) => el.key === 'todo') || workflowStates[0]

  useEffect(() => {
    function handleCloseModal(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        store.dispatch(setShowModal())
        store.dispatch(clearCreateTaskFields())
      }
    }

    document.addEventListener('keydown', handleCloseModal)

    return () => {
      document.removeEventListener('keydown', handleCloseModal)
    }
  }, [])

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
            <CloseIcon
              style={{ cursor: 'pointer' }}
              onClick={() => {
                store.dispatch(setShowModal())
                store.dispatch(clearCreateTaskFields())
              }}
            />
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
              placeholder="Change assignee"
              getSelectedValue={(_newValue) => {
                const newValue = _newValue as IAssigneeCombined
                updateAssigneeValue(newValue)
                store.dispatch(
                  setCreateTaskFields({
                    targetField: 'assigneeType',
                    value: getAssigneeTypeCorrected(newValue),
                  }),
                )
                store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: newValue?.id }))
              }}
              startIcon={assigneeValue ? <CopilotAvatar currentAssignee={assigneeValue} /> : <AssigneePlaceholderSmall />}
              options={loading ? [] : filteredAssignees}
              value={assigneeValue}
              //****Disabling re-assignment completely for now***
              // extraOption={NoAssigneeExtraOptions}
              // extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
              //   return (
              //     <>
              //       <ExtraOptionRendererAssignee
              //         props={props}
              //         onClick={(e) => {
              //           updateAssigneeValue({ id: '', name: 'No assignee' })
              //           setAnchorEl(anchorEl ? null : e.currentTarget)
              //           store.dispatch(setCreateTaskFields({ targetField: 'assigneeType', value: null }))
              //           store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: null }))
              //         }}
              //       />
              //       {loading && <MiniLoader />}
              //     </>
              //   )
              // }}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              handleInputChange={async (newInputValue: string) => {
                if (!newInputValue) {
                  setFilteredAssignees(filteredAssigneeList)
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
                    color: (theme) => theme.color.gray[600],
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    fontSize: '12px',
                    maxWidth: { xs: '60px', sm: '100px' },
                  }}
                >
                  {assigneeValue
                    ? (assigneeValue as IAssigneeCombined)?.name ||
                      `${(assigneeValue as IAssigneeCombined)?.givenName ?? ''} ${(assigneeValue as IAssigneeCombined)?.familyName ?? ''}`.trim()
                    : 'Assignee'}
                </Typography>
              }
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
                getDate={(value) =>
                  store.dispatch(setCreateTaskFields({ targetField: 'dueDate', value: formatDate(value) }))
                }
                isButton={true}
              />
            </Box>
          </Stack>
        </Stack>
      </AppMargin>
      <NewTaskFooter handleCreate={handleCreate} getSignedUrlUpload={getSignedUrlUpload} />
    </NewTaskContainer>
  )
}

const NewTaskFormInputs = () => {
  const { title, description, attachments } = useSelector(selectCreateTask)

  return (
    <>
      <Stack direction="column" rowGap={1}>
        <Typography variant="md">Task name</Typography>
        <StyledTextField
          type="text"
          padding="8px 0px"
          autoFocus={true}
          value={title}
          onChange={(e) => store.dispatch(setCreateTaskFields({ targetField: 'title', value: e.target.value }))}
        />
      </Stack>
      <Stack direction="column" rowGap={1} m="16px 0px">
        <Typography variant="md">Description</Typography>
        <Tapwrite
          uploadFn={async (file, tiptapEditorUtils) => {
            const newBlob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            })
            tiptapEditorUtils.setImage(newBlob.url as string)
          }}
          content={description}
          getContent={(content) => store.dispatch(setCreateTaskFields({ targetField: 'description', value: content }))}
          placeholder="Add description..."
          editorClass="tapwrite-task-description"
        />
      </Stack>
      <Stack direction="row" columnGap={2} m="16px 0px">
        {attachments?.map((el, key) => {
          return (
            <Box key={el.filePath}>
              <AttachmentCard
                file={el}
                deleteAttachment={async (event: React.MouseEvent<HTMLDivElement>) => {
                  event.stopPropagation()
                  const { data } = await supabaseActions.removeAttachment(el.filePath)
                  store.dispatch(removeOneAttachment({ attachment: el }))
                }}
              />
            </Box>
          )
        })}
      </Stack>
    </>
  )
}

const NewTaskFooter = ({
  handleCreate,
  getSignedUrlUpload,
}: {
  handleCreate: () => void
  getSignedUrlUpload: (fileName: string) => Promise<ISignedUrlUpload>
}) => {
  const { attachments } = useSelector(selectCreateTask)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(generateRandomString(file.name))
      const filePayload = await supabaseActions.uploadAttachment(file, signedUrl, '')
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
              handleClick={async () => {
                store.dispatch(setShowModal())
                store.dispatch(clearCreateTaskFields())
                await bulkRemoveAttachments(attachments)
              }}
              buttonContent={
                <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                  Cancel
                </Typography>
              }
            />
            <PrimaryBtn handleClick={handleCreate} buttonText="Create" />
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
