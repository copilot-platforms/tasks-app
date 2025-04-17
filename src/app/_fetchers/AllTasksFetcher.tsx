export const fetchCache = 'force-no-store'

import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { AccessibleTasksResponse } from '@/types/dto/tasks.dto'
import { PropsWithToken } from '@/types/interfaces'
import { PropsWithChildren } from 'react'

const getAllAccessibleTasks = async (token: string): Promise<AccessibleTasksResponse[]> => {
  const select: (keyof AccessibleTasksResponse)[] = [
    'id',
    'assigneeId',
    'assigneeType',
    'title',
    'body',
    'parentId',
    'label',
  ]

  const res = await fetch(`${apiUrl}/api/tasks?token=${token}&all=1&select=${select.join(',')}`)
  const { tasks } = await res.json()
  return tasks
}

export const AllTasksFetcher = async ({ token, children }: PropsWithChildren & PropsWithToken) => {
  const accessibleTasks = await getAllAccessibleTasks(token)

  return <ClientSideStateUpdate accessibleTasks={accessibleTasks}>{children}</ClientSideStateUpdate>
}
