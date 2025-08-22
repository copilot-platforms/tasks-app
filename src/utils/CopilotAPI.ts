import { withRetry } from '@/app/api/core/utils/withRetry'
import { copilotAPIKey as apiKey, APP_ID } from '@/config'
import { API_DOMAIN } from '@/constants/domains'
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
import { DISPATCHABLE_EVENT } from '@/types/webhook'
import Bottleneck from 'bottleneck'
import type { CopilotAPI as SDK } from 'copilot-node-sdk'
import { copilotApi } from 'copilot-node-sdk'
import { z } from 'zod'

export class CopilotAPI {
  copilot: SDK

  constructor(
    private token: string,
    customApiKey?: string,
  ) {
    this.copilot = copilotApi({ apiKey: customApiKey ?? apiKey, token })
  }

  private async manualFetch(route: string, query?: Record<string, string>, workspaceId?: string) {
    const url = new URL(`${API_DOMAIN}/v1/${route}`)
    if (query) {
      for (const key of Object.keys(query)) {
        url.searchParams.set(key, query[key])
      }
    }
    const headers = {
      'X-API-KEY': workspaceId ? `${workspaceId}/${apiKey}` : apiKey,
      accept: 'application/json',
    }

    console.info('CopilotAPI#manualFetch |', url, headers)
    const resp = await fetch(url, { headers })
    return await resp.json()
  }

  // NOTE: Any method prefixed with _ is a API method that doesn't implement retry & delay
  // NOTE: Any normal API method name implements `withRetry` with default config

  // Get Token Payload from copilot request token
  async _getTokenPayload(): Promise<Token | null> {
    const getTokenPayload = this.copilot.getTokenPayload
    if (!getTokenPayload) {
      console.error(`CopilotAPI#getTokenPayload | Could not parse token payload for token ${this.token}`)
      return null
    }

    return TokenSchema.parse(await getTokenPayload())
  }

  async _me(): Promise<MeResponse | null> {
    console.info('CopilotAPI#_me', this.token)
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
    console.info('CopilotAPI#_getWorkspace', this.token)
    return WorkspaceResponseSchema.parse(await this.copilot.retrieveWorkspace())
  }

  async _getClientTokenPayload(): Promise<ClientToken | null> {
    console.info('CopilotAPI#_getClientTokenPayload', this.token)
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return ClientTokenSchema.parse(tokenPayload)
  }

  async _getIUTokenPayload(): Promise<IUToken | null> {
    console.info('CopilotAPI#_getIUTokenPayload', this.token)
    const tokenPayload = await this.getTokenPayload()
    if (!tokenPayload) return null

    return IUTokenSchema.parse(tokenPayload)
  }

  async _createClient(requestBody: ClientRequest, sendInvite: boolean = false): Promise<ClientResponse> {
    console.info('CopilotAPI#_createClient', this.token)
    return ClientResponseSchema.parse(await this.copilot.createClient({ sendInvite, requestBody }))
  }

  async _getClient(id: string): Promise<ClientResponse> {
    console.info('CopilotAPI#_getClient', this.token)
    return ClientResponseSchema.parse(await this.copilot.retrieveClient({ id }))
  }

  async _getClients(args: CopilotListArgs & { companyId?: string } = {}) {
    console.info('CopilotAPI#_getClients', this.token)
    return ClientsResponseSchema.parse(await this.copilot.listClients(args))
  }

  async _updateClient(id: string, requestBody: ClientRequest): Promise<ClientResponse> {
    console.info('CopilotAPI#_updateClient', this.token)
    // @ts-ignore
    return ClientResponseSchema.parse(await this.copilot.updateClient({ id, requestBody }))
  }

  async _deleteClient(id: string) {
    console.info('CopilotAPI#_deleteClient', this.token)
    return await this.copilot.deleteClient({ id })
  }

  async _createCompany(requestBody: CompanyCreateRequest) {
    console.info('CopilotAPI#_createCompany', this.token)
    return CompanyResponseSchema.parse(await this.copilot.createCompany({ requestBody }))
  }

  async _getCompany(id: string): Promise<CompanyResponse> {
    console.info('CopilotAPI#_getCompany', this.token)
    return CompanyResponseSchema.parse(await this.copilot.retrieveCompany({ id }))
  }

  async _getCompanies(args: CopilotListArgs & { isPlaceholder?: boolean } = {}): Promise<CompaniesResponse> {
    console.info('CopilotAPI#_getCompanies', this.token)
    return CompaniesResponseSchema.parse(await this.copilot.listCompanies(args))
  }

  async _getCompanyClients(companyId: string): Promise<ClientResponse[]> {
    console.info('CopilotAPI#_getCompanyClients', this.token)
    return (await this.getClients({ limit: 10000, companyId })).data || []
  }

