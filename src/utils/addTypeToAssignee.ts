import { AssigneeType, IAssignee, IAssigneeCombined } from '@/types/interfaces'

export function addTypeToAssignee(assignee: IAssignee): IAssigneeCombined[] {
  const result: IAssigneeCombined[] = []

  // Iterate over each array in assignee
  for (const key in assignee) {
    if (Object.prototype.hasOwnProperty.call(assignee, key)) {
      const array = assignee[key as AssigneeType]

      // Add type field to each object in the array
      const newArray = array.map((obj) => {
        return { ...obj, type: key as AssigneeType }
      })

      // Concatenate newArray to result array
      result.push(...newArray)
    }
  }

  return result
}
