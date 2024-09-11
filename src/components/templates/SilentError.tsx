'use client'

import ClientErrorBoundary from '@/app/error'

interface SilentErrorProps {
  message: string
}
export const SilentError = ({ message }: SilentErrorProps) => {
  return <ClientErrorBoundary error={new Error(message)} />
  // Make sure this `error` is never actually thrown
}
