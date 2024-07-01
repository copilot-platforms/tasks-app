import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'

dayjs.extend(isToday)
dayjs.extend(isTomorrow)

interface DueDateLayoutProp {
  date: string | Date
}

export const DueDateLayout = ({ date }: DueDateLayoutProp) => {
  const now = dayjs()
  let formattedDueDate
  let isPast: boolean
  const parsedDate = dayjs(date)

  if (parsedDate.isToday()) {
    formattedDueDate = `Today`
  } else if (parsedDate.isTomorrow()) {
    formattedDueDate = `Tomorrow`
  } else {
    isPast = now.isAfter(parsedDate)
    formattedDueDate = parsedDate.format('MMMM D, YYYY')
  }

  return (
    <Typography variant="bodySm" sx={{ color: (theme) => (isPast ? theme.color.error : theme.color.gray[500]) }}>
      {formattedDueDate}
    </Typography>
  )
}
