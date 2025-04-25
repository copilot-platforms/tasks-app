import { RFC3339Date, RFC3339DateSchema } from '@/types/common'
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

/**
 * Util to convert datestring to a RFC3339 format
 * @param {DateString} datestring In format YYYY-MM-DD (This is human readable date - month starts from 1, not 0!)
 * @returns {string}
 */
export const toRFC3339 = (datestring: string | Date | null): RFC3339Date | null => {
  if (!datestring) return null
  const date = typeof datestring === 'string' ? new Date(datestring) : datestring

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }

  // Get the ISO string and strip milliseconds
  const iso = date.toISOString()
  return RFC3339DateSchema.parse(iso.replace(/\.\d{3}Z$/, 'Z')) // Remove milliseconds
}

export const rfc3339ToDateString = (date: string | null | undefined) => {
  if (!date) return date
  return new Date(date).toISOString().slice(0, 10)
}
