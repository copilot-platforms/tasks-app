interface CreatedAtOrderable {
  createdAt: string
}

export const orderByRecentlyCreatedAt = <T extends CreatedAtOrderable>(data: T[]): T[] =>
  data.sort((a: CreatedAtOrderable, b: CreatedAtOrderable) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })
