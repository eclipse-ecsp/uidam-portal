# Implementation Tasks: Password Reset for Authenticated Users

**Version**: 1.0  
**Created**: February 3, 2026  
**Feature**: Password Reset for Authenticated Users  
**Source**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts.md](./contracts.md)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create feature directory structure at `src/features/self-service/password-reset/` with subdirectories: components/, hooks/, utils/, types/, __tests__/
- [X] T002 [P] Create TypeScript type definitions in `src/features/self-service/password-reset/types.ts` with interfaces: PasswordResetFormData, PasswordStrength, PasswordPolicyItem, PasswordResetResponse
- [X] T003 [P] Create Yup validation schema in `src/features/self-service/password-reset/schemas/passwordResetSchema.ts` with currentPassword, newPassword, confirmPassword validation rules

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Extend UserService in `src/services/userService.ts` with method `postSelfRecoveryForgotPassword()` that calls POST `/v1/users/self/recovery/forgot-password`
- [X] T005 [P] Create PasswordPolicyService in `src/services/passwordPolicyService.ts` with method `getPasswordPolicy()` that calls GET `/v1/password-policies`
- [X] T006 [P] Create password strength calculation utility in `src/features/self-service/password-reset/utils/passwordStrength.ts` with function `calculatePasswordStrength(password: string, policy: PasswordPolicyItem[]): number` (0-100 score based on policy rules)
- [X] T007 [P] Create password validation utility in `src/features/self-service/password-reset/utils/passwordValidation.ts` with functions to validate against policy rules (length, complexity, history)
- [X] T008 Create usePasswordPolicy hook in `src/features/self-service/password-reset/hooks/usePasswordPolicy.ts` using React Query to fetch and cache password policy (5 min stale time)
- [X] T009 Create usePasswordResetMutation hook in `src/features/self-service/password-reset/hooks/usePasswordResetMutation.ts` using React Query mutation for password reset API call with success/error handling

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Password Reset Form UI (Priority: P1)

**Goal**: Implement the password reset form with all input fields, validation, and password strength indicator

**Maps to**: US-1 (As an authenticated user, I want to reset my password from my profile settings)

### Implementation for User Story 1

- [X] T010 [P] [US1] Create PasswordResetForm component in `src/features/self-service/password-reset/components/PasswordResetForm.tsx` with React Hook Form integration, three TextField components (current, new, confirm password), submit/cancel buttons
- [X] T011 [P] [US1] Create PasswordStrengthIndicator component in `src/features/self-service/password-reset/components/PasswordStrengthIndicator.tsx` with MUI LinearProgress, color-coded bar (red/yellow/green), text label (Weak/Fair/Good/Strong)
- [X] T012 [P] [US1] Create PasswordPolicyDisplay component in `src/features/self-service/password-reset/components/PasswordPolicyDisplay.tsx` that fetches policy and displays requirements with checkmarks/X marks in real-time
- [X] T013 [US1] Create usePasswordStrength hook in `src/features/self-service/password-reset/hooks/usePasswordStrength.ts` that watches password field and calculates strength with 300ms debounce using passwordStrength utility
- [X] T014 [US1] Integrate PasswordStrengthIndicator and PasswordPolicyDisplay into PasswordResetForm with real-time updates on password change
- [X] T015 [US1] Add password visibility toggle (eye icon) to all three password fields using MUI InputAdornment with IconButton and VisibilityIcon/VisibilityOffIcon
- [X] T016 [US1] Configure React Hook Form validation mode to `onBlur` for error messages and `onChange` for strength indicator with yupResolver using passwordResetSchema
- [X] T017 [US1] Add field-level error display using TextField `error` and `helperText` props for each validation failure
- [X] T018 [US1] Add button loading state with CircularProgress spinner inside submit button when isLoading is true from usePasswordResetMutation

**Tests for User Story 1**:

