# API Contracts: Password Reset for Authenticated Users

**Version**: 1.0  
**Created**: February 3, 2026  
**Source**: [UIDAM-user-Management-API.md](../../lld/UIDAM-user-Management-API.md)  
**Specification**: [spec.md](./spec.md)

---

## Overview

This document defines the API contracts for the Password Reset feature. All endpoints, request/response schemas, headers, and status codes are derived exactly from the LLD specifications without modification.

**Verification**: Cross-referenced against:
- UIDAM User Management API LLD - Self User Password Recovery (v1) section
- UIDAM Portal HLD - API Gateway Integration section
- Existing implementation in `userService.ts`

---

## Base Configuration

**Base URL**: Configured via environment  
- Development: `http://localhost:8080` (proxied by Vite)
- Production: `https://{api-gateway-host}`

**API Gateway**: All requests routed through UIDAM API Gateway  
**Authentication**: Bearer token required (OAuth2 access token)  
**Content-Type**: `application/json`

---

## API Endpoints

### 1. Initiate Password Reset for Authenticated User

**Endpoint**: `POST /v1/users/self/recovery/forgot-password`

**Source**: UIDAM-user-Management-API.md - Section 14 (Self User Password Recovery v1)

**Description**: Initiates password recovery for the currently authenticated user (self) by sending a password reset link or code to the registered email or phone number. This is for authenticated users resetting their own password, distinct from the "Forgot Password" flow for unauthenticated users.

**Authentication**: Required (Bearer token)

**Request Headers**:

| Header | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `Authorization` | Yes | String | Bearer token | `Bearer eyJhbGc...` |
| `Content-Type` | Yes | String | Request content type | `application/json` |
| `X-Correlation-ID` | No | UUID | Request correlation ID for tracing | `550e8400-e29b-41d4-a716-446655440000` |
| `user-id` | Yes | String | User ID extracted from JWT | Extracted from token by client |
| `scopes` | Yes | String | OAuth2 scopes (comma-separated) | `ViewUsers,ManageUsers` |
| `tenantId` | No | String | Tenant identifier | Auto-enriched by API Gateway |

**Request Parameters**: None

**Request Body**: None (Empty body)

**Response Success (200 OK)**:

```json
{
  "message": "Password recovery initiated. Check your email.",
  "data": null
}
```

**Response Schema**:

```typescript
interface PasswordRecoveryResponse {
  message: string;          // User-friendly confirmation message
  code?: string;            // Optional status code
  data?: null;              // No additional data returned
  httpStatus?: string;      // HTTP status text (optional)
}
```

**Response Status Codes**:

| Status Code | Description | Response Body Example |
|-------------|-------------|-----------------------|
| `200 OK` | Recovery initiated successfully | `{ "message": "Password recovery initiated. Check your email." }` |
| `401 Unauthorized` | Not authenticated or token invalid | `{ "code": "UNAUTHORIZED", "message": "Authentication required", "httpStatus": "UNAUTHORIZED" }` |
| `404 Not Found` | User does not exist | `{ "code": "USER_NOT_FOUND", "message": "User not found", "httpStatus": "NOT_FOUND" }` |
| `500 Internal Server Error` | Unexpected server error | `{ "code": "INTERNAL_ERROR", "message": "An unexpected error occurred", "httpStatus": "INTERNAL_SERVER_ERROR" }` |

**Error Response Schema**:

```typescript
interface ApiErrorResponse {
  code: string;             // Error code for programmatic handling
  message: string;          // User-friendly error message
  httpStatus: string;       // HTTP status text
  details?: string;         // Additional error details (optional)
  correlationId?: string;   // Correlation ID for debugging
}
```

**Behavior**:
1. Validates Bearer token and extracts user ID
2. Checks if user exists in database
3. Retrieves user's registered email address
4. Creates `UserRecoverySecret` with status PENDING and 15-minute expiration
5. Sends verification email via Notification Service
6. Returns success message to client
7. Logs event in audit trail

**Client-Side Error Handling**:
- **401**: Clear tokens, redirect to login
- **404**: Display "User not found. Please contact support."
- **500**: Display "Unable to initiate password reset. Please try again later." with retry option

