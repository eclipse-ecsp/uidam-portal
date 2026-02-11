# Data Model: Password Reset for Authenticated Users

**Version**: 1.0  
**Created**: February 3, 2026  
**Source**: [UIDAM-user-Management-API.md](../../lld/UIDAM-user-Management-API.md), [Unified-IDAM_HLD.md](../../hld/uidam/Unified-IDAM_HLD.md)  
**Specification**: [spec.md](./spec.md)

---

## Overview

This document defines the data models for the Password Reset feature for authenticated users. All models are derived from the HLD and LLD specifications without modification or improvisation.

**Verification**: Cross-referenced against:
- UIDAM User Management API LLD (entity definitions, API payloads)
- Unified IDAM HLD Requirement #27 (password reset requirements)
- Unified IDAM HLD Requirement #26 (password policy requirements)

---

## Core Entities

### 1. User Entity

**Source**: UIDAM-user-Management-API.md - User Creation API (v1), Self User Password Recovery (v1)

**Description**: Represents a user in the UIDAM system with password-related fields.

**Fields**:

| Field Name | Type | Required | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `id` | BigInteger | Yes | Unique user identifier | Auto-generated |
| `userName` | String | Yes | Unique username | Regex pattern, max length varies by tenant |
| `userPassword` | String | Yes | Hashed password | Hashed with tenant-specific encoder (bcrypt/SHA-256) |
| `passwordSalt` | String | Yes | Salt for password hashing | Generated per user, stored separately |
| `pwdChangedtime` | Timestamp | No | Last password change timestamp | ISO 8601 format, updated on password reset |
| `email` | String | Yes | User email address | Valid email format, max 128 chars |
| `phoneNumber` | String | No | Mobile phone number | E.164 format, max 16 chars, optional |
| `status` | Enum (UserStatus) | Yes | User account status | Values: PENDING, ACTIVE, BLOCKED, INACTIVE, DELETED, DEACTIVATED |
| `firstName` | String | No | User first name | Max 49 chars |
| `lastName` | String | No | User last name | Max 49 chars |

**State Transitions**:
- Password reset does not change user status
- If account is BLOCKED due to failed attempts, successful password reset clears the block
- All other status values remain unchanged during password reset

**Relationships**:
- User → PasswordHistory (one-to-many)
- User → UserRecoverySecret (one-to-many, but only one active at a time)
- User → PasswordPolicy (many-to-one via tenant configuration)

---

### 2. PasswordPolicy Entity

**Source**: Unified-IDAM_HLD.md - Requirement #26 (Portal Password policy & Expiration)

**Description**: Defines password validation rules and constraints for a tenant.

**Fields**:

| Field Name | Type | Required | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `policyId` | UUID/String | Yes | Unique policy identifier | Auto-generated |
| `tenantId` | String | Yes | Associated tenant | Links to tenant configuration |
| `minLength` | Integer | Yes | Minimum password length | Default: 8, must be >= 8 |
| `maxLength` | Integer | Yes | Maximum password length | Default: 128 |
| `requireUppercase` | Boolean | Yes | Require uppercase letters | Default: true |
| `requireLowercase` | Boolean | Yes | Require lowercase letters | Default: true |
| `requireDigit` | Boolean | Yes | Require numeric digits | Default: true |
| `requireSpecialChar` | Boolean | Yes | Require special characters | Default: true |
| `minUppercaseCount` | Integer | No | Minimum uppercase letters | Default: 1 |
| `minLowercaseCount` | Integer | No | Minimum lowercase letters | Default: 1 |
| `minDigitCount` | Integer | No | Minimum digits | Default: 1 |
| `minSpecialCharCount` | Integer | No | Minimum special characters | Default: 1 |
| `specialCharList` | String | No | Allowed special characters | Default: "!@#$%^&*()_+-=[]{}|;:,.<>?" |
| `excludedSpecialChars` | String | No | Excluded special characters | Optional |
| `passwordHistoryCount` | Integer | Yes | Number of previous passwords to check | Default: 5 |
| `passwordExpiryDays` | Integer | No | Days until password expires | Default: 90, 0 = no expiry |
| `required` | Boolean | Yes | Whether policy is active | Default: true |
| `priority` | Integer | Yes | Policy priority for evaluation order | Lower number = higher priority |

