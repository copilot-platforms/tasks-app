import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import { useCallback } from 'react'

dayjs.extend(isToday)
dayjs.extend(isTomorrow)

interface DueDateLayoutProp {
  date: string | Date
}

export const DueDateLayout = ({ date }: DueDateLayoutProp) => {
  const now = dayjs()
  const calculateFormattedDueDate = useCallback(() => {
    const parsedDate = dayjs(date)

    if (parsedDate.isToday()) {
      return 'Today'
    } else if (parsedDate.isTomorrow()) {
      return 'Tomorrow'
    } else {
      return parsedDate.format('MMMM D, YYYY')
    }
  }, [date])

  const formattedDueDate = calculateFormattedDueDate()
  const isPast = now.isAfter(formattedDueDate)

  return (
    <Typography variant="bodySm" sx={{ color: (theme) => (isPast ? theme.color.error : theme.color.gray[500]) }}>
      {formattedDueDate}
    </Typography>
  )
}
