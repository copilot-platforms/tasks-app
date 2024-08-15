'use client'

import { Box, Skeleton, Stack, Typography, alpha } from '@mui/material'
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
import { UrlObject } from 'url'
import { CustomLink } from '@/hoc/CustomLink'
import { getAssigneeName } from '@/utils/assignee'
import { AssigneeType } from '@prisma/client'
import { useEffect, useState } from 'react'

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

  const [currentAssignee, setCurrentAssignee] = useState<IAssigneeCombined | undefined>(undefined)

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = assignee.find((el) => el.id === task.assigneeId)
      setCurrentAssignee(currentAssignee)
    }
  }, [assignee])

  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: currentAssignee,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  return (
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
      <Box sx={{ padding: '8.5px 12px 8.5px 20px' }}>
        <Stack direction="row" columnGap={'20px'} alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" columnGap={'16px'}>
            <Typography
              variant="sm"
              fontWeight={400}
              sx={{
                color: (theme) => theme.color.gray[500],
                flexGrow: 0,
                minWidth: '75px',
                lineHeight: '21px',
              }}
            >
              {task.label}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <Typography
                variant="sm"
                sx={{
                  lineHeight: '21px',
                  wordBreak: 'break-word',
                  flexGrow: 1,
                }}
              >
                {task?.title}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" columnGap={'20px'}>
            <Box
              sx={{
                display: 'flex',
                maxWidth: '80px',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.dueDate && <DueDateLayout dateString={task.dueDate} />}
            </Box>

            {currentAssignee ? (
              <Selector
                placeholder="Change assignee"
                disableOutline
                disabled
                buttonWidth="150px"
                getSelectedValue={(_newValue) => {
                  const newValue = _newValue as IAssigneeCombined
                  updateAssigneeValue(newValue)
                  const assigneeType = newValue.type ? AssigneeType[newValue.type as AssigneeType] : null
                  if (updateTask) {
                    updateTask({
                      payload: {
                        assigneeType: assigneeType,
                        assigneeId: newValue?.id,
                      },
                    })
                  }
                }}
                startIcon={
                  <CopilotAvatar currentAssignee={assigneeValue as IAssigneeCombined} alt={getAssigneeName(assigneeValue)} />
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
                    {getAssigneeName(assigneeValue)}
                  </Typography>
                }
              />
            ) : (
              <Stack direction="row" justifyContent="space-between" alignItems="center" columnGap={'4px'}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="rectangular" width="100px" height="12px" />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