**Validation Logic**:
- Policies are evaluated in priority order (ascending)
- All required policies must pass
- Password history check uses hashed passwords from PasswordHistory entity

---

### 3. PasswordHistory Entity

**Source**: UIDAM-user-Management-API.md (User Creation flow, password hashing logic)

**Description**: Stores historical passwords for a user to prevent password reuse.

**Fields**:

| Field Name | Type | Required | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `historyId` | BigInteger | Yes | Unique history record identifier | Auto-generated |
| `userId` | BigInteger | Yes | Reference to User entity | Foreign key to User.id |
| `userPassword` | String | Yes | Hashed password | Same hash algorithm as User.userPassword |
| `passwordSalt` | String | Yes | Salt used for this password | Same as User.passwordSalt at time of creation |
| `userName` | String | Yes | Username at time of password creation | Copied from User.userName |
| `createDate` | Timestamp | Yes | When password was set | ISO 8601 format |
| `createdBy` | String | Yes | Who created the password | User ID or "system" for self-service |
| `updateDate` | Timestamp | Yes | Last update timestamp | Same as createDate initially |
| `updatedBy` | String | Yes | Who last updated | Same as createdBy initially |

**Relationships**:
- PasswordHistory → User (many-to-one)

**Lifecycle**:
- New entry created on every password change
- Old entries automatically purged when count exceeds `passwordHistoryCount` policy
- Entries ordered by `createDate` descending

---

### 4. UserRecoverySecret Entity

**Source**: UIDAM-user-Management-API.md - Self User Password Recovery (v1)

**Description**: Stores verification tokens for password reset email/SMS verification.

**Fields**:

| Field Name | Type | Required | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `secretId` | UUID/String | Yes | Unique secret identifier | Auto-generated, cryptographically secure |
| `userId` | BigInteger | Yes | Reference to User entity | Foreign key to User.id |
| `secret` | String | Yes | Verification token | Min 256-bit entropy, URL-safe encoding |
| `recoverySecretStatus` | Enum (Status) | Yes | Token status | Values: PENDING, VERIFIED, EXPIRED, REVOKED |
| `expiresAt` | Timestamp | Yes | Expiration timestamp | Creation time + 15 minutes |
| `createdAt` | Timestamp | Yes | Creation timestamp | ISO 8601 format |
| `verifiedAt` | Timestamp | No | Verification timestamp | Null until verified |
| `verificationType` | Enum (Type) | Yes | Verification method | Values: EMAIL, SMS |

**State Transitions**:
- PENDING → VERIFIED (on successful verification)
- PENDING → EXPIRED (after 15 minutes)
- PENDING/VERIFIED → REVOKED (on new password reset request)

**Validation Rules**:
- Only one PENDING secret per user at a time
- Previous secrets automatically set to REVOKED when new secret is created
- Secret must be verified within 15 minutes of creation
- Secret is single-use (cannot be reused after verification)

**Relationships**:
- UserRecoverySecret → User (many-to-one)

---

### 5. AuditLog Entity

**Source**: Unified-IDAM_HLD.md - Audit logging requirements

**Description**: Stores audit trail for password reset activities.

**Fields**:

