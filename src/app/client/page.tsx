export const fetchCache = 'force-no-store'

import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { IAssignee } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { ClientTaskBoard } from './ui/ClientTaskBoard'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { completeTask } from './actions'

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users/client?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}`, {
    next: { tags: ['getAssigneeList'] },
  })
  const data = await res.json()
  return data.clients
}

export default async function ClientPage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  const assignee = addTypeToAssignee(await getAssigneeList(token))

  return (
    <>
      <ClientSideStateUpdate assignee={assignee}>
        <ClientTaskBoard
          completeTask={async (taskId) => {
            'use server'
            completeTask({ token, taskId })
          }}
        />
      </ClientSideStateUpdate>
    </>
  )
}
