interface BaseSortable {
  createdAt: string
  id: string
}

interface WithDueDate extends BaseSortable {
  dueDate?: string
}

const getTimestamp = (date: string | Date) => new Date(date).getTime()

export const sortByDescendingOrder = <T extends BaseSortable, K extends keyof T = never>(
  items: T[],
  priorityKey?: K,
): T[] => {
  return [...items].sort((a, b) => {
    if (priorityKey) {
      const aVal = a[priorityKey] as unknown as string | undefined
      const bVal = b[priorityKey] as unknown as string | undefined

      if (aVal && !bVal) return -1
      if (bVal && !aVal) return 1
      if (aVal && bVal && aVal !== bVal) {
        return getTimestamp(aVal) - getTimestamp(bVal)
      }
    }

    const createdAtDiff = getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
    return createdAtDiff !== 0 ? createdAtDiff : a.id.localeCompare(b.id)
  })
}

export const sortTaskByDescendingOrder = <T extends WithDueDate>(tasks: T[]) => sortByDescendingOrder(tasks, 'dueDate')

export const sortTemplatesByDescendingOrder = <T extends BaseSortable>(templates: T[]) => sortByDescendingOrder(templates)
