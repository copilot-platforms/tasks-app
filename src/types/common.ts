import { UserRole } from '@/app/api/core/types/user'
import { z } from 'zod'

export const HexColorSchema = z.string().refine((val) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val), {
  message: 'Invalid hex color code',
})

export type CopilotListArgs = {
  limit?: number
  nextToken?: string
}

export const TokenSchema = z.object({
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  internalUserId: z.string().optional(),
  workspaceId: z.string(),
})
export type Token = z.infer<typeof TokenSchema>

export const IUTokenSchema = z.object({
  internalUserId: z.string(),
  workspaceId: z.string(),
})
export type IUToken = z.infer<typeof IUTokenSchema>

export const ClientTokenSchema = z.object({
  clientId: z.string(),
  companyId: z.string().optional(),
  workspaceId: z.string(),
})
export type ClientToken = z.infer<typeof ClientTokenSchema>

export const MeResponseSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string(),
  portalName: z.string().optional(),
})
export type MeResponse = z.infer<typeof MeResponseSchema>

// Response schema for `/workspace` endpoint
export const WorkspaceResponseSchema = z.object({
  id: z.string(),
  isCompaniesEnabled: z.boolean().optional(),
  industry: z.string().optional(),
  isClientDirectSignUpEnabled: z.boolean().optional(),
  logOutUrl: z.string().optional(),
  brandName: z.string().optional(),
  squareIconUrl: z.string().optional(),
  fullLogoUrl: z.string().optional(),
  squareLoginImageUrl: z.string().optional(),
  socialSharingImageUrl: z.string().optional(),
  colorSidebarBackground: z.string().optional(),
  colorSidebarText: z.string().optional(),
  colorAccent: z.string().optional(),
  font: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})
export type WorkspaceResponse = z.infer<typeof WorkspaceResponseSchema>

export const ClientResponseSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string(),
  companyId: z.string(),
  status: z.string(),
  avatarImageUrl: z.string().nullable(),
  customFields: z.record(z.string(), z.union([z.string(), z.array(z.string())]).nullable()).nullish(),
  fallbackColor: z.string().nullish(),
})
export type ClientResponse = z.infer<typeof ClientResponseSchema>

export const ClientsResponseSchema = z.object({
  data: z.array(ClientResponseSchema).nullable(),
})
export type ClientsResponse = z.infer<typeof ClientsResponseSchema>

export const CompanyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconImageUrl: z.string().nullable(),
  fallbackColor: z.string().nullish(),
  isPlaceholder: z.boolean(),
})
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>

export const CompaniesResponseSchema = z.object({
  data: z.array(CompanyResponseSchema).nullable(),
})
export type CompaniesResponse = z.infer<typeof CompaniesResponseSchema>

export const CompanyCreateRequestSchema = z.object({
  name: z.string(),
  iconImageUrl: z.string().optional(),
  fallbackColor: HexColorSchema.optional(),
})
export type CompanyCreateRequest = z.infer<typeof CompanyCreateRequestSchema>

export const CustomFieldSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  type: z.string(),
  order: z.number(),
  object: z.string(),
  options: z
    .array(
      z.object({
        id: z.string(),
        key: z.string(),
        label: z.string(),
        color: z.string(),
      }),
    )
    .optional(),
})
export type CustomField = z.infer<typeof CustomFieldSchema>
export const CustomFieldResponseSchema = z.object({
  data: z.array(CustomFieldSchema).nullable(),
})
export type CustomFieldResponse = z.infer<typeof CustomFieldResponseSchema>

export const ClientRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  email: z.string().email(),
  companyId: z.string().uuid().optional(),
  // NOTE: customFields can also be passed as a JSON object, but CopilotAPI has its type defined to stringified JSON
  customFields: z.string().optional(),
})
export type ClientRequest = z.infer<typeof ClientRequestSchema>

export const InternalUsersSchema = z.object({
  id: z.string().uuid(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string().email(),
  avatarImageUrl: z.string().optional(),
  isClientAccessLimited: z.boolean(),
  companyAccessList: z.array(z.string()).nullable(),
  fallbackColor: z.string().nullish(),
})
export type InternalUsers = z.infer<typeof InternalUsersSchema>

export const InternalUsersResponseSchema = z.object({
  data: z.array(InternalUsersSchema),
})
export type InternalUsersResponse = z.infer<typeof InternalUsersResponseSchema>

/**
 * Notification RequestBody schema - accepted by SDK#createNotification
 */
export const NotificationRequestBodySchema = z.object({
  senderId: z.string(),
  recipientId: z.string(),
  deliveryTargets: z
    .object({
      inProduct: z
        .object({
          title: z.string(),
          body: z.string().optional(),
        })
        .optional(),
      email: z
        .object({
          subject: z.string().optional(),
          header: z.string().optional(),
          title: z.string().optional(),
          body: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

export type CopilotUser = InternalUsers | ClientResponse

export type NotificationRequestBody = z.infer<typeof NotificationRequestBodySchema>

export const NotificationCreatedResponseSchema = z.object({
  id: z.string().uuid(),
  appId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  event: z.string().optional(),
  object: z.string().optional(),
  recipientId: z.string().optional(),
  resourceId: z.string().optional(),
  senderId: z.string().optional(),
  senderType: z.string().optional(),
})
export type NotificationCreatedResponse = z.infer<typeof NotificationCreatedResponseSchema>

export const UserSchema = z.object({
  token: z.string(),
  role: z.nativeEnum(UserRole),
  workspaceId: z.string(),
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  internalUserId: z.string().optional(),
})

export interface FilterableUser {
  givenName?: string
  familyName?: string
  name?: string
}
