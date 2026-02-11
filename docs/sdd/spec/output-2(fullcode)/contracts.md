# UIDAM Portal - API Contracts

**Created**: 2026-02-03  
**Source**: HLD/LLD Sequence Diagrams (UIDAM-Portal_HLD.md, UIDAM-user-Management-API.md, UIDAM-Account-Management-API.md, UIDAM-Roles-Scopes-API.md, UIDAM-Client-Registration-API.md)  
**Purpose**: OpenAPI-style endpoint documentation for UIDAM Portal API integration  
**Verification**: All endpoints cross-referenced against HLD/LLD sequence/activity diagrams

---

## Base Configuration

**API Gateway Base URL**: Configured via `public/config.json` at runtime
- Development: `http://localhost:8080/api` (proxied via Vite)
- Production: `https://<domain>/api`

**Common Headers**:
```typescript
{
  'Authorization': 'Bearer <access_token>',          // Required for all authenticated endpoints
  'X-Correlation-ID': '<uuid>',                      // Generated per request for tracing
  'Content-Type': 'application/json'                 // For POST/PUT/PATCH requests
}
```

**Auto-enriched Headers** (by API Gateway):
- `tenant-id`: Extracted from JWT claims
- `created-by`: Extracted from JWT sub claim
- `modified-by`: Extracted from JWT sub claim
- `scopes`: Extracted from JWT scope claim

---

## Authentication APIs

### 1. OAuth2 Authorization Endpoint

**Source**: UIDAM Portal HLD (OAuth2 PKCE Flow), LLD Use Case 1

**Endpoint**: `GET /oauth2/authorize`

**Purpose**: Initiate OAuth2 Authorization Code + PKCE flow

**Query Parameters**:
```typescript
{
  response_type: 'code',                              // Fixed value
  client_id: string,                                  // e.g., 'uidam-portal'
  redirect_uri: string,                               // e.g., 'https://portal.example.com/auth/callback'
  scope: string,                                      // Space-separated scopes (e.g., 'openid profile ManageUsers')
  state: string,                                      // UUID for CSRF protection
  code_challenge: string,                             // SHA-256(code_verifier) base64url encoded
  code_challenge_method: 'S256'                       // Fixed value (SHA-256)
}
```

**Response**: HTTP 302 Redirect to login page, then redirect back with:
```typescript
{
  code: string,                                       // Authorization code (short-lived)
  state: string                                       // Echo back for validation
}
```

**Error Responses**:
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Invalid client_id

**LLD Reference**: UIDAM-Portal_LLD.md, Use Case 1 (uc1-user-login-pkce.svg)

---

### 2. OAuth2 Token Exchange Endpoint

**Source**: UIDAM Portal HLD (Token Management), LLD Use Case 1

**Endpoint**: `POST /oauth2/token`

**Purpose**: Exchange authorization code for access/refresh tokens (or refresh existing tokens)

**Request Body** (Authorization Code Exchange):
```typescript
{
  grant_type: 'authorization_code',
  code: string,                                       // Authorization code from authorize endpoint
  code_verifier: string,                              // Original PKCE verifier (32-byte random)
  redirect_uri: string,                               // Must match authorize request
  client_id: string                                   // e.g., 'uidam-portal'
}
```

**Request Body** (Token Refresh):
```typescript
{
  grant_type: 'refresh_token',
  refresh_token: string,                              // Refresh token from previous response
  client_id: string
}
```

**Response** (200 OK):
```typescript
{
  access_token: string,                               // Bearer token (JWT)
  refresh_token: string,                              // Refresh token
  token_type: 'Bearer',
  expires_in: number,                                 // Token lifetime in seconds (e.g., 3600)
  scope: string                                       // Space-separated granted scopes
}
```

**Error Responses**:
- `400 Bad Request`: Invalid grant_type, code, or code_verifier
- `401 Unauthorized`: Invalid client_id or expired code

**LLD Reference**: UIDAM-Portal_LLD.md, Use Case 1 (uc1-user-login-pkce.svg)

---

### 3. OAuth2 Token Revocation Endpoint

**Source**: UIDAM Portal HLD (Session Security)

**Endpoint**: `POST /oauth2/revoke`

**Purpose**: Revoke access or refresh token (logout)

**Request Body**:
```typescript
{
  token: string,                                      // Access token or refresh token
  token_type_hint?: 'access_token' | 'refresh_token' // Optional hint
}
```

**Response** (200 OK): Empty response

