# UIDAM Portal - Data Model Specification

**Created**: 2026-02-03  
**Source**: LLD API Documentation (UIDAM-user-Management-API.md, UIDAM-Account-Management-API.md, UIDAM-Roles-Scopes-API.md, UIDAM-Client-Registration-API.md)  
**Purpose**: TypeScript entity definitions for UIDAM Portal  
**Verification**: All entities cross-referenced against LLD entity diagrams

---

## Entity Definitions

### 1. User Entity

**Source**: UIDAM-user-Management-API.md (User Creation API v1, Response Payload Attributes)

```typescript
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export interface UserAccount {
  account: string;
  roles: string[];
}

export interface User {
  id: number;                              // BigInteger in Java, number in TypeScript
  userName: string;                        // Required, unique, validated by regex
  email: string;                          // Required, validated by email format (max 128 chars)
  firstName: string;                      // Optional, max 49 chars
  lastName: string;                       // Optional, max 49 chars
  status: UserStatus;                     // Enum: ACTIVE, INACTIVE, PENDING, BLOCKED, REJECTED, DELETED, DEACTIVATED
  
  // Contact Information
  phoneNumber?: string;                   // Optional, validated by regex, max 16 chars
  country?: string;                       // Optional, max 50 chars
  state?: string;                         // Optional, max 50 chars
  city?: string;                          // Optional, max 50 chars
  address1?: string;                      // Optional, max 50 chars
  address2?: string;                      // Optional, max 100 chars
  postalCode?: string;                    // Optional, max 11 chars
  
  // Personal Information
  gender?: Gender;                        // Optional, enum: MALE, FEMALE
  birthDate?: string;                     // Optional, ISO 8601 format (yyyy-MM-dd)
  locale?: string;                        // Optional, max 35 chars
  timeZone?: string;                      // Optional
  notificationConsent?: boolean;          // Optional
  
  // System Fields
  devIds?: string[];                      // Set<String> in Java, string[] in TypeScript (device IDs)
  roles?: string[];                       // Set<String> in Java, string[] in TypeScript
  accounts?: UserAccount[];               // Account-role mappings
  additionalAttributes?: Record<string, any>;  // Map<String, Object> in Java
  
  // External User Fields
  isExternalUser?: boolean;               // Optional, default false
  aud?: string;                           // Optional, client id/audience
}

export interface CreateUserRequest {
  userName: string;                       // Required
  password: string;                       // Required, min 8 chars client-side
  email: string;                          // Required
  firstName: string;                      // Required
  lastName: string;                       // Required
  roles: string[];                        // Required, at least one role
  
  // Optional fields
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  gender?: Gender;
  birthDate?: string;
  locale?: string;
  timeZone?: string;
  notificationConsent?: boolean;
  additionalAttributes?: Record<string, any>;
  status?: UserStatus;
  isExternalUser?: boolean;
  aud?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  gender?: Gender;
  birthDate?: string;
  locale?: string;
  timeZone?: string;
  notificationConsent?: boolean;
  status?: UserStatus;
  roles?: string[];
  accounts?: UserAccount[];
}
```

**Validation Rules** (from LLD):
- `userName`: Must match pattern `/^[a-zA-Z0-9._-]+$/`, unique
- `email`: Must match pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, max 128 chars
- `password`: Minimum 8 characters (client-side), backend enforces tenant-specific policy
- `phoneNumber`: Validated by regex, max 16 chars
- `birthDate`: ISO 8601 format (yyyy-MM-dd)

**State Transitions**:
- New user → PENDING (if email verification enabled) or ACTIVE
- PENDING → ACTIVE (upon approval)
- ACTIVE → INACTIVE (manual deactivation)
- ACTIVE → BLOCKED (security lockout)
- PENDING → REJECTED (approval denied)
- Any → DELETED (soft delete)

---

### 2. Account Entity

**Source**: UIDAM-Account-Management-API.md (Account API Specifications)

