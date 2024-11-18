export const getSearchParams = <T extends string>(searchParams: URLSearchParams, fields: T[]): Record<T, string | null> => {
  return fields.reduce(
    (acc, key) => {
      acc[key] = searchParams.get(key)
      return acc
    },
    {} as Record<T, string | null>,
  )
}

export const getBooleanQuery = (val: string | null, defaultValue: boolean = false): boolean => {
  if (val === null) return defaultValue

  const falseyValues = ['0', 'false']
  return !falseyValues.includes(val)
}
