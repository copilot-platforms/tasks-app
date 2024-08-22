import { copilotAPIKey as apiKey } from '@/config'
import {
  ClientRequest,
  ClientResponse,
  ClientResponseSchema,
  ClientsResponseSchema,
  ClientToken,
  ClientTokenSchema,
  CompaniesResponse,
  CompaniesResponseSchema,
  CompanyCreateRequest,
  CompanyResponse,
  CompanyResponseSchema,
  CopilotListArgs,
  CustomFieldResponse,
  CustomFieldResponseSchema,
  InternalUsers,
  InternalUsersResponse,
  InternalUsersResponseSchema,
  InternalUsersSchema,
  IUToken,
  IUTokenSchema,
  MeResponse,
  MeResponseSchema,
  NotificationCreatedResponse,
  NotificationCreatedResponseSchema,
  NotificationRequestBody,
  Token,
  TokenSchema,
  WorkspaceResponse,
  WorkspaceResponseSchema,
} from '@/types/common'
import type { CopilotAPI as SDK } from 'copilot-node-sdk'
import { copilotApi } from 'copilot-node-sdk'

export class CopilotAPI {
  copilot: SDK

  constructor(token: string, customApiKey?: string) {
    this.copilot = copilotApi({ apiKey: customApiKey ?? apiKey, token })
  }

  async getTokenPayload(): Promise<Token | null> {
    const getTokenPayload = this.copilot.getTokenPayload
    if (!getTokenPayload) return null

    return TokenSchema.parse(await getTokenPayload())
  }

  async me(): Promise<MeResponse | null> {
    const tokenPayload = await this.getTokenPayload()
    const id = tokenPayload?.internalUserId || tokenPayload?.clientId
    if (!tokenPayload || !id) return null

    const retrieveCurrentUserInfo = tokenPayload.internalUserId
      ? this.copilot.retrieveInternalUser
      : this.copilot.retrieveClient
    const currentUserInfo = await retrieveCurrentUserInfo({ id })

    return MeResponseSchema.parse(currentUserInfo)
  }

  async getWorkspace(): Promise<WorkspaceResponse> {
    return WorkspaceResponseSchema.parse(await this.copilot.retrieveWorkspace())
  }

  async getClientTokenPayload(): Promise<ClientToken | null> {
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return ClientTokenSchema.parse(tokenPayload)
  }

  async getIUTokenPayload(): Promise<IUToken | null> {
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return IUTokenSchema.parse(tokenPayload)
  }

  async createClient(requestBody: ClientRequest, sendInvite: boolean = false): Promise<ClientResponse> {
    return ClientResponseSchema.parse(await this.copilot.createClient({ sendInvite, requestBody }))
  }

  async getClient(id: string): Promise<ClientResponse> {
    return ClientResponseSchema.parse(await this.copilot.retrieveClient({ id }))
  }

  async getClients(args: CopilotListArgs & { companyId?: string } = {}) {
    return ClientsResponseSchema.parse(await this.copilot.listClients(args))
  }

  async updateClient(id: string, requestBody: ClientRequest): Promise<ClientResponse> {
    // @ts-ignore
    return ClientResponseSchema.parse(await this.copilot.updateClient({ id, requestBody }))
  }

  async deleteClient(id: string) {
    return await this.copilot.deleteClient({ id })
  }

  async createCompany(requestBody: CompanyCreateRequest) {
    return CompanyResponseSchema.parse(await this.copilot.createCompany({ requestBody }))
  }

  async getCompany(id: string): Promise<CompanyResponse> {
    return CompanyResponseSchema.parse(await this.copilot.retrieveCompany({ id }))
  }

  async getCompanies(args: CopilotListArgs = {}): Promise<CompaniesResponse> {
    return CompaniesResponseSchema.parse(await this.copilot.listCompanies(args))
  }

  async getCompanyClients(companyId: string): Promise<ClientResponse[]> {
    return (await this.getClients({ limit: 10000, companyId })).data || []
  }

  async getCustomFields(): Promise<CustomFieldResponse> {
    return CustomFieldResponseSchema.parse(await this.copilot.listCustomFields())
  }

  async getInternalUsers(args: CopilotListArgs = {}): Promise<InternalUsersResponse> {
    return InternalUsersResponseSchema.parse(await this.copilot.listInternalUsers(args))
  }

  async getInternalUser(id: string): Promise<InternalUsers> {
    return InternalUsersSchema.parse(await this.copilot.retrieveInternalUser({ id }))
  }

  async createNotification(requestBody: NotificationRequestBody): Promise<NotificationCreatedResponse> {
    return NotificationCreatedResponseSchema.parse(
      await this.copilot.createNotification({
        requestBody,
      }),
    )
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.copilot.markNotificationRead({ id })
  }

  async deleteNotification(id: string): Promise<void> {
    await this.copilot.deleteNotification({ id })
  }
}
