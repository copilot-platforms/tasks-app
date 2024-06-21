import React from 'react'
import { formatDistance, subDays } from 'date-fns'

export const getTimeDifference = (createdAt: string): string => {
  const now = new Date()
  const formattedDate = formatDistance(createdAt, now)
  return formattedDate
}
