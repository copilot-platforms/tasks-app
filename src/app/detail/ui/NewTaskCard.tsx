import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import AttachmentLayout from '@/components/AttachmentLayout'
import { ManageTemplatesEndOption } from '@/components/buttons/ManageTemplatesEndOptions'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { StyledTextField } from '@/components/inputs/TextField'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { AssigneePlaceholderSmall, TempalteIconMd } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { selectCreateTemplate } from '@/redux/features/templateSlice'
import { DateString } from '@/types/date'
import { AssigneeTypeSchema, CreateTaskRequest } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { AssigneeType, CreateTaskErrors, IAssigneeCombined, ITemplate } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import { NoAssigneeExtraOptions } from '@/utils/noAssignee'
import { trimAllTags } from '@/utils/trimTags'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { Box, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'
import { z } from 'zod'

interface IErrors {
  [CreateTaskErrors.ASSIGNEE]: boolean
}

interface SubTaskFields {
  title: string
  description: string
  workflowStateId: string
  assigneeId: string | null
  dueDate: DateString | null
  errors: IErrors
  assigneeType?: AssigneeType | null
}

export const NewTaskCard = ({
  handleClose,
  handleSubTaskCreation,
}: {
  handleClose: () => void
  handleSubTaskCreation: (payload: CreateTaskRequest) => void
}) => {
  const { workflowStates, assignee, token, filterOptions, previewMode, activeTask } = useSelector(selectTaskBoard)
  const { assigneeListForLimitedTasks } = useSelector(selectTaskDetails)

  const { templates } = useSelector(selectCreateTemplate)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)

  const [isEditorReadonly, setIsEditorReadonly] = useState(false)

  const { tokenPayload } = useSelector(selectAuthDetails)
  const [subTaskFields, setSubTaskFields] = useState<SubTaskFields>({
    title: '',
    description: '',
    workflowStateId: '',
    assigneeId: '',
    dueDate: null,
    errors: {
      [CreateTaskErrors.ASSIGNEE]: false,
    },
    assigneeType: null,
  })

  const [filteredAssignees, setFilteredAssignees] = useState(
    assigneeListForLimitedTasks.length ? assigneeListForLimitedTasks : assignee,
  )

  const inputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)

  const clearSubTaskFields = () => {
    setSubTaskFields((prev) => ({
      ...prev,
      title: '',
      description: '',
      errors: {
        [CreateTaskErrors.ASSIGNEE]: false,
      },
      workflowStateId: todoWorkflowState.id,
      assigneeId: '',
      assigneeType: null,
      dueDate: null,
    }))
    updateAssigneeValue(null)
    updateStatusValue(todoWorkflowState)
  }

  const handleFieldChange = (field: keyof SubTaskFields, value: string | DateString | IErrors | null) => {
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

  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: null,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })
  const assigneeValue = _assigneeValue as IAssigneeCombined

  const { renderingItem: _templateValue, updateRenderingItem: updateTemplateValue } = useHandleSelectorComponent({
    item: undefined,
    type: SelectorType.TEMPLATE_SELECTOR,
  })
  const templateValue = _templateValue as ITemplate

  const [inputStatusValue, setInputStatusValue] = useState('')

  const handleUploadStatusChange = (uploading: boolean) => {
    setIsUploading(uploading)
  }

  const clientCompanyId = activeTask && activeTask.assigneeType !== 'internalUser' ? activeTask.assigneeId : undefined

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
    [token, setIsEditorReadonly, workflowStates, subTaskFields.title, subTaskFields.description],
  )

  const applyTemplateHandler = (newValue: ITemplate) => {
    if (!newValue || !token) return
    const controller = applyTemplate(newValue.id, newValue.title)
    return () => {
      controller.abort()
    }
  }

  const handleTaskCreation = async () => {
    if (subTaskFields.title && subTaskFields.assigneeId && subTaskFields.assigneeType) {
      const formattedDueDate = subTaskFields.dueDate && dayjs(new Date(subTaskFields.dueDate)).format('YYYY-MM-DD')

      const payload: CreateTaskRequest = {
        title: subTaskFields.title,
        body: subTaskFields.description,
        workflowStateId: subTaskFields.workflowStateId,
        assigneeType: AssigneeTypeSchema.parse(subTaskFields.assigneeType),
        assigneeId: subTaskFields.assigneeId,
        dueDate: formattedDueDate,
        parentId: activeTask?.id,
      }
      handleSubTaskCreation(payload)
      clearSubTaskFields()
      handleClose()
    }
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
            endOption={<ManageTemplatesEndOption />}
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
          filterOptions,
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
          <Selector
            padding={'0px 4px'}
            inputStatusValue={inputStatusValue}
            setInputStatusValue={setInputStatusValue}
            placeholder="Set assignee"
            getSelectedValue={(_newValue) => {
              handleFieldChange('errors', {
                assignee: false,
              })
              const newValue = _newValue as IAssigneeCombined

              updateAssigneeValue(newValue)
              handleFieldChange('assigneeType', getAssigneeTypeCorrected(newValue))
              handleFieldChange('assigneeId', newValue?.id)
            }}
            onClick={() => {
              if (activeDebounceTimeoutId) {
                clearTimeout(activeDebounceTimeoutId)
              }
              setLoading(true)
              setFilteredAssignees(assigneeListForLimitedTasks.length ? assigneeListForLimitedTasks : assignee)
              setLoading(false)
            }}
            options={loading ? [] : filteredAssignees}
            value={assigneeValue}
            extraOption={NoAssigneeExtraOptions}
            extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
              return <>{loading && <MiniLoader />}</>
            }}
            selectorType={SelectorType.ASSIGNEE_SELECTOR}
            handleInputChange={async (newInputValue: string) => {
              if (!newInputValue) {
                setFilteredAssignees(assigneeListForLimitedTasks.length ? assigneeListForLimitedTasks : assignee)
                return
              }
              setDebouncedFilteredAssignees(
                activeDebounceTimeoutId,
                setActiveDebounceTimeoutId,
                setLoading,
                setFilteredAssignees,
                z.string().parse(token),
                newInputValue,
                undefined,
                clientCompanyId,
              )
            }}
            filterOption={(x: unknown) => x}
            buttonHeight="auto"
            buttonContent={
              <Stack direction="row" alignItems={'center'} columnGap={'6px'} height="26px">
                {assigneeValue ? <CopilotAvatar currentAssignee={assigneeValue} /> : <AssigneePlaceholderSmall />}
                <Typography
                  variant="bodySm"
                  sx={{
                    color: (theme) => (assigneeValue ? theme.color.gray[600] : theme.color.text.textDisabled),
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '22px',
                    overflow: 'hidden',
                    fontSize: '12px',
                    maxWidth: '120px',
                  }}
                >
                  {getAssigneeName(assigneeValue as IAssigneeCombined, 'Assignee')}
                </Typography>
              </Stack>
            }
            error={subTaskFields.errors.assignee}
            errorPlaceholder=""
          />
          <DatePickerComponent
            padding={'0px 4px'}
            height={'28px'}
            getDate={(value) => handleFieldChange('dueDate', value)}
            variant="button"
            dateValue={subTaskFields.dueDate ?? undefined}
          />
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
            handleClick={() => {
              const hasAssigneeError = !subTaskFields.assigneeId

              if (hasAssigneeError) {
                handleFieldChange('errors', {
                  assignee: true,
                })
              } else {
                handleTaskCreation()
              }
            }}
            buttonText="Create"
            disabled={!subTaskFields.title.trim() || isUploading || isEditorReadonly}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
