import { copilotApi } from 'copilot-node-sdk';
import type { CopilotAPI as SDK } from 'copilot-node-sdk';
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
} from '@/types/common';
import { copilotAPIKey as apiKey } from '@/config';

export class CopilotAPI {
  copilot: SDK;

  constructor(token: string) {
    this.copilot = copilotApi({ apiKey, token });
  }

  private async getTokenPayload(): Promise<Token | null> {
    const getTokenPayload = this.copilot.getTokenPayload;
    if (!getTokenPayload) return null;

    return TokenSchema.parse(await getTokenPayload());
  }

  async me(): Promise<MeResponse | null> {
    const tokenPayload = await this.getTokenPayload();
    const id = tokenPayload?.internalUserId || tokenPayload?.clientId;
    if (!tokenPayload || !id) return null;

    const retrieveCurrentUserInfo = tokenPayload.internalUserId
      ? this.copilot.retrieveInternalUser
      : this.copilot.retrieveClient;
    const currentUserInfo = await retrieveCurrentUserInfo({ id });

    return MeResponseSchema.parse(currentUserInfo);
  }

  async getWorkspace(): Promise<WorkspaceResponse> {
    return WorkspaceResponseSchema.parse(await this.copilot.retrieveWorkspace());
  }

  async getClientTokenPayload(): Promise<ClientToken | null> {
    const tokenPayload = await this.getTokenPayload();
    if (!tokenPayload) return null;

    return ClientTokenSchema.parse(tokenPayload);
  }

  async getIUTokenPayload(): Promise<IUToken | null> {
    const tokenPayload = await this.getTokenPayload();
    if (!tokenPayload) return null;

    return IUTokenSchema.parse(tokenPayload);
  }

  async getClient(id: string): Promise<ClientResponse> {
    return ClientResponseSchema.parse(await this.copilot.retrieveClient({ id }));
  }

  async getClients() {
    return ClientsResponseSchema.parse(await this.copilot.listClients({}));
  }

  async updateClient(id: string, requestBody: ClientRequest): Promise<ClientResponse> {
    // @ts-ignore
    return ClientResponseSchema.parse(await this.copilot.updateClient({ id, requestBody }));
  }

  async getCompany(id: string): Promise<CompanyResponse> {
    return CompanyResponseSchema.parse(await this.copilot.retrieveCompany({ id }));
  }

  async getCompanies(): Promise<CompaniesResponse> {
    return CompaniesResponseSchema.parse(await this.copilot.listCompanies({}));
  }

  async getCustomFields(): Promise<CustomFieldResponse> {
    return CustomFieldResponseSchema.parse(await this.copilot.listCustomFields());
  }
}
