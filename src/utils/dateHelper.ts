import { IsoDate, IsoDateSchema } from '@/types/dto/tasks.dto'

export function isoToReadableDate(isoString: IsoDate): IsoDate {
  // Create a Date object from the ISO string
  const date = new Date(isoString)

  // Adjust date to make sure it shows correctly for all time zones
  date.setUTCMinutes(date.getUTCMinutes() + date.getTimezoneOffset())

  // Define options for date formatting
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }

  // Format the date to a readable format
  const readableDate = date.toLocaleDateString('en-US', options)

  return IsoDateSchema.parse(readableDate)
}

export function formatDate(dateString: unknown): IsoDate {
  // Parse the date from the input format
  const date = new Date(dateString as Date)

  // Set the time to noon to avoid timezone issues causing date rollover
  date.setHours(12, 0, 0, 0)

  // Convert the date to ISO 8601 format in UTC
  const isoDate = date.toISOString()

  // Return only the date part with time reset to midnight UTC
  return IsoDateSchema.parse(`${isoDate.substring(0, 10)}T00:00:00Z`)
}
