export const fetchCache = 'force-no-store'

import { IAssignee, UserType } from '@/types/interfaces'
import { apiUrl } from '@/config'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'

interface Props {
  token: string
  viewSettings?: CreateViewSettingsDTO
  userType?: UserType
  isPreview?: boolean
}

const fetchAssignee = async (token: string, userType?: UserType, isPreview?: boolean): Promise<IAssignee> => {
  if (userType === UserType.CLIENT_USER && !isPreview) {
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
export const AssigneeFetcher = async ({ token, userType, viewSettings, isPreview }: Props) => {
  const assignableUsersWithType = addTypeToAssignee(await fetchAssignee(token, userType, isPreview))
  return (
    <ClientSideStateUpdate assignee={assignableUsersWithType} viewSettings={viewSettings}>
      {null}
    </ClientSideStateUpdate>
  )
}
