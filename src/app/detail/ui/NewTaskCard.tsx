import { UserRole } from '@/app/api/core/types/user'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import AttachmentLayout from '@/components/AttachmentLayout'
import { ManageTemplatesEndOption } from '@/components/buttons/ManageTemplatesEndOptions'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { SelectorButton } from '@/components/buttons/SelectorButton'
import { CopilotPopSelector } from '@/components/inputs/CopilotSelector'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { StyledTextField } from '@/components/inputs/TextField'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { PersonIconSmall, TempalteIconMd } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectCreateTemplate } from '@/redux/features/templateSlice'
import { DateString } from '@/types/date'
import { CreateTaskRequest, Viewers } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { FilterByOptions, FilterOptions, IAssigneeCombined, ITemplate, UserIds } from '@/types/interfaces'
import { getAssigneeName, UserIdsType } from '@/utils/assignee'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import {
  getSelectedUserIds,
  getSelectedViewerIds,
  getSelectorAssignee,
  getSelectorAssigneeFromFilterOptions,
} from '@/utils/selector'
import { trimAllTags } from '@/utils/trimTags'
import { Box, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'

interface SubTaskFields {
  title: string
  description: string
  workflowStateId: string
  userIds: UserIdsType
  dueDate: DateString | null
  viewers?: Viewers
}

export const NewTaskCard = ({
  handleClose,
  handleSubTaskCreation,
}: {
  handleClose: () => void
  handleSubTaskCreation: (payload: CreateTaskRequest) => void
}) => {
  const { workflowStates, assignee, token, activeTask, previewMode, filterOptions } = useSelector(selectTaskBoard)
  const { templates } = useSelector(selectCreateTemplate)

  const [isEditorReadonly, setIsEditorReadonly] = useState(false)

  const assigneeIds = previewMode
    ? {
        [UserIds.INTERNAL_USER_ID]: null,
        [UserIds.CLIENT_ID]: filterOptions[FilterOptions.ASSIGNEE][UserIds.CLIENT_ID],
        [UserIds.COMPANY_ID]: filterOptions[FilterOptions.ASSIGNEE][UserIds.COMPANY_ID],
      }
    : {
        [UserIds.INTERNAL_USER_ID]: null,
        [UserIds.CLIENT_ID]: null,
        [UserIds.COMPANY_ID]: null,
      }

  const { tokenPayload } = useSelector(selectAuthDetails)
  const [subTaskFields, setSubTaskFields] = useState<SubTaskFields>({
    title: '',
    description: '',
    workflowStateId: '',
    userIds: assigneeIds,
    dueDate: null,
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)

  const clearSubTaskFields = () => {
    setSubTaskFields((prev) => ({
      ...prev,
      title: '',
      description: '',
      workflowStateId: todoWorkflowState.id,
      userIds: assigneeIds,
      dueDate: null,
      viewers: [],
    }))
    updateStatusValue(todoWorkflowState)
    setAssigneeValue(null)
  }

  const handleFieldChange = (field: keyof SubTaskFields, value: string | DateString | null | UserIdsType | Viewers) => {
    setSubTaskFields((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const uploadFn =
    token && tokenPayload?.workspaceId
      ? (file: File) => uploadImageHandler(file, token, tokenPayload.workspaceId, null)
      : undefined

  const todoWorkflowState = workflowStates.find((el) => el.key === 'todo') || workflowStates[0]

  useEffect(() => {
    handleFieldChange('workflowStateId', todoWorkflowState.id)
  }, [todoWorkflowState])

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: todoWorkflowState,
    type: SelectorType.STATUS_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse

  const { renderingItem: _templateValue, updateRenderingItem: updateTemplateValue } = useHandleSelectorComponent({
    item: undefined,
    type: SelectorType.TEMPLATE_SELECTOR,
  })
  const templateValue = _templateValue as ITemplate

  const [inputStatusValue, setInputStatusValue] = useState('')

  const handleUploadStatusChange = (uploading: boolean) => {
    setIsUploading(uploading)
  }

  const [assigneeValue, setAssigneeValue] = useState<IAssigneeCombined | null>(
    previewMode
      ? (getSelectorAssigneeFromFilterOptions(
          assignee,
          filterOptions[FilterOptions.ASSIGNEE],
          filterOptions[FilterOptions.TYPE],
        ) ?? null)
      : null,
  )
  const [taskViewerValue, setTaskViewerValue] = useState<IAssigneeCombined | null>(null)

  const applyTemplate = useCallback(
    (id: string, templateTitle: string) => {
      const controller = new AbortController()

      const fetchTemplate = async () => {
        try {
          setIsEditorReadonly?.(true)

          if (!subTaskFields.title.trim()) {
            setSubTaskFields((prev) => ({
              ...prev,
              title: templateTitle,
            }))
          } else {
            setSubTaskFields((prev) => ({
              ...prev,
              title: prev.title + ' ' + templateTitle,
            }))
          }
          const resp = await fetch(`/api/tasks/templates/${id}/apply?token=${token}`, {
            signal: controller.signal,
          })
          const { data: template } = await resp.json()
          setIsEditorReadonly?.(false)

          updateStatusValue(workflowStates.find((state) => state.id === template.workflowStateId))
          setSubTaskFields((prev) => ({
            ...prev,
            workflowStateId: template.workflowStateId,
          }))
          const trimmedAppliedDescription = template.description && trimAllTags(template.description)
          const trimmedDescription = trimAllTags(subTaskFields.description)
          if (trimmedAppliedDescription == trimmedDescription || trimmedDescription === '<p></p>') {
            setSubTaskFields((prev) => ({
              ...prev,
              description: template.body,
            }))
          } else {
            setSubTaskFields((prev) => ({
              ...prev,
              description: prev.description + template.body,
            }))
          }
        } catch (error) {
          console.error('error applying template')
        } finally {
          setIsEditorReadonly?.(false)
        }
      }
      fetchTemplate()
      return controller
    },
    [token, setIsEditorReadonly, workflowStates, subTaskFields.title, subTaskFields.description, updateStatusValue],
  )

  const applyTemplateHandler = (newValue: ITemplate) => {
    if (!newValue || !token) return
    const controller = applyTemplate(newValue.id, newValue.title)
    return () => {
      controller.abort()
    }
  }

  const handleTaskCreation = async () => {
    if (!subTaskFields.title.trim()) return

    const formattedDueDate = subTaskFields.dueDate && dayjs(new Date(subTaskFields.dueDate)).format('YYYY-MM-DD')
    const payload: CreateTaskRequest = {
      title: subTaskFields.title,
      body: subTaskFields.description,
      workflowStateId: subTaskFields.workflowStateId,
      internalUserId: subTaskFields.userIds[UserIds.INTERNAL_USER_ID],
      clientId: subTaskFields.userIds[UserIds.CLIENT_ID],
      companyId: subTaskFields.userIds[UserIds.COMPANY_ID],
      dueDate: formattedDueDate,
      parentId: activeTask?.id,
      ...(subTaskFields?.viewers && subTaskFields.viewers.length > 0 && { viewers: subTaskFields.viewers }),
    }

    handleSubTaskCreation(payload)
    clearSubTaskFields()
    handleClose()
  }

  return (
    <Stack
      direction="column"
      sx={{
        display: 'flex',
        padding: '12px 0px',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        borderRadius: '4px',
        border: (theme) => `1px solid ${theme.color.borders.border}`,
        boxShadow: '0px 6px 20px 0px rgba(0,0,0, 0.07)',
      }}
    >
      <Stack
        direction="column"
        sx={{ display: 'flex', padding: '0px 12px 12px', alignItems: 'center', gap: '4px', alignSelf: 'stretch' }}
      >
        <Stack direction="row" sx={{ display: 'flex', alignItems: 'flex-end', gap: '4px', alignSelf: 'stretch' }}>
          <StyledTextField
            inputRef={inputRef}
            type="text"
            multiline
            autoFocus={true}
            borderLess
            sx={{
              width: '100%',
              '& .MuiInputBase-input': {
                fontSize: '16px',
                lineHeight: '24px',
                color: (theme) => theme.color.gray[600],
                fontWeight: 500,
              },
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: (theme) => theme.color.gray[600],
              },
              '& .MuiInputBase-root': {
                padding: '0px 0px',
              },
            }}
            placeholder="Task name"
            value={subTaskFields.title}
            onChange={(event) => {
              handleFieldChange('title', event.target.value)
            }}
            inputProps={{ maxLength: 255 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault() //prevent users from breaking line
              }
            }}
            disabled={isEditorReadonly}
          />

          <Selector
            padding="5px"
            inputStatusValue={inputStatusValue}
            setInputStatusValue={setInputStatusValue}
            getSelectedValue={(_newValue) => {
              const newValue = _newValue as ITemplate
              updateTemplateValue(newValue)
              applyTemplateHandler(newValue)
            }}
            startIcon={<TempalteIconMd />}
            options={templates || []}
            placeholder="Search..."
            value={templateValue}
            selectorType={SelectorType.TEMPLATE_SELECTOR}
            endOption={<ManageTemplatesEndOption hasTemplates={!!templates?.length} />}
            endOptionHref={`/manage-templates?token=${token}`}
            listAutoHeightMax="147px"
            variant="normal"
            responsiveNoHide
            buttonWidth="auto"
            useClickHandler
          />
        </Stack>

        <Box sx={{ height: '100%', width: '100%' }}>
          <Tapwrite
            content={subTaskFields.description}
            getContent={(content) => handleFieldChange('description', content)}
            placeholder="Add description.."
            editorClass="tapwrite-task-editor"
            uploadFn={uploadFn}
            deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', null, null)}
            attachmentLayout={(props) => (
              <AttachmentLayout {...props} isComment={true} onUploadStatusChange={handleUploadStatusChange} />
            )}
            maxUploadLimit={MAX_UPLOAD_LIMIT}
            parentContainerStyle={{ gap: '0px' }}
            readonly={isEditorReadonly}
          />
        </Box>
      </Stack>
      <Stack
        direction="row"
        columnGap={'24px'}
        rowGap={'12px'}
        sx={{
          display: 'flex',
          padding: '0px 12px',
          alignItems: 'center',
          alignSelf: 'stretch',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Stack
          direction="row"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'stretch',
            flexWrap: 'wrap',
          }}
        >
          <WorkflowStateSelector
            option={workflowStates}
            value={statusValue}
            getValue={(value) => {
              updateStatusValue(value)
              handleFieldChange('workflowStateId', value.id)
            }}
            padding={'0px 4px'}
            height={'28px'}
            gap={'6px'}
          />
          <DatePickerComponent
            padding={'0px 4px'}
            height={'28px'}
            getDate={(value) => handleFieldChange('dueDate', value)}
            variant="button"
            dateValue={subTaskFields.dueDate ?? undefined}
          />
          <CopilotPopSelector
            disabled={!!previewMode}
            name="Set assignee"
            onChange={(inputValue) => {
              // remove task viewers if assignee is cleared or changed to client or company
              if (inputValue.length === 0 || inputValue[0].object !== UserRole.IU) {
                setTaskViewerValue(null)
                handleFieldChange('viewers', [])
              }
              const newUserIds = getSelectedUserIds(inputValue)
              const selectedAssignee = getSelectorAssignee(assignee, inputValue)
              setAssigneeValue(selectedAssignee || null)
              handleFieldChange('userIds', newUserIds)
            }}
            initialValue={assigneeValue || undefined}
            buttonContent={
              <SelectorButton
                disabled={!!previewMode}
                padding="0px 4px"
                height="28px"
                buttonContent={
                  <Stack direction="row" alignItems={'center'} columnGap={'6px'} height="26px">
                    {assigneeValue ? <CopilotAvatar currentAssignee={assigneeValue} /> : <PersonIconSmall />}
                    <Typography
                      variant="bodySm"
                      sx={{
                        color: (theme) => (assigneeValue ? theme.color.gray[600] : theme.color.text.textDisabled),
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '22px',
                        overflow: 'hidden',
                        fontSize: '14px',
                        maxWidth: '120px',
                      }}
                    >
                      {getAssigneeName(assigneeValue as IAssigneeCombined, 'Assignee')}
                    </Typography>
                  </Stack>
                }
              />
            }
          />
          {assigneeValue && assigneeValue.type === FilterByOptions.IUS && (
            <CopilotPopSelector
              hideIusList
              hideCompanysList
              disabled={!!previewMode}
              name="Set client visibility"
              onChange={(inputValue) => {
                const newUserIds = getSelectedViewerIds(inputValue)
                const selectedAssignee = getSelectorAssignee(assignee, inputValue)
                setTaskViewerValue(selectedAssignee || null)
                handleFieldChange('viewers', newUserIds)
              }}
              initialValue={taskViewerValue || undefined}
              buttonContent={
                <SelectorButton
                  disabled={!!previewMode}
                  padding="0px 4px"
                  height="28px"
                  buttonContent={
                    <Stack direction="row" alignItems={'center'} columnGap={'6px'} height="26px">
                      {taskViewerValue ? <CopilotAvatar currentAssignee={taskViewerValue} /> : <PersonIconSmall />}
                      <Typography
                        variant="bodySm"
                        sx={{
                          color: (theme) => (taskViewerValue ? theme.color.gray[600] : theme.color.text.textDisabled),
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: '22px',
                          overflow: 'hidden',
                          fontSize: '14px',
                          maxWidth: '120px',
                        }}
                      >
                        {getAssigneeName(taskViewerValue as IAssigneeCombined, 'Client visibility')}
                      </Typography>
                    </Stack>
                  }
                />
              }
            />
          )}
        </Stack>
        <Stack
          direction="row"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            alignSelf: 'stretch',

            marginLeft: 'auto',
          }}
        >
          <SecondaryBtn
            padding={'3px 8px'}
            handleClick={handleClose}
            buttonContent={
              <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                Discard
              </Typography>
            }
          />
          <PrimaryBtn
            padding={'3px 8px'}
            handleClick={handleTaskCreation}
            buttonText="Create"
            disabled={!subTaskFields.title.trim() || isUploading || isEditorReadonly}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
