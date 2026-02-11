# Implementation Plan: Password Reset for Authenticated Users

**Version**: 1.0  
**Created**: February 3, 2026  
**Status**: Planning  
**Specification**: [spec.md](./spec.md)  
**Source Requirement**: HLD Requirement #27 - Human-User Self Service - Reset Password

---

## Summary

Implement a secure, user-verified password reset feature for authenticated UIDAM Portal users accessible from the Security Settings page. The feature enforces email/SMS verification before completing the password change and automatically terminates all active user sessions upon success.

**Primary Requirement**: Enable authenticated users to reset their password through a validated workflow that includes:
1. Password policy enforcement (complexity, history, expiration rules)
2. Mandatory email or SMS verification
3. Automatic session termination (OAuth2 token revocation)
4. Comprehensive audit logging

**Technical Approach**: Extend the existing `self-service/password-recovery` feature module with additional components for authenticated user password reset. Integrate with existing `UserService` API layer using the `/v1/users/self/recovery/forgot-password` endpoint. Leverage React Hook Form for validation, React Query for server state, and Material-UI for UI consistency.

---

## User Clarifications

**Technical Decisions** (Confirmed: February 3, 2026):

| Decision Area | Selected Option | Implementation Details |
|---------------|----------------|------------------------|
| **Password Strength Calculation** | Rules-Based (Policy API) | Validate against password policy API rules (length, complexity, history). Calculate score 0-100 based on rules met: Min length (+25), Uppercase (+20), Lowercase (+20), Digit (+20), Special char (+15). Fast, deterministic, aligns exactly with policy requirements. |
| **Password Strength Indicator** | Linear Progress Bar | MUI `<LinearProgress />` component with color transitions: 0-40% = "Weak" (red/error), 41-70% = "Fair" (yellow/warning), 71-89% = "Good" (light green/success.light), 90-100% = "Strong" (green/success.main). WCAG AA compliant, minimal code. |
| **Error Message Strategy** | Field-Level Only | Standard MUI pattern with `error` and `helperText` props on each `TextField`. Clear field-to-error mapping, follows constitution guidelines. No summary banner needed for 3-field form. |
| **Success Confirmation** | Toast Notification (Snackbar) | MUI `<Snackbar />` component at top-right, auto-dismiss after 5 seconds, closable via X button. Message: "Password reset email sent. Please check your inbox." Non-blocking, modern UX pattern. |
| **Password Visibility Toggle** | All Password Fields | Eye icon (`VisibilityIcon`/`VisibilityOffIcon`) toggle button in `InputAdornment` for all three fields: current password, new password, confirm password. Maximum user control, helpful for complex passwords. |
| **Real-Time Validation** | On Change (Debounced) | Password strength indicator updates on every keystroke with 300ms debounce using `watch()` from React Hook Form. Validation errors shown on `onBlur` to avoid aggressive error display. Meets FR-003 "real-time feedback" requirement. |
| **Loading State** | Button Spinner | MUI `<CircularProgress size={24} />` inside submit button with `disabled` state. Button text changes to "Sending..." during loading. Prevents double-submission, contextual feedback. |

**Implementation Constants**:
```typescript
// Password Strength Scoring
const STRENGTH_SCORES = {
  MIN_LENGTH: 25,
  UPPERCASE: 20,
  LOWERCASE: 20,
  DIGIT: 20,
  SPECIAL_CHAR: 15,
  MAX_SCORE: 100,
};

// Strength Thresholds
const STRENGTH_LEVELS = {
  WEAK: { max: 40, color: 'error', label: 'Weak' },
  FAIR: { max: 70, color: 'warning', label: 'Fair' },
  GOOD: { max: 89, color: 'success.light', label: 'Good' },
  STRONG: { max: 100, color: 'success.main', label: 'Strong' },
};

// UI Configuration
const DEBOUNCE_DELAY_MS = 300;
const TOAST_DURATION_MS = 5000;
const BUTTON_SPINNER_SIZE = 24;
```

---

## Technical Context

**Language/Version**: TypeScript 5.2.2, ECMAScript 2022

