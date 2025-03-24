import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import AttachmentLayout from '@/components/AttachmentLayout'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { StyledTextField } from '@/components/inputs/TextField'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { AssigneePlaceholderSmall } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { DateString } from '@/types/date'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { CreateTaskErrors, HandleSelectorComponentModes, IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import { NoAssigneeExtraOptions } from '@/utils/noAssignee'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'
import { string, z } from 'zod'

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
}

export const NewTaskCard = ({ handleClose }: { handleClose: () => void }) => {
  const { workflowStates, assignee, token, filterOptions, previewMode } = useSelector(selectTaskBoard)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)

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
  })

  const [filteredAssignees, setFilteredAssignees] = useState(assignee)

  const [isUploading, setIsUploading] = useState(false)

  const clearSubTaskFields = () => {
    setSubTaskFields({
      title: '',
      description: '',
      workflowStateId: '',
      assigneeId: '',
      dueDate: null,
      errors: {
        [CreateTaskErrors.ASSIGNEE]: false,
      },
    })
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

  const [inputStatusValue, setInputStatusValue] = useState('')

  const handleUploadStatusChange = (uploading: boolean) => {
    setIsUploading(uploading)
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
        sx={{ display: 'flex', padding: '0px 12px 12px', alignItems: 'flex-start', gap: '4px', alignSelf: 'stretch' }}
      >
        <StyledTextField
          type="text"
          multiline
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
        />
        <Box sx={{ height: '100%', width: '100%' }}>
          <Tapwrite
            content={subTaskFields.description}
            getContent={(content) => handleFieldChange('description', content)}
            placeholder="Add description..."
            editorClass="tapwrite-task-editor"
            uploadFn={uploadFn}
            deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', null, null)}
            attachmentLayout={(props) => (
              <AttachmentLayout {...props} isComment={true} onUploadStatusChange={handleUploadStatusChange} />
            )}
            maxUploadLimit={MAX_UPLOAD_LIMIT}
            parentContainerStyle={{ gap: '0px' }}
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
            padding={'4px 8px'}
          />
          <Selector
            padding={'4px 8px'}
            inputStatusValue={inputStatusValue}
            setInputStatusValue={setInputStatusValue}
            placeholder="Set assignee"
            getSelectedValue={(_newValue) => {
              handleFieldChange('errors', {
                assignee: false,
              })
              const newValue = _newValue as IAssigneeCombined

              updateAssigneeValue(newValue)

              handleFieldChange('assigneeId', newValue?.id)
            }}
            startIcon={assigneeValue ? <CopilotAvatar currentAssignee={assigneeValue} /> : <AssigneePlaceholderSmall />}
            onClick={() => {
              if (activeDebounceTimeoutId) {
                clearTimeout(activeDebounceTimeoutId)
              }
              setLoading(true)
              setFilteredAssignees(assignee)
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
                  color: (theme) => (assigneeValue ? theme.color.gray[600] : theme.color.gray[550]),
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',

                  overflow: 'hidden',
                  fontSize: '12px',
                  maxWidth: '100px',
                }}
              >
                {getAssigneeName(assigneeValue as IAssigneeCombined, 'Assignee')}
              </Typography>
            }
            error={subTaskFields.errors.assignee}
            errorPlaceholder=""
          />
          <DatePickerComponent
            padding={'4px 8px'}
            getDate={(value) => handleFieldChange('dueDate', value)}
            isButton={true}
          />
        </Stack>
        <Stack
          direction="row"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '16px',
            alignSelf: 'stretch',

            marginLeft: 'auto',
          }}
        >
          <SecondaryBtn
            padding={'4px 8px'}
            handleClick={handleClose}
            buttonContent={
              <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                Discard
              </Typography>
            }
          />
          <PrimaryBtn
            padding={'4px 8px'}
            handleClick={() => {
              const hasAssigneeError = !subTaskFields.assigneeId
              if (hasAssigneeError) {
                handleFieldChange('errors', {
                  assignee: true,
                })
              } else {
                // handleCreate()
              }
            }}
            buttonText="Create"
            disabled={!subTaskFields.title.trim() || isUploading}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
