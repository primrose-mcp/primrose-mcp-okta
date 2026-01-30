/**
 * Okta Entity Types
 *
 * Type definitions for Okta API responses and entities.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Number of items to return */
  limit?: number;
  /** Cursor/link for pagination */
  after?: string;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Number of items in this response */
  count: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Cursor for next page */
  nextCursor?: string;
}

// =============================================================================
// User
// =============================================================================

export interface OktaUser {
  id: string;
  status: OktaUserStatus;
  created: string;
  activated?: string;
  statusChanged?: string;
  lastLogin?: string;
  lastUpdated?: string;
  passwordChanged?: string;
  type?: {
    id: string;
  };
  profile: OktaUserProfile;
  credentials?: OktaUserCredentials;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export type OktaUserStatus =
  | 'STAGED'
  | 'PROVISIONED'
  | 'ACTIVE'
  | 'RECOVERY'
  | 'LOCKED_OUT'
  | 'PASSWORD_EXPIRED'
  | 'SUSPENDED'
  | 'DEPROVISIONED';

export interface OktaUserProfile {
  login: string;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
  title?: string;
  displayName?: string;
  nickName?: string;
  profileUrl?: string;
  secondEmail?: string;
  mobilePhone?: string;
  primaryPhone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
  postalAddress?: string;
  preferredLanguage?: string;
  locale?: string;
  timezone?: string;
  userType?: string;
  employeeNumber?: string;
  costCenter?: string;
  organization?: string;
  division?: string;
  department?: string;
  managerId?: string;
  manager?: string;
  [key: string]: unknown;
}

export interface OktaUserCredentials {
  password?: Record<string, unknown>;
  recovery_question?: {
    question: string;
  };
  provider?: {
    type: string;
    name?: string;
  };
}

export interface OktaUserCreateInput {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    login: string;
    mobilePhone?: string;
    secondEmail?: string;
    [key: string]: unknown;
  };
  credentials?: {
    password?: {
      value?: string;
      hash?: {
        algorithm: string;
        value: string;
        salt?: string;
        saltOrder?: string;
        workFactor?: number;
      };
    };
    recovery_question?: {
      question: string;
      answer: string;
    };
  };
  groupIds?: string[];
  type?: {
    id: string;
  };
}

// =============================================================================
// Group
// =============================================================================

