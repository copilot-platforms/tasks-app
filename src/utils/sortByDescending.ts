interface Sortable {
  dueDate?: string
  createdAt: string
  id: string
}

const getTimestamp = (date: string | Date) => new Date(date).getTime()

export const sortTaskByDescendingOrder = <T extends Sortable>(tasks: T[]): T[] => {
  return tasks.sort((a, b) => {
    // Prioritize tasks with due dates over tasks without due dates
    if (a.dueDate && !b.dueDate) {
      return -1
    } else if (b.dueDate && !a.dueDate) {
      return 1
    } else if (a.dueDate && b.dueDate) {
      // Sort by duedate in asc order.
      if (a.dueDate !== b.dueDate) {
        return getTimestamp(a.dueDate) - getTimestamp(b.dueDate)
      }
    }
    const createdAtDiff = getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
    return createdAtDiff !== 0 ? createdAtDiff : a.id.localeCompare(b.id)
  })
}

interface TemplateSortable {
  createdAt: Date
  id: string
}

export const sortTemplatesByDescendingOrder = <T extends TemplateSortable>(templates: readonly T[]): T[] => {
  return [...templates].sort((a, b) => {
    const createdAtDiff = getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
    return createdAtDiff !== 0 ? createdAtDiff : a.id.localeCompare(b.id)
  })
}
