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

  if (diffInWeeks < 4 || (diffInWeeks === 4 && diffInDays < 30)) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
  } //4 weeks is not necessarily a month, there will still be 2 days left to complete a month. So in those 2 days, it will show 0 months, to fix this added a check: diffInDays<30

  const diffInMonths = now.diff(targetTime, 'month')
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }

  const diffInYears = now.diff(targetTime, 'year')
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}
