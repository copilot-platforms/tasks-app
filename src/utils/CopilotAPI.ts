import { copilotApi } from 'copilot-node-sdk'
import type { CopilotAPI as SDK } from 'copilot-node-sdk'
import {
  ClientResponse,
  ClientResponseSchema,
  ClientsResponseSchema,
  CompanyResponse,
  CompanyResponseSchema,
  ClientRequest,
  CustomFieldResponse,
  CustomFieldResponseSchema,
  MeResponse,
  MeResponseSchema,
  CompaniesResponse,
  CompaniesResponseSchema,
  WorkspaceResponse,
  WorkspaceResponseSchema,
  Token,
  TokenSchema,
  ClientToken,
  ClientTokenSchema,
  IUTokenSchema,
  IUToken,
  NotificationRequestBody,
  InternalUsersResponse,
  InternalUsersResponseSchema,
  InternalUsers,
  InternalUsersSchema,
  CopilotListArgs,
} from '@/types/common'
import { copilotAPIKey as apiKey } from '@/config'

export class CopilotAPI {
  copilot: SDK

  constructor(token: string) {
    this.copilot = copilotApi({ apiKey, token })
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

  async getCompany(id: string): Promise<CompanyResponse> {
    return CompanyResponseSchema.parse(await this.copilot.retrieveCompany({ id }))
  }

  async getCompanies(args: CopilotListArgs = {}): Promise<CompaniesResponse> {
    return CompaniesResponseSchema.parse(await this.copilot.listCompanies(args))
  }

  async getCompanyClients(companyId: string) {
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

  async createNotification(requestBody: NotificationRequestBody) {
    return await this.copilot.createNotification({
      requestBody,
    })
  }
}
