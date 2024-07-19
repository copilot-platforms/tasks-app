import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import { useCallback } from 'react'
import { createDateFromFormattedDateString } from '@/utils/dateHelper'
import { DateString } from '@/types/date'

dayjs.extend(isToday)
dayjs.extend(isTomorrow)

interface DueDateLayoutProp {
  dateString: DateString
}

export const DueDateLayout = ({ dateString }: DueDateLayoutProp) => {
  const date = createDateFromFormattedDateString(dateString)
  const now = dayjs()
  const calculateFormattedDueDate = useCallback(() => {
    const parsedDate = dayjs(date)

    if (parsedDate.isToday()) {
      return 'Today'
    } else if (parsedDate.isTomorrow()) {
      return 'Tomorrow'
    } else {
      const monthFormats: { [key: string]: string } = {
        January: 'Jan',
        February: 'Feb',
        March: 'March',
        April: 'April',
        May: 'May',
        June: 'June',
        July: 'July',
        August: 'Aug',
        September: 'Sep',
        October: 'Oct',
        November: 'Nov',
        December: 'Dec',
      }

      const month = parsedDate.format('MMMM')
      const day = parsedDate.format('D')
      const year = parsedDate.format('YYYY')

      const formattedMonth = month.length <= 5 ? month : monthFormats[month]

      return `${formattedMonth} ${day}, ${year}`
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