- [ ] T019 [P] [US1] Write unit test for PasswordResetForm in `src/features/self-service/password-reset/__tests__/PasswordResetForm.test.tsx` testing form rendering, field validation, and submission flow
- [ ] T020 [P] [US1] Write unit test for PasswordStrengthIndicator in `src/features/self-service/password-reset/__tests__/PasswordStrengthIndicator.test.tsx` testing color changes and label updates for different strength levels
- [ ] T021 [P] [US1] Write unit test for PasswordPolicyDisplay in `src/features/self-service/password-reset/__tests__/PasswordPolicyDisplay.test.tsx` testing policy fetching and requirement checking
- [ ] T022 [P] [US1] Write unit test for usePasswordStrength hook in `src/features/self-service/password-reset/__tests__/usePasswordStrength.test.ts` testing debounce and strength calculation
- [ ] T023 [P] [US1] Write unit test for passwordStrength utility in `src/features/self-service/password-reset/__tests__/passwordStrength.test.ts` testing score calculation for various password combinations

**Checkpoint**: At this point, User Story 1 should be fully functional - users can see the form, enter passwords, view strength indicator, and see validation errors

---

## Phase 4: User Story 2 - Email Verification Flow (Priority: P1)

**Goal**: Implement email verification sending and success confirmation with toast notification

**Maps to**: US-2 (As an authenticated user, I want to receive email/SMS verification when resetting my password)

### Implementation for User Story 2

- [X] T024 [US2] Update usePasswordResetMutation hook in `src/features/self-service/password-reset/hooks/usePasswordResetMutation.ts` to handle API response and trigger success toast notification with message "Password reset email sent. Please check your inbox."
- [X] T025 [US2] Create Snackbar component wrapper in `src/features/self-service/password-reset/components/PasswordResetSnackbar.tsx` with MUI Snackbar, auto-hide duration 5000ms, top-right position, closable via X button
- [X] T026 [US2] Integrate PasswordResetSnackbar into PasswordResetForm with state management for open/close controlled by mutation success callback
- [X] T027 [US2] Add error handling in usePasswordResetMutation for API failures (401, 404, 500) with user-friendly error messages displayed in Snackbar with severity="error"
- [X] T028 [US2] Add correlation ID header (X-Correlation-ID) generation in API request using UUID v4 via apiUtils helper

**Tests for User Story 2**:

- [ ] T029 [P] [US2] Write unit test for PasswordResetSnackbar in `src/features/self-service/password-reset/__tests__/PasswordResetSnackbar.test.tsx` testing auto-dismiss, manual close, and message display
- [ ] T030 [P] [US2] Write integration test for usePasswordResetMutation in `src/features/self-service/password-reset/__tests__/usePasswordResetMutation.test.ts` testing success callback, error handling, and API call with mocked responses

**Checkpoint**: At this point, User Stories 1 AND 2 should work independently - users can submit form, see success toast, and handle errors gracefully

---

## Phase 5: User Story 3 - Password Policy Validation (Priority: P1)

**Goal**: Enforce password policy rules (complexity, history, length) with specific error messages

**Maps to**: US-3 (As an authenticated user, I want my password to be validated against security policies)

### Implementation for User Story 3

- [ ] T031 [US3] Enhance passwordValidation utility in `src/features/self-service/password-reset/utils/passwordValidation.ts` to add functions: `validateMinLength`, `validateComplexity`, `validateHistory`, `validateNotSameAsCurrent`, `validateNotMatchingUsername`
- [ ] T032 [US3] Update passwordResetSchema in `src/features/self-service/password-reset/schemas/passwordResetSchema.ts` to integrate custom validation tests using passwordValidation utility functions with specific error messages per policy failure
- [ ] T033 [US3] Add client-side pre-submission validation in PasswordResetForm that checks all policy rules before calling API to provide immediate feedback
- [ ] T034 [US3] Enhance PasswordPolicyDisplay component to show real-time policy compliance with dynamic checkmarks (✓ green) and X marks (✗ red) as user types
- [ ] T035 [US3] Add password mismatch validation for confirm password field with error message "Passwords must match" and visual indication (red border)

**Tests for User Story 3**:

