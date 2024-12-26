import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const getTimeDifference = (createdAt: string): string => {
  const now = dayjs()

  // Ensure the input timestamp always has a Z (UTC) if no timezone is present
  const sanitizedCreatedAt = createdAt.match(/Z|[+-]\d{2}:\d{2}$/) ? createdAt : `${createdAt}Z`

  const targetTime = dayjs(sanitizedCreatedAt)
  const diffInSeconds = now.diff(targetTime, 'second')

  if (diffInSeconds < 60) {
    return `Just now`
  }

  const diffInMinutes = now.diff(targetTime, 'minute')
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }

  const diffInHours = now.diff(targetTime, 'hour')
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }

  const diffInDays = now.diff(targetTime, 'day')
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }

  const diffInWeeks = now.diff(targetTime, 'week')
  const diffInMonths = now.diff(targetTime, 'month')

  if (diffInWeeks < 4 || (diffInWeeks === 4 && diffInMonths < 1)) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
  }

  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }

  const diffInYears = now.diff(targetTime, 'year')
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}
