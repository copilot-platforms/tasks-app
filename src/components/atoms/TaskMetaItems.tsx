import { ArchiveBoxIcon, SubtaskIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { Box, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'

import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'

interface TaskMetaItemsProps {
  task: TaskResponse
  lineHeight: string
}

const TaskMetaItemsInner: React.FC<TaskMetaItemsProps> = ({ task, lineHeight }) => {
  const accessibleTasks = useSelector((state: ReturnType<typeof selectTaskBoard>) => state.accessibleTasks, shallowEqual)

  const subtaskCount = useMemo(() => {
    return accessibleTasks.filter((t) => t.parentId === task.id).length
  }, [accessibleTasks, task.id])

  return (
    <>
      {task.isArchived && (
        <Stack direction="row" alignItems={'center'} columnGap={'4px'}>
          <Box sx={{ marginTop: '-2px' }}>
            <ArchiveBoxIcon />
          </Box>
          <Typography
            variant="bodyXs"
            sx={{ color: (theme) => theme.color.text.textSecondary, lineHeight: lineHeight ?? '21px' }}
          >
            Archived
          </Typography>
        </Stack>
      )}
      {subtaskCount > 0 && (
        <Stack direction="row" alignItems={'center'} columnGap={'4px'}>
          <Typography
            variant="bodySm"
            sx={{
              fontSize: '12px',
              color: (theme) => theme.color.text.textSecondary,
              lineHeight: lineHeight ?? '21px',
            }}
          >
            {subtaskCount}
          </Typography>
          <SubtaskIcon />
        </Stack>
      )}
    </>
  )
}

TaskMetaItemsInner.displayName = 'TaskMetaItems'

export const TaskMetaItems = React.memo(TaskMetaItemsInner)
