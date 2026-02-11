# Feature Specification: Password Reset for Authenticated Users

**Version**: 1.0  
**Created**: February 3, 2026  
**Status**: Draft  
**Source Requirement**: [Unified-IDAM_HLD.md](../../../uidam-portal/hld/uidam/Unified-IDAM_HLD.md) - Requirement #27  
**Priority**: High (MVP)  

---

## Feature Overview

Enable authenticated users to reset their password from the UIDAM Portal profile section through a secure, user-verified process that includes email or SMS notification for additional validation.

**Related Requirements**:
- **HLD Requirement #27**: Human-User Self Service - Reset Password (RDNG: 172717)
- **HLD Requirement #26**: Portal Password Policy & Expiration
- **HLD Requirement #28**: Update Profile (related to MFA validation)

---

## User Stories

### Primary User Stories

**US-1: As an authenticated user, I want to reset my password from my profile settings**  
So that I can update my credentials when I suspect they may be compromised or wish to strengthen my account security.

**US-2: As an authenticated user, I want to receive email/SMS verification when resetting my password**  
So that I can confirm the password change request is legitimate and prevent unauthorized access to my account.

**US-3: As an authenticated user, I want my password to be validated against security policies**  
So that my new password meets minimum security requirements and cannot be a previously used password.

**US-4: As an authenticated user, I want to be logged out of all sessions after a successful password reset**  
So that any potentially compromised sessions are immediately terminated.

**US-5: As a system administrator, I want to enforce password reset with email/SMS verification**  
So that password changes are properly validated and auditable for security compliance.

---

## User Scenarios & Acceptance Criteria

### Scenario 1: Successful Password Reset with Email Verification

**Given** I am an authenticated user on the UIDAM Portal  
**And** I navigate to my profile/security settings  
**When** I click "Reset Password" button  
**Then** I should see a password reset form

**When** I enter my current password, new password, and confirm new password  
**And** I submit the form  
**Then** the system should validate the new password against the password policy  
**And** send a verification email to my registered email address  
**And** display a message "Verification email sent. Please check your inbox."

**When** I open the verification email  
**And** click the verification link within 15 minutes  
**Then** my password should be successfully updated  
**And** I should receive a confirmation message  
**And** all my active sessions should be terminated  
**And** I should be redirected to the login page

**Acceptance Criteria**:
- Password reset form displays current password, new password, and confirm password fields
- New password must meet password policy requirements (length, complexity, history)
- Verification email is sent within 30 seconds of form submission
- Verification link expires after 15 minutes
- Password is updated only after successful email verification
- All existing user tokens are revoked upon successful password change
- User is logged out and redirected to login page
- Password change is logged in audit trail

### Scenario 2: Password Reset with SMS Verification

**Given** I am an authenticated user with SMS/phone number configured  
**And** SMS verification is enabled for my account  
**When** I initiate a password reset  
**Then** I should receive an SMS with a verification code  
**And** be prompted to enter the code within 15 minutes

**When** I enter the correct verification code  
**Then** my password should be updated successfully  
**And** all sessions should be terminated

**Acceptance Criteria**:
- SMS is sent if phone number is configured and SMS verification is enabled
- Verification code is 6 digits and expires in 15 minutes
- Maximum 3 attempts allowed for code verification
- Account is temporarily locked for 30 minutes after 3 failed verification attempts

### Scenario 3: Password Policy Validation Failure

**Given** I am submitting a password reset request  
**When** my new password violates any password policy rule  
**Then** I should see a specific error message indicating which policy requirement failed  
**And** the password should not be changed  
**And** no verification email/SMS should be sent

**Policy Validations**:
- Minimum password length (default: 8 characters)
- Password complexity (uppercase, lowercase, digits, special characters)
- Password not in previous password history (last 5 passwords)
- Password not same as current password
- Password not matching common weak passwords list

**Acceptance Criteria**:
- Clear, actionable error messages displayed for each failed policy rule
- Password policy requirements visible before user attempts to change password
- Multiple validation failures shown simultaneously
- Form remains accessible for retry

### Scenario 4: Expired Verification Link

**Given** I have received a password reset verification email  
**When** I click the verification link after 15 minutes  
**Then** I should see an error message "Verification link has expired"  
**And** be given the option to request a new password reset  
**And** my password should remain unchanged

**Acceptance Criteria**:
- Clear expiration message displayed
- Option to restart password reset process
- Original password reset request is invalidated
- Security event logged

### Scenario 5: Current Password Validation Failure

**Given** I am attempting to reset my password  
**When** I enter an incorrect current password  
**Then** I should see an error message "Current password is incorrect"  
**And** the password reset should not proceed  
**And** no verification email/SMS should be sent

**Acceptance Criteria**:
- Current password validated before sending verification
- Failed attempts tracked (max 5 failures trigger account lock for 30 minutes)
- Error message does not reveal whether user exists

### Scenario 6: Password Mismatch

**Given** I am filling the password reset form  
**When** my new password and confirm password fields do not match  
**Then** I should see an error message "Passwords do not match"  
**And** the submit button should be disabled until they match

**Acceptance Criteria**:
- Real-time validation as user types in confirm password field
- Clear visual indicator (red border, error icon)
- Submit button disabled while mismatch exists

---

## Functional Requirements

### FR-001: Password Reset Form
**Priority**: MUST  
The system MUST provide a password reset form accessible from the user profile/security settings section that includes:
- Current password input field (password type, masked)
- New password input field (password type, masked with show/hide toggle)
- Confirm new password input field (password type, masked with show/hide toggle)
- Password strength indicator
- Password policy requirements display
- Submit and Cancel buttons

### FR-002: Current Password Validation
**Priority**: MUST  
The system MUST validate the user's current password before proceeding with password reset. If validation fails:
- Display error message "Current password is incorrect"
- Track failed attempts (maximum 5 failures within 15 minutes triggers 30-minute account lock)
- Log failed validation attempts for security audit

### FR-003: Password Policy Enforcement
**Priority**: MUST  
The system MUST validate the new password against all active password policies before sending verification, including:
- Minimum length (configurable, default 8 characters)
- Complexity requirements (minimum uppercase, lowercase, digits, special characters)
- Password history check (cannot match last 5 passwords)
- Not same as current password
- Not matching username or email
- Display specific error messages for each failed policy requirement

### FR-004: Email Verification
**Priority**: MUST  
The system MUST send an email verification when password reset is requested:
- Email sent to user's registered email address
- Email contains unique, time-limited verification link
- Verification link expires after 15 minutes
- Email includes user-friendly instructions and security warnings
- Link format: `https://{auth-server}/recovery/reset/{secret-token}`

### FR-005: SMS Verification (Alternative)
**Priority**: SHOULD  
The system SHOULD support SMS verification as an alternative or additional verification method:
- SMS sent to registered phone number if configured
- SMS contains 6-digit verification code
- Code expires after 15 minutes
- Maximum 3 verification attempts allowed
- Account locked for 30 minutes after 3 failed attempts

### FR-006: Verification Completion
**Priority**: MUST  
Upon successful verification (email link click or SMS code entry), the system MUST:
- Update user's password to the new password
- Hash password using tenant-specific encoder (bcrypt/SHA-256)
- Generate new password salt
- Store password in password history
- Set password changed timestamp
- Revoke all existing access and refresh tokens for the user
- Log password change event with correlation ID

### FR-007: Session Termination
**Priority**: MUST  
The system MUST terminate all active user sessions upon successful password change:
- Revoke all OAuth2 tokens (access and refresh tokens)
- Clear user session data from authorization server
- Force re-authentication on all devices
- Display message "Password changed successfully. Please log in again."
- Redirect to login page

### FR-008: Password Strength Indicator
**Priority**: SHOULD  
The system SHOULD display real-time password strength feedback as the user types:
- Visual indicator (weak/medium/strong/very strong)
- Color-coded progress bar (red/yellow/green)
- Specific suggestions for improvement
- Based on entropy calculation and policy requirements

### FR-009: Audit Logging
**Priority**: MUST  
The system MUST log all password reset activities:
- Password reset initiated (user ID, timestamp, correlation ID)
- Verification email/SMS sent (user ID, timestamp, delivery status)
- Verification completed (user ID, timestamp, verification method)
- Password changed successfully (user ID, timestamp, IP address)
- Failed verification attempts (user ID, timestamp, reason)
- Policy validation failures (user ID, timestamp, policy violated)