- [ ] T036 [P] [US3] Write unit test for passwordValidation utility in `src/features/self-service/password-reset/__tests__/passwordValidation.test.ts` testing each validation function (length, complexity, history, username match)
- [ ] T037 [P] [US3] Write integration test for passwordResetSchema in `src/features/self-service/password-reset/__tests__/passwordResetSchema.test.ts` testing schema validation with valid and invalid passwords
- [ ] T038 [P] [US3] Write unit test for PasswordPolicyDisplay real-time updates in `src/features/self-service/password-reset/__tests__/PasswordPolicyDisplay.test.tsx` testing checkmark/X mark changes on password input

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - password policy validation is enforced with clear error messages

---

## Phase 6: User Story 4 - Session Termination & Logout (Priority: P1)

**Goal**: Automatically log out user and redirect to login page after successful password reset

**Maps to**: US-4 (As an authenticated user, I want to be logged out of all sessions after a successful password reset)

### Implementation for User Story 4

- [ ] T039 [US4] Create token revocation function in `src/services/authService.ts` with method `revokeTokens()` that calls POST `/oauth2/revoke` for both access_token and refresh_token
- [ ] T040 [US4] Update usePasswordResetMutation success callback in `src/features/self-service/password-reset/hooks/usePasswordResetMutation.ts` to call revokeTokens() after password reset confirmation
- [ ] T041 [US4] Integrate Redux logout action in usePasswordResetMutation to clear auth state from Redux store using `dispatch(logout())`
- [ ] T042 [US4] Add localStorage cleanup to remove access_token and refresh_token after successful password reset
- [ ] T043 [US4] Add navigation redirect to login page using `navigate('/login')` from react-router-dom after token revocation completes
- [ ] T044 [US4] Add timeout handling for token revocation API call (max 5 seconds) with fallback to proceed with logout even if revocation fails (fail-open for UX)

**Tests for User Story 4**:

- [ ] T045 [P] [US4] Write unit test for authService.revokeTokens in `src/services/__tests__/authService.test.ts` testing token revocation API calls with success and failure scenarios
- [ ] T046 [P] [US4] Write integration test for logout flow in `src/features/self-service/password-reset/__tests__/usePasswordResetMutation.test.ts` testing Redux dispatch, localStorage cleanup, and navigation redirect

**Checkpoint**: At this point, all 4 user stories work end-to-end - password reset triggers session termination and redirects to login

---

## Phase 7: User Story 5 - Audit Logging & Compliance (Priority: P2)

**Goal**: Ensure all password reset events are logged for security compliance and traceability

**Maps to**: US-5 (As a system administrator, I want to enforce password reset with email/SMS verification)

### Implementation for User Story 5

- [ ] T047 [US5] Add logging utility function in `src/utils/logging.ts` with method `logPasswordResetEvent(eventType: string, userId: string, correlationId: string, status: string)` for client-side logging
- [ ] T048 [US5] Integrate logging in usePasswordResetMutation to log "password_reset_initiated" event on form submission with correlation ID
- [ ] T049 [US5] Add error logging for password reset failures with event type "password_reset_failed" including error code and message (sanitized, no sensitive data)
- [ ] T050 [US5] Add success logging for password reset completion with event type "password_reset_completed" after successful email verification
- [ ] T051 [US5] Ensure correlation ID from API response headers (X-Correlation-ID) is extracted and included in all subsequent logs for request tracing

**Tests for User Story 5**:

- [ ] T052 [P] [US5] Write unit test for logging utility in `src/utils/__tests__/logging.test.ts` testing log event generation with correct parameters and no sensitive data leakage
- [ ] T053 [P] [US5] Write integration test for audit logging in `src/features/self-service/password-reset/__tests__/usePasswordResetMutation.test.ts` verifying logs are created on initiation, success, and failure

**Checkpoint**: At this point, all 5 user stories are complete - full audit trail is captured for compliance

---

## Phase 8: Integration & Page Setup

**Purpose**: Integrate password reset feature into Security Settings page

