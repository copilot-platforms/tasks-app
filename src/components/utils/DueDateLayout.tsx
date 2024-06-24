import { Typography } from '@mui/material'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'

interface DueDateLayoutProp {
  date: string | Date
}

export const DueDateLayout = ({ date }: DueDateLayoutProp) => {
  const now = new Date()
  let formattedDueDate
  let isPast: boolean
  if (isToday(date)) {
    formattedDueDate = `Today`
  } else if (isTomorrow(date)) {
    formattedDueDate = `Tomorrow`
  } else {
    isPast = now > new Date(date)
    formattedDueDate = format(date, 'dd, MMM, yyyy')
  }

  return (
    <Typography variant="bodySm" sx={{ color: (theme) => (isPast ? theme.color.error : theme.color.gray[500]) }}>
      {formattedDueDate}
    </Typography>
  )
}
