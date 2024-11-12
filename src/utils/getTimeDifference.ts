import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const getTimeDifference = (createdAt: string): string => {
  const now = dayjs()
  const targetTime = dayjs(createdAt)
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
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
  }

  const diffInMonths = now.diff(targetTime, 'month')
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }

  const diffInYears = now.diff(targetTime, 'year')
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}
