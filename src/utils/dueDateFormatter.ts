import dayjs from 'dayjs'

export const DueDateFormatter = (
  date: string | Date,
  isRelativeDate: boolean = false,
  variant: 'short' | 'long' = 'long',
  isClient: boolean = false,
) => {
  const parsedDate = dayjs(date)
  if (isRelativeDate) {
    if (parsedDate.isToday()) {
      return isClient ? 'Due: Today' : 'Today'
    }
    if (parsedDate.isTomorrow()) {
      return isClient ? 'Due: Tomorrow' : 'Tomorrow'
    }
  }
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

  const month = parsedDate.format('MMM')
  const day = parsedDate.format('D')
  const year = parsedDate.format('YYYY')

  const formattedMonth = month.length <= 5 ? month : monthFormats[month]

  return variant === 'short' ? `${isClient ? 'Due: ' : ''}${formattedMonth} ${day}` : `${formattedMonth} ${day}, ${year}`
}