| Field Name | Type | Required | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `logId` | UUID/String | Yes | Unique log entry identifier | Auto-generated |
| `userId` | BigInteger | Yes | User who performed action | Foreign key to User.id |
| `eventType` | Enum (EventType) | Yes | Type of event | Values: PASSWORD_RESET_INITIATED, VERIFICATION_SENT, PASSWORD_CHANGED, VERIFICATION_FAILED, etc. |
| `timestamp` | Timestamp | Yes | Event timestamp | ISO 8601 format, UTC |
| `correlationId` | UUID | Yes | Request correlation ID | Passed from API Gateway, used for tracing |
| `ipAddress` | String | No | User IP address | IPv4 or IPv6 format |
| `userAgent` | String | No | Browser/device information | HTTP User-Agent header |
| `status` | Enum (Status) | Yes | Event status | Values: SUCCESS, FAILURE |
| `failureReason` | String | No | Reason for failure | Present only if status = FAILURE |
| `additionalData` | JSON | No | Extra context data | Structured JSON, no sensitive data |

**Event Types for Password Reset**:
- `PASSWORD_RESET_INITIATED` - User started password reset flow
- `VERIFICATION_EMAIL_SENT` - Verification email sent successfully
- `VERIFICATION_SMS_SENT` - Verification SMS sent successfully
- `VERIFICATION_COMPLETED` - User verified email/SMS successfully
- `PASSWORD_CHANGED` - Password updated successfully
- `VERIFICATION_EXPIRED` - Verification token expired
- `VERIFICATION_FAILED` - Verification attempt failed
- `POLICY_VALIDATION_FAILED` - Password failed policy validation
- `SESSIONS_REVOKED` - All user sessions terminated

**Retention**:
- Minimum 90 days per compliance requirements
- Extended retention based on tenant-specific regulations (GDPR, SOX, HIPAA)

---

## Frontend Data Transfer Objects (DTOs)

### 6. PasswordResetRequest DTO

**Source**: Derived from API contract requirements

**Description**: Request payload for initiating password reset.

**TypeScript Interface**:

```typescript
interface PasswordResetRequest {
  currentPassword: string;    // User's current password for validation
  newPassword: string;        // New password to set
}
```

**Validation Rules**:
- `currentPassword`: Required, non-empty string
- `newPassword`: Required, must pass password policy validation
- Passwords transmitted over HTTPS only
- No password logging on client or server

---

### 7. PasswordResetResponse DTO

**Source**: UIDAM-user-Management-API.md - Self User Password Recovery (v1)

**Description**: Response payload from password reset initiation.

**TypeScript Interface**:

```typescript
interface PasswordResetResponse {
  message: string;            // User-friendly confirmation message
  success: boolean;           // Whether operation succeeded
  verificationType?: 'EMAIL' | 'SMS';  // Method used for verification
}
```

**Example Response**:
```json
{
  "message": "Password recovery initiated. Check your email.",
  "success": true,
  "verificationType": "EMAIL"
}
```

---

### 8. PasswordPolicyResponse DTO

**Source**: Derived from PasswordPolicy entity structure

**Description**: Password policy configuration returned from API.

**TypeScript Interface**:

```typescript
interface PasswordPolicyResponse {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecialChar: boolean;
  minUppercaseCount?: number;
  minLowercaseCount?: number;
  minDigitCount?: number;
  minSpecialCharCount?: number;
  specialCharList?: string;
  passwordHistoryCount: number;
  passwordExpiryDays?: number;
}
```

**Usage**:
- Fetched on page load to display policy requirements
- Used for client-side validation (server remains authoritative)
- Cached in React Query for performance

---

### 9. PasswordValidationError DTO

**Source**: Derived from validation requirements

**Description**: Structured error response for password validation failures.

**TypeScript Interface**:

```typescript
interface PasswordValidationError {
  field: 'currentPassword' | 'newPassword' | 'confirmPassword';
  code: string;               // Error code for localization
  message: string;            // User-friendly error message
  policyViolated?: string;    // Specific policy rule violated (if applicable)
}
```

