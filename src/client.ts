/**
 * Okta API Client
 *
 * This file handles all HTTP communication with the Okta API.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different API tokens.
 */

import type {
  OktaApplication,
  OktaAppUser,
  OktaAuthenticator,
  OktaAuthorizationServer,
  OktaAuthServerClaim,
  OktaAuthServerPolicy,
  OktaAuthServerScope,
  OktaBrand,
  OktaDomain,
  OktaEventHook,
  OktaFactor,
  OktaFeature,
  OktaGroup,
  OktaGroupRule,
  OktaIdentityProvider,
  OktaLinkedObject,
  OktaLogEvent,
  OktaNetworkZone,
  OktaPolicy,
  OktaPolicyRule,
  OktaPolicyType,
  OktaSession,
  OktaTrustedOrigin,
  OktaUser,
  OktaUserCreateInput,
  OktaUserSchema,
  PaginatedResponse,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, OktaApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Okta Client Interface
// =============================================================================

export interface OktaClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Users
  listUsers(params?: {
    limit?: number;
    after?: string;
    search?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaUser>>;
  getUser(userId: string): Promise<OktaUser>;
  createUser(
    input: OktaUserCreateInput,
    activate?: boolean,
    provider?: boolean
  ): Promise<OktaUser>;
  updateUser(userId: string, profile: Record<string, unknown>): Promise<OktaUser>;
  deleteUser(userId: string, sendEmail?: boolean): Promise<void>;
  activateUser(userId: string, sendEmail?: boolean): Promise<OktaUser>;
  deactivateUser(userId: string, sendEmail?: boolean): Promise<void>;
  suspendUser(userId: string): Promise<void>;
  unsuspendUser(userId: string): Promise<void>;
  unlockUser(userId: string): Promise<void>;
  resetPassword(userId: string, sendEmail?: boolean): Promise<{ resetPasswordUrl?: string }>;
  expirePassword(userId: string): Promise<OktaUser>;
  reactivateUser(userId: string, sendEmail?: boolean): Promise<{ activationUrl?: string }>;
  listUserGroups(userId: string): Promise<OktaGroup[]>;
  listUserApps(userId: string): Promise<OktaAppUser[]>;
  setUserPassword(userId: string, password: string): Promise<void>;

  // User Factors (MFA)
  listUserFactors(userId: string): Promise<OktaFactor[]>;
  getUserFactor(userId: string, factorId: string): Promise<OktaFactor>;
  enrollFactor(
    userId: string,
    factorType: string,
    provider: string,
    profile?: Record<string, unknown>
  ): Promise<OktaFactor>;
  activateFactor(
    userId: string,
    factorId: string,
    passCode?: string
  ): Promise<OktaFactor>;
  resetFactors(userId: string): Promise<void>;
  deleteFactor(userId: string, factorId: string): Promise<void>;

  // Groups
  listGroups(params?: {
    limit?: number;
    after?: string;
    search?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaGroup>>;
  getGroup(groupId: string): Promise<OktaGroup>;
  createGroup(name: string, description?: string): Promise<OktaGroup>;
  updateGroup(groupId: string, name: string, description?: string): Promise<OktaGroup>;
  deleteGroup(groupId: string): Promise<void>;
  listGroupMembers(
    groupId: string,
    limit?: number,
    after?: string
  ): Promise<PaginatedResponse<OktaUser>>;
  addUserToGroup(groupId: string, userId: string): Promise<void>;
  removeUserFromGroup(groupId: string, userId: string): Promise<void>;
  listGroupApps(groupId: string): Promise<OktaApplication[]>;

  // Group Rules
  listGroupRules(params?: {
    limit?: number;
    after?: string;
  }): Promise<PaginatedResponse<OktaGroupRule>>;
  getGroupRule(ruleId: string): Promise<OktaGroupRule>;
  createGroupRule(
    name: string,
    groupIds: string[],
    expression: string
  ): Promise<OktaGroupRule>;
  updateGroupRule(
    ruleId: string,
    name: string,
    groupIds: string[],
    expression: string
  ): Promise<OktaGroupRule>;
  deleteGroupRule(ruleId: string): Promise<void>;
  activateGroupRule(ruleId: string): Promise<void>;
  deactivateGroupRule(ruleId: string): Promise<void>;

  // Applications
  listApplications(params?: {
    limit?: number;
    after?: string;
    filter?: string;
    q?: string;
  }): Promise<PaginatedResponse<OktaApplication>>;
  getApplication(appId: string): Promise<OktaApplication>;
  activateApplication(appId: string): Promise<void>;
  deactivateApplication(appId: string): Promise<void>;
  deleteApplication(appId: string): Promise<void>;
  listAppUsers(
    appId: string,
    limit?: number,
    after?: string
  ): Promise<PaginatedResponse<OktaAppUser>>;
  assignUserToApp(
    appId: string,
    userId: string,
    profile?: Record<string, unknown>
  ): Promise<OktaAppUser>;
  removeUserFromApp(appId: string, userId: string): Promise<void>;
  listAppGroups(appId: string): Promise<OktaGroup[]>;
  assignGroupToApp(appId: string, groupId: string): Promise<void>;
  removeGroupFromApp(appId: string, groupId: string): Promise<void>;

  // Authorization Servers
  listAuthorizationServers(params?: {
    limit?: number;
    after?: string;
    q?: string;
  }): Promise<PaginatedResponse<OktaAuthorizationServer>>;
  getAuthorizationServer(authServerId: string): Promise<OktaAuthorizationServer>;
  createAuthorizationServer(
    name: string,
    description: string,
    audiences: string[]
  ): Promise<OktaAuthorizationServer>;
  updateAuthorizationServer(
    authServerId: string,
    name: string,
    description: string,
    audiences: string[]
  ): Promise<OktaAuthorizationServer>;
  deleteAuthorizationServer(authServerId: string): Promise<void>;
  activateAuthorizationServer(authServerId: string): Promise<void>;
  deactivateAuthorizationServer(authServerId: string): Promise<void>;

  // Auth Server Scopes
  listAuthServerScopes(authServerId: string): Promise<OktaAuthServerScope[]>;
  createAuthServerScope(
    authServerId: string,
    name: string,
    description?: string,
    consent?: string,
    metadataPublish?: string
  ): Promise<OktaAuthServerScope>;
  updateAuthServerScope(
    authServerId: string,
    scopeId: string,
    name: string,
    description?: string
  ): Promise<OktaAuthServerScope>;
  deleteAuthServerScope(authServerId: string, scopeId: string): Promise<void>;

  // Auth Server Claims
  listAuthServerClaims(authServerId: string): Promise<OktaAuthServerClaim[]>;
  createAuthServerClaim(
    authServerId: string,
    name: string,
    claimType: 'RESOURCE' | 'IDENTITY',
    valueType: 'EXPRESSION' | 'GROUPS',
    value: string
  ): Promise<OktaAuthServerClaim>;
  deleteAuthServerClaim(authServerId: string, claimId: string): Promise<void>;

  // Auth Server Policies
  listAuthServerPolicies(authServerId: string): Promise<OktaAuthServerPolicy[]>;
  getAuthServerPolicy(
    authServerId: string,
    policyId: string
  ): Promise<OktaAuthServerPolicy>;
  createAuthServerPolicy(
    authServerId: string,
    name: string,
    description: string,
    priority: number,
    clientIds: string[]
  ): Promise<OktaAuthServerPolicy>;
  deleteAuthServerPolicy(authServerId: string, policyId: string): Promise<void>;

  // System Log
  getLogs(params?: {
    since?: string;
    until?: string;
    filter?: string;
    q?: string;
    limit?: number;
    after?: string;
    sortOrder?: 'ASCENDING' | 'DESCENDING';
  }): Promise<PaginatedResponse<OktaLogEvent>>;

  // Sessions
  getSession(sessionId: string): Promise<OktaSession>;
  createSession(login: string, password: string): Promise<OktaSession>;
  endSession(sessionId: string): Promise<void>;
  refreshSession(sessionId: string): Promise<OktaSession>;

  // Policies
  listPolicies(type: OktaPolicyType): Promise<OktaPolicy[]>;
  getPolicy(policyId: string): Promise<OktaPolicy>;
  createPolicy(
    type: OktaPolicyType,
    name: string,
    description?: string,
    priority?: number
  ): Promise<OktaPolicy>;
  updatePolicy(
    policyId: string,
    name: string,
    description?: string,
    priority?: number
  ): Promise<OktaPolicy>;
  deletePolicy(policyId: string): Promise<void>;
  activatePolicy(policyId: string): Promise<void>;
  deactivatePolicy(policyId: string): Promise<void>;

  // Policy Rules
  listPolicyRules(policyId: string): Promise<OktaPolicyRule[]>;
  getPolicyRule(policyId: string, ruleId: string): Promise<OktaPolicyRule>;
  deletePolicyRule(policyId: string, ruleId: string): Promise<void>;
  activatePolicyRule(policyId: string, ruleId: string): Promise<void>;
  deactivatePolicyRule(policyId: string, ruleId: string): Promise<void>;

  // Trusted Origins
  listTrustedOrigins(params?: {
    limit?: number;
    after?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaTrustedOrigin>>;
  getTrustedOrigin(trustedOriginId: string): Promise<OktaTrustedOrigin>;
  createTrustedOrigin(
    name: string,
    origin: string,
    scopes: Array<{ type: 'CORS' | 'REDIRECT' }>
  ): Promise<OktaTrustedOrigin>;
  updateTrustedOrigin(
    trustedOriginId: string,
    name: string,
    origin: string,
    scopes: Array<{ type: 'CORS' | 'REDIRECT' }>
  ): Promise<OktaTrustedOrigin>;
  deleteTrustedOrigin(trustedOriginId: string): Promise<void>;
  activateTrustedOrigin(trustedOriginId: string): Promise<void>;
  deactivateTrustedOrigin(trustedOriginId: string): Promise<void>;

  // Identity Providers
  listIdentityProviders(params?: {
    limit?: number;
    after?: string;
    type?: string;
  }): Promise<PaginatedResponse<OktaIdentityProvider>>;
  getIdentityProvider(idpId: string): Promise<OktaIdentityProvider>;
  activateIdentityProvider(idpId: string): Promise<void>;
  deactivateIdentityProvider(idpId: string): Promise<void>;
  deleteIdentityProvider(idpId: string): Promise<void>;

  // Authenticators
  listAuthenticators(): Promise<OktaAuthenticator[]>;
  getAuthenticator(authenticatorId: string): Promise<OktaAuthenticator>;
  activateAuthenticator(authenticatorId: string): Promise<OktaAuthenticator>;
  deactivateAuthenticator(authenticatorId: string): Promise<OktaAuthenticator>;

  // Network Zones
  listNetworkZones(params?: {
    limit?: number;
    after?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaNetworkZone>>;
  getNetworkZone(zoneId: string): Promise<OktaNetworkZone>;
  createNetworkZone(
    name: string,
    type: 'IP' | 'DYNAMIC',
    gateways?: Array<{ type: 'CIDR' | 'RANGE'; value: string }>
  ): Promise<OktaNetworkZone>;
  updateNetworkZone(
    zoneId: string,
    name: string,
    gateways?: Array<{ type: 'CIDR' | 'RANGE'; value: string }>
  ): Promise<OktaNetworkZone>;
  deleteNetworkZone(zoneId: string): Promise<void>;
  activateNetworkZone(zoneId: string): Promise<void>;
  deactivateNetworkZone(zoneId: string): Promise<void>;

  // Event Hooks
  listEventHooks(): Promise<OktaEventHook[]>;
  getEventHook(eventHookId: string): Promise<OktaEventHook>;
  createEventHook(
    name: string,
    url: string,
    eventTypes: string[]
  ): Promise<OktaEventHook>;
  updateEventHook(
    eventHookId: string,
    name: string,
    url: string,
    eventTypes: string[]
  ): Promise<OktaEventHook>;
  deleteEventHook(eventHookId: string): Promise<void>;
  activateEventHook(eventHookId: string): Promise<void>;
  deactivateEventHook(eventHookId: string): Promise<void>;
  verifyEventHook(eventHookId: string): Promise<OktaEventHook>;

  // Brands
  listBrands(): Promise<OktaBrand[]>;
  getBrand(brandId: string): Promise<OktaBrand>;
  updateBrand(
    brandId: string,
    customPrivacyPolicyUrl?: string,
    removePoweredByOkta?: boolean
  ): Promise<OktaBrand>;

  // Domains
  listDomains(): Promise<OktaDomain[]>;
  getDomain(domainId: string): Promise<OktaDomain>;
  createDomain(domain: string, certificateSourceType: 'MANUAL' | 'OKTA_MANAGED'): Promise<OktaDomain>;
  deleteDomain(domainId: string): Promise<void>;
  verifyDomain(domainId: string): Promise<OktaDomain>;

  // Features
  listFeatures(): Promise<OktaFeature[]>;
  getFeature(featureId: string): Promise<OktaFeature>;
  updateFeatureLifecycle(
    featureId: string,
    lifecycle: 'enable' | 'disable'
  ): Promise<OktaFeature>;

  // Linked Objects
  listLinkedObjectDefinitions(): Promise<OktaLinkedObject[]>;
  getLinkedObjectDefinition(linkedObjectName: string): Promise<OktaLinkedObject>;
  createLinkedObjectDefinition(
    primary: { name: string; title: string; description: string },
    associated: { name: string; title: string; description: string }
  ): Promise<OktaLinkedObject>;
  deleteLinkedObjectDefinition(linkedObjectName: string): Promise<void>;
  setLinkedObjectValue(
    userId: string,
    primaryRelationshipName: string,
    associatedUserId: string
  ): Promise<void>;
  getLinkedObjectValues(
    userId: string,
    relationshipName: string
  ): Promise<OktaUser[]>;
  deleteLinkedObjectValue(
    userId: string,
    relationshipName: string,
    associatedUserId: string
  ): Promise<void>;

  // User Schema
  getUserSchema(schemaId?: string): Promise<OktaUserSchema>;
  updateUserSchema(
    schemaId: string,
    customProperties: Record<string, unknown>
  ): Promise<OktaUserSchema>;
}

// =============================================================================
// Okta Client Implementation
// =============================================================================

class OktaClientImpl implements OktaClient {
  private credentials: TenantCredentials;
  private baseUrl: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;

    // Build base URL from domain
    if (credentials.baseUrl) {
      this.baseUrl = credentials.baseUrl;
    } else {
      // Handle both "dev-12345678" and "dev-12345678.okta.com" formats
      const domain = credentials.domain.includes('.')
        ? credentials.domain
        : `${credentials.domain}.okta.com`;
      this.baseUrl = `https://${domain}/api/v1`;
    }
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.apiToken) {
      throw new AuthenticationError(
        'No API token provided. Include X-Okta-API-Token header.'
      );
    }

    return {
      Authorization: `SSWS ${this.credentials.apiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; linkHeader?: string }> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('X-Rate-Limit-Reset');
      const retrySeconds = retryAfter
        ? Math.ceil((parseInt(retryAfter, 10) * 1000 - Date.now()) / 1000)
        : 60;
      throw new RateLimitError('Rate limit exceeded', Math.max(1, retrySeconds));
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your API token.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error: ${response.status}`;
      let errorId: string | undefined;
      let errorCauses: Array<{ errorSummary: string }> | undefined;

      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.errorSummary || errorJson.message || message;
        errorId = errorJson.errorId;
        errorCauses = errorJson.errorCauses;
      } catch {
        // Use default message
      }
      throw new OktaApiError(message, response.status, undefined, false, errorId, errorCauses);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: undefined as T };
    }

    const linkHeader = response.headers.get('Link') || undefined;
    const data = (await response.json()) as T;
    return { data, linkHeader };
  }

  private parseLinkHeader(linkHeader?: string): { after?: string } {
    if (!linkHeader) return {};

    const matches = linkHeader.match(/<[^>]+after=([^&>]+)[^>]*>;\s*rel="next"/);
    if (matches) {
      return { after: matches[1] };
    }
    return {};
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      await this.request('/users/me');
      return { connected: true, message: 'Successfully connected to Okta' };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { connected: false, message: error.message };
      }
      // Try listing users instead (current user may not exist)
      try {
        await this.request('/users?limit=1');
        return { connected: true, message: 'Successfully connected to Okta' };
      } catch (retryError) {
        return {
          connected: false,
          message: retryError instanceof Error ? retryError.message : 'Connection failed',
        };
      }
    }
  }

  // ===========================================================================
  // Users
  // ===========================================================================

  async listUsers(params?: {
    limit?: number;
    after?: string;
    search?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaUser>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.filter) queryParams.set('filter', params.filter);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaUser[]>(
      `/users${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getUser(userId: string): Promise<OktaUser> {
    const { data } = await this.request<OktaUser>(`/users/${userId}`);
    return data;
  }

  async createUser(
    input: OktaUserCreateInput,
    activate = true,
    provider = false
  ): Promise<OktaUser> {
    const queryParams = new URLSearchParams();
    queryParams.set('activate', String(activate));
    if (provider) queryParams.set('provider', 'true');

    const { data } = await this.request<OktaUser>(`/users?${queryParams}`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data;
  }

  async updateUser(userId: string, profile: Record<string, unknown>): Promise<OktaUser> {
    const { data } = await this.request<OktaUser>(`/users/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ profile }),
    });
    return data;
  }

  async deleteUser(userId: string, sendEmail = false): Promise<void> {
    const queryParams = sendEmail ? '?sendEmail=true' : '';
    await this.request(`/users/${userId}${queryParams}`, { method: 'DELETE' });
  }

  async activateUser(userId: string, sendEmail = true): Promise<OktaUser> {
    const { data } = await this.request<OktaUser>(
      `/users/${userId}/lifecycle/activate?sendEmail=${sendEmail}`,
      { method: 'POST' }
    );
    return data;
  }

  async deactivateUser(userId: string, sendEmail = false): Promise<void> {
    const queryParams = sendEmail ? '?sendEmail=true' : '';
    await this.request(`/users/${userId}/lifecycle/deactivate${queryParams}`, {
      method: 'POST',
    });
  }

  async suspendUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}/lifecycle/suspend`, { method: 'POST' });
  }

  async unsuspendUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}/lifecycle/unsuspend`, { method: 'POST' });
  }

  async unlockUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}/lifecycle/unlock`, { method: 'POST' });
  }

  async resetPassword(
    userId: string,
    sendEmail = true
  ): Promise<{ resetPasswordUrl?: string }> {
    const { data } = await this.request<{ resetPasswordUrl?: string }>(
      `/users/${userId}/lifecycle/reset_password?sendEmail=${sendEmail}`,
      { method: 'POST' }
    );
    return data;
  }

  async expirePassword(userId: string): Promise<OktaUser> {
    const { data } = await this.request<OktaUser>(
      `/users/${userId}/lifecycle/expire_password`,
      { method: 'POST' }
    );
    return data;
  }

  async reactivateUser(
    userId: string,
    sendEmail = true
  ): Promise<{ activationUrl?: string }> {
    const { data } = await this.request<{ activationUrl?: string }>(
      `/users/${userId}/lifecycle/reactivate?sendEmail=${sendEmail}`,
      { method: 'POST' }
    );
    return data;
  }

  async listUserGroups(userId: string): Promise<OktaGroup[]> {
    const { data } = await this.request<OktaGroup[]>(`/users/${userId}/groups`);
    return data;
  }

  async listUserApps(userId: string): Promise<OktaAppUser[]> {
    const { data } = await this.request<OktaAppUser[]>(`/users/${userId}/appLinks`);
    return data;
  }

  async setUserPassword(userId: string, password: string): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        credentials: {
          password: { value: password },
        },
      }),
    });
  }

  // ===========================================================================
  // User Factors (MFA)
  // ===========================================================================

  async listUserFactors(userId: string): Promise<OktaFactor[]> {
    const { data } = await this.request<OktaFactor[]>(`/users/${userId}/factors`);
    return data;
  }

  async getUserFactor(userId: string, factorId: string): Promise<OktaFactor> {
    const { data } = await this.request<OktaFactor>(
      `/users/${userId}/factors/${factorId}`
    );
    return data;
  }

  async enrollFactor(
    userId: string,
    factorType: string,
    provider: string,
    profile?: Record<string, unknown>
  ): Promise<OktaFactor> {
    const { data } = await this.request<OktaFactor>(`/users/${userId}/factors`, {
      method: 'POST',
      body: JSON.stringify({ factorType, provider, profile }),
    });
    return data;
  }

  async activateFactor(
    userId: string,
    factorId: string,
    passCode?: string
  ): Promise<OktaFactor> {
    const body = passCode ? JSON.stringify({ passCode }) : undefined;
    const { data } = await this.request<OktaFactor>(
      `/users/${userId}/factors/${factorId}/lifecycle/activate`,
      { method: 'POST', body }
    );
    return data;
  }

  async resetFactors(userId: string): Promise<void> {
    await this.request(`/users/${userId}/lifecycle/reset_factors`, {
      method: 'POST',
    });
  }

  async deleteFactor(userId: string, factorId: string): Promise<void> {
    await this.request(`/users/${userId}/factors/${factorId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Groups
  // ===========================================================================

  async listGroups(params?: {
    limit?: number;
    after?: string;
    search?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaGroup>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.filter) queryParams.set('filter', params.filter);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaGroup[]>(
      `/groups${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getGroup(groupId: string): Promise<OktaGroup> {
    const { data } = await this.request<OktaGroup>(`/groups/${groupId}`);
    return data;
  }

  async createGroup(name: string, description?: string): Promise<OktaGroup> {
    const { data } = await this.request<OktaGroup>('/groups', {
      method: 'POST',
      body: JSON.stringify({ profile: { name, description } }),
    });
    return data;
  }

  async updateGroup(
    groupId: string,
    name: string,
    description?: string
  ): Promise<OktaGroup> {
    const { data } = await this.request<OktaGroup>(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify({ profile: { name, description } }),
    });
    return data;
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.request(`/groups/${groupId}`, { method: 'DELETE' });
  }

  async listGroupMembers(
    groupId: string,
    limit?: number,
    after?: string
  ): Promise<PaginatedResponse<OktaUser>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.set('limit', String(limit));
    if (after) queryParams.set('after', after);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaUser[]>(
      `/groups/${groupId}/users${query ? `?${query}` : ''}`
    );

    const parsed = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!parsed.after,
      nextCursor: parsed.after,
    };
  }

  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    await this.request(`/groups/${groupId}/users/${userId}`, { method: 'PUT' });
  }

  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    await this.request(`/groups/${groupId}/users/${userId}`, { method: 'DELETE' });
  }

  async listGroupApps(groupId: string): Promise<OktaApplication[]> {
    const { data } = await this.request<OktaApplication[]>(`/groups/${groupId}/apps`);
    return data;
  }

  // ===========================================================================
  // Group Rules
  // ===========================================================================

  async listGroupRules(params?: {
    limit?: number;
    after?: string;
  }): Promise<PaginatedResponse<OktaGroupRule>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaGroupRule[]>(
      `/groups/rules${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getGroupRule(ruleId: string): Promise<OktaGroupRule> {
    const { data } = await this.request<OktaGroupRule>(`/groups/rules/${ruleId}`);
    return data;
  }

  async createGroupRule(
    name: string,
    groupIds: string[],
    expression: string
  ): Promise<OktaGroupRule> {
    const { data } = await this.request<OktaGroupRule>('/groups/rules', {
      method: 'POST',
      body: JSON.stringify({
        name,
        type: 'group_rule',
        conditions: {
          expression: { value: expression, type: 'urn:okta:expression:1.0' },
        },
        actions: {
          assignUserToGroups: { groupIds },
        },
      }),
    });
    return data;
  }

  async updateGroupRule(
    ruleId: string,
    name: string,
    groupIds: string[],
    expression: string
  ): Promise<OktaGroupRule> {
    const { data } = await this.request<OktaGroupRule>(`/groups/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        type: 'group_rule',
        conditions: {
          expression: { value: expression, type: 'urn:okta:expression:1.0' },
        },
        actions: {
          assignUserToGroups: { groupIds },
        },
      }),
    });
    return data;
  }

  async deleteGroupRule(ruleId: string): Promise<void> {
    await this.request(`/groups/rules/${ruleId}`, { method: 'DELETE' });
  }

  async activateGroupRule(ruleId: string): Promise<void> {
    await this.request(`/groups/rules/${ruleId}/lifecycle/activate`, {
      method: 'POST',
    });
  }

  async deactivateGroupRule(ruleId: string): Promise<void> {
    await this.request(`/groups/rules/${ruleId}/lifecycle/deactivate`, {
      method: 'POST',
    });
  }

  // ===========================================================================
  // Applications
  // ===========================================================================

  async listApplications(params?: {
    limit?: number;
    after?: string;
    filter?: string;
    q?: string;
  }): Promise<PaginatedResponse<OktaApplication>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.filter) queryParams.set('filter', params.filter);
    if (params?.q) queryParams.set('q', params.q);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaApplication[]>(
      `/apps${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getApplication(appId: string): Promise<OktaApplication> {
    const { data } = await this.request<OktaApplication>(`/apps/${appId}`);
    return data;
  }

  async activateApplication(appId: string): Promise<void> {
    await this.request(`/apps/${appId}/lifecycle/activate`, { method: 'POST' });
  }

  async deactivateApplication(appId: string): Promise<void> {
    await this.request(`/apps/${appId}/lifecycle/deactivate`, { method: 'POST' });
  }

  async deleteApplication(appId: string): Promise<void> {
    await this.request(`/apps/${appId}`, { method: 'DELETE' });
  }

  async listAppUsers(
    appId: string,
    limit?: number,
    after?: string
  ): Promise<PaginatedResponse<OktaAppUser>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.set('limit', String(limit));
    if (after) queryParams.set('after', after);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaAppUser[]>(
      `/apps/${appId}/users${query ? `?${query}` : ''}`
    );

    const parsed = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!parsed.after,
      nextCursor: parsed.after,
    };
  }

  async assignUserToApp(
    appId: string,
    userId: string,
    profile?: Record<string, unknown>
  ): Promise<OktaAppUser> {
    const { data } = await this.request<OktaAppUser>(`/apps/${appId}/users`, {
      method: 'POST',
      body: JSON.stringify({ id: userId, profile }),
    });
    return data;
  }

  async removeUserFromApp(appId: string, userId: string): Promise<void> {
    await this.request(`/apps/${appId}/users/${userId}`, { method: 'DELETE' });
  }

  async listAppGroups(appId: string): Promise<OktaGroup[]> {
    const { data } = await this.request<OktaGroup[]>(`/apps/${appId}/groups`);
    return data;
  }

  async assignGroupToApp(appId: string, groupId: string): Promise<void> {
    await this.request(`/apps/${appId}/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  }

  async removeGroupFromApp(appId: string, groupId: string): Promise<void> {
    await this.request(`/apps/${appId}/groups/${groupId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Authorization Servers
  // ===========================================================================

  async listAuthorizationServers(params?: {
    limit?: number;
    after?: string;
    q?: string;
  }): Promise<PaginatedResponse<OktaAuthorizationServer>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.q) queryParams.set('q', params.q);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaAuthorizationServer[]>(
      `/authorizationServers${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getAuthorizationServer(authServerId: string): Promise<OktaAuthorizationServer> {
    const { data } = await this.request<OktaAuthorizationServer>(
      `/authorizationServers/${authServerId}`
    );
    return data;
  }

  async createAuthorizationServer(
    name: string,
    description: string,
    audiences: string[]
  ): Promise<OktaAuthorizationServer> {
    const { data } = await this.request<OktaAuthorizationServer>('/authorizationServers', {
      method: 'POST',
      body: JSON.stringify({ name, description, audiences }),
    });
    return data;
  }

  async updateAuthorizationServer(
    authServerId: string,
    name: string,
    description: string,
    audiences: string[]
  ): Promise<OktaAuthorizationServer> {
    const { data } = await this.request<OktaAuthorizationServer>(
      `/authorizationServers/${authServerId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name, description, audiences }),
      }
    );
    return data;
  }

  async deleteAuthorizationServer(authServerId: string): Promise<void> {
    await this.request(`/authorizationServers/${authServerId}`, { method: 'DELETE' });
  }

  async activateAuthorizationServer(authServerId: string): Promise<void> {
    await this.request(`/authorizationServers/${authServerId}/lifecycle/activate`, {
      method: 'POST',
    });
  }

  async deactivateAuthorizationServer(authServerId: string): Promise<void> {
    await this.request(`/authorizationServers/${authServerId}/lifecycle/deactivate`, {
      method: 'POST',
    });
  }

  // ===========================================================================
  // Auth Server Scopes
  // ===========================================================================

  async listAuthServerScopes(authServerId: string): Promise<OktaAuthServerScope[]> {
    const { data } = await this.request<OktaAuthServerScope[]>(
      `/authorizationServers/${authServerId}/scopes`
    );
    return data;
  }

  async createAuthServerScope(
    authServerId: string,
    name: string,
    description?: string,
    consent?: string,
    metadataPublish?: string
  ): Promise<OktaAuthServerScope> {
    const { data } = await this.request<OktaAuthServerScope>(
      `/authorizationServers/${authServerId}/scopes`,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          consent: consent || 'IMPLICIT',
          metadataPublish: metadataPublish || 'NO_CLIENTS',
        }),
      }
    );
    return data;
  }

  async updateAuthServerScope(
    authServerId: string,
    scopeId: string,
    name: string,
    description?: string
  ): Promise<OktaAuthServerScope> {
    const { data } = await this.request<OktaAuthServerScope>(
      `/authorizationServers/${authServerId}/scopes/${scopeId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      }
    );
    return data;
  }

  async deleteAuthServerScope(authServerId: string, scopeId: string): Promise<void> {
    await this.request(`/authorizationServers/${authServerId}/scopes/${scopeId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Auth Server Claims
  // ===========================================================================

  async listAuthServerClaims(authServerId: string): Promise<OktaAuthServerClaim[]> {
    const { data } = await this.request<OktaAuthServerClaim[]>(
      `/authorizationServers/${authServerId}/claims`
    );
    return data;
  }

  async createAuthServerClaim(
    authServerId: string,
    name: string,
    claimType: 'RESOURCE' | 'IDENTITY',
    valueType: 'EXPRESSION' | 'GROUPS',
    value: string
  ): Promise<OktaAuthServerClaim> {
    const { data } = await this.request<OktaAuthServerClaim>(
      `/authorizationServers/${authServerId}/claims`,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          status: 'ACTIVE',
          claimType,
          valueType,
          value,
        }),
      }
    );
    return data;
  }

  async deleteAuthServerClaim(authServerId: string, claimId: string): Promise<void> {
    await this.request(`/authorizationServers/${authServerId}/claims/${claimId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Auth Server Policies
  // ===========================================================================

  async listAuthServerPolicies(authServerId: string): Promise<OktaAuthServerPolicy[]> {
    const { data } = await this.request<OktaAuthServerPolicy[]>(
      `/authorizationServers/${authServerId}/policies`
    );
    return data;
  }

  async getAuthServerPolicy(
    authServerId: string,
    policyId: string
  ): Promise<OktaAuthServerPolicy> {
    const { data } = await this.request<OktaAuthServerPolicy>(
      `/authorizationServers/${authServerId}/policies/${policyId}`
    );
    return data;
  }

  async createAuthServerPolicy(
    authServerId: string,
    name: string,
    description: string,
    priority: number,
    clientIds: string[]
  ): Promise<OktaAuthServerPolicy> {
    const { data } = await this.request<OktaAuthServerPolicy>(
      `/authorizationServers/${authServerId}/policies`,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          priority,
          status: 'ACTIVE',
          conditions: {
            clients: { include: clientIds.length > 0 ? clientIds : ['ALL_CLIENTS'] },
          },
        }),
      }
    );
    return data;
  }

  async deleteAuthServerPolicy(authServerId: string, policyId: string): Promise<void> {
    await this.request(`/authorizationServers/${authServerId}/policies/${policyId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // System Log
  // ===========================================================================

  async getLogs(params?: {
    since?: string;
    until?: string;
    filter?: string;
    q?: string;
    limit?: number;
    after?: string;
    sortOrder?: 'ASCENDING' | 'DESCENDING';
  }): Promise<PaginatedResponse<OktaLogEvent>> {
    const queryParams = new URLSearchParams();
    if (params?.since) queryParams.set('since', params.since);
    if (params?.until) queryParams.set('until', params.until);
    if (params?.filter) queryParams.set('filter', params.filter);
    if (params?.q) queryParams.set('q', params.q);
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaLogEvent[]>(
      `/logs${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  // ===========================================================================
  // Sessions
  // ===========================================================================

  async getSession(sessionId: string): Promise<OktaSession> {
    const { data } = await this.request<OktaSession>(`/sessions/${sessionId}`);
    return data;
  }

  async createSession(login: string, password: string): Promise<OktaSession> {
    // Note: This uses the Authentication API, not the Sessions API
    const { data } = await this.request<OktaSession>('/authn', {
      method: 'POST',
      body: JSON.stringify({
        username: login,
        password,
      }),
    });
    return data;
  }

  async endSession(sessionId: string): Promise<void> {
    await this.request(`/sessions/${sessionId}`, { method: 'DELETE' });
  }

  async refreshSession(sessionId: string): Promise<OktaSession> {
    const { data } = await this.request<OktaSession>(
      `/sessions/${sessionId}/lifecycle/refresh`,
      { method: 'POST' }
    );
    return data;
  }

  // ===========================================================================
  // Policies
  // ===========================================================================

  async listPolicies(type: OktaPolicyType): Promise<OktaPolicy[]> {
    const { data } = await this.request<OktaPolicy[]>(`/policies?type=${type}`);
    return data;
  }

  async getPolicy(policyId: string): Promise<OktaPolicy> {
    const { data } = await this.request<OktaPolicy>(`/policies/${policyId}`);
    return data;
  }

  async createPolicy(
    type: OktaPolicyType,
    name: string,
    description?: string,
    priority?: number
  ): Promise<OktaPolicy> {
    const { data } = await this.request<OktaPolicy>('/policies', {
      method: 'POST',
      body: JSON.stringify({
        type,
        name,
        description,
        priority: priority || 1,
        status: 'ACTIVE',
      }),
    });
    return data;
  }

  async updatePolicy(
    policyId: string,
    name: string,
    description?: string,
    priority?: number
  ): Promise<OktaPolicy> {
    // First get the current policy to preserve the type
    const current = await this.getPolicy(policyId);
    const { data } = await this.request<OktaPolicy>(`/policies/${policyId}`, {
      method: 'PUT',
      body: JSON.stringify({
        type: current.type,
        name,
        description,
        priority,
        status: current.status,
      }),
    });
    return data;
  }

  async deletePolicy(policyId: string): Promise<void> {
    await this.request(`/policies/${policyId}`, { method: 'DELETE' });
  }

  async activatePolicy(policyId: string): Promise<void> {
    await this.request(`/policies/${policyId}/lifecycle/activate`, { method: 'POST' });
  }

  async deactivatePolicy(policyId: string): Promise<void> {
    await this.request(`/policies/${policyId}/lifecycle/deactivate`, { method: 'POST' });
  }

  // ===========================================================================
  // Policy Rules
  // ===========================================================================

  async listPolicyRules(policyId: string): Promise<OktaPolicyRule[]> {
    const { data } = await this.request<OktaPolicyRule[]>(`/policies/${policyId}/rules`);
    return data;
  }

  async getPolicyRule(policyId: string, ruleId: string): Promise<OktaPolicyRule> {
    const { data } = await this.request<OktaPolicyRule>(
      `/policies/${policyId}/rules/${ruleId}`
    );
    return data;
  }

  async deletePolicyRule(policyId: string, ruleId: string): Promise<void> {
    await this.request(`/policies/${policyId}/rules/${ruleId}`, { method: 'DELETE' });
  }

  async activatePolicyRule(policyId: string, ruleId: string): Promise<void> {
    await this.request(`/policies/${policyId}/rules/${ruleId}/lifecycle/activate`, {
      method: 'POST',
    });
  }

  async deactivatePolicyRule(policyId: string, ruleId: string): Promise<void> {
    await this.request(`/policies/${policyId}/rules/${ruleId}/lifecycle/deactivate`, {
      method: 'POST',
    });
  }

  // ===========================================================================
  // Trusted Origins
  // ===========================================================================

  async listTrustedOrigins(params?: {
    limit?: number;
    after?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaTrustedOrigin>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.filter) queryParams.set('filter', params.filter);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaTrustedOrigin[]>(
      `/trustedOrigins${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getTrustedOrigin(trustedOriginId: string): Promise<OktaTrustedOrigin> {
    const { data } = await this.request<OktaTrustedOrigin>(
      `/trustedOrigins/${trustedOriginId}`
    );
    return data;
  }

  async createTrustedOrigin(
    name: string,
    origin: string,
    scopes: Array<{ type: 'CORS' | 'REDIRECT' }>
  ): Promise<OktaTrustedOrigin> {
    const { data } = await this.request<OktaTrustedOrigin>('/trustedOrigins', {
      method: 'POST',
      body: JSON.stringify({ name, origin, scopes }),
    });
    return data;
  }

  async updateTrustedOrigin(
    trustedOriginId: string,
    name: string,
    origin: string,
    scopes: Array<{ type: 'CORS' | 'REDIRECT' }>
  ): Promise<OktaTrustedOrigin> {
    const { data } = await this.request<OktaTrustedOrigin>(
      `/trustedOrigins/${trustedOriginId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name, origin, scopes }),
      }
    );
    return data;
  }

  async deleteTrustedOrigin(trustedOriginId: string): Promise<void> {
    await this.request(`/trustedOrigins/${trustedOriginId}`, { method: 'DELETE' });
  }

  async activateTrustedOrigin(trustedOriginId: string): Promise<void> {
    await this.request(`/trustedOrigins/${trustedOriginId}/lifecycle/activate`, {
      method: 'POST',
    });
  }

  async deactivateTrustedOrigin(trustedOriginId: string): Promise<void> {
    await this.request(`/trustedOrigins/${trustedOriginId}/lifecycle/deactivate`, {
      method: 'POST',
    });
  }

  // ===========================================================================
  // Identity Providers
  // ===========================================================================

  async listIdentityProviders(params?: {
    limit?: number;
    after?: string;
    type?: string;
  }): Promise<PaginatedResponse<OktaIdentityProvider>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.type) queryParams.set('type', params.type);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaIdentityProvider[]>(
      `/idps${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getIdentityProvider(idpId: string): Promise<OktaIdentityProvider> {
    const { data } = await this.request<OktaIdentityProvider>(`/idps/${idpId}`);
    return data;
  }

  async activateIdentityProvider(idpId: string): Promise<void> {
    await this.request(`/idps/${idpId}/lifecycle/activate`, { method: 'POST' });
  }

  async deactivateIdentityProvider(idpId: string): Promise<void> {
    await this.request(`/idps/${idpId}/lifecycle/deactivate`, { method: 'POST' });
  }

  async deleteIdentityProvider(idpId: string): Promise<void> {
    await this.request(`/idps/${idpId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Authenticators
  // ===========================================================================

  async listAuthenticators(): Promise<OktaAuthenticator[]> {
    const { data } = await this.request<OktaAuthenticator[]>('/authenticators');
    return data;
  }

  async getAuthenticator(authenticatorId: string): Promise<OktaAuthenticator> {
    const { data } = await this.request<OktaAuthenticator>(
      `/authenticators/${authenticatorId}`
    );
    return data;
  }

  async activateAuthenticator(authenticatorId: string): Promise<OktaAuthenticator> {
    const { data } = await this.request<OktaAuthenticator>(
      `/authenticators/${authenticatorId}/lifecycle/activate`,
      { method: 'POST' }
    );
    return data;
  }

  async deactivateAuthenticator(authenticatorId: string): Promise<OktaAuthenticator> {
    const { data } = await this.request<OktaAuthenticator>(
      `/authenticators/${authenticatorId}/lifecycle/deactivate`,
      { method: 'POST' }
    );
    return data;
  }

  // ===========================================================================
  // Network Zones
  // ===========================================================================

  async listNetworkZones(params?: {
    limit?: number;
    after?: string;
    filter?: string;
  }): Promise<PaginatedResponse<OktaNetworkZone>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.after) queryParams.set('after', params.after);
    if (params?.filter) queryParams.set('filter', params.filter);

    const query = queryParams.toString();
    const { data, linkHeader } = await this.request<OktaNetworkZone[]>(
      `/zones${query ? `?${query}` : ''}`
    );

    const { after } = this.parseLinkHeader(linkHeader);

    return {
      items: data,
      count: data.length,
      hasMore: !!after,
      nextCursor: after,
    };
  }

  async getNetworkZone(zoneId: string): Promise<OktaNetworkZone> {
    const { data } = await this.request<OktaNetworkZone>(`/zones/${zoneId}`);
    return data;
  }

  async createNetworkZone(
    name: string,
    type: 'IP' | 'DYNAMIC',
    gateways?: Array<{ type: 'CIDR' | 'RANGE'; value: string }>
  ): Promise<OktaNetworkZone> {
    const { data } = await this.request<OktaNetworkZone>('/zones', {
      method: 'POST',
      body: JSON.stringify({
        name,
        type,
        status: 'ACTIVE',
        usage: 'POLICY',
        gateways,
      }),
    });
    return data;
  }

  async updateNetworkZone(
    zoneId: string,
    name: string,
    gateways?: Array<{ type: 'CIDR' | 'RANGE'; value: string }>
  ): Promise<OktaNetworkZone> {
    const current = await this.getNetworkZone(zoneId);
    const { data } = await this.request<OktaNetworkZone>(`/zones/${zoneId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        type: current.type,
        status: current.status,
        usage: current.usage,
        gateways,
      }),
    });
    return data;
  }

  async deleteNetworkZone(zoneId: string): Promise<void> {
    await this.request(`/zones/${zoneId}`, { method: 'DELETE' });
  }

  async activateNetworkZone(zoneId: string): Promise<void> {
    await this.request(`/zones/${zoneId}/lifecycle/activate`, { method: 'POST' });
  }

  async deactivateNetworkZone(zoneId: string): Promise<void> {
    await this.request(`/zones/${zoneId}/lifecycle/deactivate`, { method: 'POST' });
  }

  // ===========================================================================
  // Event Hooks
  // ===========================================================================

  async listEventHooks(): Promise<OktaEventHook[]> {
    const { data } = await this.request<OktaEventHook[]>('/eventHooks');
    return data;
  }

  async getEventHook(eventHookId: string): Promise<OktaEventHook> {
    const { data } = await this.request<OktaEventHook>(`/eventHooks/${eventHookId}`);
    return data;
  }

  async createEventHook(
    name: string,
    url: string,
    eventTypes: string[]
  ): Promise<OktaEventHook> {
    const { data } = await this.request<OktaEventHook>('/eventHooks', {
      method: 'POST',
      body: JSON.stringify({
        name,
        events: {
          type: 'EVENT_TYPE',
          items: eventTypes,
        },
        channel: {
          type: 'HTTP',
          version: '1.0.0',
          config: { uri: url },
        },
      }),
    });
    return data;
  }

  async updateEventHook(
    eventHookId: string,
    name: string,
    url: string,
    eventTypes: string[]
  ): Promise<OktaEventHook> {
    const { data } = await this.request<OktaEventHook>(`/eventHooks/${eventHookId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        events: {
          type: 'EVENT_TYPE',
          items: eventTypes,
        },
        channel: {
          type: 'HTTP',
          version: '1.0.0',
          config: { uri: url },
        },
      }),
    });
    return data;
  }

  async deleteEventHook(eventHookId: string): Promise<void> {
    await this.request(`/eventHooks/${eventHookId}`, { method: 'DELETE' });
  }

  async activateEventHook(eventHookId: string): Promise<void> {
    await this.request(`/eventHooks/${eventHookId}/lifecycle/activate`, {
      method: 'POST',
    });
  }

  async deactivateEventHook(eventHookId: string): Promise<void> {
    await this.request(`/eventHooks/${eventHookId}/lifecycle/deactivate`, {
      method: 'POST',
    });
  }

  async verifyEventHook(eventHookId: string): Promise<OktaEventHook> {
    const { data } = await this.request<OktaEventHook>(
      `/eventHooks/${eventHookId}/lifecycle/verify`,
      { method: 'POST' }
    );
    return data;
  }

  // ===========================================================================
  // Brands
  // ===========================================================================

  async listBrands(): Promise<OktaBrand[]> {
    const { data } = await this.request<OktaBrand[]>('/brands');
    return data;
  }

  async getBrand(brandId: string): Promise<OktaBrand> {
    const { data } = await this.request<OktaBrand>(`/brands/${brandId}`);
    return data;
  }

  async updateBrand(
    brandId: string,
    customPrivacyPolicyUrl?: string,
    removePoweredByOkta?: boolean
  ): Promise<OktaBrand> {
    const { data } = await this.request<OktaBrand>(`/brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify({
        customPrivacyPolicyUrl,
        removePoweredByOkta,
      }),
    });
    return data;
  }

  // ===========================================================================
  // Domains
  // ===========================================================================

  async listDomains(): Promise<OktaDomain[]> {
    const { data } = await this.request<{ domains: OktaDomain[] }>('/domains');
    return data.domains || [];
  }

  async getDomain(domainId: string): Promise<OktaDomain> {
    const { data } = await this.request<OktaDomain>(`/domains/${domainId}`);
    return data;
  }

  async createDomain(
    domain: string,
    certificateSourceType: 'MANUAL' | 'OKTA_MANAGED'
  ): Promise<OktaDomain> {
    const { data } = await this.request<OktaDomain>('/domains', {
      method: 'POST',
      body: JSON.stringify({ domain, certificateSourceType }),
    });
    return data;
  }

  async deleteDomain(domainId: string): Promise<void> {
    await this.request(`/domains/${domainId}`, { method: 'DELETE' });
  }

  async verifyDomain(domainId: string): Promise<OktaDomain> {
    const { data } = await this.request<OktaDomain>(`/domains/${domainId}/verify`, {
      method: 'POST',
    });
    return data;
  }

  // ===========================================================================
  // Features
  // ===========================================================================

  async listFeatures(): Promise<OktaFeature[]> {
    const { data } = await this.request<OktaFeature[]>('/features');
    return data;
  }

  async getFeature(featureId: string): Promise<OktaFeature> {
    const { data } = await this.request<OktaFeature>(`/features/${featureId}`);
    return data;
  }

  async updateFeatureLifecycle(
    featureId: string,
    lifecycle: 'enable' | 'disable'
  ): Promise<OktaFeature> {
    const { data } = await this.request<OktaFeature>(
      `/features/${featureId}/${lifecycle}`,
      { method: 'POST' }
    );
    return data;
  }

  // ===========================================================================
  // Linked Objects
  // ===========================================================================

  async listLinkedObjectDefinitions(): Promise<OktaLinkedObject[]> {
    const { data } = await this.request<OktaLinkedObject[]>('/meta/schemas/user/linkedObjects');
    return data;
  }

  async getLinkedObjectDefinition(linkedObjectName: string): Promise<OktaLinkedObject> {
    const { data } = await this.request<OktaLinkedObject>(
      `/meta/schemas/user/linkedObjects/${linkedObjectName}`
    );
    return data;
  }

  async createLinkedObjectDefinition(
    primary: { name: string; title: string; description: string },
    associated: { name: string; title: string; description: string }
  ): Promise<OktaLinkedObject> {
    const { data } = await this.request<OktaLinkedObject>(
      '/meta/schemas/user/linkedObjects',
      {
        method: 'POST',
        body: JSON.stringify({
          primary: { ...primary, type: 'USER' },
          associated: { ...associated, type: 'USER' },
        }),
      }
    );
    return data;
  }

  async deleteLinkedObjectDefinition(linkedObjectName: string): Promise<void> {
    await this.request(`/meta/schemas/user/linkedObjects/${linkedObjectName}`, {
      method: 'DELETE',
    });
  }

  async setLinkedObjectValue(
    userId: string,
    primaryRelationshipName: string,
    associatedUserId: string
  ): Promise<void> {
    await this.request(
      `/users/${associatedUserId}/linkedObjects/${primaryRelationshipName}/${userId}`,
      { method: 'PUT' }
    );
  }

  async getLinkedObjectValues(
    userId: string,
    relationshipName: string
  ): Promise<OktaUser[]> {
    const { data } = await this.request<OktaUser[]>(
      `/users/${userId}/linkedObjects/${relationshipName}`
    );
    return data;
  }

  async deleteLinkedObjectValue(
    userId: string,
    relationshipName: string,
    associatedUserId: string
  ): Promise<void> {
    await this.request(
      `/users/${userId}/linkedObjects/${relationshipName}/${associatedUserId}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // User Schema
  // ===========================================================================

  async getUserSchema(schemaId?: string): Promise<OktaUserSchema> {
    const id = schemaId || 'default';
    const { data } = await this.request<OktaUserSchema>(
      `/meta/schemas/user/${id}`
    );
    return data;
  }

  async updateUserSchema(
    schemaId: string,
    customProperties: Record<string, unknown>
  ): Promise<OktaUserSchema> {
    const { data } = await this.request<OktaUserSchema>(
      `/meta/schemas/user/${schemaId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          definitions: {
            custom: {
              id: '#custom',
              type: 'object',
              properties: customProperties,
            },
          },
        }),
      }
    );
    return data;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create an Okta client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createOktaClient(credentials: TenantCredentials): OktaClient {
  return new OktaClientImpl(credentials);
}
