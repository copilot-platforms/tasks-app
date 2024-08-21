import { IAssignee, IAssigneeCombined } from '@/types/interfaces'

export function addTypeToAssignee(assignee?: IAssignee): IAssigneeCombined[] {
  if (!assignee) return []
  return (Object.keys(assignee) as (keyof IAssignee)[]).flatMap((key) => {
    return assignee[key].map((assignee) => ({
      ...assignee,
      type: key,
    }))
  })
}
