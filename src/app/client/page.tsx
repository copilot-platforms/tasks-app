export const fetchCache = 'force-no-store'

import { ClientTaskBoard } from './ui/ClientTaskBoard'
import { completeTask } from '@/app/client/actions'

export default async function ClientPage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  return (
    <ClientTaskBoard
      completeTask={async (taskId) => {
        'use server'
        completeTask({ token, taskId })
      }}
    />
  )
}
