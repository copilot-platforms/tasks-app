'use client'

import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

export const LastArchivedField = () => {
  const { task } = useSelector(selectTaskDetails)
  const [timeAgoText, setTimeAgoText] = useState<string | null>(null)

  useEffect(() => {
    if (!task?.lastArchivedDate) return

    // Update the time difference immediately
    setTimeAgoText(getTimeDifference(task.lastArchivedDate))

    // Set an interval to update the time difference every 60 seconds
    const interval = setInterval(() => {
      setTimeAgoText(getTimeDifference(task.lastArchivedDate))
    }, 60000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [task?.lastArchivedDate])

  if (!task?.isArchived || !timeAgoText) return null

  return (
    <Typography
      variant="sm"
      fontStyle="italic"
      sx={{
        color: (theme) => theme.color.gray[500],
      }}
    >
      {`Archived ${timeAgoText.toLowerCase()}`}
    </Typography>
  )
}
