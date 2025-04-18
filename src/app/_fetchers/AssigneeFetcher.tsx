export const fetchCache = 'force-no-store'

import { apiUrl } from '@/config'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { IAssignee, PropsWithToken, UserType } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import fetchRetry from 'fetch-retry'

const fetchWithRetry = fetchRetry(globalThis.fetch)

interface AssigneeFetcherProps extends PropsWithToken {
  viewSettings?: CreateViewSettingsDTO
  userType?: UserType
  isPreview?: boolean
  task?: TaskResponse
  clientCompanyId?: string
}

const fetchAssignee = async (
  token: string,
  userType?: UserType,
  isPreview?: boolean,
  clientCompanyId?: string,
): Promise<IAssignee> => {
  if (userType === UserType.CLIENT_USER && !isPreview) {
    const res = await fetchWithRetry(`${apiUrl}/api/users/client?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}`, {
      next: { tags: ['getAssigneeList'] },
      retries: 3,
      retryDelay: 100,
    })

    const data = await res.json()

    return data.clients
  }

  const res = await fetch(
    `${apiUrl}/api/users?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}&clientCompanyId=${clientCompanyId}`,
    {
      next: { tags: ['getAssigneeList'] },
    },
  )

  return (await res.json()).users as IAssignee
}
export const AssigneeFetcher = async ({
  token,
  userType,
  viewSettings,
  isPreview,
  task,
  clientCompanyId,
}: AssigneeFetcherProps) => {
  const [assignableUsersWithType, activeTaskAssignees] = await Promise.all([
    fetchAssignee(token, userType, isPreview).then(addTypeToAssignee),
    clientCompanyId
      ? fetchAssignee(token, userType, isPreview, clientCompanyId).then(addTypeToAssignee)
      : Promise.resolve([]),
  ])
  return (
    <ClientSideStateUpdate
      assignee={assignableUsersWithType}
      viewSettings={viewSettings}
      task={task}
      activeTaskAssignees={activeTaskAssignees}
    >
      {null}
    </ClientSideStateUpdate>
  )
}
