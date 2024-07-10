import { IAssignee } from '@/types/interfaces'

/**
 * Client side service fn to query for keyword matching Copilot IUs / Clients / Companies' name fields
 * @param token CopilotAPI token
 * @param keyword Keyword to match
 * @returns {IAssignee} Assignee list
 */
export async function getAssigneeList(token: string, keyword?: string): Promise<IAssignee> {
  const reqUrl = `/api/users?token=${token}` + (keyword ? `&search=${keyword}` : '')
  const res = await fetch(reqUrl, {
    next: { tags: ['getAssigneeList'] },
  })

  const data = await res.json()

  return data.users
}
