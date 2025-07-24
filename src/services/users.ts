import { IAssignee } from '@/types/interfaces'
import { buildOptionalSearchParam } from '@/utils/string'

/**
 * Client side service fn to query for keyword matching Copilot IUs / Clients / Companies' name fields
 * @param token CopilotAPI token
 * @param keyword Keyword to match
 * @returns {IAssignee} Assignee list
 */
export async function getAssigneeList(
  token: string,
  keyword?: string,
  limit?: number,
  nextToken?: string,
  filterOptions?: string,
): Promise<IAssignee> {
  const reqUrl =
    `/api/users?token=${token}` +
    buildOptionalSearchParam('search', keyword) +
    buildOptionalSearchParam('limit', limit) +
    buildOptionalSearchParam('nextToken', nextToken) +
    buildOptionalSearchParam('userType', filterOptions)

  const res = await fetch(reqUrl, {
    next: { tags: ['getAssigneeList'] },
  })

  const data = await res.json()

  return data.users
}
