import { DateString } from '@/types/date'

export function formatDate(dateString: string): DateString {
  // Parse the date from the input format
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const year = date.getFullYear()

  return `${year}-${month}-${day}`
}

/**
 * Util to convert datestring to a Date object
 * @param {DateString} dateString In format YYYY-MM-DD (This is human readable date - month starts from 1, not 0!)
 * @returns {Date}
 */
export function createDateFromFormattedDateString(dateString: string): Date {
  // Split the date string into day, month, and year
  const [year, month, day] = dateString.split('-').map(Number)

  // IN JS month is zero-based to increase suffering for humankind, so we subtract 1 from the month
  return new Date(year, month - 1, day)
}
