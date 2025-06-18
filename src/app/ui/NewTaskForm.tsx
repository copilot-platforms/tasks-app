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
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { AssigneePlaceholderSmall, CloseIcon, TemplateIconSm } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import {
  selectCreateTask,
  setAppliedDescription,
  setAppliedTitle,
  setCreateTaskFields,
  setErrors,
} from '@/redux/features/createTaskSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectCreateTemplate } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { CreateTaskErrors, FilterOptions, IAssigneeCombined, ITemplate, UserIds } from '@/types/interfaces'
import { checkEmptyAssignee, emptyAssignee, getAssigneeName } from '@/utils/assignee'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import { getSelectedUserIds } from '@/utils/selector'
import { trimAllTags } from '@/utils/trimTags'
import { Box, Stack, Typography, styled } from '@mui/material'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'

interface NewTaskFormInputsProps {
  isEditorReadonly?: boolean
}

interface NewTaskFormProps {
  handleCreate: () => void
  handleClose: () => void
  setIsEditorReadonly?: Dispatch<SetStateAction<boolean>>
}

export const NewTaskForm = ({ handleCreate, handleClose }: NewTaskFormProps) => {
  const { activeWorkflowStateId } = useSelector(selectCreateTask)
  const { workflowStates, assignee, previewMode, filterOptions } = useSelector(selectTaskBoard)

  const todoWorkflowState = workflowStates.find((el) => el.key === 'todo') || workflowStates[0]
  const defaultWorkflowState = activeWorkflowStateId
    ? workflowStates.find((state) => state.id === activeWorkflowStateId)
    : todoWorkflowState

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: defaultWorkflowState,
    type: SelectorType.STATUS_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting

  const [isEditorReadonly, setIsEditorReadonly] = useState(false)

  const [assigneeValue, setAssigneeValue] = useState<IAssigneeCombined | null>(
    assignee.find(
      (item) =>
        item.id == filterOptions[FilterOptions.ASSIGNEE][UserIds.INTERNAL_USER_ID] ||
        item.id == filterOptions[FilterOptions.ASSIGNEE][UserIds.CLIENT_ID] ||
        item.id == filterOptions[FilterOptions.ASSIGNEE][UserIds.COMPANY_ID] ||
        item.id == filterOptions[FilterOptions.TYPE],
    ) ?? null,
  )
  useEffect(() => {
    if (!checkEmptyAssignee(filterOptions[FilterOptions.ASSIGNEE])) {
      store.dispatch(setCreateTaskFields({ targetField: 'userIds', value: filterOptions[FilterOptions.ASSIGNEE] }))
    } else if (filterOptions[FilterOptions.TYPE]) {
      if (!assigneeValue) return
      const correctedObject = getAssigneeTypeCorrected(assigneeValue)
      if (!correctedObject) return
      const newUserIds = getSelectedUserIds([{ ...assigneeValue, object: correctedObject }])
      store.dispatch(setCreateTaskFields({ targetField: 'userIds', value: newUserIds }))
    } else {
      store.dispatch(setCreateTaskFields({ targetField: 'userIds', value: emptyAssignee }))
    }
  }, []) //if assigneeValue has an intial value before selection (when my tasks, filter by assignee filter is applied), then update the task creation field for userIds.

  const handleCreateWithAssignee = () => {
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
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="md" fontSize={'15px'} lineHeight={'18.15px'}>
              Create task
            </Typography>
            <CloseIcon style={{ cursor: 'pointer' }} onClick={() => handleClose()} />
          </Stack>
        </AppMargin>
      </Stack>

      <AppMargin size={SizeofAppMargin.MEDIUM} py="16px">
        <NewTaskFormInputs isEditorReadonly={isEditorReadonly} />
        <Stack direction="row" columnGap={3} position="relative" sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ padding: 0.1 }}>
            <WorkflowStateSelector
              padding="4px"
              option={workflowStates}
              value={statusValue}
              getValue={(value) => {
                updateStatusValue(value)
                store.dispatch(setCreateTaskFields({ targetField: 'workflowStateId', value: value.id }))
              }}
            />
          </Box>

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
                padding="4px"
                getDate={(value) => store.dispatch(setCreateTaskFields({ targetField: 'dueDate', value: value as string }))}
                variant="button"
              />
            </Box>
          </Stack>
          <Stack alignSelf="flex-start">
            <CopilotPopSelector
              disabled={!!previewMode}
              name="Set assignee"
              initialValue={assigneeValue || undefined}
              onChange={(inputValue) => {
                const newUserIds = getSelectedUserIds(inputValue)
                const selectedAssignee = assignee.find((assignee) => assignee.id === inputValue[0].id)
                setAssigneeValue(selectedAssignee || null)
                store.dispatch(setCreateTaskFields({ targetField: 'userIds', value: newUserIds }))
              }}
              onEmptySelection={() => {
                setAssigneeValue(null)
                store.dispatch(
                  setCreateTaskFields({
                    targetField: 'userIds',
                    value: { internalUserId: null, clientId: null, companyId: null },
                  }),
                )
              }}
              buttonContent={
                <SelectorButton
                  disabled={!!previewMode}
                  startIcon={
                    assigneeValue ? <CopilotAvatar currentAssignee={assigneeValue} /> : <AssigneePlaceholderSmall />
                  }
                  height="30px"
                  padding="4px 4px 4px 8px"
                  buttonContent={
                    <Typography
                      variant="bodySm"
                      sx={{
                        color: (theme) => theme.color.text.textDisabled,
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        fontSize: '12px',
                        maxWidth: { xs: '60px', sm: '100px' },
                      }}
                    >
                      {getAssigneeName(assigneeValue as IAssigneeCombined, 'Assignee')}
                    </Typography>
                  }
                />
              }
            />
          </Stack>
        </Stack>
      </AppMargin>
      <NewTaskFooter
        handleCreate={handleCreateWithAssignee}
        handleClose={handleClose}
        setIsEditorReadonly={setIsEditorReadonly}
        updateWorkflowStatusValue={updateStatusValue}
      />
    </NewTaskContainer>
  )
}

