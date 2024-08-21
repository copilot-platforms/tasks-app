export const fetchCache = 'force-no-store'

import { IAssignee, UserType } from '@/types/interfaces'
import { apiUrl } from '@/config'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'

interface Props {
  token: string
  userType?: UserType
}

const fetchAssignee = async (token: string, userType?: UserType): Promise<IAssignee> => {
  if (userType === UserType.CLIENT_USER) {
    const res = await fetch(`${apiUrl}/api/users/client?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}`, {
      next: { tags: ['getAssigneeList'] },
    })

    const data = await res.json()

    return data.clients
  }

  const res = await fetch(`${apiUrl}/api/users?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}`, {
    next: { tags: ['getAssigneeList'] },
  })

  return (await res.json()).users as IAssignee
}

export const AssigneeFetcher = async ({ token, userType }: Props) => {
  const assignableUsersWithType = addTypeToAssignee(await fetchAssignee(token, userType))

  return <ClientSideStateUpdate assignee={assignableUsersWithType}>{null}</ClientSideStateUpdate>
}
