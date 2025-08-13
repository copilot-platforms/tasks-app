import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import { useCallback } from 'react'
import { createDateFromFormattedDateString } from '@/utils/dateHelper'
import { DateString } from '@/types/date'
import { DueDateFormatter } from '@/utils/dueDateFormatter'

dayjs.extend(isToday)
dayjs.extend(isTomorrow)

interface DueDateLayoutProp {
  dateString: DateString
  isDone: boolean
  variant?: 'short' | 'long'
  isClient?: boolean
}

export const DueDateLayout = ({ dateString, isDone, variant = 'long', isClient = false }: DueDateLayoutProp) => {
  const date = createDateFromFormattedDateString(dateString)
  const now = dayjs()
  const calculateFormattedDueDate = useCallback(() => {
    return DueDateFormatter(date, true, variant, isClient)
  }, [date])

  const formattedDueDate = calculateFormattedDueDate()

  const isPast = now.isAfter(dateString)
  return (
    <Typography variant="bodySm" sx={{ color: (theme) => (isPast && !isDone ? theme.color.error : theme.color.gray[500]) }}>
      {formattedDueDate}
    </Typography>
  )
}
