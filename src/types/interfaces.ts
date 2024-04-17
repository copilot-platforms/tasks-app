export interface IAssignee {
  name: string
  type: string
  img?: string
}

export enum UserType {
  INTERNAL_USER = 'iu',
  CLIENT_USER = 'cu',
}
