'use client'

import { WorkflowState } from '@/types/dto/workflowStates.dto'
import { Box, Stack, Typography } from '@mui/material'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { statusIcons } from '@/utils/iconMatcher'
import { IAssigneeCombined, Sizes } from '@/types/interfaces'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'
import { isTaskCompleted } from '@/utils/isTaskCompleted'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { useEffect, useState } from 'react'
import { NoAssignee } from '@/utils/noAssignee'

interface TaskCardListProps {
  task: TaskResponse
}

export const TaskCardList = ({ task }: TaskCardListProps) => {
  const { assignee, workflowStates } = useSelector(selectTaskBoard)

  const [currentAssignee, setCurrentAssignee] = useState<IAssigneeCombined | undefined>(undefined)

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = assignee.find((el) => el.id === task.assigneeId)
      //@ts-expect-error  "type" property has mismatching types in between NoAssignee and IAssigneeCombined
      setCurrentAssignee(currentAssignee ?? NoAssignee)
    }
  }, [assignee, task])
  return (
    <Stack
      direction="row"
      sx={{
        height: '36px',
        display: 'flex',
        padding: '6px 2px 6px 0px',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: '20px',
        justifyContent: 'flex-end',
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        sx={{
          gap: '8px',
          display: 'flex',
          alignItems: 'center',
          marginRight: 'auto',
          minWidth: 0,
          flexGrow: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            display: 'flex',
            gap: '2px',
            minWidth: 0,
            flexGrow: 1,
            flexShrink: 1,
          }}
        >
          <Box sx={{ padding: '2px 4px' }}>{statusIcons[Sizes.MEDIUM][task.workflowState.type]}</Box>

          <Typography
            variant="bodySm"
            sx={{
              lineHeight: '21px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexShrink: 1,
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            {task.title}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '130px',
          marginLeft: 'auto',
          justifyContent: 'flex-end',
        }}
      >
        {task.dueDate && <DueDateLayout dateString={task.dueDate} isDone={isTaskCompleted(task, workflowStates)} />}
        <CopilotAvatar currentAssignee={currentAssignee as IAssigneeCombined} />
      </Stack>
    </Stack>
  )
}
