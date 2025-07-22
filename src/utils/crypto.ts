import * as crypto from 'crypto'

/**
 * Generates a 128-bit key from the given API key using HMAC-SHA256
 */
export const generate128BitKey = (apiKey: string): string => {
  const hmac = crypto.createHmac('sha256', apiKey).digest('hex')
  return hmac.slice(0, 32) // 32 chars = 128 bits
}

/**
 * Encrypts a string payload using AES-128-CBC with the provided hex key
 */
export const encryptAES128BitToken = (keyHex: string, payload: string): string => {
  const keyBuffer = Buffer.from(keyHex, 'hex')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, iv)
  let encrypted = cipher.update(payload, 'utf-8')
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const tokenBuffer = Buffer.concat([iv, encrypted])
  return tokenBuffer.toString('hex')
}

/**
 * Encodes a payload object as an encrypted hex string using the API key
 */
export const encodePayload = (apiKey: string, payload: unknown): string => {
  const payloadString = JSON.stringify(payload)
  const key = generate128BitKey(apiKey)
  return encryptAES128BitToken(key, payloadString)
}