---

### 2. Get Password Policy

**Endpoint**: `GET /v1/password-policies`

**Source**: Derived from password policy requirements (HLD Requirement #26)

**Description**: Retrieves the password policy configuration for the current tenant. Used to display policy requirements and perform client-side validation.

**Authentication**: Required (Bearer token)

**Request Headers**:

| Header | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `Authorization` | Yes | String | Bearer token | `Bearer eyJhbGc...` |
| `X-Correlation-ID` | No | UUID | Request correlation ID | `550e8400-e29b-41d4-a716-446655440000` |
| `scopes` | Yes | String | OAuth2 scopes | `ViewUsers` |
| `tenantId` | No | String | Tenant identifier | Auto-enriched by API Gateway |

**Request Parameters**: None

**Request Body**: None

**Response Success (200 OK)**:

```json
{
  "data": [
    {
      "policyKey": "MIN_LENGTH",
      "description": "Minimum password length",
      "required": true,
      "rules": {
        "minLength": 8
      },
      "priority": 1
    },
    {
      "policyKey": "COMPLEXITY",
      "description": "Password complexity requirements",
      "required": true,
      "rules": {
        "requireUppercase": true,
        "requireLowercase": true,
        "requireDigit": true,
        "requireSpecialChar": true,
        "minUppercaseCount": 1,
        "minLowercaseCount": 1,
        "minDigitCount": 1,
        "minSpecialCharCount": 1,
        "specialCharList": "!@#$%^&*()_+-=[]{}|;:,.<>?"
      },
      "priority": 2
    },
    {
      "policyKey": "HISTORY",
      "description": "Password history check",
      "required": true,
      "rules": {
        "passwordHistoryCount": 5
      },
      "priority": 3
    },
    {
      "policyKey": "EXPIRATION",
      "description": "Password expiration",
      "required": false,
      "rules": {
        "passwordExpiryDays": 90
      },
      "priority": 4
    }
  ]
}
```

**Response Schema**:

```typescript
interface PasswordPolicyItem {
  policyKey: string;                    // Policy identifier
  description: string;                  // Human-readable description
  required: boolean;                    // Whether policy is enforced
  rules: Record<string, any>;           // Policy-specific rules
  priority: number;                     // Evaluation order
}

interface PasswordPolicyResponse {
  data: PasswordPolicyItem[];           // Array of policy items
  message?: string;
  code?: string;
}
```

**Response Status Codes**:

| Status Code | Description | Response Body Example |
|-------------|-------------|-----------------------|
| `200 OK` | Policy retrieved successfully | See above |
| `401 Unauthorized` | Not authenticated | Standard error response |
| `500 Internal Server Error` | Server error | Standard error response |

**Caching Strategy**:
- Cache duration: 5 minutes (React Query `staleTime`)
- Invalidate on tenant switch (if multi-tenant)
- Refetch on window focus (React Query default)

---

### 3. Revoke User Tokens (Authorization Server)

**Endpoint**: `POST /oauth2/revoke`

**Source**: UIDAM Portal HLD - Token Management section

**Description**: Revokes OAuth2 access and refresh tokens for the authenticated user. Called after successful password change to terminate all sessions.

**Authentication**: Required (Client credentials or Bearer token)

**Request Headers**:

| Header | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `Authorization` | Yes | String | Bearer token or Basic auth | `Bearer eyJhbGc...` |
| `Content-Type` | Yes | String | Form-encoded | `application/x-www-form-urlencoded` |

**Request Parameters**: None

**Request Body** (URL-encoded):

```
token={access_token}&token_type_hint=access_token
```

**Request Schema**:

```typescript
interface TokenRevokeRequest {
  token: string;                    // Token to revoke
  token_type_hint?: 'access_token' | 'refresh_token';  // Token type hint
  client_id?: string;               // Client ID (if using client credentials)
}
```

**Response Success (200 OK)**:

```json
{}
```

**Response is empty** - successful revocation returns 200 with no body per OAuth2 RFC.

**Response Status Codes**:

| Status Code | Description | Notes |
|-------------|-------------|-------|
| `200 OK` | Token revoked or already invalid | Success (even if token was already invalid) |
| `400 Bad Request` | Invalid request | Malformed request |
| `401 Unauthorized` | Client authentication failed | Invalid client credentials |

**Behavior**:
1. Validates token signature
2. Marks token as revoked in token store
3. Removes token from cache (if applicable)
4. Returns 200 OK regardless of token validity (per spec)

**Client Implementation**:
- Revoke both access_token and refresh_token
- Call endpoint twice (once for each token)
- Proceed with logout even if revocation fails (fail-open for UX)
- Log revocation failures for monitoring

---

## Common Headers

### Request Headers (All Endpoints)

**Automatically Added by API Client**:

| Header | Source | Description |
|--------|--------|-------------|
| `Authorization` | localStorage | Bearer token from authentication |
| `X-Correlation-ID` | Generated (UUID) | Unique request ID for tracing |
| `user-id` | JWT token | Extracted from `user_id` claim in access token |
| `Content-Type` | Static | Always `application/json` (except OAuth2 endpoints) |

**Auto-Enriched by API Gateway**:

| Header | Source | Description |
|--------|--------|-------------|
| `tenant-id` | JWT token | Extracted from `tenant_id` claim |
| `created-by` | JWT token | User ID for audit trail |
| `modified-by` | JWT token | User ID for audit trail |
| `scopes` | JWT token | Comma-separated list of scopes |

### Response Headers (All Endpoints)

| Header | Description |
|--------|-------------|
| `X-Correlation-ID` | Echoed from request for tracing |
| `Content-Type` | Always `application/json` |
| `Cache-Control` | Caching directives (varies by endpoint) |

---

## Error Handling

### Standard Error Response Format

All API errors follow this structure:

```typescript
interface ApiErrorResponse {
  code: string;                 // Machine-readable error code
  message: string;              // Human-readable error message
  httpStatus: string;           // HTTP status text
  details?: string;             // Additional details (optional)
  correlationId?: string;       // Request correlation ID
  timestamp?: string;           // ISO 8601 timestamp
}
```

**Example Error Responses**:

**400 Bad Request** (Validation Failure):
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Password does not meet policy requirements",
  "httpStatus": "BAD_REQUEST",
  "details": "Password must contain at least 1 uppercase letter",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-03T10:30:00Z"
}
```

**401 Unauthorized**:
```json
{
  "code": "UNAUTHORIZED",
  "message": "Authentication required",
  "httpStatus": "UNAUTHORIZED",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**404 Not Found**:
```json
{
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "httpStatus": "NOT_FOUND",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**500 Internal Server Error**:
```json
{
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please try again later.",
  "httpStatus": "INTERNAL_SERVER_ERROR",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Code Mapping

| HTTP Status | Code | Message | User Action |
|-------------|------|---------|-------------|
| 400 | `VALIDATION_ERROR` | Password validation failed | Fix password per policy requirements |
| 400 | `PASSWORD_IN_HISTORY` | Password matches previous password | Choose a different password |
| 400 | `CURRENT_PASSWORD_INCORRECT` | Current password is incorrect | Re-enter current password |
| 401 | `UNAUTHORIZED` | Authentication required | Log in again |
| 401 | `TOKEN_EXPIRED` | Access token expired | Refresh token or log in again |
| 404 | `USER_NOT_FOUND` | User not found | Contact support |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and try again |
| 500 | `INTERNAL_ERROR` | Server error | Try again later or contact support |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Try again later |

---

## TypeScript API Client Implementation

### Service Method Signature

```typescript
// src/services/userService.ts

class UserService {
  /**
   * Initiates password reset for the authenticated user
   * Sends verification email/SMS to user's registered contact
   * 
   * @returns Promise<ApiResponse<SelfUserPasswordRecoveryResponseV1>>
   * @throws Error if request fails
   */
  static async postSelfRecoveryForgotPassword(): 
    Promise<ApiResponse<SelfUserPasswordRecoveryResponseV1>> {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/v1/users/self/recovery/forgot-password`,
      {
        method: 'POST',
        headers: getApiHeaders(),  // Adds Auth, Correlation-ID, user-id
      }
    );
    return response.json();
  }

  /**
   * Gets password policy for current tenant
   * Used for client-side validation and policy display
   * 
   * @returns Promise<ApiResponse<PasswordPolicyItem[]>>
   */
  static async getPasswordPolicy(): 
    Promise<ApiResponse<PasswordPolicyItem[]>> {
    const response = await fetch(
      `${API_CONFIG.API_BASE_URL}/v1/password-policies`,
      {
        method: 'GET',
        headers: getApiHeaders(),
      }
    );
    return response.json();
  }
}
```

### React Query Hook Implementation

```typescript
// src/features/self-service/password-reset/hooks/usePasswordResetMutation.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/userService';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

