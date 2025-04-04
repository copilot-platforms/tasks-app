export const buildLtree = (...paths: string[]) => {
  return paths.map(buildLtreeNodeString).join('.')
}

export const buildLtreeNodeString = (str: string) => {
  return str.toLowerCase().replaceAll('-', '_')
}
