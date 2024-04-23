export enum UserType {
  INTERNAL_USER = 'iu',
  CLIENT_USER = 'cu',
}

export interface IAssignee {
  ius: Omit<IIus, 'type'>[]
  clients: Omit<IClient, 'type'>[]
  companies: Omit<ICompany, 'type'>[]
}

export interface IIus {
  id: string
  givenName: string
  familyName: string
  email: string
  type: AssigneeType
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
  type: AssigneeType
}

export interface ICompany {
  id: string
  name: string
  iconImageUrl: string
  fallbackColor: string
  type: AssigneeType
}

export type AssigneeType = keyof IAssignee

export interface IAssigneeCombined {
  id: string
  givenName?: string
  familyName?: string
  email?: string
  type: AssigneeType
  companyId?: string
  status?: string
  avatarImageUrl?: string
  customFields?: unknown
  name?: string
  iconImageUrl?: string
  fallbackColor?: string
}
