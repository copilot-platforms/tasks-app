'use client'

import ClientErrorBoundary from '@/app/error'
import { useRouter } from 'next/navigation'

interface SilentErrorProps {
  message: string
}
export const SilentError = ({ message }: SilentErrorProps) => {
  const router = useRouter()

  return <ClientErrorBoundary error={new Error(message)} reset={router.refresh} />
  // Make sure this `error` is never actually thrown
}
