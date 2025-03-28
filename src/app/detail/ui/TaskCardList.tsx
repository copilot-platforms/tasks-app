'use client'

import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
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
import { TaskMetaItems } from '@/components/atoms/TaskMetaItems'

interface TaskCardListProps {
  task: TaskResponse
  variant: 'task' | 'subtask' //task variant is used in task board list view, subtask variant is used for sub task list in details page
  workflowState?: WorkflowStateResponse
}

export const TaskCardList = ({ task, variant, workflowState }: TaskCardListProps) => {
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
        height: variant == 'task' ? '44px' : '36px',
        display: 'flex',
        padding: variant == 'task' ? '6px 20px 6px 20px' : '6px 2px 6px 0px',
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
            flexGrow: 0,
            flexShrink: 1,
          }}
        >
          <Box sx={{ padding: '2px 4px' }}>
            {statusIcons[Sizes.MEDIUM][workflowState ? workflowState.type : task.workflowState.type]}
          </Box>

          <Typography
            variant="bodySm"
            sx={{
              lineHeight: variant == 'task' ? '22px' : '21px',
              fontSize: variant == 'task' ? '14px' : '13px',
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
        {(task.subtaskCount > 0 || task.isArchived) && (
          <Stack direction="row" sx={{ display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center' }}>
            <TaskMetaItems task={task} lineHeight="21px" />
          </Stack>
        )}
      </Stack>
      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto',
          justifyContent: 'flex-end',
        }}
      >
        {task.dueDate && (
          <Box sx={{ minWidth: '100px', display: 'flex', justifyContent: 'flex-end' }}>
            <DueDateLayout dateString={task.dueDate} isDone={isTaskCompleted(task, workflowStates)} />
          </Box>
        )}
        <CopilotAvatar currentAssignee={currentAssignee as IAssigneeCombined} />
      </Stack>
    </Stack>
  )
}
