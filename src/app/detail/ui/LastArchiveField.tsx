'use client'

import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Typography } from '@mui/material'
import { useSelector } from 'react-redux'

export const LastArchivedField = () => {
  const { task } = useSelector(selectTaskDetails)
  console.log('task', task)

  if (!task?.isArchived) return null

  return (
    <Typography
      variant="sm"
      fontStyle="italic"
      sx={{
        color: (theme) => theme.color.gray[500],
      }}
    >
      Archived {!task || !task.lastArchivedDate ? null : getTimeDifference(task.lastArchivedDate)}
    </Typography>
  )
}
