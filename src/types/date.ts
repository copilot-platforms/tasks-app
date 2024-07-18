import { z } from 'zod'

export const DateStringSchema = z.string().refine(
  (dateString) => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(dateString)) {
      return false
    }

    const [year, month, day] = dateString.split('-').map(Number)

    // Check if year, month, and day are valid
    if (year < 1000 || year > 9999) return false
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 31) return false

    // Check if the day is valid for the given month and year
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      return false
    }

    return true
  },
  {
    message: 'Invalid date format or value. Expected format: YYYY-MM-DD',
  },
)

export type DateString = z.infer<typeof DateStringSchema>