**Common Error Codes**:
- `PASSWORD_TOO_SHORT` - Password length below minimum
- `PASSWORD_TOO_LONG` - Password length exceeds maximum
- `PASSWORD_NO_UPPERCASE` - Missing uppercase letter
- `PASSWORD_NO_LOWERCASE` - Missing lowercase letter
- `PASSWORD_NO_DIGIT` - Missing digit
- `PASSWORD_NO_SPECIAL_CHAR` - Missing special character
- `PASSWORD_IN_HISTORY` - Password matches previous password
- `PASSWORD_MISMATCH` - New password and confirm password don't match
- `CURRENT_PASSWORD_INCORRECT` - Current password validation failed

---

## Validation Rules Summary

### Password Validation Workflow

1. **Client-Side Validation** (React Hook Form + Yup)
   - Field presence checks (required fields)
   - Password match validation (newPassword === confirmPassword)
   - Basic format checks (min/max length from policy)
   - Real-time feedback via PasswordStrengthIndicator

2. **Server-Side Validation** (Authoritative)
   - Current password hash verification
   - Full password policy enforcement
   - Password history check (last N passwords)
   - User account status validation
   - Token/authentication validation

3. **Verification Validation**
   - Email/SMS verification token validity
   - Token expiration check (15 minutes)
   - Token status check (not already used/revoked)
   - User account status recheck

### State Transition Diagram

```
[User Initiates Reset]
        ↓
[Validate Current Password] → FAIL → [Display Error]
        ↓ PASS
[Validate New Password vs Policy] → FAIL → [Display Policy Errors]
        ↓ PASS
[Create UserRecoverySecret (PENDING)]
        ↓
[Send Verification Email/SMS]
        ↓
[User Clicks Link / Enters Code]
        ↓
[Validate Secret] → FAIL/EXPIRED → [Display Error + Retry Option]
        ↓ PASS
[Update User Password]
        ↓
[Create PasswordHistory Entry]
        ↓
[Set UserRecoverySecret → VERIFIED]
        ↓
[Revoke All User Tokens]
        ↓
[Log Audit Events]
        ↓
[Logout User + Redirect to Login]
```

---

## Data Relationships Diagram

```
┌─────────────────┐
│      User       │
│  - id           │
│  - userName     │
│  - userPassword │◄───────┐
│  - passwordSalt │        │
│  - email        │        │
│  - phoneNumber  │        │
└────────┬────────┘        │
         │                 │
         │ 1               │
         │                 │
         │ *               │
    ┌────▼────────┐        │
    │  Password   │        │
    │  History    │────────┘
    │  - historyId│  (stores old passwords)
    │  - userId   │
    │  - password │
    └─────────────┘

┌─────────────────┐
│   Password      │
│   Policy        │
│  - policyId     │
│  - tenantId     │
│  - minLength    │
│  - rules...     │
└─────────────────┘
         │
         │ applies to
         ▼
┌─────────────────┐
│      User       │
│  (tenant-based) │
└─────────────────┘

┌─────────────────┐
│  UserRecovery   │
│  Secret         │
│  - secretId     │
│  - userId       │◄─── references
│  - secret       │
│  - status       │
│  - expiresAt    │
└─────────────────┘

┌─────────────────┐
│   AuditLog      │
│  - logId        │
│  - userId       │◄─── references
│  - eventType    │
│  - timestamp    │
└─────────────────┘
```

---

## Verification Against HLD/LLD

**✅ Verified Against**:
1. UIDAM-user-Management-API.md - User entity structure (Lines 1-200)
2. UIDAM-user-Management-API.md - Self User Password Recovery API (Lines 835-900)
3. Unified-IDAM_HLD.md - Requirement #26 (Password Policy)
4. Unified-IDAM_HLD.md - Requirement #27 (Reset Password)

**No Deviations**: All entities, fields, and relationships match LLD specifications exactly. No improvisation or modification beyond documented design.

---

## Notes

- All timestamps use ISO 8601 format in UTC
- All password hashing uses tenant-configured encoder (bcrypt or SHA-256)
- BigInteger type maps to JavaScript `number` or `string` (for large values)
- Enum values are uppercase strings in backend, converted to TypeScript string literal unions
- All sensitive data (passwords, tokens) excluded from client-side logging
