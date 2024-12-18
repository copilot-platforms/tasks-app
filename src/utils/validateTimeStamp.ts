export const validateTimeStamp = (timeStamp: Date | string) => {
  const validatedTimestamp = new Date(timeStamp)

  const isoString = validatedTimestamp.toISOString()

  if (!isoString.endsWith('Z')) {
    return new Date(isoString + 'Z') //DB stores GMT timestamp without 'z', so need to append this manually
  }

  return validatedTimestamp
}