- [ ] T054 Import PasswordResetForm component in `src/pages/SecuritySettingsPage.tsx` and add to page layout in appropriate section
- [ ] T055 Add navigation route for password reset feature if needed in `src/routes/index.tsx` (if separate page required instead of inline in settings)
- [ ] T056 Add feature flag check (if applicable) to conditionally show/hide password reset section based on tenant configuration
- [ ] T057 Update SecuritySettingsPage layout to include password reset section with proper spacing and visual hierarchy using MUI Box/Stack components

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add accessibility attributes to PasswordResetForm in `src/features/self-service/password-reset/components/PasswordResetForm.tsx`: ARIA labels, aria-describedby for password policy hint, aria-invalid for error states, aria-live for screen reader announcements
- [ ] T059 [P] Add keyboard navigation support: Tab order, Enter to submit, Esc to cancel/close dialogs, focus management for modals
- [ ] T060 [P] Add responsive design breakpoints for mobile devices using MUI useMediaQuery in PasswordResetForm for mobile-optimized layout
- [ ] T061 [P] Optimize performance: Memoize password strength calculation with useMemo, debounce password field watchers to reduce re-renders
- [ ] T062 [P] Add internationalization (i18n) support for error messages, labels, and success messages using existing i18n framework (if applicable)
- [ ] T063 [P] Update feature documentation in `docs/features/password-reset.md` with usage instructions, screenshots, and API integration details
- [ ] T064 [P] Add JSDoc comments to all exported functions, hooks, and components for better developer experience
- [ ] T065 Run accessibility audit using axe-core or WAVE tool and fix any WCAG 2.1 Level AA violations in password reset components
- [ ] T066 Run bundle size analysis and optimize imports (tree-shaking) to keep password reset feature under 50KB gzipped
- [ ] T067 Perform manual cross-browser testing on Chrome, Firefox, Safari, Edge (latest 2 versions) and document any browser-specific issues
- [ ] T068 Code review and refactoring: Extract repeated logic, remove console.log statements, ensure TypeScript strict mode compliance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Integration (Phase 8)**: Depends on User Stories 1-4 completion (US5 optional)
- **Polish (Phase 9)**: Depends on Integration phase completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1/US2/US4 but independently testable

### Within Each User Story

- Tests (if included) can be written in parallel with implementation or using TDD (write tests first)
- Components within a story marked [P] can be developed in parallel
- Hooks depend on utilities/services being complete
- Form integration tasks depend on individual components being complete
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003)
- All Foundational tasks marked [P] can run in parallel (T005, T006, T007)
- Once Foundational phase completes, all user stories (Phase 3-7) can start in parallel if team capacity allows
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel (e.g., T010, T011, T012 in US1)
- Polish tasks marked [P] can run in parallel (T058-T068)

---

## Parallel Example: User Story 1

```bash
# Phase 3: User Story 1 - Parallel Opportunities

# Launch all components in parallel:
Task T010: Create PasswordResetForm component in src/features/self-service/password-reset/components/PasswordResetForm.tsx
Task T011: Create PasswordStrengthIndicator component in src/features/self-service/password-reset/components/PasswordStrengthIndicator.tsx
Task T012: Create PasswordPolicyDisplay component in src/features/self-service/password-reset/components/PasswordPolicyDisplay.tsx

# Then launch integration tasks sequentially:
Task T013: Create usePasswordStrength hook (depends on passwordStrength utility from Phase 2)
Task T014: Integrate components into PasswordResetForm
Task T015: Add password visibility toggles
Task T016: Configure validation mode
Task T017: Add error display
Task T018: Add loading state

# Launch all tests in parallel after implementation:
Task T019: Test PasswordResetForm
Task T020: Test PasswordStrengthIndicator
Task T021: Test PasswordPolicyDisplay
Task T022: Test usePasswordStrength hook
Task T023: Test passwordStrength utility
```

---

## Parallel Example: User Story 3

```bash
# Phase 5: User Story 3 - Parallel Opportunities

# Launch all validation utility functions in parallel:
Task T031: Enhance passwordValidation utility with multiple validation functions

# Then sequential integration:
Task T032: Update passwordResetSchema with custom validation tests
Task T033: Add pre-submission validation in PasswordResetForm
Task T034: Enhance PasswordPolicyDisplay for real-time compliance
Task T035: Add password mismatch validation

# Launch all tests in parallel:
Task T036: Test passwordValidation utility
Task T037: Test passwordResetSchema
Task T038: Test PasswordPolicyDisplay real-time updates
```