```typescript
export enum AccountStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

export interface Account {
  accountId: number;                      // BigInteger in Java (unique identifier)
  accountName: string;                    // Required, unique, must not be blank
  parentId?: number;                      // Optional, BigInteger (parent account ID)
  roles?: string[];                       // Optional, List<String>
  status?: AccountStatus;                 // Optional, enum: active, disabled
}

export interface CreateAccountRequest {
  accountName: string;                    // Required, unique
  parentId?: number;                      // Optional
  roles?: string[];                       // Optional
  status?: AccountStatus;                 // Optional
}

export interface UpdateAccountRequest {
  roles?: string[];                       // Optional
  parentId?: number;                      // Optional
  status?: AccountStatus;                 // Optional
}

export interface AccountFilterRequest {
  accountId?: number;                     // Filter by account ID
  parentId?: number;                      // Filter by parent account ID
  roles?: string[];                       // Filter by roles
  status?: AccountStatus;                 // Filter by status
}

export interface AccountFilterResponse {
  accounts: Account[];                    // List of accounts matching filter
  totalCount?: number;                    // Total number of matching accounts
  page?: number;                          // Current page number
  size?: number;                          // Page size
}
```

**Validation Rules** (from LLD):
- `accountName`: Required, must not be blank, unique across system
- `parentId`: Optional, must reference existing account if provided
- `status`: Allowed values: 'active', 'disabled'

**Relationships**:
- Account can have one parent account (hierarchical structure)
- Account can have multiple child accounts
- Account can have multiple roles assigned

---

### 3. Role Entity

**Source**: UIDAM-Roles-Scopes-API.md (Roles Management API)

```typescript
export interface Role {
  id?: number;                            // BigInteger (role unique identifier)
  name: string;                           // Required, unique, validated
  description: string;                    // Required, max 255 chars
  scopeNames?: string[];                  // Set<String> in Java, optional
}

export interface CreateRoleRequest {
  name: string;                           // Required, unique
  description: string;                    // Required, max 255 chars
  scopeNames?: string[];                  // Optional
}

export interface UpdateRoleRequest {
  description?: string;                   // Optional, max 255 chars
  scopeNames?: string[];                  // Optional
}

export interface RoleFilterRequest {
  roles?: string[];                       // Filter by role names
  description?: string;                   // Filter by description
  scopeNames?: string[];                  // Filter by scope names
}

export interface RoleFilterResponse {
  roles: Role[];                          // List of roles matching filter
  totalCount: number;                     // Total number of matching roles
  page: number;                           // Current page number
  size: number;                           // Page size
}
```

**Validation Rules** (from LLD):
- `name`: Required, unique, must match pattern and length
- `description`: Required, max 255 characters
- `scopeNames`: Optional, must reference existing scopes

**Relationships**:
- Role has many-to-many relationship with Scopes
- Role can be assigned to multiple Users
- Role can be assigned to multiple Accounts

---

### 4. Scope Entity

**Source**: UIDAM-Roles-Scopes-API.md (Scopes Management API)

```typescript
export interface Scope {
  id?: number;                            // Scope unique identifier
  name: string;                           // Required, unique
  description: string;                    // Required
}

export interface CreateScopeRequest {
  name: string;                           // Required, unique
  description: string;                    // Required
}

export interface UpdateScopeRequest {
  description?: string;                   // Optional
}
```

**Validation Rules** (from LLD):
- `name`: Required, unique across system
- `description`: Required

**Relationships**:
- Scope has many-to-many relationship with Roles
- Scope defines granular permissions for API access

---

### 5. OAuth2 Client Entity

**Source**: UIDAM-Client-Registration-API.md (Client Registration API)

```typescript
export enum OAuth2GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  REFRESH_TOKEN = 'refresh_token',
  CLIENT_CREDENTIALS = 'client_credentials'
}

export interface OAuth2Client {
  clientId: string;                       // Required, unique identifier
  clientSecret: string;                   // Required, validated (security policy)
  clientName?: string;                    // Optional
  clientDescription?: string;             // Optional
  grantTypes: OAuth2GrantType[];          // Required, Set<String> in Java
  redirectUris?: string[];                // Optional, Set<String> in Java
  scopes?: string[];                      // Optional, Set<String> in Java
}

export interface RegisterClientRequest {
  clientId: string;                       // Required, unique
  clientSecret: string;                   // Required
  clientName?: string;                    // Optional
  clientDescription?: string;             // Optional
  grantTypes: OAuth2GrantType[];          // Required
  redirectUris?: string[];                // Optional
  scopes?: string[];                      // Optional
}

export interface UpdateClientRequest {
  clientSecret?: string;                  // Optional
  clientName?: string;                    // Optional
  clientDescription?: string;             // Optional
  grantTypes?: OAuth2GrantType[];         // Optional
  redirectUris?: string[];                // Optional
  scopes?: string[];                      // Optional
}
```

