# UIDAM Web Admin Portal - Baseline Specification

**Type**: Baseline Specification (Existing Code)  
**Created**: 2026-02-02  
**Purpose**: Document actual implemented behavior of UIDAM Portal  
**Status**: Baseline - Documenting Existing Implementation

---

## Executive Summary

UIDAM Portal is a modern web-based administrative interface for managing User Identity and Access Management (UIDAM) systems. The portal provides comprehensive UI for administrators to manage users, accounts, roles, scopes, and OAuth2 client registrations within the UIDAM ecosystem.

**Primary Users**: System Administrators, Account Managers  
**Deployment**: Single Page Application (SPA) with OAuth2 authentication  
**Backend Integration**: UIDAM User Management API, UIDAM Authorization Server

---

## User Stories

### US-1: User Management
**As an** admin user  
**I want to** manage user accounts (create, view, edit, delete, search)  
**So that** I can control who has access to the system

**Acceptance Criteria**:
- View paginated list of users with search/filter
- Create new users with required fields (username, email, password, roles)
- Edit existing user details and status
- Delete users with confirmation
- Search users by username/email
- View user status (ACTIVE, INACTIVE, PENDING)

### US-2: User Approval Workflow
**As an** admin user  
**I want to** approve pending user registrations  
**So that** I can control access and assign appropriate roles/accounts

**Acceptance Criteria**:
- View list of pending users
- Assign account and roles during approval
- Approve or reject user requests
- Track approval history

### US-3: Account Management
**As an** admin user  
**I want to** manage tenant accounts  
**So that** I can organize users into organizational units

**Acceptance Criteria**:
- View list of accounts
- Create new accounts
- Edit account details
- Associate users with accounts
- Manage account-specific configurations

### US-4: Role Management
**As an** admin user  
**I want to** manage roles and their scope assignments  
**So that** I can define permission sets for users

**Acceptance Criteria**:
- View list of roles with associated scopes
- Create new roles
- Assign/remove scopes to/from roles
- Edit role details
- Delete roles

### US-5: Scope Management
**As an** admin user  
**I want to** manage permission scopes  
**So that** I can define granular access controls

**Acceptance Criteria**:
- View list of available scopes
- Create new scopes
- Edit scope details
- Delete scopes
- View which roles use each scope

### US-6: OAuth2 Client Registration
**As an** admin user  
**I want to** register and manage OAuth2 clients  
**So that** applications can integrate with UIDAM authentication

**Acceptance Criteria**:
- Register new OAuth2 clients
- View client credentials (clientId, clientSecret)
- Configure redirect URIs, grant types, scopes
- Edit client configurations
- Delete client registrations

### US-7: Authentication & Authorization
**As a** user  
**I want to** securely log in using OAuth2  
**So that** I can access the portal with appropriate permissions

**Acceptance Criteria**:
- OAuth2 PKCE authentication flow
- Session management
- Protected routes based on scopes
- Automatic token refresh
- Secure logout

### US-8: Self-Service Portal
**As a** regular user  
**I want to** view and update my own profile  
**So that** I can manage my personal information

**Acceptance Criteria**:
- View own user profile
- Update personal details (name, email, phone, address)
- Change password with validation
- View assigned roles and scopes

---

## Functional Requirements

### FR-1: User Authentication
**MUST** authenticate users via OAuth2 PKCE flow with UIDAM Authorization Server  
**MUST** maintain secure session with token refresh  
**MUST** support logout and session termination

### FR-2: User CRUD Operations
**MUST** support creating users with fields: username, email, password, firstName, lastName, roles  
**MUST** validate username uniqueness  
**MUST** validate email format using regex pattern  
**MUST** enforce password policy: minimum 8 characters (client-side), additional backend validation  
**MUST** validate username contains only letters, numbers, dots, underscores, and hyphens  
**MUST** require password confirmation matching original password  
**MUST** support editing user details  
**MUST** support deleting users with confirmation dialog  
**MUST** display user status (ACTIVE, INACTIVE, PENDING, BLOCKED, REJECTED, DELETED, DEACTIVATED)

### FR-3: User Search and Filtering
**MUST** support searching users by username or email  
**MUST** support pagination with configurable rows per page (10, 20, 50, 100)  
**MUST** display loading states during API calls  
**MUST** handle empty search results gracefully with "No users found" message

### FR-4: User Approval Workflow
**MUST** display list of pending users awaiting approval  
**MUST** allow assigning account and roles during approval  
**MUST** support approve/reject actions  
**MUST** update user status to ACTIVE upon approval

