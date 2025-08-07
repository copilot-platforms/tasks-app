import dayjs from 'dayjs'

export const DueDateFormatter = (date: string | Date, isRelativeDate: boolean = false, variant: 'board' | 'detail') => {
  const parsedDate = dayjs(date)
  if (isRelativeDate) {
    if (parsedDate.isToday()) {
      return 'Today'
    }
    if (parsedDate.isTomorrow()) {
      return 'Tomorrow'
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

  const month = parsedDate.format('MMMM')
  const day = parsedDate.format('D')
  const year = parsedDate.format('YYYY')

  const formattedMonth = month.length <= 5 ? month : monthFormats[month]

  return variant == 'board' ? `Due: ${formattedMonth} ${day}` : `${formattedMonth} ${day}, ${year}`
}
