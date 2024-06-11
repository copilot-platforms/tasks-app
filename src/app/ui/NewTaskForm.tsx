import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { SelectorType } from '@/components/inputs/Selector'
import Selector from '@/components/inputs/Selector'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { ArrowLinkIcon, AttachmentIcon, TemplateIcon, TemplateIconSm } from '@/icons'
import { clearCreateTaskFields, selectCreateTask, setCreateTaskFields, setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { statusIcons } from '@/utils/iconMatcher'
import { Close } from '@mui/icons-material'
import { Avatar, Box, Stack, Typography, styled } from '@mui/material'
import { ReactNode } from 'react'
import { FilterOptions, IAssigneeCombined, ITemplate } from '@/types/interfaces'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { useRouter } from 'next/navigation'
import { selectCreateTemplate } from '@/redux/features/templateSlice'
import { NoAssignee, NoAssigneeExtraOptions } from '@/utils/noAssignee'
import ExtraOptionRendererAssignee from '@/components/inputs/ExtraOptionRendererAssignee'

export const NewTaskForm = ({ handleCreate }: { handleCreate: () => void }) => {
  const { workflowStates, assignee, token, filterOptions } = useSelector(selectTaskBoard)

  const { templates } = useSelector(selectCreateTemplate)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: workflowStates[0],
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item:
      assignee.find(
        (item) => item.id == filterOptions[FilterOptions.ASSIGNEE] || item.id == filterOptions[FilterOptions.TYPE],
      ) ?? NoAssignee,
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
              <Selector
                getSelectedValue={(_newValue) => {
                  const newValue = _newValue as ITemplate
                  updateTemplateValue(newValue)
                  store.dispatch(setCreateTaskFields({ targetField: 'title', value: newValue.title }))
                  store.dispatch(setCreateTaskFields({ targetField: 'description', value: newValue.body }))
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
            </Box>
            <Close
              sx={{ color: (theme) => theme.color.gray[500], cursor: 'pointer' }}
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

        <Stack direction="row" columnGap={3} position="relative">
          <Selector
            getSelectedValue={(newValue) => {
              updateStatusValue(newValue)
              store.dispatch(
                setCreateTaskFields({ targetField: 'workflowStateId', value: (newValue as WorkflowStateResponse)?.id }),
              )
            }}
            startIcon={statusIcons[statusValue?.type]}
            options={workflowStates}
            value={statusValue}
            selectorType={SelectorType.STATUS_SELECTOR}
            buttonContent={
              <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {statusValue?.name as ReactNode}
              </Typography>
            }
          />
          <Stack alignSelf="flex-start">
            <Selector
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
              startIcon={
                <Avatar
                  alt="user"
                  src={assigneeValue?.iconImageUrl || assigneeValue?.avatarImageUrl}
                  sx={{ width: '20px', height: '20px' }}
                  variant={assigneeValue?.type === 'companies' ? 'square' : 'circular'}
                />
              }
              options={assignee}
              value={assigneeValue}
              extraOption={NoAssigneeExtraOptions}
              extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                return (
                  <ExtraOptionRendererAssignee
                    props={props}
                    onClick={(e) => {
                      updateAssigneeValue({ id: '', name: 'No assignee' })
                      setAnchorEl(anchorEl ? null : e.currentTarget)
                      store.dispatch(setCreateTaskFields({ targetField: 'assigneeType', value: null }))
                      store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: null }))
                    }}
                  />
                )
              }}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                  {assigneeValue?.name || assigneeValue?.givenName}
                </Typography>
              }
            />
          </Stack>
        </Stack>
      </AppMargin>
      <NewTaskFooter handleCreate={handleCreate} />
    </NewTaskContainer>
  )
}

const NewTaskFormInputs = () => {
  const { title, description } = useSelector(selectCreateTask)

  return (
    <>
      <Stack direction="column" rowGap={1}>
        <Typography variant="md">Task name</Typography>
        <StyledTextField
          type="text"
          padding="8px 0px"
          value={title}
          onChange={(e) => store.dispatch(setCreateTaskFields({ targetField: 'title', value: e.target.value }))}
        />
      </Stack>
      <Stack direction="column" rowGap={1} m="16px 0px">
        <Typography variant="md">Description</Typography>
        <StyledTextField
          type="text"
          placeholder="Add description..."
          multiline
          rows={6}
          inputProps={{ style: { resize: 'vertical' } }}
          value={description}
          onChange={(e) => store.dispatch(setCreateTaskFields({ targetField: 'description', value: e.target.value }))}
        />
      </Stack>
    </>
  )
}

const NewTaskFooter = ({ handleCreate }: { handleCreate: () => void }) => {
  return (
    <Box sx={{ borderTop: (theme) => `1px solid ${theme.color.borders.border2}` }}>
      <AppMargin size={SizeofAppMargin.MEDIUM} py="21px">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <AttachmentIcon />
          </Box>
          <Stack direction="row" columnGap={4}>
            <SecondaryBtn
              handleClick={() => {
                store.dispatch(setShowModal())
                store.dispatch(clearCreateTaskFields())
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
  width: '80%',
  maxWidth: '650px',
}))
