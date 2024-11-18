'use client'

import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Typography } from '@mui/material'
import { useSelector } from 'react-redux'

export const LastArchivedField = () => {
  const { task } = useSelector(selectTaskDetails)

  if (!task?.isArchived) return null

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
