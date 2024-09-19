interface CreatedAtOrderable {
  createdAt: string
}

export const orderByRecentCreatedAt = <T extends CreatedAtOrderable>(data: T[]) =>
  data.sort((a: CreatedAtOrderable, b: CreatedAtOrderable) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })
