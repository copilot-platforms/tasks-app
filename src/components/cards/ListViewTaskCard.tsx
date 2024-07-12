'use client'

import { Box, Stack, Typography, alpha } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskResponse, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import Selector from '@/components/inputs/Selector'
import { IAssigneeCombined } from '@/types/interfaces'
import { NoAssignee, NoAssigneeExtraOptions } from '@/utils/noAssignee'
import ExtraOptionRendererAssignee from '@/components/inputs/ExtraOptionRendererAssignee'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { getAssigneeName } from '@/utils/getAssigneeName'
import { UrlObject } from 'url'
import { StyledUninvasiveLink } from '@/app/detail/ui/styledComponent'

export const ListViewTaskCard = ({
  task,
  updateTask,
  href,
}: {
  task: TaskResponse
  updateTask?: ({ payload }: { payload: UpdateTaskRequest }) => void
  href: string | UrlObject
}) => {
  const { assignee } = useSelector(selectTaskBoard)

  const currentAssignee = assignee.find((el) => el.id === task.assigneeId) ?? NoAssignee

  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: currentAssignee,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  return (
    <StyledUninvasiveLink href={href} prefetch={true}>
      <Box
        className="task-list-card"
        sx={{
          userSelect: 'none',
          cursor: 'pointer',
          borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
          ':hover': {
            bgcolor: (theme) => alpha(theme.color.gray[100], 0.5),
          },
        }}
      >
        <AppMargin size={SizeofAppMargin.LARGE} py="12px">
          <Box>
            <Stack direction="row" columnGap={'20px'} alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" columnGap={'16px'}>
                <Typography
                  variant="sm"
                  fontWeight={400}
                  sx={{
                    color: (theme) => theme.color.gray[500],
                    flexGrow: 0,
                    minWidth: '80px',
                    lineHeight: '21px',
                  }}
                >
                  {task.label}
                </Typography>
                <Typography variant="sm" sx={{ lineHeight: '21px' }}>
                  {task?.title}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent={'space-between'} columnGap={2}>
                <Box
                  sx={{
                    display: 'flex',
                    maxWidth: '100px',
                    gap: '33px',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {task.dueDate && <DueDateLayout date={task.dueDate} />}
                </Box>
                <Box sx={{}}>
                  <Selector
                    placeholder="Change assignee"
                    disableOutline
                    disabled
                    buttonWidth="160px"
                    getSelectedValue={(_newValue) => {
                      const newValue = _newValue as IAssigneeCombined
                      updateAssigneeValue(newValue)
                      const assigneeType = newValue?.type
                      if (updateTask) {
                        updateTask({
                          payload: {
                            assigneeType:
                              assigneeType === 'ius'
                                ? 'internalUser'
                                : assigneeType === 'clients'
                                  ? 'client'
                                  : assigneeType === 'companies'
                                    ? 'company'
                                    : 'internalUser',
                            assigneeId: newValue?.id,
                          },
                        })
                      }
                    }}
                    startIcon={
                      <CopilotAvatar
                        currentAssignee={currentAssignee as IAssigneeCombined}
                        alt={getAssigneeName(assigneeValue)}
                      />
                    }
                    options={assignee}
                    value={assigneeValue}
                    selectorType={SelectorType.ASSIGNEE_SELECTOR}
                    extraOption={NoAssigneeExtraOptions}
                    extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                      return (
                        <ExtraOptionRendererAssignee
                          props={props}
                          onClick={(e) => {
                            updateAssigneeValue({ id: '', name: 'No assignee' })
                            setAnchorEl(anchorEl ? null : e.currentTarget)
                            if (updateTask) {
                              updateTask({
                                payload: {
                                  assigneeType: null,
                                  assigneeId: null,
                                },
                              })
                            }
                          }}
                        />
                      )
                    }}
                    buttonContent={
                      <Typography
                        variant="bodySm"
                        lineHeight="20px"
                        sx={{
                          color: (theme) => theme.color.gray[600],
                        }}
                      >
                        {(assigneeValue as IAssigneeCombined)?.name ||
                          `${(assigneeValue as IAssigneeCombined)?.givenName ?? ''} ${(assigneeValue as IAssigneeCombined)?.familyName ?? ''}`.trim()}
                      </Typography>
                    }
                  />
                </Box>
              </Stack>
            </Stack>
          </Box>
        </AppMargin>
      </Box>
    </StyledUninvasiveLink>
  )
}
