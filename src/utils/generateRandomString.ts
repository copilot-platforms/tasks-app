import { v4 as uuidv4 } from 'uuid'

export function generateRandomString(name: string) {
  const result = uuidv4()
  const safeName = name.replace(/[^a-zA-Z0-9\/\-_\.]/g, '_') //regex made to replace characters which are not alphanumeric, slash, dash, underscore, period with and underscore

  return result + '_' + safeName
}