### FR-010: Error Handling
**Priority**: MUST  
The system MUST handle errors gracefully:
- Email delivery failures: display message "Unable to send verification email. Please try again later."
- SMS delivery failures: offer email as fallback or retry
- Network errors: display retry option
- Token expiration: offer to restart password reset process
- Server errors: display generic error message without exposing internal details

### FR-011: Security Notifications
**Priority**: SHOULD  
The system SHOULD send security notification emails:
- Confirmation email after successful password change
- Alert email if password reset was not initiated by user (with action link)
- Include timestamp, IP address, and location (if available)

### FR-012: Password History Management
**Priority**: MUST  
The system MUST maintain password history:
- Store hash of last 5 passwords (configurable)
- Prevent reuse of previous passwords
- Automatically purge history beyond configured limit
- Include password creation timestamp

---

## Edge Cases

### EC-001: Concurrent Password Reset Requests
**Scenario**: User initiates multiple password reset requests simultaneously  
**Expected Behavior**: Only the most recent verification token should be valid. Previous tokens should be invalidated automatically. Display warning if attempting to use an invalidated token.

### EC-002: Password Reset During Active Session
**Scenario**: User has multiple active sessions when resetting password  
**Expected Behavior**: All sessions across all devices should be terminated immediately upon successful password change.

### EC-003: Unregistered Email Address
**Scenario**: User's email address is not verified or no longer valid  
**Expected Behavior**: Display error "Unable to send verification email. Please update your email address in profile settings first."

### EC-004: MFA Enabled Account
**Scenario**: User has Multi-Factor Authentication enabled  
**Expected Behavior**: After email/SMS verification for password reset, user should also complete MFA challenge before password is updated (if MFA factors like email/phone are being changed).

### EC-005: External IDP Users
**Scenario**: User authenticated via external Identity Provider (e.g., Google, Azure AD)  
**Expected Behavior**: Password reset option should be hidden or disabled for external IDP users with message "Your password is managed by {IDP Name}. Please contact your administrator."

### EC-006: Account Locked State
**Scenario**: User account is locked due to failed login attempts  
**Expected Behavior**: Password reset should still be available. Upon successful password reset and verification, account lock should be automatically cleared.

### EC-007: Password Expiration During Reset
**Scenario**: User's password expires while password reset verification is pending  
**Expected Behavior**: Allow password reset to complete. New password sets new expiration date based on policy.

### EC-008: Network Interruption During Verification
**Scenario**: Network connection lost while clicking verification link  
**Expected Behavior**: Verification link remains valid until expiration. User can retry clicking the link when connection is restored.

---

## Non-Functional Requirements

### NFR-001: Performance
**Priority**: MUST  
- Password validation response time: < 500ms
- Verification email delivery: within 30 seconds (95th percentile)
- SMS delivery: within 60 seconds (95th percentile)
- Form submission response: < 1 second
- Token revocation: < 2 seconds

### NFR-002: Security
**Priority**: MUST  
- All password data transmitted over HTTPS/TLS 1.2+
- Passwords hashed using bcrypt or SHA-256 with unique salt per user
- Verification tokens cryptographically secure (minimum 256-bit entropy)
- Rate limiting: maximum 5 password reset attempts per user per hour
- Verification links single-use only
- Protection against brute force attacks on verification codes
- No password data logged in plain text
- OWASP compliance for password handling

### NFR-003: Usability
**Priority**: SHOULD  
- Form accessible via keyboard navigation (Tab, Enter, Esc)
- WCAG 2.1 Level AA compliance
- Clear, jargon-free error messages
- Mobile-responsive design
- Password show/hide toggle for accessibility
- Screen reader compatible
- Support for password managers

### NFR-004: Reliability
**Priority**: MUST  
- System availability: 99.9% uptime
- Email delivery success rate: > 95%
- SMS delivery success rate: > 90%
- Graceful degradation if email/SMS service unavailable
- Automatic retry mechanism for failed notifications (max 3 retries)

