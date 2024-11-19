'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export const LastArchivedField = ({ taskId }: { taskId: string }) => {
  const { tasks } = useSelector(selectTaskBoard)
  const [task, setTask] = useState<TaskResponse>()
  useEffect(() => {
    const currentTask = tasks.find((el) => el.id === taskId)
    if (currentTask) {
      setTask(currentTask)
    }
  }, [tasks, taskId])

  if (!task?.isArchived || !task) return null

  return (
    <Typography
      variant="sm"
      fontStyle="italic"
      sx={{
        color: (theme) => theme.color.gray[500],
      }}
    >
      {!task || !task.lastArchivedDate ? null : `Archived ${getTimeDifference(task.lastArchivedDate)}`}
    </Typography>
  )
}
