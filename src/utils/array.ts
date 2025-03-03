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