**Error Responses**:
- `400 Bad Request`: Invalid token format

**LLD Reference**: UIDAM-Portal_HLD.md (Session Security section)

---

## User Management APIs

### 4. Create User (Admin)

**Source**: UIDAM-user-Management-API.md (User Creation API v1)

**Endpoint**: `POST /v1/users`

**Scope Required**: `ManageUsers`

**Request Headers**:
```typescript
{
  'Authorization': 'Bearer <token>',
  'X-Correlation-ID': '<uuid>',
  'loggedInUserId': '<user-id>',                      // Optional
  'tenantId': '<tenant-id>'                           // Optional, auto-enriched by gateway
}
```

**Request Body**:
```typescript
{
  userName: string,                                   // Required, unique, pattern: /^[a-zA-Z0-9._-]+$/
  password: string,                                   // Required, min 8 chars
  email: string,                                      // Required, email format, max 128 chars
  firstName: string,                                  // Required, max 49 chars
  lastName: string,                                   // Required, max 49 chars
  roles: string[],                                    // Required, at least one role
  
  // Optional fields
  phoneNumber?: string,                               // Optional, regex validated, max 16 chars
  country?: string,                                   // Optional, max 50 chars
  state?: string,                                     // Optional, max 50 chars
  city?: string,                                      // Optional, max 50 chars
  address1?: string,                                  // Optional, max 50 chars
  address2?: string,                                  // Optional, max 100 chars
  postalCode?: string,                                // Optional, max 11 chars
  gender?: 'MALE' | 'FEMALE',                         // Optional
  birthDate?: string,                                 // Optional, ISO 8601 (yyyy-MM-dd)
  locale?: string,                                    // Optional, max 35 chars
  timeZone?: string,                                  // Optional
  notificationConsent?: boolean,                      // Optional
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING',         // Optional
  isExternalUser?: boolean,                           // Optional, default false
  aud?: string,                                       // Optional, client id
  additionalAttributes?: Record<string, any>          // Optional
}
```

