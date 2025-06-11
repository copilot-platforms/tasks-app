import { IAssignee, IAssigneeCombined, ISelectorOption } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { AssigneeType } from '@prisma/client'

export type ObjectType = 'client' | 'internalUser' | 'company'

export function addTypeToAssignee(assignee?: IAssignee): IAssigneeCombined[] {
  if (!assignee) return []
  return (Object.keys(assignee) as (keyof IAssignee)[]).flatMap((key) => {
    return assignee[key].map((assignee) => ({
      ...assignee,
      type: key,
    }))
  })
}

export async function parseAssigneeToSelectorOption(
  token: string,
  assignee?: IAssignee,
): Promise<{
  clients: ISelectorOption[]
  internalUsers: ISelectorOption[]
  companies: ISelectorOption[]
}> {
  if (!assignee) {
    return {
      clients: [],
      internalUsers: [],
      companies: [],
    }
  }
  const copilot = new CopilotAPI(token)
  const parseCategory = async (category: Record<string, any> | undefined, type: ObjectType): Promise<ISelectorOption[]> => {
    if (!category) return []

    const results = Object.values(category).map((item: any) => {
      if (type === AssigneeType.client) {
        return (item.companyIds ?? [item.companyId]).map((companyId: string) => ({
          value: item.id,
          label: getAssigneeName(item),
          avatarSrc: item.avatarImageUrl ?? item.iconImageUrl,
          avatarFallbackColor: item.fallbackColor,
          companyId,
          type,
        }))
      } else {
        return {
          value: item.id,
          label: getAssigneeName(item),
          avatarSrc: item.avatarImageUrl ?? item.iconImageUrl,
          avatarFallbackColor: item.fallbackColor,
          companyId: item.companyId,
          type,
        }
      }
    })

    // Flatten the result because client branch returns an array of clients for each company
    return results.flat()
  }

  const [clients, internalUsers, companies] = await Promise.all([
    parseCategory(assignee.clients, 'client'),
    parseCategory(assignee.internalUsers, 'internalUser'),
    parseCategory(assignee.companies, 'company'),
  ])

  return {
    clients: parseCategory(assignee.clients, AssigneeType.client),
    internalUsers: parseCategory(assignee.internalUsers, AssigneeType.internalUser),
    companies: parseCategory(assignee.companies, AssigneeType.company),
  }
}