**Primary Dependencies**:
- React 18.2.0 (UI framework)
- Material-UI 5.15.0 (component library)
- React Hook Form 7.48.2 (form validation and state)
- React Query 5.14.2 (@tanstack/react-query - server state management)
- Redux Toolkit 2.0.1 (global auth state management)
- Yup 1.4.0 (schema validation)
- Axios 1.6.2 (HTTP client)

**Storage**: 
- `localStorage` for OAuth2 tokens (access_token, refresh_token)
- `sessionStorage` for temporary OAuth2 state/PKCE verifiers
- No additional storage required for password reset feature

**Testing**: 
- Jest 29.7.0 + React Testing Library (unit and integration tests)
- Target: >80% coverage for critical paths
- Test user behavior (form submission, validation errors, success flows)

**Target Platform**: 
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile web browsers: iOS Safari, Chrome Mobile
- Responsive design (desktop and tablet focus)

**Build Tool**: Vite 5.0.8

**State Management**:
- Redux Toolkit for global authentication state (user profile, tokens)
- React Query for server state (API calls, caching, mutations)
- React Hook Form for local form state
- No Zustand or Context API needed for this feature

**Routing**: React Router 6.20.1

**UI Framework**: Material-UI 5.15.0 (MUI)
- Components: TextField, Button, Dialog, Card, Alert, CircularProgress
- Theme: Existing UIDAM Portal theme
- Icons: @mui/icons-material

**Performance Goals**:
- Form render time: <100ms
- API call response handling: <200ms
- Password strength calculation: real-time (<50ms)
- Total interaction time (form submit to feedback): <2s
- Bundle size impact: <30KB gzipped (incremental)

**Constraints**:
- OAuth2 PKCE authentication required
- API Gateway integration (correlation headers, token validation)
- WCAG 2.1 Level AA accessibility compliance
- Password policy enforcement (server-side validation authoritative)
- No direct database access (all operations via REST APIs)
- CORS handled by Vite proxy in development, Nginx in production

**Scale/Scope**:
- Single feature module within existing portal
- Estimated 500-1000 active users
- Multi-tenant support (tenant-specific password policies)
- Integration with 3 backend services (User Management, Auth Server, Notification)

---

## Project Structure

```
uidam-portal/
├── src/
│   ├── features/
│   │   └── self-service/
│   │       └── password-reset/                    # New feature module
│   │           ├── components/
│   │           │   ├── PasswordResetForm.tsx      # Main form component
│   │           │   ├── PasswordStrengthIndicator.tsx  # Real-time strength feedback
│   │           │   ├── PasswordPolicyDisplay.tsx   # Policy requirements display
│   │           │   └── PasswordResetDialog.tsx     # Success/Error dialog
│   │           ├── hooks/
│   │           │   ├── usePasswordResetMutation.ts # React Query mutation
│   │           │   ├── usePasswordPolicy.ts        # Fetch password policy
│   │           │   └── usePasswordValidation.ts    # Real-time validation logic
│   │           ├── utils/
│   │           │   ├── passwordStrength.ts         # Strength calculation utility
│   │           │   └── passwordValidation.ts       # Client-side validation helpers
│   │           ├── __tests__/
│   │           │   ├── PasswordResetForm.test.tsx
│   │           │   ├── PasswordStrengthIndicator.test.tsx
│   │           │   ├── usePasswordResetMutation.test.ts
│   │           │   └── passwordValidation.test.ts
│   │           ├── index.ts                        # Public exports
│   │           └── types.ts                        # Feature-specific types
│   │
│   ├── services/
│   │   ├── userService.ts                          # Update with new methods
│   │   └── passwordPolicyService.ts                # New service for policy API
│   │
│   ├── types/
│   │   └── index.ts                                # Update with password reset types
│   │
│   ├── pages/
│   │   └── SecuritySettingsPage.tsx                # Integrate PasswordResetForm
│   │
│   └── utils/
│       └── validation/
│           └── passwordSchemas.ts                   # Yup schemas for password validation
│
├── sdd/
│   └── output/
│       ├── spec.md                                  # Feature specification
│       ├── plan.md                                  # This file
│       ├── data-model.md                            # Data models (Phase 1)
│       ├── contracts.md                             # API contracts (Phase 1)
│       └── context.md                               # Agent context (Phase 1)
│
└── package.json                                     # No new dependencies needed
```