### NFR-005: Browser Compatibility
**Priority**: MUST  
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers: iOS Safari, Chrome Mobile

### NFR-006: Accessibility
**Priority**: MUST  
- ARIA labels for all form fields
- Proper heading hierarchy
- Focus management for modal dialogs
- Error announcements via screen readers
- Sufficient color contrast (4.5:1 minimum)
- Resizable text without loss of functionality

### NFR-007: Internationalization
**Priority**: SHOULD  
- Support for multiple languages (English as default)
- Localized error messages
- Date/time formatting based on user locale
- RTL language support

---

## Success Criteria

### Measurable Outcomes

1. **Security**: 100% of password resets require email/SMS verification before completion
2. **Compliance**: 100% of password changes enforce password policy and history rules
3. **User Experience**: Users can complete password reset in under 3 minutes (from initiation to login with new password)
4. **Reliability**: Password reset completion rate > 95% (excluding user abandonment)
5. **Performance**: 95% of verification emails delivered within 30 seconds
6. **Session Security**: 100% of user sessions terminated within 5 seconds of password change
7. **Audit**: 100% of password reset events logged with correlation IDs for traceability
8. **Accessibility**: WCAG 2.1 Level AA compliance score of 100% on automated testing tools
9. **Error Recovery**: Users can successfully retry after failures 90% of the time without support intervention

---

## Key Entities

### User
- **userId**: Unique identifier
- **userName**: Login username
- **email**: Registered email address (required for email verification)
- **phoneNumber**: Mobile number (optional, required for SMS verification)
- **currentPasswordHash**: Hashed current password
- **passwordSalt**: Salt used for password hashing
- **passwordChangedTime**: Timestamp of last password change
- **accountStatus**: Active, Locked, Pending, etc.

### PasswordPolicy
- **policyId**: Unique identifier
- **minLength**: Minimum password length
- **requireUppercase**: Boolean
- **requireLowercase**: Boolean
- **requireDigit**: Boolean
- **requireSpecialChar**: Boolean
- **specialCharList**: Allowed special characters
- **passwordHistoryCount**: Number of previous passwords to check
- **passwordExpiryDays**: Days until password expires

### PasswordHistory
- **historyId**: Unique identifier
- **userId**: Reference to User
- **passwordHash**: Hashed password
- **passwordSalt**: Salt used
- **createdDate**: When password was set
- **createdBy**: User or system identifier

### UserRecoverySecret
- **secretId**: Unique identifier
- **userId**: Reference to User
- **secret**: Unique verification token
- **expiresAt**: Expiration timestamp (15 minutes from creation)
- **status**: Pending, Verified, Expired, Revoked
- **verificationType**: Email, SMS
- **createdAt**: Creation timestamp
- **verifiedAt**: Verification timestamp (null until verified)

### AuditLog
- **logId**: Unique identifier
- **userId**: Reference to User
- **eventType**: PasswordResetInitiated, VerificationSent, PasswordChanged, etc.
- **timestamp**: Event timestamp
- **correlationId**: Request correlation ID
- **ipAddress**: User's IP address
- **userAgent**: Browser/device information
- **status**: Success, Failure
- **failureReason**: If applicable

---

## Dependencies & External Integrations

### Internal Dependencies

1. **UIDAM User Management Service**
   - Endpoint: `PUT /v1/users/{userId}/password/reset`
   - Purpose: Validate current password, enforce policies, update password
   - Authentication: Bearer token required

2. **UIDAM Authorization Server**
   - Endpoints:
     - `POST /oauth2/revoke` - Revoke access/refresh tokens
     - `GET /recovery/reset/{secret}` - Verification link endpoint
   - Purpose: Token management and verification flow
   - Authentication: Client credentials

3. **Notification Service**
   - Endpoints:
     - `POST /notifications/email` - Send verification email
     - `POST /notifications/sms` - Send verification SMS
   - Purpose: Deliver verification notifications
   - Authentication: Service-to-service token
   - Timeout: 5 seconds
   - Retry: 3 attempts with exponential backoff

4. **API Gateway**
   - Purpose: Route requests, add correlation headers, validate tokens
   - Headers required: `Authorization`, `X-Correlation-ID`, `user-id`