### FR-5: Account Management
**MUST** support viewing all tenant accounts  
**MUST** support creating accounts with name and description  
**MUST** support editing account details  
**MUST** associate users with accounts

### FR-6: Role and Scope Management
**MUST** display roles with associated scopes  
**MUST** support creating roles with scope assignments  
**MUST** support adding/removing scopes from existing roles  
**MUST** support editing role details  
**MUST** support deleting roles (with dependency checks)  
**MUST** manage scopes independently of roles  
**MUST** prevent deletion of scopes in use by roles

### FR-7: OAuth2 Client Registration
**MUST** register clients with: clientId, clientSecret, redirectUris, grantTypes, scopes  
**MUST** generate secure client credentials  
**MUST** support multiple redirect URIs  
**MUST** support multiple grant types (authorization_code, refresh_token, client_credentials)  
**MUST** assign scopes to clients  
**MUST** display client secret only once at creation

### FR-8: Authorization Controls
**MUST** restrict access based on user scopes  
**MUST** implement protected routes requiring authentication  
**MUST** enforce scope-based feature visibility (e.g., ManageUsers scope for user management)  
**MUST** redirect unauthorized users to login

### FR-9: Error Handling
**MUST** display user-friendly error messages for API failures  
**MUST** handle network errors gracefully  
**MUST** show validation errors on forms  
**MUST** log errors for debugging (without exposing sensitive data to users)

### FR-10: UI/UX Requirements
**MUST** provide responsive layout supporting desktop and tablet  
**MUST** use Material-UI components for consistent design  
**MUST** support light and dark themes  
**MUST** display loading spinners during async operations  
**MUST** show success/error notifications (snackbars) for user actions  
**MUST** maintain consistent navigation with sidebar menu

---

## Non-Functional Requirements

### NFR-1: Performance
**MUST** load initial page within 3 seconds on standard broadband  
**MUST** render user lists with pagination to handle 1000+ users  
**MUST** debounce search input to minimize API calls

### NFR-2: Browser Compatibility
**MUST** support latest versions of Chrome, Firefox, Safari, Edge  
**MUST** gracefully degrade on older browsers with warning message

### NFR-3: Security
**MUST** store tokens securely (sessionStorage)  
**MUST** never log sensitive data (passwords, tokens)  
**MUST** sanitize user inputs to prevent XSS  
**MUST** use HTTPS in production  
**MUST** implement CORS via Vite proxy in development

### NFR-4: Accessibility
**MUST** provide keyboard navigation for all features  
**MUST** use semantic HTML elements  
**MUST** provide ARIA labels for screen readers  
**SHOULD** achieve WCAG 2.1 AA compliance

### NFR-5: Maintainability
**MUST** use TypeScript with strict mode  
**MUST** maintain test coverage >80% for critical paths  
**MUST** follow existing code patterns and conventions  
**MUST** document complex logic with comments

### NFR-6: Scalability
**MUST** support multi-tenant architecture via tenantId header  
**MUST** handle concurrent admin sessions  
**SHOULD** cache frequently accessed data (roles, scopes)

---

## Success Criteria

1. **User Task Completion**: Admins can create a new user in under 2 minutes
2. **Search Performance**: User search returns results within 1 second for 10,000 users
3. **Error Recovery**: 95% of form validation errors provide actionable guidance
4. **Authentication Reliability**: OAuth2 flow completes successfully 99% of the time
5. **UI Responsiveness**: All user actions receive visual feedback within 200ms
6. **Approval Efficiency**: Batch approval of 10 users takes under 30 seconds

---

## Assumptions

1. UIDAM User Management API is running and accessible at configured endpoint
2. UIDAM Authorization Server is running with OAuth2 configured
3. Administrators have appropriate scopes (ManageUsers, ManageRoles, ManageScopes, ManageClients)
4. Backend API handles all business logic and validation
5. Vite proxy is used in development to resolve CORS issues
6. Production deployment uses nginx or similar reverse proxy
7. Node.js 19.5.0+ and npm 9.0.0+ are available in development environment

---

## Dependencies & External Integrations

### External APIs
- **UIDAM User Management API**: `/v1/users`, `/v2/users`, `/v2/accounts`, `/v2/roles`, `/v2/scopes`
- **UIDAM Authorization Server**: OAuth2 endpoints (`/oauth2/authorize`, `/oauth2/token`, `/oauth2/revoke`)
- **Client Registration API**: `/v2/client-registrations`

### Technology Stack
- **React**: 18.2.0
- **TypeScript**: 5.2.2
- **Material-UI**: 5.15.0
- **Vite**: 5.0.8
- **React Router**: 6.x
- **Redux Toolkit**: For state management
- **React Query**: For API data fetching and caching