  async _getCustomFields(): Promise<CustomFieldResponse> {
    console.info('CopilotAPI#_getCustomFields', this.token)
    return CustomFieldResponseSchema.parse(await this.copilot.listCustomFields())
  }

  async _getInternalUsers(args: CopilotListArgs = {}): Promise<InternalUsersResponse> {
    console.info('CopilotAPI#_getInternalUsers', this.token)
    return InternalUsersResponseSchema.parse(await this.copilot.listInternalUsers(args))
  }

  async _getInternalUser(id: string): Promise<InternalUsers> {
    console.info('CopilotAPI#_getInternalUser', this.token)
    return InternalUsersSchema.parse(await this.copilot.retrieveInternalUser({ id }))
  }

  async _createNotification(requestBody: NotificationRequestBody): Promise<NotificationCreatedResponse> {
    console.info('CopilotAPI#_createNotification', this.token)
    const notification = await this.copilot.createNotification({ requestBody })
    return NotificationCreatedResponseSchema.parse(notification)
  }

  async _markNotificationAsRead(id: string): Promise<void> {
    console.info('CopilotAPI#_markNotificationAsRead', this.token)
    await this.copilot.markNotificationRead({ id })
  }

  async _bulkMarkNotificationsAsRead(notificationIds: string[]): Promise<void> {
    console.info('CopilotAPI#_bulkMarkNotificationsAsRead', this.token)
    const markAsReadPromises = []
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 2 })

    for (let notification of notificationIds) {
      markAsReadPromises.push(
        bottleneck
          .schedule(() => {
            console.info('CopilotAPI#_bulkMarkNotificationsAsRead | Marking notification as read', this.token, notification)
            return this.markNotificationAsRead(notification)
          })
          .catch((err: unknown) => console.error(`Failed to delete notification with id ${notification}`, err)),
      )
    }

    await Promise.all(markAsReadPromises)
  }

  async _deleteNotification(id: string): Promise<void> {
    console.info('CopilotAPI#_deleteNotification', this.token)
    await this.copilot.deleteNotification({ id })
  }

  async _bulkDeleteNotifications(notificationIds: string[]): Promise<void> {
    console.info('CopilotAPI#_bulkDeleteNotifications', this.token)
    const deletePromises = []
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 2 })
    for (let notification of notificationIds) {
      deletePromises.push(
        bottleneck
          .schedule(() => {
            return this.deleteNotification(notification)
          })
          .catch((err: unknown) => console.error(`Failed to delete notification with id ${notification}`, err)),
      )
    }
    await Promise.all(deletePromises)
  }

  async _getClientNotifications(
    recipientClientId: string,
    recipientCompanyId: string,
    workspaceId: string,
    opts: {
      limit?: number
      showArchived?: boolean
      showUnarchived?: boolean
      showIncompleteOnly?: boolean
    } = { limit: 100 },
  ) {
    console.info('CopilotAPI#_getClientNotifications', this.token)
    const response = await this.manualFetch('notifications', {
      recipientClientId,
      recipientCompanyId,
      limit: `${opts.limit}`,
      workspaceId,
    })
    const notifications = z.array(NotificationCreatedResponseSchema).parse(response.data)
    // Return only all notifications triggered by tasks-app
    return notifications
      .filter((notification) => notification.appId === z.string({ message: 'Missing AppID in environment' }).parse(APP_ID))
      .filter((notification) => {
        const isSameRecipientCompanyId =
          notification.recipientCompanyId && notification.recipientCompanyId === recipientCompanyId
        const isSameCompanyId = notification.companyId && notification.companyId === recipientCompanyId
        return isSameRecipientCompanyId || isSameCompanyId
      })
  }

  async dispatchWebhook(eventName: DISPATCHABLE_EVENT, { workspaceId, payload }: { workspaceId: string; payload?: object }) {
    console.info('CopilotAPI#dispatchWebhook', this.token)
    const url = `${API_DOMAIN}/v1/webhooks/${eventName}`
    console.info('CopilotAPI#dispatchWebhook | Dispatching webhook to ', url, 'with payload', payload ?? null)

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${workspaceId}/${apiKey}`,
        },
        body: payload ? JSON.stringify(payload) : null,
      })
    } catch (e) {
      console.error(`Failed to dispatch webhook for event ${eventName}`, e)
    }
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
  getClientNotifications = this.wrapWithRetry(this._getClientNotifications)
  markNotificationAsRead = this.wrapWithRetry(this._markNotificationAsRead)
  bulkMarkNotificationsAsRead = this.wrapWithRetry(this._bulkMarkNotificationsAsRead)
  deleteNotification = this.wrapWithRetry(this._deleteNotification)
  bulkDeleteNotifications = this.wrapWithRetry(this._bulkDeleteNotifications)
}
