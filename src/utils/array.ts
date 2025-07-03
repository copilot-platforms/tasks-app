/**
 * Gets the difference between two arrays
 */
export const getArrayDifference = <T>(arr1: readonly T[], arr2: readonly T[]): T[] => {
  return arr1.filter((item) => !arr2.includes(item))
}

/**
 * Gets the intersection between two arrays
 */
export const getArrayIntersection = <T>(arr1: readonly T[], arr2: readonly T[]): T[] => {
  const set2 = new Set(arr2)
  return arr1.filter((item) => set2.has(item))
}

export type Grouped<T> = Record<string, T[]>

/**
 * Group an array of object by object key
 */
export const groupBy = <T, K extends keyof T>(arr: readonly T[], key: K): Grouped<T> => {
  return arr.reduce<Grouped<T>>((acc, obj) => {
    const groupKey = String(obj[key])
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(obj)
    return acc
  }, {})
}