### Build and Deployment
- **Vite**: Development server and build tool
- **Docker**: Containerization (nginx-based)
- **Environment Configuration**: Runtime config via config.json

---

## Out of Scope

The following features are NOT implemented in the current baseline:

1. **Password Reset**: Self-service password reset via email
2. **Multi-Factor Authentication (MFA)**: Additional authentication factors
3. **Audit Logging UI**: Viewing system audit logs
4. **User Activity Monitoring**: Real-time user session tracking
5. **Bulk User Import**: CSV/Excel import for mass user creation
6. **Advanced Reporting**: Analytics and usage reports
7. **Custom Branding**: Tenant-specific themes and logos
8. **Mobile App**: Native mobile applications
9. **Email Notifications**: In-app email notification management
10. **Workflow Automation**: Custom approval workflows and rules

---

## Edge Cases

### EC-1: Network Connectivity
- **Scenario**: User loses network connection during form submission
- **Behavior**: Display "Network error" message, preserve form data, allow retry

### EC-2: Session Expiration
- **Scenario**: OAuth2 token expires during active session
- **Behavior**: Attempt automatic token refresh, redirect to login if refresh fails

### EC-3: Concurrent Modifications
- **Scenario**: Two admins edit the same user simultaneously
- **Behavior**: Last write wins (handled by backend), display success/failure accordingly

### EC-4: Invalid Backend Responses
- **Scenario**: Backend returns malformed JSON or unexpected status codes
- **Behavior**: Display generic error message, log details for debugging

### EC-5: Empty Data States
- **Scenario**: No users exist in system
- **Behavior**: Display "No users found" message with "Create User" call-to-action

### EC-6: Pagination Edge Cases
- **Scenario**: User deletes last item on current page
- **Behavior**: Navigate to previous page if current page becomes empty

### EC-7: Special Characters in Input
- **Scenario**: Username or email contains special characters
- **Behavior**: Validate per backend rules, display specific validation errors

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-02-02 | 1.0 | Baseline specification documenting existing implementation |

---

## Notes

**This is a BASELINE specification** created by analyzing the existing UIDAM Portal implementation. It documents the actual behavior of the code as of 2026-02-02.

**Technology Details Excluded**: Per SDD principles, implementation details (React, TypeScript, Material-UI) are mentioned only where necessary to describe user-facing behavior. The focus is on WHAT the portal does, not HOW it's implemented.

**Future Enhancements**: Any new features should be specified separately and reference this baseline for context.
---

## User Clarifications

### Session 2026-02-03

- **Q**: What is the exact password validation policy enforced by the portal?  
  **A**: Client-side validation enforces minimum 8 characters. Additional backend validation includes pattern matching, password history checks, and tenant-specific password policies (configured in UIDAM User Management API). Password confirmation is required and must match the original password.

- **Q**: What are all possible user status values displayed in the portal?  
  **A**: User status enum includes: ACTIVE, INACTIVE, PENDING, BLOCKED, REJECTED, DELETED, DEACTIVATED. All statuses are displayed in the UI based on backend API responses.

- **Q**: What are the exact pagination options available?  
  **A**: Rows per page options are: 10, 20, 50, 100. Default is 20 rows per page. Implemented using Material-UI TablePagination component.

- **Q**: What username format is allowed during user creation?  
  **A**: Username can only contain letters (a-z, A-Z), numbers (0-9), dots (.), underscores (_), and hyphens (-). No spaces or other special characters are permitted. This is validated client-side using regex `/^[a-zA-Z0-9._-]+$/`.

- **Q**: What email validation is performed?  
  **A**: Email validation uses regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` to ensure one or more non-whitespace/@ characters, followed by @, then domain with dot. This pattern is designed to avoid ReDoS vulnerabilities (linear time complexity).

- **Q**: What fields are required vs optional when creating a user?  
  **A**: Required fields: firstName, lastName, email, userName, password, confirmPassword. Optional fields: phoneNumber, country, state, city, address1, address2, postalCode, gender, birthDate, locale, timeZone, notificationConsent, additionalAttributes. At least one account-role assignment is required.

- **Q**: How does the portal handle concurrent user modifications?  
  **A**: Last write wins approach - the backend handles conflict resolution. The portal displays success/failure based on API response. No optimistic locking or version checking is implemented in the baseline.

- **Q**: What is the default rows per page for pagination?  
  **A**: Default is 20 rows per page for Account Management. User Management and other features may use different defaults as configured in component state.