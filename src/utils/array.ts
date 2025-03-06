/**
 * Gets the difference between two arrays
 */
export const getArrayDifference = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter((item) => !arr2.includes(item))
}

/**
 * Gets the intersection between two arrays
 */
export const getArrayIntersection = <T>(arr1: T[], arr2: T[]): T[] => {
  const set2 = new Set(arr2)
  return arr1.filter((item) => set2.has(item))
}

type Grouped<T> = {
  [key: string]: T[]
}

/**
 * Group an array of object by object key
 */
export const groupBy = <T, K extends keyof T>(arr: T[], key: K): Grouped<T> => {
  return arr.reduce((acc, obj) => {
    const groupKey = String(obj[key]) // Ensure key is string for object keys
    acc[groupKey] = acc[groupKey] || []
    acc[groupKey].push(obj)
    return acc
  }, {} as Grouped<T>)
}