**Validation Rules** (from LLD):
- `clientId`: Required, unique across system
- `clientSecret`: Required, must meet security policy
- `grantTypes`: Required, allowed values: authorization_code, refresh_token, client_credentials
- `redirectUris`: Optional, must be valid URIs
- `scopes`: Optional, must reference existing scopes

**Security Note**:
- `clientSecret` is displayed only once at creation time
- Subsequent retrievals do not include clientSecret for security

---

### 6. API Response Wrapper

**Source**: All LLD documents (common response pattern)

```typescript
export interface ApiResponse<T> {
  code?: string;                          // Response code
  message?: string;                       // Response message
  data?: T;                               // Response payload (generic type)
  httpStatus?: string;                    // HTTP status code
}

export interface PaginatedResponse<T> {
  data: T[];                              // Array of items
  totalCount: number;                     // Total number of items
  page: number;                           // Current page number (0-indexed or 1-indexed based on API)
  size: number;                           // Page size
}

export interface ErrorResponse {
  code: string;                           // Error code
  message: string;                        // Error message
  httpStatus: number;                     // HTTP status code
  details?: string[];                     // Optional detailed error messages
}
```

---

### 7. OAuth2 Token

**Source**: UIDAM Portal HLD (OAuth2 PKCE flow)

```typescript
export interface OAuth2Token {
  access_token: string;                   // Bearer token
  refresh_token: string;                  // Refresh token
  token_type: string;                     // 'Bearer'
  expires_in: number;                     // Token lifetime in seconds
  scope: string;                          // Space-separated scope list
}

export interface TokenRefreshRequest {
  grant_type: 'refresh_token';
  refresh_token: string;
}

export interface AuthorizationCodeRequest {
  grant_type: 'authorization_code';
  code: string;                           // Authorization code
  code_verifier: string;                  // PKCE code verifier
  redirect_uri: string;
  client_id: string;
}
```

---

## Entity Relationships

```
User ──┬─► Account (many-to-many via UserAccount)
       └─► Role (many-to-many)

Account ──► Role (many-to-many)

Role ──► Scope (many-to-many)

OAuth2Client ──► Scope (many-to-many)
```

---

## Verification Checklist

- [x] User entity matches UIDAM-user-Management-API.md Response Payload Attributes
- [x] Account entity matches UIDAM-Account-Management-API.md API specifications
- [x] Role entity matches UIDAM-Roles-Scopes-API.md Role API definitions
- [x] Scope entity matches UIDAM-Roles-Scopes-API.md Scope API definitions
- [x] OAuth2Client matches UIDAM-Client-Registration-API.md RegisteredClientDetails
- [x] All field names preserved exactly as documented in LLD
- [x] All data types correctly mapped (BigInteger→number, Set→array, Map→Record)
- [x] All validation rules extracted from LLD
- [x] All status enums match LLD specifications
- [x] Relationships documented per LLD entity diagrams

---

## TypeScript Type Mapping

| Java Type | TypeScript Type | Notes |
|-----------|----------------|-------|
| BigInteger | number | JavaScript number (safe up to 2^53-1) |
| String | string | - |
| Boolean | boolean | - |
| Set<String> | string[] | Array for simplicity |
| List<String> | string[] | - |
| Map<String, Object> | Record<string, any> | Key-value pairs |
| Enum | enum | TypeScript enum |
| LocalDate | string | ISO 8601 format (yyyy-MM-dd) |
| ZonedDateTime | string | ISO 8601 format with timezone |

---

## Notes

- **Strict LLD Adherence**: All entities replicate LLD specifications without modification
- **TypeScript Strict Mode**: All interfaces use strict typing (no `any` except for additionalAttributes)
- **Optional vs Required**: Matches LLD request/response attribute definitions exactly
- **Enums**: Defined for all constrained value fields (UserStatus, Gender, AccountStatus, OAuth2GrantType)
- **Validation**: Client-side validation rules documented separately (implemented in form components)