export interface OktaGroup {
  id: string;
  created: string;
  lastUpdated: string;
  lastMembershipUpdated?: string;
  objectClass?: string[];
  type: OktaGroupType;
  profile: OktaGroupProfile;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export type OktaGroupType = 'OKTA_GROUP' | 'APP_GROUP' | 'BUILT_IN';

export interface OktaGroupProfile {
  name: string;
  description?: string;
}

export interface OktaGroupCreateInput {
  profile: OktaGroupProfile;
}

// =============================================================================
// Application
// =============================================================================

export interface OktaApplication {
  id: string;
  name: string;
  label: string;
  status: OktaAppStatus;
  created: string;
  lastUpdated?: string;
  activated?: string;
  signOnMode?: string;
  features?: string[];
  visibility?: {
    autoSubmitToolbar?: boolean;
    hide?: {
      iOS?: boolean;
      web?: boolean;
    };
  };
  credentials?: {
    scheme?: string;
    userNameTemplate?: {
      template?: string;
      type?: string;
    };
    signing?: Record<string, unknown>;
  };
  settings?: {
    app?: Record<string, unknown>;
    notifications?: Record<string, unknown>;
    signOn?: Record<string, unknown>;
  };
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export type OktaAppStatus = 'ACTIVE' | 'INACTIVE';

export interface OktaAppUser {
  id: string;
  externalId?: string;
  created: string;
  lastUpdated?: string;
  scope: string;
  status: string;
  statusChanged?: string;
  passwordChanged?: string;
  syncState?: string;
  lastSync?: string;
  credentials?: Record<string, unknown>;
  profile?: Record<string, unknown>;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Authorization Server
// =============================================================================

export interface OktaAuthorizationServer {
  id: string;
  name: string;
  description?: string;
  audiences: string[];
  issuer?: string;
  issuerMode?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created: string;
  lastUpdated: string;
  credentials?: {
    signing?: {
      rotationMode?: string;
      lastRotated?: string;
      nextRotation?: string;
      kid?: string;
    };
  };
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export interface OktaAuthServerPolicy {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  name: string;
  description?: string;
  priority: number;
  system: boolean;
  conditions?: {
    clients?: {
      include: string[];
    };
  };
  created: string;
  lastUpdated: string;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export interface OktaAuthServerScope {
  id: string;
  name: string;
  description?: string;
  system: boolean;
  default: boolean;
  displayName?: string;
  consent?: string;
  metadataPublish?: string;
}

export interface OktaAuthServerClaim {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  claimType: 'RESOURCE' | 'IDENTITY';
  valueType: 'EXPRESSION' | 'GROUPS';
  value?: string;
  conditions?: {
    scopes?: string[];
  };
  system: boolean;
  alwaysIncludeInToken: boolean;
  group_filter_type?: string;
}

// =============================================================================
// Policy
// =============================================================================

export interface OktaPolicy {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  name: string;
  description?: string;
  priority: number;
  system: boolean;
  type: OktaPolicyType;
  conditions?: Record<string, unknown>;
  created: string;
  lastUpdated: string;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export type OktaPolicyType =
  | 'OKTA_SIGN_ON'
  | 'PASSWORD'
  | 'MFA_ENROLL'
  | 'OAUTH_AUTHORIZATION_POLICY'
  | 'IDP_DISCOVERY'
  | 'ACCESS_POLICY'
  | 'PROFILE_ENROLLMENT';

export interface OktaPolicyRule {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  name: string;
  priority: number;
  system: boolean;
  type: string;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  created: string;
  lastUpdated: string;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Identity Provider
// =============================================================================

export interface OktaIdentityProvider {
  id: string;
  type: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  created: string;
  lastUpdated: string;
  protocol?: Record<string, unknown>;
  policy?: Record<string, unknown>;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Session
// =============================================================================

export interface OktaSession {
  id: string;
  login: string;
  userId: string;
  expiresAt: string;
  status: 'ACTIVE' | 'MFA_REQUIRED' | 'MFA_ENROLL';
  lastPasswordVerification?: string;
  lastFactorVerification?: string;
  amr?: string[];
  idp?: {
    id: string;
    type: string;
  };
  mfaActive?: boolean;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// System Log
// =============================================================================

export interface OktaLogEvent {
  uuid: string;
  published: string;
  eventType: string;
  version: string;
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  legacyEventType?: string;
  displayMessage?: string;
  actor?: {
    id: string;
    type: string;
    alternateId?: string;
    displayName?: string;
    detailEntry?: Record<string, unknown>;
  };
  client?: {
    userAgent?: {
      rawUserAgent?: string;
      os?: string;
      browser?: string;
    };
    zone?: string;
    device?: string;
    id?: string;
    ipAddress?: string;
    geographicalContext?: {
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      geolocation?: {
        lat?: number;
        lon?: number;
      };
    };
  };
  outcome?: {
    result: 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'ALLOW' | 'DENY' | 'CHALLENGE' | 'UNKNOWN';
    reason?: string;
  };
  target?: Array<{
    id: string;
    type: string;
    alternateId?: string;
    displayName?: string;
    detailEntry?: Record<string, unknown>;
  }>;
  transaction?: {
    type?: string;
    id?: string;
    detail?: Record<string, unknown>;
  };
  debugContext?: {
    debugData?: Record<string, unknown>;
  };
  authenticationContext?: {
    authenticationProvider?: string;
    authenticationStep?: number;
    credentialProvider?: string;
    credentialType?: string;
    externalSessionId?: string;
    interface?: string;
    issuer?: {
      id?: string;
      type?: string;
    };
  };
  securityContext?: {
    asNumber?: number;
    asOrg?: string;
    isp?: string;
    domain?: string;
    isProxy?: boolean;
  };
  request?: {
    ipChain?: Array<{
      ip?: string;
      geographicalContext?: {
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
        geolocation?: {
          lat?: number;
          lon?: number;
        };
      };
      version?: string;
      source?: string;
    }>;
  };
}

// =============================================================================
// User Factor (MFA)
// =============================================================================

export interface OktaFactor {
  id: string;
  factorType: OktaFactorType;
  provider: string;
  vendorName?: string;
  status: 'NOT_SETUP' | 'PENDING_ACTIVATION' | 'ENROLLED' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  created?: string;
  lastUpdated?: string;
  profile?: Record<string, unknown>;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export type OktaFactorType =
  | 'call'
  | 'email'
  | 'push'
  | 'question'
  | 'sms'
  | 'token'
  | 'token:hardware'
  | 'token:hotp'
  | 'token:software:totp'
  | 'u2f'
  | 'web'
  | 'webauthn';

// =============================================================================
// Trusted Origin
// =============================================================================

export interface OktaTrustedOrigin {
  id: string;
  name: string;
  origin: string;
  status: 'ACTIVE' | 'INACTIVE';
  scopes: Array<{
    type: 'CORS' | 'REDIRECT';
    allowedOktaApps?: string[];
  }>;
  created: string;
  createdBy: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Authenticator
// =============================================================================

export interface OktaAuthenticator {
  id: string;
  key: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'INACTIVE';
  created: string;
  lastUpdated: string;
  settings?: Record<string, unknown>;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Network Zone
// =============================================================================

export interface OktaNetworkZone {
  id: string;
  name: string;
  type: 'IP' | 'DYNAMIC';
  status: 'ACTIVE' | 'INACTIVE';
  usage: 'POLICY' | 'BLOCKLIST';
  created: string;
  lastUpdated: string;
  system: boolean;
  gateways?: Array<{
    type: 'CIDR' | 'RANGE';
    value: string;
  }>;
  proxies?: Array<{
    type: 'CIDR' | 'RANGE';
    value: string;
  }>;
  locations?: Array<{
    country: string;
    region?: string;
  }>;
  proxyType?: string;
  asns?: string[];
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Event Hook
// =============================================================================

export interface OktaEventHook {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'VERIFIED';
  verificationStatus?: string;
  events: {
    type: 'EVENT_TYPE';
    items: string[];
  };
  channel: {
    type: 'HTTP';
    version: string;
    config: {
      uri: string;
      headers?: Array<{
        key: string;
        value: string;
      }>;
      authScheme?: {
        type: string;
        key?: string;
      };
    };
  };
  created: string;
  lastUpdated: string;
  createdBy?: string;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Brand / Theme
// =============================================================================

export interface OktaBrand {
  id: string;
  name?: string;
  isDefault: boolean;
  customPrivacyPolicyUrl?: string;
  removePoweredByOkta?: boolean;
  agreeToCustomPrivacyPolicy?: boolean;
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Domain
// =============================================================================

export interface OktaDomain {
  id: string;
  domain: string;
  certificateSourceType: 'MANUAL' | 'OKTA_MANAGED';
  validationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'VERIFIED' | 'COMPLETED';
  dnsRecords?: Array<{
    recordType: string;
    fqdn: string;
    values: string[];
    expiration?: string;
  }>;
  publicCertificate?: {
    subject: string;
    fingerprint: string;
    expiration: string;
  };
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Feature
// =============================================================================

export interface OktaFeature {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'ENABLED' | 'DISABLED';
  stage?: {
    value: string;
    state?: string;
  };
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Linked Object
// =============================================================================

export interface OktaLinkedObject {
  primary: {
    name: string;
    title: string;
    description: string;
    type: 'USER';
  };
  associated: {
    name: string;
    title: string;
    description: string;
    type: 'USER';
  };
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// User Schema
// =============================================================================

export interface OktaUserSchema {
  id: string;
  $schema: string;
  name: string;
  title: string;
  created: string;
  lastUpdated: string;
  definitions: {
    base: {
      id: string;
      type: string;
      properties: Record<string, OktaSchemaProperty>;
      required?: string[];
    };
    custom: {
      id: string;
      type: string;
      properties: Record<string, OktaSchemaProperty>;
      required?: string[];
    };
  };
  type: string;
  properties: {
    profile: {
      allOf: Array<{
        $ref: string;
      }>;
    };
  };
  _links?: Record<string, OktaLink | OktaLink[]>;
}

export interface OktaSchemaProperty {
  title: string;
  type: string;
  description?: string;
  required?: boolean;
  mutability?: string;
  scope?: string;
  minLength?: number;
  maxLength?: number;
  permissions?: Array<{
    principal: string;
    action: string;
  }>;
  master?: {
    type: string;
  };
  enum?: string[];
  oneOf?: Array<{
    const: string;
    title: string;
  }>;
}

// =============================================================================
// Group Rule
// =============================================================================

export interface OktaGroupRule {
  id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'INVALID';
  name: string;
  created: string;
  lastUpdated: string;
  conditions: {
    people?: {
      users?: {
        exclude?: string[];
      };
      groups?: {
        exclude?: string[];
      };
    };
    expression?: {
      value: string;
      type: string;
    };
  };
  actions: {
    assignUserToGroups: {
      groupIds: string[];
    };
  };
  _links?: Record<string, OktaLink | OktaLink[]>;
}

// =============================================================================
// Common Types
// =============================================================================

export interface OktaLink {
  href: string;
  name?: string;
  hints?: {
    allow?: string[];
  };
}

export type ResponseFormat = 'json' | 'markdown';
