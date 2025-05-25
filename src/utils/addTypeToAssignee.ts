import { IAssignee, IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { Option } from 'copilot-design-system'

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

export function parseAssigneeToSelectorOption(assignee?: IAssignee): {
  clients: Option[]
  internalUsers: Option[]
  companies: Option[]
} {
  if (!assignee) {
    return {
      clients: [],
      internalUsers: [],
      companies: [],
    }
  }

  const parseCategory = (category: Record<string, any> | undefined, type: ObjectType): Option[] => {
    if (!category) return []
    return Object.values(category).map((item: any) => ({
      value: item.id,
      label: getAssigneeName(item),
      avatarSrc: item.avatarImageUrl ?? item.iconImageUrl,
      avatarFallbackColor: item.fallbackColor,
      companyId: item.companyId,
      type,
    }))
  }

  return {
    clients: parseCategory(assignee.clients, 'client'),
    internalUsers: parseCategory(assignee.internalUsers, 'internalUser'),
    companies: parseCategory(assignee.companies, 'company'),
  }
}