---

## Implementation Phases

### Phase 0: Research & Clarification ✅

**Completed**:
- ✅ Analyzed HLD Requirement #27 and related requirements (#26, #28, #34)
- ✅ Reviewed existing `password-recovery` implementation
- ✅ Identified API endpoint: `POST /v1/users/self/recovery/forgot-password`
- ✅ Confirmed authentication requirement (Bearer token)
- ✅ Verified integration points (User Management API, Auth Server, Notification Service)

**Technical Context Validation**:
- All technology stack items confirmed from existing codebase
- No NEEDS CLARIFICATION items remain
- Existing patterns identified and documented in constitution.md

---

### Phase 1: Design & Contracts

**Objectives**:
1. Extract and document data models from HLD/LLD
2. Define API contracts based on LLD specifications
3. Create agent context document

**Deliverables**:
- `./sdd/output/data-model.md` - Entity definitions, validations, state transitions
- `./sdd/output/contracts.md` - OpenAPI-style API specifications
- `./sdd/output/context.md` - Technology and pattern context for agents

**Key Entities** (from HLD/LLD):
- User (with password fields)
- PasswordPolicy
- PasswordHistory  
- UserRecoverySecret
- AuditLog

**Key APIs** (from LLD):
- `POST /v1/users/self/recovery/forgot-password` - Initiate password reset
- `GET /v1/password-policies` - Fetch password policy
- `POST /oauth2/revoke` - Revoke tokens (Authorization Server)

---

### Phase 2: Implementation Planning

**Component Breakdown**:

1. **PasswordResetForm** (Main Component)
   - Fields: Current Password, New Password, Confirm Password
   - Real-time validation with Yup schema
   - Password strength indicator integration
   - Submit handler using React Query mutation
   - Error display and success feedback

2. **PasswordStrengthIndicator** (Reusable Component)
   - Visual strength meter using MUI `<LinearProgress />` component
   - Color-coded progress bar: red (0-40%), yellow (41-70%), light green (71-89%), green (90-100%)
   - Rules-based calculation from password policy API
   - Text label below bar: "Weak", "Fair", "Good", "Strong"
   - Updates on every keystroke (300ms debounce)

3. **PasswordPolicyDisplay** (Reusable Component)
   - Fetch and display tenant password policy from `/v1/password-policies`
   - Checkmarks (✓) for met requirements, X marks for unmet requirements
   - Real-time updates as user types (debounced)
   - Shows: min length, uppercase, lowercase, digit, special character requirements

4. **Success Toast Notification** (Feedback Component)
   - MUI `<Snackbar />` at top-right corner
   - Auto-dismiss after 5 seconds
   - Closable via X button
   - Message: "Password reset email sent. Please check your inbox."
   - Non-blocking user interaction

**Custom Hooks**:

1. **usePasswordResetMutation**
   - React Query mutation for API call
   - Handles success/error states
   - Integrates with auth state for token management
   - Triggers logout and redirect on success

2. **usePasswordPolicy**
   - React Query to fetch password policy
   - Caches policy configuration
   - Exposes policy rules to form validation

3. **usePasswordValidation**
   - Real-time password validation logic
   - Checks against policy requirements
   - Provides validation errors for UI display

**Service Layer Updates**:

1. **UserService.resetPasswordForSelf()**
   - New method: `POST /v1/users/self/password/reset`
   - Payload: `{ currentPassword, newPassword }`
   - Returns: `{ message, success }`

2. **PasswordPolicyService.getPasswordPolicy()**
   - New service class
   - Method: `GET /v1/password-policies`
   - Returns: PasswordPolicy object

**Validation Layer**:

1. **passwordSchemas.ts** (Yup schemas)
   - Current password: required, string
   - New password: required, min length, complexity rules
   - Confirm password: required, must match new password
   - Cross-field validation

2. **passwordStrength.ts** (Utility)
   - Entropy calculation algorithm
   - Strength classification (0-4 scale)
   - Suggestion generation based on weaknesses

