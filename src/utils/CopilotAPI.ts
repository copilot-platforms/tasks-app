import { withRetry } from '@/app/api/core/utils/withRetry'
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

  // NOTE: Any method prefixed with _ is a API method that doesn't implement retry & delay
  // NOTE: Any normal API method name implements `withRetry` with default config

  // Get Token Payload from copilot request token
  async _getTokenPayload(): Promise<Token | null> {
    console.info('CopilotAPI#getTokenPayload | token =', this.token)
    const getTokenPayload = this.copilot.getTokenPayload
    if (!getTokenPayload) {
      console.error(`CopilotAPI#getTokenPayload | Could not parse token payload for token ${this.token}`)
      return null
    }

    return TokenSchema.parse(await getTokenPayload())
  }

  async _me(): Promise<MeResponse | null> {
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

  async _getWorkspace(): Promise<WorkspaceResponse> {
    console.info('CopilotAPI#getWorkspace | token =', this.token)
    return WorkspaceResponseSchema.parse(await this.copilot.retrieveWorkspace())
  }

  async _getClientTokenPayload(): Promise<ClientToken | null> {
    console.info('CopilotAPI#getClientTokenPayload | token =', this.token)
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return ClientTokenSchema.parse(tokenPayload)
  }

  async _getIUTokenPayload(): Promise<IUToken | null> {
    console.info('CopilotAPI#getIUTokenPayload | token =', this.token)
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return IUTokenSchema.parse(tokenPayload)
  }

  async _createClient(requestBody: ClientRequest, sendInvite: boolean = false): Promise<ClientResponse> {
    console.info('CopilotAPI#createClient | token =', this.token)
    return ClientResponseSchema.parse(await this.copilot.createClient({ sendInvite, requestBody }))
  }

  async _getClient(id: string): Promise<ClientResponse> {
    console.info('CopilotAPI#getClient | token =', this.token)
    return ClientResponseSchema.parse(await this.copilot.retrieveClient({ id }))
  }

  async _getClients(args: CopilotListArgs & { companyId?: string } = {}) {
    console.info('CopilotAPI#getClients | token =', this.token)
    return ClientsResponseSchema.parse(await this.copilot.listClients(args))
  }

  async _updateClient(id: string, requestBody: ClientRequest): Promise<ClientResponse> {
    console.info('CopilotAPI#updateClient | token =', this.token)
    // @ts-ignore
    return ClientResponseSchema.parse(await this.copilot.updateClient({ id, requestBody }))
  }

  async _deleteClient(id: string) {
    console.info('CopilotAPI#deleteClient | token =', this.token)
    return await this.copilot.deleteClient({ id })
  }

  async _createCompany(requestBody: CompanyCreateRequest) {
    console.info('CopilotAPI#createCompany | token =', this.token)
    return CompanyResponseSchema.parse(await this.copilot.createCompany({ requestBody }))
  }

  async _getCompany(id: string): Promise<CompanyResponse> {
    console.info('CopilotAPI#getCompany | token =', this.token)
    return CompanyResponseSchema.parse(await this.copilot.retrieveCompany({ id }))
  }

  async _getCompanies(args: CopilotListArgs = {}): Promise<CompaniesResponse> {
    console.info('CopilotAPI#getCompanies | token =', this.token)
    return CompaniesResponseSchema.parse(await this.copilot.listCompanies(args))
  }

  async _getCompanyClients(companyId: string): Promise<ClientResponse[]> {
    console.info('CopilotAPI#getCompanyClients | token =', this.token)
    return (await this.getClients({ limit: 10000, companyId })).data || []
  }

  async _getCustomFields(): Promise<CustomFieldResponse> {
    console.info('CopilotAPI#getCustomFields | token =', this.token)
    return CustomFieldResponseSchema.parse(await this.copilot.listCustomFields())
  }

  async _getInternalUsers(args: CopilotListArgs = {}): Promise<InternalUsersResponse> {
    console.info('CopilotAPI#getInternalUsers | token =', this.token)
    return InternalUsersResponseSchema.parse(await this.copilot.listInternalUsers(args))
  }

  async _getInternalUser(id: string): Promise<InternalUsers> {
    console.info('CopilotAPI#getInternalUser | token =', this.token)
    return InternalUsersSchema.parse(await this.copilot.retrieveInternalUser({ id }))
  }

  async _createNotification(requestBody: NotificationRequestBody): Promise<NotificationCreatedResponse> {
    console.info('CopilotAPI#createNotification | token =', this.token)
    return NotificationCreatedResponseSchema.parse(
      await this.copilot.createNotification({
        requestBody,
      }),
    )
  }

  async _markNotificationAsRead(id: string): Promise<string> {
    console.info('CopilotAPI#markNotificationAsRead | token =', this.token)
    await this.copilot.markNotificationRead({ id })
    return id
  }

  async _deleteNotification(id: string): Promise<void> {
    console.info('CopilotAPI#deleteNotification | token =', this.token)
    await this.copilot.deleteNotification({ id })
  }

  private wrapWithRetry<Args extends unknown[], R>(fn: (...args: Args) => Promise<R>): (...args: Args) => Promise<R> {
    return (...args: Args): Promise<R> => withRetry(fn.bind(this), args)
  }

  // Methods wrapped with retry
  getTokenPayload = this.wrapWithRetry(this._getTokenPayload)
  me = this.wrapWithRetry(this._me)
  getWorkspace = this.wrapWithRetry(this._getWorkspace)
  getClientTokenPayload = this.wrapWithRetry(this._getClientTokenPayload)
  getIUTokenPayload = this.wrapWithRetry(this._getIUTokenPayload)
  createClient = this.wrapWithRetry(this._createClient)
  getClient = this.wrapWithRetry(this._getClient)
  getClients = this.wrapWithRetry(this._getClients)
  updateClient = this.wrapWithRetry(this._updateClient)
  deleteClient = this.wrapWithRetry(this._deleteClient)
  createCompany = this.wrapWithRetry(this._createCompany)
  getCompany = this.wrapWithRetry(this._getCompany)
  getCompanies = this.wrapWithRetry(this._getCompanies)
  getCompanyClients = this.wrapWithRetry(this._getCompanyClients)
  getCustomFields = this.wrapWithRetry(this._getCustomFields)
  getInternalUsers = this.wrapWithRetry(this._getInternalUsers)
  getInternalUser = this.wrapWithRetry(this._getInternalUser)
  createNotification = this.wrapWithRetry(this._createNotification)
  markNotificationAsRead = this.wrapWithRetry(this._markNotificationAsRead)
  deleteNotification = this.wrapWithRetry(this._deleteNotification)
}
