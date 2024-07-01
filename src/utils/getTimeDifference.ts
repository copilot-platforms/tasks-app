import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const getTimeDifference = (createdAt: string): string => dayjs().to(dayjs(createdAt))