**Testing Strategy**:

1. **Unit Tests**
   - Component rendering with various props
   - Form validation logic
   - Password strength calculation
   - Utility functions

2. **Integration Tests**
   - Form submission flow
   - API mutation success/error handling
   - Validation error display
   - Success dialog and redirect

3. **Accessibility Tests**
   - Keyboard navigation
   - Screen reader compatibility
   - ARIA labels and roles
   - Focus management

**Error Handling**:

1. **Client-Side Errors**
   - Form validation errors (field-level)
   - Network errors (retry option)
   - Token expiration (auto-refresh or logout)

2. **Server-Side Errors**
   - 400 Bad Request (validation failure)
   - 401 Unauthorized (token invalid)
   - 404 Not Found (user not found)
   - 500 Internal Server Error (generic error)

3. **User-Friendly Messages**
   - "Current password is incorrect"
   - "New password does not meet policy requirements"
   - "Unable to send verification email. Please try again."
   - "Password reset successful. Redirecting to login..."

**Security Considerations**:

1. **Password Handling**
   - Never log passwords (plain or hashed)
   - No password storage in browser beyond form state
   - Clear form state on unmount
   - Use password type inputs with show/hide toggle

2. **Token Management**
   - Revoke all tokens on successful password change
   - Clear localStorage tokens
   - Redirect to login immediately

3. **HTTPS Required**
   - All password data transmitted over TLS
   - Enforce HTTPS in production

---

## Verification & Acceptance

**Definition of Done**:
- ✅ All components implemented and tested
- ✅ >80% test coverage achieved
- ✅ WCAG 2.1 Level AA accessibility verified
- ✅ Password policy enforcement working correctly
- ✅ Email/SMS verification flow functional
- ✅ Token revocation on success confirmed
- ✅ Audit logging implemented
- ✅ Error handling comprehensive
- ✅ Code review completed
- ✅ Documentation updated

**Acceptance Criteria** (from spec.md):
1. Password reset form accessible from Security Settings
2. All password policy validations enforced
3. Verification email sent within 30 seconds
4. Password updated only after email verification
5. All user sessions terminated on success
6. User redirected to login page
7. All events logged in audit trail

---

## Dependencies & Integration Points

**Internal Services**:
1. UIDAM User Management Service (`/v1/users/*`)
2. UIDAM Authorization Server (`/oauth2/*`)
3. Notification Service (email/SMS delivery)
4. API Gateway (routing, headers, token validation)

**External Services**:
1. Email Service Provider (SendGrid, AWS SES)
2. SMS Gateway (Twilio, AWS SNS) - optional

**Shared Utilities**:
- `apiUtils.ts` - Header generation, correlation IDs
- `auth.service.ts` - Token management, logout
- Existing Material-UI theme and components

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Password policy not fetched correctly | High | Low | Implement fallback default policy, error handling |
| Email delivery failure | High | Medium | Retry mechanism, fallback to SMS, user notification |
| Token revocation fails | High | Low | Catch errors, log for manual cleanup, still log out user |
| Browser incompatibility | Medium | Low | Test on all target browsers, polyfills for older versions |
| Accessibility issues | Medium | Medium | Automated testing with axe-core, manual screen reader testing |
| Performance degradation | Low | Low | Code splitting, lazy loading, bundle size monitoring |

---

## Timeline Estimate

**Total Effort**: 5-7 days (1 developer)

| Phase | Effort | Tasks |
|-------|--------|-------|
| **Phase 1: Design** | 1 day | data-model.md, contracts.md, context.md |
| **Phase 2: Implementation** | 3-4 days | Components, hooks, services, validation |
| **Phase 3: Testing** | 1-2 days | Unit tests, integration tests, accessibility |
| **Phase 4: Review & Polish** | 0.5 day | Code review, documentation, bug fixes |

---

## Notes

- This plan follows the existing UIDAM Portal architecture and patterns
- No new dependencies required - all functionality achievable with existing tech stack
- Feature will be deployed as part of the main portal bundle
- Backend APIs already exist - focus is on frontend implementation
- Password reset for unauthenticated users (Forgot Password) is a separate feature (Requirement #29)
