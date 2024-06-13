import React from 'react'

export const getTimeDifference = (createdAt: string): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(createdAt).getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} days ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} months ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} years ago`
}
