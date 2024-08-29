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

  constructor(
    private token: string,
    customApiKey?: string,
  ) {
    this.copilot = copilotApi({ apiKey: customApiKey ?? apiKey, token })
  }

  async getTokenPayload(): Promise<Token | null> {
    console.info('CopilotAPI#getTokenPayload | token =', this.token)
    const getTokenPayload = this.copilot.getTokenPayload
    if (!getTokenPayload) {
      console.error(`CopilotAPI#getTokenPayload | Could not parse token payload for token ${this.token}`)
      return null
    }

    return TokenSchema.parse(await getTokenPayload())
  }

  async me(): Promise<MeResponse | null> {
    console.info('CopilotAPI#me | token =', this.token)
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
    console.info('CopilotAPI#getWorkspace | token =', this.token)
    return WorkspaceResponseSchema.parse(await this.copilot.retrieveWorkspace())
  }

  async getClientTokenPayload(): Promise<ClientToken | null> {
    console.info('CopilotAPI#getClientTokenPayload | token =', this.token)
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return ClientTokenSchema.parse(tokenPayload)
  }

  async getIUTokenPayload(): Promise<IUToken | null> {
    console.info('CopilotAPI#getIUTokenPayload | token =', this.token)
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return IUTokenSchema.parse(tokenPayload)
  }

  async createClient(requestBody: ClientRequest, sendInvite: boolean = false): Promise<ClientResponse> {
    console.info('CopilotAPI#createClient | token =', this.token)
    return ClientResponseSchema.parse(await this.copilot.createClient({ sendInvite, requestBody }))
  }

  async getClient(id: string): Promise<ClientResponse> {
    console.info('CopilotAPI#getClient | token =', this.token)
    return ClientResponseSchema.parse(await this.copilot.retrieveClient({ id }))
  }

  async getClients(args: CopilotListArgs & { companyId?: string } = {}) {
    console.info('CopilotAPI#getClients | token =', this.token)
    return ClientsResponseSchema.parse(await this.copilot.listClients(args))
  }

  async updateClient(id: string, requestBody: ClientRequest): Promise<ClientResponse> {
    console.info('CopilotAPI#updateClient | token =', this.token)
    // @ts-ignore
    return ClientResponseSchema.parse(await this.copilot.updateClient({ id, requestBody }))
  }

  async deleteClient(id: string) {
    console.info('CopilotAPI#deleteClient | token =', this.token)
    return await this.copilot.deleteClient({ id })
  }

  async createCompany(requestBody: CompanyCreateRequest) {
    console.info('CopilotAPI#createCompany | token =', this.token)
    return CompanyResponseSchema.parse(await this.copilot.createCompany({ requestBody }))
  }

  async getCompany(id: string): Promise<CompanyResponse> {
    console.info('CopilotAPI#getCompany | token =', this.token)
    return CompanyResponseSchema.parse(await this.copilot.retrieveCompany({ id }))
  }

  async getCompanies(args: CopilotListArgs = {}): Promise<CompaniesResponse> {
    console.info('CopilotAPI#getCompanies | token =', this.token)
    return CompaniesResponseSchema.parse(await this.copilot.listCompanies(args))
  }

  async getCompanyClients(companyId: string): Promise<ClientResponse[]> {
    console.info('CopilotAPI#getCompanyClients | token =', this.token)
    return (await this.getClients({ limit: 10000, companyId })).data || []
  }

  async getCustomFields(): Promise<CustomFieldResponse> {
    console.info('CopilotAPI#getCustomFields | token =', this.token)
    return CustomFieldResponseSchema.parse(await this.copilot.listCustomFields())
  }

  async getInternalUsers(args: CopilotListArgs = {}): Promise<InternalUsersResponse> {
    console.info('CopilotAPI#getInternalUsers | token =', this.token)
    return InternalUsersResponseSchema.parse(await this.copilot.listInternalUsers(args))
  }

  async getInternalUser(id: string): Promise<InternalUsers> {
    console.info('CopilotAPI#getInternalUser | token =', this.token)
    return InternalUsersSchema.parse(await this.copilot.retrieveInternalUser({ id }))
  }

  async createNotification(requestBody: NotificationRequestBody): Promise<NotificationCreatedResponse> {
    console.info('CopilotAPI#createNotification | token =', this.token)
    return NotificationCreatedResponseSchema.parse(
      await this.copilot.createNotification({
        requestBody,
      }),
    )
  }

  async markNotificationAsRead(id: string): Promise<void> {
    console.info('CopilotAPI#markNotificationAsRead | token =', this.token)
    await this.copilot.markNotificationRead({ id })
  }

  async deleteNotification(id: string): Promise<void> {
    console.info('CopilotAPI#deleteNotification | token =', this.token)
    await this.copilot.deleteNotification({ id })
  }
}