---

## Implementation Strategy

### Incremental Delivery Approach

1. **Complete Setup (Phase 1) + Foundational (Phase 2)** → Foundation ready for all user stories
2. **Add User Story 1 (Phase 3)** → Test independently → Demo basic form with validation and strength indicator
3. **Add User Story 2 (Phase 4)** → Test independently → Demo email verification flow with toast notifications
4. **Add User Story 3 (Phase 5)** → Test independently → Demo password policy enforcement with real-time feedback
5. **Add User Story 4 (Phase 6)** → Test independently → Demo session termination and logout flow
6. **Add User Story 5 (Phase 7)** → Test independently → Demo audit logging and compliance
7. **Complete Integration (Phase 8)** → Test full end-to-end flow in Security Settings page
8. **Polish (Phase 9)** → Accessibility, performance, documentation, cross-browser testing

Each user story adds incremental value and can be demonstrated/deployed independently.

### Testing Strategy

- **Unit Tests**: Test individual components, hooks, and utilities in isolation
- **Integration Tests**: Test hooks with mocked API responses, test form submission flow
- **Manual Testing**: Test full user journey in browser, test accessibility with screen readers
- **Coverage Target**: >80% for critical paths (form submission, validation, API integration)
- **Testing Tools**: Jest 29.7.0 + React Testing Library + @testing-library/user-event

### Quality Gates

**Before Moving to Next Phase**:
- All tasks in current phase completed and checked off
- All tests passing (if tests included in phase)
- Code review completed (if multi-developer team)
- No TypeScript errors or linting warnings
- Manual testing confirms expected behavior

**Before Final Delivery**:
- All 5 user stories independently tested and validated
- End-to-end flow tested on Security Settings page
- Accessibility audit passed (WCAG 2.1 Level AA)
- Cross-browser testing completed
- Documentation updated
- Code coverage >80% for critical paths

---

## Task Summary

**Total Tasks**: 68  
**Setup Tasks**: 3 (Phase 1)  
**Foundational Tasks**: 6 (Phase 2)  
**User Story 1 Tasks**: 14 (10 implementation + 5 tests) - Phase 3  
**User Story 2 Tasks**: 7 (5 implementation + 2 tests) - Phase 4  
**User Story 3 Tasks**: 8 (5 implementation + 3 tests) - Phase 5  
**User Story 4 Tasks**: 8 (6 implementation + 2 tests) - Phase 6  
**User Story 5 Tasks**: 7 (5 implementation + 2 tests) - Phase 7  
**Integration Tasks**: 4 (Phase 8)  
**Polish Tasks**: 11 (Phase 9)

**Parallel Opportunities Identified**: 29 tasks marked with [P]  
**Independent Test Criteria**: Each user story has checkpoint validation and can be tested independently

---

## Format Validation

✅ **All tasks follow checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`  
✅ **All tasks have sequential IDs**: T001 through T068  
✅ **All user story tasks have [Story] labels**: US1, US2, US3, US4, US5  
✅ **All parallel tasks marked with [P]**: 29 tasks identified  
✅ **All tasks include file paths**: Exact locations specified  
✅ **All checkpoints defined**: Each user story has validation criteria  

---

## Notes

- **Priority**: User Stories 1-4 are P1 (must-have for MVP), User Story 5 is P2 (should-have)
- **Testing**: Tests included for each user story to ensure quality and enable TDD if desired
- **Dependencies**: User stories designed to be independently testable and deployable
- **Modularity**: Each component, hook, and utility is in a separate file for parallel development
- **Reusability**: PasswordStrengthIndicator and PasswordPolicyDisplay are reusable components
- **Error Handling**: Comprehensive error handling across all user stories
- **Accessibility**: Dedicated polish phase for WCAG 2.1 Level AA compliance
- **Performance**: Debouncing and memoization optimizations in polish phase
