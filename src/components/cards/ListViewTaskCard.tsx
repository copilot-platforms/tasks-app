'use client'

import { Avatar, Box, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskResponse, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { SelectorType } from '../inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import Selector from '@/components/inputs/Selector'
import { IAssigneeCombined } from '@/types/interfaces'

export const ListViewTaskCard = ({
  task,
  updateTask,
  handleClick,
}: {
  task: TaskResponse
  updateTask?: ({ payload }: { payload: UpdateTaskRequest }) => void
  handleClick?: () => void
}) => {
  const { assignee } = useSelector(selectTaskBoard)

  const currentAssignee = assignee.find((el) => el.id === task.assigneeId)

  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: currentAssignee,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  return (
    <Box
      sx={{
        ':hover': {
          bgcolor: (theme) => theme.color.gray[100],
        },
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="6px">
        <Stack direction="row" columnGap={8} alignItems="center" justifyContent="space-between">
          <Stack
            sx={{ width: '100%', cursor: 'pointer' }}
            direction="row"
            alignItems="center"
            columnGap={4}
            onClick={handleClick}
          >
            <Typography variant="bodyXs">WEB-01</Typography>
            <Typography variant="bodySm">{task?.title}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" columnGap="20px" minWidth="200px">
            <Box minWidth="fit-content">
              <Typography variant="bodySm">Apr 05, 2024</Typography>
            </Box>
            <Box minWidth="fit-content">
              <Selector
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
                  <Avatar
                    alt="user"
                    src={assigneeValue?.iconImageUrl || assigneeValue?.avatarImageUrl}
                    sx={{ width: '20px', height: '20px' }}
                  />
                }
                options={assignee}
                value={assigneeValue}
                selectorType={SelectorType.ASSIGNEE_SELECTOR}
                buttonContent={
                  <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                    {assigneeValue?.name || assigneeValue?.givenName}
                  </Typography>
                }
              />
            </Box>
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}