### External Dependencies

1. **Email Service Provider** (e.g., SendGrid, AWS SES)
   - Purpose: Deliver verification emails
   - SLA: 99% delivery success rate
   - Fallback: Secondary provider if primary fails

2. **SMS Gateway** (e.g., Twilio, AWS SNS)
   - Purpose: Deliver verification SMS codes
   - SLA: 95% delivery success rate within 60 seconds
   - Rate limits: Vendor-specific

### Configuration Dependencies

1. **Tenant Configuration**
   - Password policy settings (length, complexity, history)
   - Verification method preference (email, SMS, both)
   - Verification token expiry duration
   - Password encoder type (bcrypt, SHA-256)
   - Email/SMS templates

2. **Environment Variables**
   - `AUTH_SERVER_URL`: Authorization server base URL
   - `NOTIFICATION_API_URL`: Notification service base URL
   - `RECOVERY_SECRET_EXPIRES_IN_MINUTES`: Token expiry (default: 15)
   - `PASSWORD_HISTORY_COUNT`: Number of previous passwords (default: 5)

---

## Assumptions

1. **Email Availability**: Users have a valid, accessible email address registered in their profile. If email is not verified, password reset will fail with appropriate error message.

2. **Phone Number Format**: SMS verification assumes phone numbers are stored in E.164 format (international format with country code).

3. **Single Tenant Context**: Password reset is performed within the context of a single tenant. Multi-tenant scenarios require tenant-specific configuration loading.

4. **OAuth2 Token Storage**: Assumes all user sessions use OAuth2 access/refresh tokens stored in the authorization server's token store, enabling centralized revocation.

5. **Notification Service Availability**: Email and SMS delivery services are operational. If unavailable, password reset process provides graceful error handling and retry mechanisms.

6. **User Authentication**: User must be currently authenticated to access password reset. This is "reset" (for authenticated users), not "forgot password" (for unauthenticated users).

7. **Browser Requirements**: Modern browsers with JavaScript enabled. Password strength indicator and real-time validation require JavaScript.

8. **Password Encoder Consistency**: The same password encoder used to hash the current password is used for the new password (tenant-specific configuration).

9. **Time Synchronization**: Server time is synchronized (NTP) for accurate token expiration calculations across distributed systems.

10. **Audit Log Storage**: Sufficient database capacity exists for audit logs. Logs are retained according to compliance requirements (90 days minimum).

11. **Rate Limiting Infrastructure**: API Gateway or service layer implements rate limiting to prevent abuse.

12. **External IDP Exclusion**: Users authenticated via external Identity Providers (Google, Azure AD, etc.) are explicitly excluded from this password reset flow. They manage passwords through their IDP.

---

## Out of Scope

### Explicitly Not Included