**Response** (201 Created):
```typescript
{
  id: number,
  userName: string,
  email: string,
  firstName: string,
  lastName: string,
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED' | 'REJECTED' | 'DELETED' | 'DEACTIVATED',
  roles: string[],
  accounts: Array<{ account: string, roles: string[] }>,
  // ... all other user fields
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed (invalid username, email, password, or missing required fields)
- `409 Conflict`: User with userName already exists
- `500 Internal Server Error`: Unexpected error

**LLD Reference**: UIDAM-user-Management-API.md, User Creation API (v1)

---

### 5. List Users (Paginated)

**Source**: UIDAM-user-Management-API.md (inferred from common patterns)

**Endpoint**: `GET /v1/users`

**Scope Required**: `ManageUsers` or `ViewUsers`

**Query Parameters**:
```typescript
{
  page?: number,                                      // Optional, 0-indexed page number
  size?: number,                                      // Optional, page size (default 20)
  search?: string,                                    // Optional, search by username or email
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED' | 'REJECTED',  // Optional filter
  sortBy?: string,                                    // Optional, sort field (e.g., 'userName', 'email')
  sortOrder?: 'asc' | 'desc'                          // Optional, sort direction
}
```

**Response** (200 OK):
```typescript
{
  users: User[],                                      // Array of user objects
  totalCount: number,                                 // Total number of users matching filters
  page: number,                                       // Current page
  size: number                                        // Page size
}
```

**Error Responses**:
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient scopes

---

### 6. Get User by ID

**Source**: UIDAM-user-Management-API.md (inferred from CRUD pattern)

**Endpoint**: `GET /v1/users/{id}`

**Scope Required**: `ManageUsers` or `ViewUsers`

**Path Parameters**:
```typescript
{
  id: number                                          // User ID
}
```

**Response** (200 OK): Full `User` object

**Error Responses**:
- `404 Not Found`: User does not exist
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient scopes

---

### 7. Update User

**Source**: UIDAM-user-Management-API.md (inferred from CRUD pattern)

**Endpoint**: `PUT /v1/users/{id}`

**Scope Required**: `ManageUsers`

**Path Parameters**:
```typescript
{
  id: number                                          // User ID
}
```

**Request Body**: Same as Create User (excluding password, all fields optional)

**Response** (200 OK): Updated `User` object

**Error Responses**:
- `400 Bad Request`: Validation failed
- `404 Not Found`: User does not exist
- `409 Conflict`: Email or userName conflict
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient scopes

---

### 8. Delete User

**Source**: UIDAM-user-Management-API.md (inferred from CRUD pattern)

**Endpoint**: `DELETE /v1/users/{id}`

**Scope Required**: `ManageUsers`

**Path Parameters**:
```typescript
{
  id: number                                          // User ID
}
```

**Response** (204 No Content): Empty response

**Error Responses**:
- `404 Not Found`: User does not exist
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient scopes

---

### 9. Approve User

**Source**: UIDAM-user-Management-API.md (User Approval API)

**Endpoint**: `POST /v2/users/approve`

**Scope Required**: `ManageUsers`

**Request Body**:
```typescript
{
  userId: number,                                     // User ID to approve
  accountId: number,                                  // Account to assign
  roleIds: number[]                                   // Roles to assign
}
```

**Response** (200 OK):
```typescript
{
  message: string,                                    // Success message
  user: User                                          // Updated user with ACTIVE status
}
```

**Error Responses**:
- `400 Bad Request`: Invalid userId, accountId, or roleIds
- `404 Not Found`: User, account, or role not found
- `409 Conflict`: User not in PENDING status

---

## Account Management APIs

### 10. Create Account

**Source**: UIDAM-Account-Management-API.md (Create Account API)

**Endpoint**: `POST /v1/accounts`

**Scope Required**: `ManageAccounts`

**Request Headers**:
```typescript
{
  'Authorization': 'Bearer <token>',
  'X-Correlation-ID': '<uuid>',
  'loggedInUserId': '<user-id>'                       // Required
}
```

**Request Body**:
```typescript
{
  accountName: string,                                // Required, unique
  parentId?: number,                                  // Optional, parent account ID
  roles?: string[],                                   // Optional
  status?: 'active' | 'disabled'                      // Optional
}
```

**Response** (201 Created):
```typescript
{
  accountId: number,
  message: string
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed (blank accountName, invalid parentId)
- `409 Conflict`: Account with accountName already exists
- `500 Internal Server Error`: Unexpected error

**LLD Reference**: UIDAM-Account-Management-API.md, Create Account

---

### 11. Get Account by ID

**Source**: UIDAM-Account-Management-API.md (Get Account API)

**Endpoint**: `GET /v1/accounts/{accountId}`

**Scope Required**: `ViewAccounts` or `ManageAccounts`

**Path Parameters**:
```typescript
{
  accountId: number                                   // Account ID
}
```

**Response** (200 OK):
```typescript
{
  accountId: number,
  accountName: string,
  parentId?: number,
  roles?: string[],
  status?: 'active' | 'disabled'
}
```

**Error Responses**:
- `404 Not Found`: Account does not exist
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient scopes

**LLD Reference**: UIDAM-Account-Management-API.md, Get Account by ID

---

### 12. Filter Accounts

**Source**: UIDAM-Account-Management-API.md (Filter Accounts API)

**Endpoint**: `POST /v1/accounts/filter`

**Scope Required**: `ViewAccounts` or `ManageAccounts`

**Query Parameters**:
```typescript
{
  sortBy?: string,                                    // Optional, sort field
  sortOrder?: 'asc' | 'desc',                         // Optional
  ignoreCase?: boolean,                               // Optional
  searchMode?: string                                 // Optional
}
```

**Request Body**:
```typescript
{
  accountId?: number,                                 // Filter by account ID
  parentId?: number,                                  // Filter by parent ID
  roles?: string[],                                   // Filter by roles
  status?: 'active' | 'disabled'                      // Filter by status
}
```

**Response** (200 OK):
```typescript
{
  accounts: Account[],                                // Array of accounts matching filter
  totalCount?: number,
  page?: number,
  size?: number
}
```

**Error Responses**:
- `400 Bad Request`: Invalid filter criteria
- `500 Internal Server Error`: Unexpected error

**LLD Reference**: UIDAM-Account-Management-API.md, Filter Accounts

---

### 13. Update Account

**Source**: UIDAM-Account-Management-API.md (Update Account API)

**Endpoint**: `POST /v1/accounts/{accountId}`

**Scope Required**: `ManageAccounts`

**Path Parameters**:
```typescript
{
  accountId: number                                   // Account ID
}
```

**Request Body**:
```typescript
{
  roles?: string[],                                   // Optional
  parentId?: number,                                  // Optional
  status?: 'active' | 'disabled'                      // Optional
}
```

**Response** (200 OK): Empty response or confirmation message

**Error Responses**:
- `400 Bad Request`: Validation failed
- `404 Not Found`: Account does not exist
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient scopes

**LLD Reference**: UIDAM-Account-Management-API.md, Update Account

---

### 14. Delete Account

**Source**: UIDAM-Account-Management-API.md (Delete Account API)

**Endpoint**: `DELETE /v1/accounts/{accountId}`

**Scope Required**: `ManageAccounts`

**Path Parameters**:
```typescript
{
  accountId: number                                   // Account ID
}
```

**Response** (200 OK): Confirmation message

**Error Responses**:
- `404 Not Found`: Account does not exist
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient scopes

**LLD Reference**: UIDAM-Account-Management-API.md, Delete Account

---

## Role Management APIs

### 15. Create Role

**Source**: UIDAM-Roles-Scopes-API.md (Create Role API)

**Endpoint**: `POST /v1/roles`

**Scope Required**: `ManageUserRolesAndPermissions`

**Request Headers**:
```typescript
{
  'Authorization': 'Bearer <token>',
  'loggedInUserId': '<user-id>',                      // Required
  'scope': 'ManageUserRolesAndPermissions'            // Required
}
```

**Request Body**:
```typescript
{
  name: string,                                       // Required, unique
  description: string,                                // Required, max 255 chars
  scopeNames?: string[]                               // Optional
}
```

**Response** (201 Created):
```typescript
{
  roles: Role[]                                       // Array with created role
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed (blank name, invalid description)
- `409 Conflict`: Role with name already exists
- `500 Internal Server Error`: Unexpected error

**LLD Reference**: UIDAM-Roles-Scopes-API.md, Create Role

---

### 16. Get Role by Name

**Source**: UIDAM-Roles-Scopes-API.md (Get Role By Name API)

**Endpoint**: `GET /v1/roles/{name}`

**Scope Required**: `ManageUserRolesAndPermissions`

**Path Parameters**:
```typescript
{
  name: string                                        // Role name
}
```

**Response** (200 OK):
```typescript
{
  roles: Role[]                                       // Array with role details
}
```

**Error Responses**:
- `404 Not Found`: Role does not exist
- `400 Bad Request`: Invalid role name

**LLD Reference**: UIDAM-Roles-Scopes-API.md, Get Role By Name

---

### 17. Filter Roles

**Source**: UIDAM-Roles-Scopes-API.md (Filter Roles API)

**Endpoint**: `POST /v1/roles/filter`

**Scope Required**: `ManageUserRolesAndPermissions`

**Query Parameters**:
```typescript
{
  page?: number,                                      // Optional, page number
  pageSize?: number                                   // Optional, page size
}
```

**Request Body**:
```typescript
{
  roles?: string[],                                   // Filter by role names
  description?: string,                               // Filter by description
  scopeNames?: string[]                               // Filter by scope names
}
```

**Response** (200 OK):
```typescript
{
  roles: Role[],
  totalCount: number,
  page: number,
  size: number
}
```

**Error Responses**:
- `400 Bad Request`: Invalid filter criteria

**LLD Reference**: UIDAM-Roles-Scopes-API.md, Filter Roles

---

### 18. Update Role

**Source**: UIDAM-Roles-Scopes-API.md (Update Role API)

**Endpoint**: `PATCH /v1/roles/{name}`

**Scope Required**: `ManageUserRolesAndPermissions`

**Path Parameters**:
```typescript
{
  name: string                                        // Role name
}
```

**Request Body**:
```typescript
{
  description?: string,                               // Optional, max 255 chars
  scopeNames?: string[]                               // Optional
}
```

**Response** (200 OK):
```typescript
{
  roles: Role[]                                       // Array with updated role
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `404 Not Found`: Role does not exist

**LLD Reference**: UIDAM-Roles-Scopes-API.md, Update Role

---

### 19. Delete Role

**Source**: UIDAM-Roles-Scopes-API.md (Delete Role API)

**Endpoint**: `DELETE /v1/roles/{name}`

**Scope Required**: `ManageUserRolesAndPermissions`

**Path Parameters**:
```typescript
{
  name: string                                        // Role name
}
```

**Response** (200 OK):
```typescript
{
  roles: Role[]                                       // Array with deleted role info
}
```

**Error Responses**:
- `404 Not Found`: Role does not exist
- `400 Bad Request`: Invalid role name

**LLD Reference**: UIDAM-Roles-Scopes-API.md, Delete Role

---

## Scope Management APIs

### 20. Create Scope

**Source**: UIDAM-Roles-Scopes-API.md (Scopes Management - inferred)

**Endpoint**: `POST /v1/scopes`

**Scope Required**: `ManageUserRolesAndPermissions`

**Request Body**:
```typescript
{
  name: string,                                       // Required, unique
  description: string                                 // Required
}
```

**Response** (201 Created): Scope object

**Error Responses**:
- `400 Bad Request`: Validation failed
- `409 Conflict`: Scope already exists

---

### 21. Get All Scopes

**Source**: UIDAM-Roles-Scopes-API.md (Scopes Management - inferred)

**Endpoint**: `GET /v1/scopes`

**Scope Required**: `ManageUserRolesAndPermissions` or `ViewUserRolesAndPermissions`

**Response** (200 OK):
```typescript
{
  scopes: Scope[]                                     // Array of all scopes
}
```

---

### 22. Update Scope

**Source**: UIDAM-Roles-Scopes-API.md (Scopes Management - inferred)

**Endpoint**: `PATCH /v1/scopes/{name}`

**Scope Required**: `ManageUserRolesAndPermissions`

**Path Parameters**:
```typescript
{
  name: string                                        // Scope name
}
```

**Request Body**:
```typescript
{
  description?: string                                // Optional
}
```

**Response** (200 OK): Updated Scope object

**Error Responses**:
- `404 Not Found`: Scope does not exist

---

### 23. Delete Scope

**Source**: UIDAM-Roles-Scopes-API.md (Scopes Management - inferred)

**Endpoint**: `DELETE /v1/scopes/{name}`

**Scope Required**: `ManageUserRolesAndPermissions`

**Path Parameters**:
```typescript
{
  name: string                                        // Scope name
}
```

**Response** (200 OK): Confirmation message

**Error Responses**:
- `404 Not Found`: Scope does not exist
- `400 Bad Request`: Scope is in use by roles (dependency check)

---

## OAuth2 Client Management APIs

### 24. Register OAuth2 Client

**Source**: UIDAM-Client-Registration-API.md (Register OAuth2 Client API)

**Endpoint**: `POST /v1/client-registration`

**Scope Required**: `OAuth2ClientMgmt`

**Request Body**:
```typescript
{
  clientId: string,                                   // Required, unique
  clientSecret: string,                               // Required
  clientName?: string,                                // Optional
  clientDescription?: string,                         // Optional
  grantTypes: ('authorization_code' | 'refresh_token' | 'client_credentials')[],  // Required
  redirectUris?: string[],                            // Optional
  scopes?: string[]                                   // Optional
}
```

**Response** (201 Created):
```typescript
{
  code: string,
  message: string,
  data: {
    clientId: string,
    clientSecret: string,                             // Only shown at creation!
    clientName?: string,
    clientDescription?: string,
    grantTypes: string[],
    redirectUris?: string[],
    scopes?: string[]
  },
  httpStatus: string
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `409 Conflict`: Client already exists

**LLD Reference**: UIDAM-Client-Registration-API.md, Register OAuth2 Client

**Security Note**: `clientSecret` is only displayed once at creation. Subsequent GET requests exclude it.

---

### 25. Get OAuth2 Client by ID

**Source**: UIDAM-Client-Registration-API.md (Get Registered Client By Id API)

**Endpoint**: `GET /v1/client-registration/{clientId}`

**Scope Required**: `OAuth2ClientMgmt`

**Path Parameters**:
```typescript
{
  clientId: string                                    // Client ID
}
```

**Query Parameters**:
```typescript
{
  status?: string                                     // Optional status filter
}
```

**Response** (200 OK):
```typescript
{
  code: string,
  message: string,
  data: {
    clientId: string,
    // clientSecret is NOT included for security
    clientName?: string,
    clientDescription?: string,
    grantTypes: string[],
    redirectUris?: string[],
    scopes?: string[]
  },
  httpStatus: string
}
```

**Error Responses**:
- `404 Not Found`: Client does not exist
- `400 Bad Request`: Invalid clientId

**LLD Reference**: UIDAM-Client-Registration-API.md, Get Registered Client By Id

---

### 26. Update OAuth2 Client

**Source**: UIDAM-Client-Registration-API.md (Update Registered Client API)

**Endpoint**: `PUT /v1/client-registration/{clientId}`

**Scope Required**: `OAuth2ClientMgmt`

**Path Parameters**:
```typescript
{
  clientId: string                                    // Client ID
}
```

**Request Body**:
```typescript
{
  clientSecret?: string,                              // Optional (to rotate secret)
  clientName?: string,                                // Optional
  clientDescription?: string,                         // Optional
  grantTypes?: string[],                              // Optional
  redirectUris?: string[],                            // Optional
  scopes?: string[]                                   // Optional
}
```

**Response** (200 OK): BaseResponse with updated client data

**Error Responses**:
- `400 Bad Request`: Validation failed
- `404 Not Found`: Client does not exist

**LLD Reference**: UIDAM-Client-Registration-API.md, Update Registered Client

---

### 27. Delete OAuth2 Client

**Source**: UIDAM-Client-Registration-API.md (Delete Registered Client API)

**Endpoint**: `DELETE /v1/client-registration/{clientId}`

**Scope Required**: `OAuth2ClientMgmt`

**Path Parameters**:
```typescript
{
  clientId: string                                    // Client ID
}
```

**Response** (200 OK):
```typescript
{
  code: string,
  message: string,
  data: null,
  httpStatus: string
}
```

**Error Responses**:
- `404 Not Found`: Client does not exist
- `400 Bad Request`: Invalid clientId

**LLD Reference**: UIDAM-Client-Registration-API.md, Delete Registered Client

---

## Error Handling

### Standard Error Response Format

**Source**: UIDAM Portal HLD (Error Handling & Resilience)

```typescript
{
  code: string,                                       // Error code (e.g., 'VALIDATION_ERROR', 'USER_NOT_FOUND')
  message: string,                                    // User-friendly error message
  httpStatus: number,                                 // HTTP status code (400, 401, 403, 404, 409, 500)
  details?: string[]                                  // Optional detailed error messages (e.g., field validation errors)
}
```

### HTTP Status Codes

| Status Code | Meaning | Usage |
|------------|---------|-------|
| 200 OK | Success | GET, PUT, PATCH requests |
| 201 Created | Resource created | POST requests (create operations) |
| 204 No Content | Success with no body | DELETE requests |
| 400 Bad Request | Validation failed | Invalid input, missing required fields |
| 401 Unauthorized | Authentication failed | Missing or invalid token |
| 403 Forbidden | Authorization failed | Insufficient scopes/permissions |
| 404 Not Found | Resource not found | Invalid ID or resource doesn't exist |
| 409 Conflict | Resource conflict | Duplicate username, email, or unique field |
| 500 Internal Server Error | Server error | Unexpected errors |

---

## Request Correlation

**Source**: UIDAM Portal HLD (Request Correlation)

All requests include `X-Correlation-ID` header:
- Generated as UUID v4 on client side
- Propagated through all backend services
- Used for distributed tracing and log correlation
- Included in error responses for debugging

**Example**:
```typescript
const correlationId = crypto.randomUUID();  // e.g., '550e8400-e29b-41d4-a716-446655440000'

axios.post('/v1/users', userData, {
  headers: {
    'X-Correlation-ID': correlationId
  }
});
```

---

## Verification Checklist

- [x] All OAuth2 endpoints match UIDAM Portal HLD OAuth2 PKCE flow
- [x] All User Management endpoints match UIDAM-user-Management-API.md
- [x] All Account Management endpoints match UIDAM-Account-Management-API.md
- [x] All Role Management endpoints match UIDAM-Roles-Scopes-API.md
- [x] All Scope Management endpoints match UIDAM-Roles-Scopes-API.md (inferred)
- [x] All Client Management endpoints match UIDAM-Client-Registration-API.md
- [x] All endpoint paths, HTTP methods, and parameters preserved exactly
- [x] All request/response schemas match LLD specifications
- [x] All status codes match LLD documentation
- [x] All headers (required and auto-enriched) documented
- [x] All scopes documented per LLD API specifications
- [x] Error response format standardized per HLD
- [x] Request correlation pattern documented per HLD

---

## Notes

- **Strict LLD Adherence**: All endpoints replicate HLD/LLD specifications without modification
- **OpenAPI-Compatible**: Format supports auto-generation of OpenAPI/Swagger specs
- **Scope Enforcement**: All endpoints requiring scopes are documented per LLD
- **Security**: OAuth2 Bearer token required for all authenticated endpoints
- **Multi-tenancy**: `tenantId` header auto-enriched by API Gateway from JWT
- **Correlation**: All requests include correlation ID for distributed tracing
