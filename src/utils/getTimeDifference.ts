import { formatDistance } from 'date-fns'

export const getTimeDifference = (createdAt: string): string => formatDistance(createdAt, new Date())
