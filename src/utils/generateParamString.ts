export const encodeToParamString = (string: string) => {
  return string.replaceAll(' ', '-')
}

export const decodeParamString = (string: string) => {
  return string.replaceAll('-', ' ')
}
