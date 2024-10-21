export function generateRandomString(name: string) {
  const result = crypto.randomUUID()
  return result + '_' + name
}