1. **Forgot Password Flow**: This specification covers password reset for **authenticated** users. The "Forgot Password" flow for **unauthenticated** users (Requirement #29) is a separate feature.

2. **Admin-Initiated Password Reset**: Administrators forcing password reset for other users is not included. This is user-initiated self-service only.

3. **Password Reset via Mobile App**: This specification focuses on the web portal. Native mobile app implementation is out of scope.

4. **Biometric Authentication**: Password reset does not involve biometric verification methods (fingerprint, face recognition).

5. **Password Manager Integration**: While supporting password managers, deep integration features (e.g., password generation API) are not included.

6. **Password Sharing/Delegation**: No features for sharing or delegating password reset authority to other users.

7. **Multi-Factor Authentication Setup**: While MFA may be validated during password reset if email/phone changes, setting up new MFA methods is covered in Update Profile (Requirement #28).

8. **Account Recovery**: If user loses access to both email and SMS, account recovery through support channels is out of scope for this self-service feature.

9. **Password Reset API for Machine Users**: Machine users (client credentials grant) do not have passwords in the traditional sense. This feature is for human users only.

10. **Custom Password Encoders**: Only tenant-configured encoders (bcrypt, SHA-256) are supported. Custom encoder plugins are not included.

11. **Password Import/Export**: Importing passwords from other systems or exporting password hashes is not supported.

12. **Social Login Password Management**: Users who sign in via social providers (Google, Facebook) cannot reset passwords through this flow.

---

## Related Documentation

- [Unified-IDAM_HLD.md](../../../uidam-portal/hld/uidam/Unified-IDAM_HLD.md) - Requirement #27
- [UIDAM-Portal_HLD.md](../../../uidam-portal/hld/uidam/UIDAM-Portal_HLD.md) - Security Architecture
- [UIDAM-Portal_LLD.md](../../../uidam-portal/lld/designs/UIDAM-Portal_LLD.md) - Component Design
- [UIDAM-User-Management-API.md](../../../uidam-portal/lld/UIDAM-user-Management-API.md) - User Management APIs
- [Constitution.md](../../input/constitution.md) - Development Guidelines

---

## Notes

- This specification describes **WHAT** the feature does and **WHY** it's valuable, not **HOW** to implement it (no technology stack, frameworks, or code structure).
- Implementation details (React components, API client code, state management) are defined in the Low-Level Design and development phase.
- All requirements are technology-agnostic and can be implemented on any platform that meets the technical constraints (web browser, HTTPS, OAuth2).

---

## User Clarifications

### Session 2026-02-03

Based on review of HLD, LLD, and existing implementation, the following clarifications were resolved:

- **Q: What is the exact API endpoint for authenticated user password reset?**  
  → **A**: The API endpoint is `POST /v1/users/self/recovery/forgot-password`. Despite the "forgot-password" naming, this endpoint is specifically for authenticated users initiating a password reset (requires Bearer token). The "Forgot Password" flow for unauthenticated users (Requirement #29) is a separate feature handled by the Authorization Server at `/recovery/forgot`.

- **Q: Where in the portal is the password reset feature accessed?**  
  → **A**: The password reset feature is accessed from the Security Settings page (`/security` or profile section). The existing implementation includes a `PasswordRecoveryCard` component that displays in the security settings with a "Reset Password" call-to-action button.

- **Q: Is the verification step mandatory or optional?**  
  → **A**: Email/SMS verification is **mandatory** per HLD Requirement #27. The password reset cannot be completed without successful verification. This is enforced by the backend creating a `UserRecoverySecret` token that must be verified before the password is actually changed.

- **Q: What happens if user's email is not registered or verified?**  
  → **A**: Password reset will fail with error message "Unable to send verification email. Please update your email address in profile settings first." This is handled by the backend User Management Service which checks email availability before sending notifications.

- **Q: Can users choose between email and SMS verification?**  
  → **A**: Verification method is determined by tenant configuration and user's registered contact information. If both email and phone are available, the tenant configuration specifies the preferred method. Users cannot choose at runtime; the system automatically selects based on configuration.

- **Q: What is the maximum number of concurrent password reset requests allowed?**  
  → **A**: Only the most recent password reset request is valid. When a new request is initiated, previous `UserRecoverySecret` tokens for the same user are automatically invalidated (status changed to Revoked). This prevents confusion and potential security issues from multiple active reset links.

- **Q: How does the system handle password reset for users with active MFA?**  
  → **A**: Password reset verification via email/SMS serves as the authentication factor. If MFA is enabled and the password reset also changes MFA-related fields (email/phone), additional MFA verification is required per Requirement #28 (Update Profile). However, for password-only changes, the email/SMS verification suffices.

- **Q: What access scopes are required to use the password reset API?**  
  → **A**: The API requires `ViewUsers` or `ManageUsers` scope as documented in the LLD. All authenticated users have at least `ViewUsers` scope for their own profile, enabling self-service password reset.

- **Q: Are there any specific password strength requirements beyond the policy?**  
  → **A**: Password strength is validated against the configurable password policy (Requirement #26). The policy includes: minimum length (default 8), complexity requirements (uppercase, lowercase, digits, special characters), and password history (last 5 passwords). No additional hardcoded requirements exist beyond the policy configuration.

- **Q: How long are audit logs retained?**  
  → **A**: Audit logs are retained for a minimum of 90 days per compliance requirements. The exact retention period may be longer based on tenant-specific compliance needs (e.g., GDPR, SOX, HIPAA). Logs are stored in the central audit database with automatic purging after the retention period.
