import { z } from 'zod'
import { UserSchema } from './common'
import { UpdateTaskRequestSchema } from './dto/tasks.dto'

export enum TargetMethod {
  EDIT = 'edit',
  POST = 'post',
}

export enum UserType {
  INTERNAL_USER = 'iu',
  CLIENT_USER = 'cu',
}

export enum View {
  LIST_VIEW = 'list',
  BOARD_VIEW = 'board',
}

export enum CreateTaskErrors {
  TITLE = 'title',
  ASSIGNEE = 'assignee',
}

export enum FileTypes {
  PNG = 'image/png',
  PDF = 'application/pdf',
  SVG = 'image/svg+xml',
  CSV = 'text/csv',
  ZIP = 'application/zip',
  MSWORD = 'application/msword',
  AVI = 'video/vnd.avi',
  JPEG = 'image/jpeg',
  QUICKTIME = 'video/quicktime',
  MP4 = 'video/mp4',
  EXCEL = 'application/vnd.ms-excel',
  ISO = 'application/vnd.efi.iso',
  PLAIN = 'text/plain',
  GIF = 'image/gif',
  MPEG = 'audio/mpeg',
}

export enum FilterOptions {
  ASSIGNEE = 'assignee',
  KEYWORD = 'keyword',
  TYPE = 'type',
}

export enum FilterByOptions {
  CLIENT = 'clients',
  COMPANY = 'companies',
  IUS = 'internalUsers',
  NOFILTER = 'none',
}

export enum FilterOptionsKeywords {
  CLIENTS = 'clients_companies',
  TEAM = 'ius',
}

export enum handleSelectorComponentModes {
  CreateTaskFieldUpdate,
  //add more modes here if we are to extend useHandleSelectorComponent with more features.
}

export type IFilterOptions = {
  [key in FilterOptions]: string
}

export interface IAssignee {
  ius: Omit<IIus, 'type'>[]
  internalUsers: Omit<IIus, 'type'>[]
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

export interface IAssigneeSuggestions {
  id: string
  label: string
}

export interface ITemplate {
  id: string
  workspaceId: string
  templateName: string
  title: string
  body: string
  assigneeId: string
  assigneeType: string
  workflowStateId: string
  createdBy: string
}

export interface ISignedUrlUpload {
  signedUrl: string
  token: string
  path: string
}

export interface IExtraOption {
  id: string
  name: string
  value?: string
  extraOptionFlag: true
  avatarImageUrl?: string
}

export const DataSchema = z.object({
  user: UserSchema,
  task: UpdateTaskRequestSchema,
})

export const UserTypesName = {
  ius: 'Internal users',
  internalUsers: 'Internal users',
  clients: 'Clients',
  companies: 'Companies',
}
