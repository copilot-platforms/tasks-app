interface Sortable {
  dueDate?: string
  createdAt: Date
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
      // Sort by duedate in asc order
      return getTimestamp(a.dueDate) - getTimestamp(b.dueDate)
    } else {
      // Sort by createdAt in desc order
      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
    }
  })
}
