interface Sortable {
  dueDate?: string
  createdAt: Date
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
      } else {
        // If due dates are the same use descending createdAt order
        if (getTimestamp(a.createdAt) !== getTimestamp(b.createdAt)) {
          return getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
        } else {
          // If createdAt times are also equal, sort by id alphabetically
          return a.id.localeCompare(b.id)
        }
      }
    } else {
      // Sort by createdAt in desc order
      if (getTimestamp(a.createdAt) !== getTimestamp(b.createdAt)) {
        return getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      } else {
        // If createdAt times are equal, sort by id alphabetically
        return a.id.localeCompare(b.id)
      }
    }
  })
}