const NewTaskFormInputs = ({ isEditorReadonly }: NewTaskFormInputsProps) => {
  const { title, description } = useSelector(selectCreateTask)
  const { errors } = useSelector(selectCreateTask)
  const { token } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)

  const handleDetailChange = (content: string) => {
    store.dispatch(setCreateTaskFields({ targetField: 'description', value: content }))
  }

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
          disabled={isEditorReadonly}
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
          readonly={isEditorReadonly}
          deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', null, null)}
          attachmentLayout={AttachmentLayout}
          maxUploadLimit={MAX_UPLOAD_LIMIT}
          parentContainerStyle={{ gap: '0px' }}
        />
      </Stack>
    </>
  )
}

const NewTaskFooter = ({
  handleCreate,
  handleClose,
  setIsEditorReadonly,
  updateWorkflowStatusValue,
}: NewTaskFormProps & { updateWorkflowStatusValue: (value: unknown) => void }) => {
  const [inputStatusValue, setInputStatusValue] = useState('')

  const { title, showModal, description, appliedDescription, appliedTitle } = useSelector(selectCreateTask)
  const { token, workflowStates } = useSelector(selectTaskBoard)
  const { templates } = useSelector(selectCreateTemplate)

  const { renderingItem: _templateValue, updateRenderingItem: updateTemplateValue } = useHandleSelectorComponent({
    item: undefined, //initially we don't want any value to be selected
    type: SelectorType.TEMPLATE_SELECTOR,
  })
  const templateValue = _templateValue as ITemplate //typecasting

  const applyTemplate = useCallback(
    (id: string, templateTitle: string) => {
      const controller = new AbortController()

      const fetchTemplate = async () => {
        try {
          if (!showModal) {
            controller.abort()
            return
          }

          setIsEditorReadonly?.(true)

          store.dispatch(setAppliedTitle({ title: templateTitle }))
          if (appliedTitle == title.trim()) {
            store.dispatch(setCreateTaskFields({ targetField: 'title', value: templateTitle }))
          } else {
            store.dispatch(setCreateTaskFields({ targetField: 'title', value: title + ' ' + templateTitle }))
          }

          const resp = await fetch(`/api/tasks/templates/${id}/apply?token=${token}`, {
            signal: controller.signal,
          })
          const { data: template } = await resp.json()
          if (!showModal) return

          setIsEditorReadonly?.(false)
          updateWorkflowStatusValue(workflowStates.find((state) => state.id === template.workflowStateId))
          store.dispatch(setCreateTaskFields({ targetField: 'workflowStateId', value: template.workflowStateId }))
          store.dispatch(setCreateTaskFields({ targetField: 'activeWorkflowStateId', value: template.workflowStateId }))
          store.dispatch(setAppliedDescription({ description: template.body }))
          store.dispatch(setCreateTaskFields({ targetField: 'templateId', value: id }))

          const trimmedAppliedDescription = appliedDescription && trimAllTags(appliedDescription)
          const trimmedDescription = trimAllTags(description)

          if (trimmedAppliedDescription == trimmedDescription || trimmedDescription === '<p></p>') {
            store.dispatch(setCreateTaskFields({ targetField: 'description', value: template.body }))
          } else {
            store.dispatch(setCreateTaskFields({ targetField: 'description', value: description + template.body }))
          }
          store.dispatch(setErrors({ key: CreateTaskErrors.TITLE, value: false }))
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
          }
        } finally {
          setIsEditorReadonly?.(false)
        }
      }
      fetchTemplate()
      return controller
    },
    [
      token,
      setIsEditorReadonly,
      workflowStates,
      title,
      description,
      appliedDescription,
      appliedTitle,
      showModal,
      updateWorkflowStatusValue,
    ],
  )

  const applyTemplateHandler = (newValue: ITemplate) => {
    if (!newValue || !token) return
    const controller = applyTemplate(newValue.id, newValue.title)
    return () => {
      controller.abort()
    }
  }

  return (
    <Box sx={{ borderTop: (theme) => `1px solid ${theme.color.borders.border2}` }}>
      <AppMargin size={SizeofAppMargin.MEDIUM} py="21px">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Selector
            inputStatusValue={inputStatusValue}
            setInputStatusValue={setInputStatusValue}
            getSelectedValue={(_newValue) => {
              const newValue = _newValue as ITemplate
              updateTemplateValue(newValue)
              applyTemplateHandler(newValue)
            }}
            startIcon={<TemplateIconSm />}
            options={templates || []}
            placeholder="Search..."
            value={templateValue}
            selectorType={SelectorType.TEMPLATE_SELECTOR}
            endOption={<ManageTemplatesEndOption hasTemplates={!!templates?.length} />}
            endOptionHref={`/manage-templates?token=${token}`}
            listAutoHeightMax="147px"
            buttonContent={
              <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[600], lineHeight: '24px' }}>
                {'Apply template'}
              </Typography>
            }
            variant="normal"
            responsiveNoHide
            buttonWidth="auto"
            useClickHandler
          />
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{
              marginLeft: 'auto',
            }}
          >
            <Stack direction="row" columnGap={4}>
              <SecondaryBtn
                handleClick={() => handleClose()}
                buttonContent={
                  <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                    Discard
                  </Typography>
                }
              />
              <PrimaryBtn
                handleClick={() => {
                  if (!title.trim()) {
                    store.dispatch(setErrors({ key: CreateTaskErrors.TITLE, value: true }))
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