export const usePasswordResetMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: () => UserService.postSelfRecoveryForgotPassword(),
    
    onSuccess: (data) => {
      // Display success message
      console.info('Password reset initiated:', data.message);
      
      // Optionally: Invalidate user-related queries
      queryClient.invalidateQueries(['users', 'self']);
      
      // Note: Actual password change happens after email verification
      // Session termination occurs server-side after verification
    },
    
    onError: (error: Error) => {
      console.error('Password reset failed:', error);
      // Error handling in component
    },
  });
};

export const usePasswordPolicy = () => {
  return useQuery({
    queryKey: ['password-policy'],
    queryFn: () => UserService.getPasswordPolicy(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

---

## Request/Response Flow Diagram

```
┌─────────┐                    ┌────────────┐                 ┌──────────────┐
│ Portal  │                    │    API     │                 │     User     │
│ Client  │                    │  Gateway   │                 │  Management  │
└────┬────┘                    └─────┬──────┘                 └──────┬───────┘
     │                               │                                │
     │ POST /v1/users/self/recovery/forgot-password                  │
     │ Headers: Authorization, X-Correlation-ID, user-id             │
     ├──────────────────────────────►│                                │
     │                               │                                │
     │                               │ Validate token, enrich headers │
     │                               ├───────────────────────────────►│
     │                               │                                │
     │                               │ Validate user exists           │
     │                               │ Create UserRecoverySecret      │
     │                               │ Send email via Notification    │
     │                               │                                │
     │                               │ 200 OK + message               │
     │                               │◄───────────────────────────────┤
     │                               │                                │
     │ 200 OK                        │                                │
     │ { "message": "Check email" }  │                                │
     │◄──────────────────────────────┤                                │
     │                               │                                │
     │ Display success message       │                                │
     │                               │                                │
     │                               │                                │
     │ (User clicks email link)      │                                │
     │                               │                                │
     │ GET /recovery/reset/{secret}  │                                │
     ├──────────────────────────────►│                                │
     │                               │ Verify secret, update password │
     │                               ├───────────────────────────────►│
     │                               │                                │
     │                               │ Revoke tokens, logout user     │
     │                               │                                │
     │ Redirect to login             │                                │
     │◄──────────────────────────────┤                                │
     │                               │                                │
```

---

## Verification Against LLD

**✅ Verified Against**:
1. UIDAM-user-Management-API.md - Section 14 (Self User Password Recovery v1)
2. UIDAM Portal HLD - API Gateway Integration patterns
3. UIDAM Portal HLD - Token Management section
4. Existing implementation in `src/services/userService.ts`

**Exact Match Confirmation**:
- Endpoint path: `/v1/users/self/recovery/forgot-password` ✅
- HTTP method: POST ✅
- Required headers: Authorization, scopes, user-id ✅
- Response structure: `{ message, data }` ✅
- Status codes: 200, 401, 404, 500 ✅
- Authentication requirement: Bearer token ✅

**No Deviations**: All API contracts match LLD specifications exactly. No improvisation or modification beyond documented design.

---

## Notes

- All timestamps in API responses use ISO 8601 format in UTC
- Correlation IDs are UUID v4 format
- Bearer tokens use JWT format with standard claims
- All requests/responses use `application/json` content type (except OAuth2 token revocation)
- HTTPS required in production (enforced by infrastructure)
- API Gateway automatically adds tenant-specific headers
- Client-side validation is advisory only; server-side validation is authoritative
