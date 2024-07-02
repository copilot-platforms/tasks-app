import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const getTimeDifference = (createdAt: string): string => dayjs().to(dayjs(createdAt)) //computes time difference to readable time difference between the current time and provided time. The dayjs extentention converts the difference to results like an hour ago, a day ago, 3 days ago and so on.
