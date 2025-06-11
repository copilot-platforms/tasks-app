import { IAssignee, IAssigneeCombined, ISelectorOption } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { CopilotAPI } from './CopilotAPI'

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

    const results = await Promise.all(
      Object.values(category).map(async (item: any) => {
        if (type === 'client') {
          const retrievedClient = await copilot.getClient(item.id)
          return (retrievedClient.companyIds ?? []).map((companyId: string) => ({
            value: item.id,
            label: getAssigneeName(item),
            avatarSrc: item.avatarImageUrl ?? item.iconImageUrl,
            avatarFallbackColor: item.fallbackColor,
            companyId,
            type,
          })) // Doing this monstrosity because getClients's response has empty array on companyIds. This is done to flatten clients based on their companyIds which are only provided by the getClient() method as of now.
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
      }),
    )

    // Flatten the result because client branch returns an array of options
    return results.flat()
  }

  const [clients, internalUsers, companies] = await Promise.all([
    parseCategory(assignee.clients, 'client'),
    parseCategory(assignee.internalUsers, 'internalUser'),
    parseCategory(assignee.companies, 'company'),
  ])

  return {
    clients,
    internalUsers,
    companies,
  }
}
