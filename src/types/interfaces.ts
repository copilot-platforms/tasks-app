export enum UserType {
  INTERNAL_USER = 'iu',
  CLIENT_USER = 'cu',
}

export interface IAssignee {
  ius: IIus[]
  clients: IClient[]
  companies: ICompany[]
}

export interface IIus {
  id: string
  givenName: string
  familyName: string
  email: string
}

export interface IClient {
  id: string
  givenName: string
  familyName: string
  email: string
  companyId: string
  status: string
  avatarImageUrl: string
  customFields: unknown
}

export interface ICompany {
  id: string
  name: string
  iconImageUrl: string
  fallbackColor: string
}

export type AssigneeType = keyof IAssignee

export type IAssigneeCombined = (IIus | IClient | ICompany) & { type: AssigneeType }
