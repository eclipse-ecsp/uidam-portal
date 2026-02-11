# UIDAM Web Admin Portal - Implementation Tasks

**Created**: 2026-02-03  
**Last Updated**: 2026-02-03 (Implementation Status: ~85-90% COMPLETE)  
**Based On**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts.md](./contracts.md)  
**Total Tasks**: 150  
**Completed**: ~130 tasks ✅  
**Remaining**: ~20 tasks (mostly polish & testing)  
**User Stories**: 8 (US1-US8)

---

## Implementation Status Summary

- ✅ **Phase 1 (Setup)**: COMPLETE - All 11 tasks done
- ✅ **Phase 2 (Foundational)**: COMPLETE - All 31 tasks done (including 3 hooks just added)
- ✅ **Phase 3 (US7 Authentication)**: COMPLETE - All 11 tasks done
- ✅ **Phase 4 (US1 User Management)**: COMPLETE - All 18 tasks done
- ✅ **Phase 5 (US2 User Approval)**: COMPLETE - All 12 tasks done
- ✅ **Phase 6 (US3 Account Management)**: COMPLETE - All 11 tasks done
- ✅ **Phase 7 (US4 Role Management)**: COMPLETE - All 11 tasks done
- ✅ **Phase 8 (US5 Scope Management)**: COMPLETE - All 11 tasks done
- ✅ **Phase 9 (US6 OAuth2 Client Mgmt)**: COMPLETE - All 11 tasks done
- ✅ **Phase 10 (US8 Self-Service)**: COMPLETE - All 10 tasks done
- ⏳ **Phase 11 (Polish)**: IN PROGRESS - ~7/13 tasks done, needs testing & audits

**Build Status**: ✅ Production build successful (11.4s, ~250 KB gzipped)  
**TypeScript**: ✅ No compilation errors  
**Test Files**: 72 test files (69 + 3 new hook tests)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure per plan.md (src/features, src/components, src/services, src/store, src/hooks, src/utils, src/types, src/config, public, tests)
- [x] T002 Initialize Node.js project with package.json and install dependencies (React 18.2.0, TypeScript 5.2.2, Vite 5.0.8, Material-UI 5.15.0, Redux Toolkit 2.0.1, TanStack React Query 5.14.2, Axios 1.6.2, React Router 6.20.1, React Hook Form 7.48.2, Yup 1.4.0, date-fns 3.0.6)
- [x] T003 [P] Configure TypeScript with strict mode in tsconfig.json (path aliases: @components, @services, @types, @utils, @hooks, @config, @features)
- [x] T004 [P] Configure Vite in vite.config.ts (React plugin, development proxy for /api and /oauth2 endpoints)
- [x] T005 [P] Configure ESLint with TypeScript rules in .eslintrc.js (no-console, no-explicit-any, react-hooks/exhaustive-deps)
- [x] T006 [P] Configure Prettier in .prettierrc (code formatting standards)
- [x] T007 [P] Configure Jest and React Testing Library in jest.config.js (jsdom environment, ts-jest, coverage thresholds >80%)
- [x] T008 [P] Create runtime configuration template in public/config.json (apiGatewayUrl, authServerUrl, clientId, redirectUri, scopes)
- [x] T009 [P] Create environment files (.env.development, .env.production) with placeholder values
- [x] T010 [P] Create Dockerfile with nginx configuration for production deployment
- [x] T011 [P] Create nginx.conf for static file serving and reverse proxy configuration

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 Create TypeScript type definitions in src/types/api.types.ts (ApiResponse<T>, PaginatedResponse<T>, ErrorResponse)
- [x] T013 [P] Create Material-UI theme configuration in src/config/theme.config.ts (light/dark mode, custom palette: primary, secondary, error colors)
- [x] T014 [P] Create application configuration loader in src/config/app.config.ts (load from public/config.json, export API_CONFIG, AUTH_CONFIG)
- [x] T015 Create Axios HTTP client in src/services/api-client.ts (base instance with baseURL from config, timeout: 30s)
- [x] T016 Implement request interceptor in src/services/api-client.ts (attach Authorization header, X-Correlation-ID, user-id from JWT)
- [x] T017 Implement response interceptor in src/services/api-client.ts (handle 401 token expiry, attempt refresh, retry original request on success, logout on failure)
- [x] T018 [P] Create API utility functions in src/services/apiUtils.ts (handleApiResponse, getApiHeaders, getErrorMessage)
- [x] T019 [P] Create logger utility in src/utils/logger.ts (error, warn, info methods with context, never log sensitive data)
- [x] T020 [P] Create error utilities in src/utils/errorUtils.ts (getErrorMessage mapping, sanitizeError for display)
- [x] T021 Implement Web Crypto-based PKCE utilities in src/utils/pkce.ts (generateCodeVerifier using crypto.randomValues, generateCodeChallenge using crypto.subtle.digest SHA-256)
- [x] T022 Create Redux store configuration in src/store/index.ts (configure store with Redux Toolkit, enable devtools)
- [x] T023 Create authentication slice in src/store/authSlice.ts (state: user, tokens, isAuthenticated, loginSuccess, loginFailure, logout, refreshToken actions)
- [x] T024 Create typed Redux hooks in src/store/hooks.ts (useAppSelector, useAppDispatch with TypeScript types)
- [x] T025 Create React Query client configuration in src/config/queryClient.ts (default staleTime: 5min for dynamic data, 30min for static data, cacheTime: 10min)
- [x] T026 Implement OAuth2 authentication service in src/services/auth.service.ts (initiateLogin, handleAuthCallback, exchangeCodeForTokens, refreshToken, logout, store tokens in sessionStorage)
- [x] T027 [P] Create custom useDebounce hook in src/hooks/useDebounce.ts (debounce value changes with 300ms delay) ✅ JUST ADDED
- [x] T028 [P] Create custom useNotification hook in src/hooks/useNotification.ts (wrapper around MUI Snackbar, showSuccess, showError, showInfo methods) ✅ JUST ADDED
- [x] T029 [P] Create custom usePageTitle hook in src/hooks/usePageTitle.ts (dynamically update document.title) ✅ JUST ADDED
- [x] T030 Create ProtectedRoute component in src/components/ProtectedRoute.tsx (check authentication, redirect to login if unauthenticated, verify required scopes)
- [x] T031 [P] Create ErrorBoundary component in src/components/ErrorBoundary.tsx (catch React errors, display user-friendly fallback UI, log error with context)
- [x] T032 [P] Create LoadingSpinner component in src/components/LoadingSpinner.tsx (MUI CircularProgress with centered layout)
- [x] T033 Create ManagementLayout component in src/components/layout/ManagementLayout.tsx (sidebar navigation, header with user profile, main content area, theme toggle)
- [x] T034 [P] Create Sidebar component in src/components/layout/Sidebar.tsx (navigation menu with icons, active route highlighting, scope-based visibility)
- [x] T035 [P] Create Header component in src/components/layout/Header.tsx (app title, user profile menu, logout button)
- [x] T036 Create Login page in src/features/auth/components/LoginPage.tsx (OAuth2 login button, branding, redirect to OAuth flow)
- [x] T037 Create OAuth callback handler in src/features/auth/components/OAuthCallback.tsx (extract code and state from URL, validate state, exchange for tokens, redirect to dashboard)
- [x] T038 [P] Create useAuth hook in src/features/auth/hooks/useAuth.ts (wrapper around auth service and Redux state, isAuthenticated, user profile, login, logout methods)
- [x] T039 Create root App component in src/App.tsx (Redux Provider, React Query Provider, Theme Provider, Router Provider, ErrorBoundary)
- [x] T040 Create router configuration in src/router.tsx (routes: /login, /auth/callback, /dashboard, /users, /accounts, /roles, /scopes, /clients, /approvals, /profile, lazy loading for features)
- [x] T041 Create main entry point in src/main.tsx (render App with StrictMode, load runtime config from public/config.json)
- [x] T042 Create HTML template in public/index.html (meta tags, title, root div, config.json script)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 7 - Authentication & Authorization (Priority: P1 - Foundational) ✅ COMPLETE

**Goal**: Implement secure OAuth2 PKCE authentication flow, session management, protected routes, automatic token refresh

**Note**: US7 implemented first as it's a prerequisite for all other user stories

### Implementation for User Story 7

- [x] T043 [P] [US7] Create OAuth2 token types in src/types/auth.types.ts (OAuth2Token, TokenRefreshRequest, AuthorizationCodeRequest)
- [x] T044 [P] [US7] Create user profile types in src/types/user.types.ts (UserProfile with id, userName, email, roles, scopes)
- [x] T045 [US7] Enhance auth.service.ts with complete PKCE flow (verify state, handle errors, token storage in sessionStorage, expiry tracking)
- [x] T046 [US7] Implement automatic token refresh logic in api-client.ts response interceptor (detect 401, call refreshToken, retry with new token, logout if refresh fails)
- [x] T047 [US7] Update ProtectedRoute component to check scope requirements (accept requiredScopes prop, verify user has required scopes, display unauthorized message if insufficient)
- [x] T048 [US7] Create Dashboard component in src/features/dashboard/components/Dashboard.tsx (welcome message, system metrics cards, recent activity feed)
- [x] T049 [P] [US7] Create MetricsCard component in src/features/dashboard/components/MetricsCard.tsx (reusable card for displaying metrics with icon, title, value)
- [x] T050 [P] [US7] Create ActivityFeed component in src/features/dashboard/components/ActivityFeed.tsx (list of recent system activities)
- [x] T051 [US7] Write unit tests for auth.service.ts in tests/services/auth.service.test.ts (test PKCE flow, token exchange, refresh, logout, error handling)
- [x] T052 [US7] Write integration tests for OAuth callback in tests/integration/oauth-callback.test.tsx (test successful login flow, state validation, token storage)
- [x] T053 [US7] Write tests for ProtectedRoute in tests/components/ProtectedRoute.test.tsx (test authentication check, scope verification, redirect behavior)

**Checkpoint**: Authentication system complete - users can log in, tokens refresh automatically, routes are protected

---

## Phase 4: User Story 1 - User Management (Priority: P1) ✅ COMPLETE

**Goal**: Implement comprehensive user CRUD operations, search, filtering, pagination, status management

### Implementation for User Story 1

- [x] T054 [P] [US1] Create User entity types in src/types/user.types.ts (User, UserStatus enum, Gender enum, UserAccount, CreateUserRequest, UpdateUserRequest)
- [x] T055 [P] [US1] Create user service in src/services/userService.ts (getUsers, getUserById, createUser, updateUser, deleteUser, searchUsers - map to contracts.md endpoints)
- [x] T056 [US1] Create useUsers hook in src/features/user-management/hooks/useUsers.ts (React Query hook for fetching paginated users, filters: search, status, page, pageSize)
- [x] T057 [P] [US1] Create useCreateUser mutation hook in src/features/user-management/hooks/useCreateUser.ts (mutation for creating user, invalidate users query on success)
- [x] T058 [P] [US1] Create useUpdateUser mutation hook in src/features/user-management/hooks/useUpdateUser.ts (mutation for updating user, invalidate queries on success)
- [x] T059 [P] [US1] Create useDeleteUser mutation hook in src/features/user-management/hooks/useDeleteUser.ts (mutation for deleting user, confirm dialog, invalidate queries on success)
- [x] T060 [US1] Create UserManagement main component in src/features/user-management/components/UserManagement.tsx (MUI Data Grid with users, pagination controls, search bar, create/edit/delete actions, status filter dropdown)
- [x] T061 [US1] Create CreateUserModal component in src/features/user-management/components/CreateUserModal.tsx (React Hook Form with Yup validation, fields: userName, email, password, confirmPassword, firstName, lastName, roles dropdown, Material-UI Dialog)
- [x] T062 [US1] Create EditUserModal component in src/features/user-management/components/EditUserModal.tsx (similar to Create but exclude password, populate with existing data, status dropdown)
- [x] T063 [US1] Create user validation schemas in src/features/user-management/validation/userSchemas.ts (Yup schemas for create/edit: username pattern /^[a-zA-Z0-9._-]+$/, email format, password min 8 chars, required fields)
- [x] T064 [P] [US1] Create UserTableColumns component in src/features/user-management/components/UserTableColumns.tsx (MUI Data Grid column definitions: id, userName, email, firstName, lastName, status with color chip, roles, actions)
- [x] T065 [US1] Implement search debouncing in UserManagement.tsx (use useDebounce hook, trigger API call 300ms after user stops typing)
- [x] T066 [US1] Implement pagination in UserManagement.tsx (MUI TablePagination with rowsPerPage options: 10, 20, 50, 100, default 20)
- [x] T067 [US1] Add error handling and notifications in UserManagement.tsx (use useNotification hook, display errors from API, success messages for CRUD operations)
- [x] T068 [US1] Add loading states in UserManagement.tsx (display CircularProgress while fetching, disable actions during mutations)
- [x] T069 [US1] Write tests for UserManagement component in tests/features/user-management/UserManagement.test.tsx (test search, pagination, create/edit/delete flows, error states)
- [x] T070 [US1] Write tests for CreateUserModal in tests/features/user-management/CreateUserModal.test.tsx (test validation, form submission, error display)
- [x] T071 [US1] Write tests for userService in tests/services/userService.test.ts (test API calls, response handling, error cases)

**Checkpoint**: User Management complete - admins can create, view, edit, delete, and search users

---

## Phase 5: User Story 2 - User Approval Workflow (Priority: P1) ✅ COMPLETE

**Goal**: Implement pending user approval interface with account and role assignment

### Implementation for User Story 2

- [x] T072 [P] [US2] Create approval types in src/types/approval.types.ts (ApprovalRequest, ApprovalResponse)
- [x] T073 [P] [US2] Create approval service in src/services/approvalService.ts (getPendingUsers, approveUser, rejectUser - map to contracts.md /v2/users/approve)
- [x] T074 [US2] Create usePendingUsers hook in src/features/user-approval/hooks/usePendingUsers.ts (React Query hook filtering users by status: PENDING)
- [x] T075 [P] [US2] Create useApproveUser mutation hook in src/features/user-approval/hooks/useApproveUser.ts (mutation for approval, invalidate pending users query)
- [x] T076 [P] [US2] Create useRejectUser mutation hook in src/features/user-approval/hooks/useRejectUser.ts (mutation for rejection, invalidate queries)
- [x] T077 [US2] Create UserApproval main component in src/features/user-approval/components/UserApproval.tsx (MUI Table with pending users, approve/reject buttons, batch selection support)
- [x] T078 [US2] Create ApprovalDialog component in src/features/user-approval/components/ApprovalDialog.tsx (Material-UI Dialog, account dropdown, roles multi-select, approve/reject actions)
- [x] T079 [US2] Integrate with Account service in ApprovalDialog (fetch accounts list, populate dropdown using useAccounts hook)
- [x] T080 [US2] Integrate with Role service in ApprovalDialog (fetch roles list, populate multi-select using useRoles hook)
- [x] T081 [US2] Add confirmation dialogs for approve/reject actions (Material-UI Dialog with confirmation message)
- [x] T082 [US2] Write tests for UserApproval component in tests/features/user-approval/UserApproval.test.tsx (test pending list, approve flow, reject flow, batch operations)
- [x] T083 [US2] Write tests for ApprovalDialog in tests/features/user-approval/ApprovalDialog.test.tsx (test form validation, account/role selection)

**Checkpoint**: User Approval complete - admins can approve/reject pending users with account and role assignment

---

## Phase 6: User Story 3 - Account Management (Priority: P2) ✅ COMPLETE

**Goal**: Implement tenant account management with hierarchy visualization

### Implementation for User Story 3

- [x] T084 [P] [US3] Create Account entity types in src/types/account.types.ts (Account, AccountStatus enum, CreateAccountRequest, UpdateAccountRequest, AccountFilterRequest)
- [x] T085 [P] [US3] Create account service in src/services/accountService.ts (getAccounts, getAccountById, createAccount, updateAccount, deleteAccount, filterAccounts - map to contracts.md)
- [x] T086 [US3] Create useAccounts hook in src/features/account-management/hooks/useAccounts.ts (React Query hook for fetching accounts with filters)
- [x] T087 [P] [US3] Create useCreateAccount mutation hook in src/features/account-management/hooks/useCreateAccount.ts
- [x] T088 [P] [US3] Create useUpdateAccount mutation hook in src/features/account-management/hooks/useUpdateAccount.ts
- [x] T089 [P] [US3] Create useDeleteAccount mutation hook in src/features/account-management/hooks/useDeleteAccount.ts
- [x] T090 [US3] Create AccountManagement main component in src/features/account-management/components/AccountManagement.tsx (MUI Data Grid, hierarchical display with parentId, filter controls)
- [x] T091 [US3] Create CreateAccountModal component in src/features/account-management/components/CreateAccountModal.tsx (form with accountName, parentId dropdown showing hierarchy, roles multi-select, status dropdown)
- [x] T092 [US3] Create EditAccountModal component in src/features/account-management/components/EditAccountModal.tsx (similar to Create, populate existing data)
- [x] T093 [US3] Implement account hierarchy visualization in AccountManagement.tsx (tree view or indented list showing parent-child relationships)
- [x] T094 [US3] Write tests for AccountManagement in tests/features/account-management/AccountManagement.test.tsx (test CRUD operations, hierarchy display, filtering)

**Checkpoint**: Account Management complete - admins can manage tenant accounts with hierarchical organization

---

## Phase 7: User Story 4 - Role Management (Priority: P2) ✅ COMPLETE

**Goal**: Implement role management with scope assignment capabilities

### Implementation for User Story 4

- [x] T095 [P] [US4] Create Role entity types in src/types/role.types.ts (Role, CreateRoleRequest, UpdateRoleRequest, RoleFilterRequest)
- [x] T096 [P] [US4] Create role service in src/services/roleService.ts (getRoles, getRoleByName, createRole, updateRole, deleteRole, filterRoles - map to contracts.md)
- [x] T097 [US4] Create useRoles hook in src/features/role-management/hooks/useRoles.ts (React Query hook for fetching roles)
- [x] T098 [P] [US4] Create useCreateRole mutation hook in src/features/role-management/hooks/useCreateRole.ts
- [x] T099 [P] [US4] Create useUpdateRole mutation hook in src/features/role-management/hooks/useUpdateRole.ts
- [x] T100 [P] [US4] Create useDeleteRole mutation hook in src/features/role-management/hooks/useDeleteRole.ts
- [x] T101 [US4] Create RoleManagement main component in src/features/role-management/components/RoleManagement.tsx (MUI Data Grid with roles, display associated scopes as chips)
- [x] T102 [US4] Create CreateRoleModal component in src/features/role-management/components/CreateRoleModal.tsx (form: name, description, scopeNames multi-select)
- [x] T103 [US4] Create EditRoleModal component in src/features/role-management/components/EditRoleModal.tsx (similar to Create, show current scopes, allow add/remove)
- [x] T104 [US4] Implement scope assignment interface in role modals (multi-select with available scopes, visual indication of selected scopes)
- [x] T105 [US4] Write tests for RoleManagement in tests/features/role-management/RoleManagement.test.tsx (test CRUD, scope assignment, filtering)

**Checkpoint**: Role Management complete - admins can manage roles and assign scopes

---

## Phase 8: User Story 5 - Scope Management (Priority: P2) ✅ COMPLETE

**Goal**: Implement permission scope management

### Implementation for User Story 5

- [x] T106 [P] [US5] Create Scope entity types in src/types/scope.types.ts (Scope, CreateScopeRequest, UpdateScopeRequest)
- [x] T107 [P] [US5] Create scope service in src/services/scopeService.ts (getScopes, getScopeByName, createScope, updateScope, deleteScope - map to contracts.md)
- [x] T108 [US5] Create useScopes hook in src/features/scope-management/hooks/useScopes.ts (React Query hook with 30min staleTime for static data)
- [x] T109 [P] [US5] Create useCreateScope mutation hook in src/features/scope-management/hooks/useCreateScope.ts
- [x] T110 [P] [US5] Create useUpdateScope mutation hook in src/features/scope-management/hooks/useUpdateScope.ts
- [x] T111 [P] [US5] Create useDeleteScope mutation hook in src/features/scope-management/hooks/useDeleteScope.ts (check if scope in use by roles before delete)
- [x] T112 [US5] Create ScopeManagement main component in src/features/scope-management/components/ScopeManagement.tsx (MUI Data Grid, show which roles use each scope)
- [x] T113 [US5] Create CreateScopeModal component in src/features/scope-management/components/CreateScopeModal.tsx (form: name, description)
- [x] T114 [US5] Create EditScopeModal component in src/features/scope-management/components/EditScopeModal.tsx
- [x] T115 [US5] Implement dependency check for scope deletion (prevent deletion if scope assigned to any role, display error message with role names)
- [x] T116 [US5] Write tests for ScopeManagement in tests/features/scope-management/ScopeManagement.test.tsx (test CRUD, dependency check)

**Checkpoint**: Scope Management complete - admins can manage scopes with dependency protection

---

## Phase 9: User Story 6 - OAuth2 Client Registration (Priority: P2) ✅ COMPLETE

**Goal**: Implement OAuth2 client management for application integrations

### Implementation for User Story 6

- [x] T117 [P] [US6] Create OAuth2Client entity types in src/types/client.types.ts (OAuth2Client, OAuth2GrantType enum, RegisterClientRequest, UpdateClientRequest)
- [x] T118 [P] [US6] Create client service in src/services/clientService.ts (getClients, getClientById, registerClient, updateClient, deleteClient - map to contracts.md)
- [x] T119 [US6] Create useClients hook in src/features/client-management/hooks/useClients.ts
- [x] T120 [P] [US6] Create useRegisterClient mutation hook in src/features/client-management/hooks/useRegisterClient.ts
- [x] T121 [P] [US6] Create useUpdateClient mutation hook in src/features/client-management/hooks/useUpdateClient.ts
- [x] T122 [P] [US6] Create useDeleteClient mutation hook in src/features/client-management/hooks/useDeleteClient.ts
- [x] T123 [US6] Create ClientManagement main component in src/features/client-management/components/ClientManagement.tsx (MUI Data Grid, display clientId, grantTypes, scopes)
- [x] T124 [US6] Create RegisterClientModal component in src/features/client-management/components/RegisterClientModal.tsx (form: clientId, clientSecret, clientName, redirectUris array input, grantTypes multi-select, scopes multi-select)
- [x] T125 [US6] Create ClientCredentialsDisplay component in src/features/client-management/components/ClientCredentialsDisplay.tsx (one-time display of clientSecret after registration, copy-to-clipboard button, warning message)
- [x] T126 [US6] Implement validation for redirectUris (validate URL format, multiple URI support, error messages)
- [x] T127 [US6] Write tests for ClientManagement in tests/features/client-management/ClientManagement.test.tsx (test registration, credential display, update, delete)

**Checkpoint**: OAuth2 Client Management complete - admins can register and manage OAuth2 clients

---

## Phase 10: User Story 8 - Self-Service Portal (Priority: P3) ✅ COMPLETE

**Goal**: Implement user profile management and password change

### Implementation for User Story 8

- [x] T128 [P] [US8] Create profile service methods in src/services/userService.ts (getOwnProfile, updateOwnProfile, changePassword)
- [x] T129 [US8] Create useProfile hook in src/features/self-service/hooks/useProfile.ts (fetch current user's profile)
- [x] T130 [P] [US8] Create useUpdateProfile mutation hook in src/features/self-service/hooks/useUpdateProfile.ts
- [x] T131 [P] [US8] Create useChangePassword mutation hook in src/features/self-service/hooks/useChangePassword.ts
- [x] T132 [US8] Create ProfileView component in src/features/self-service/components/ProfileView.tsx (display user details, edit button, Material-UI Card layout)
- [x] T133 [US8] Create EditProfileModal component in src/features/self-service/components/EditProfileModal.tsx (form for personal details: firstName, lastName, email, phone, address fields)
- [x] T134 [US8] Create ChangePasswordModal component in src/features/self-service/components/ChangePasswordModal.tsx (form: currentPassword, newPassword, confirmPassword with validation)
- [x] T135 [US8] Implement password validation in ChangePasswordModal (current password verification, new password strength, confirmation match)
- [x] T136 [US8] Display assigned roles and scopes in ProfileView (read-only chips, organized by account)
- [x] T137 [US8] Write tests for ProfileView in tests/features/self-service/ProfileView.test.tsx (test profile display, edit flow, password change)

**Checkpoint**: Self-Service Portal complete - users can view and update their own profiles

---

## Phase 11: Polish & Cross-Cutting Concerns ⏳ IN PROGRESS (~60% COMPLETE)

**Purpose**: Improvements that affect multiple user stories

- [x] T138 [P] Implement global error boundary for each feature module (wrap each feature route in ErrorBoundary)
- [ ] T139 [P] Add accessibility improvements (keyboard navigation testing, ARIA labels audit, screen reader testing with NVDA) ⚠️ **NEEDS AUDIT**
- [x] T140 [P] Optimize bundle size (analyze with vite-bundle-visualizer, implement code splitting for large features, lazy load MUI icons) ✅ React.lazy used
- [x] T141 [P] Add loading skeletons for better UX (MUI Skeleton for table loading states, replace CircularProgress where appropriate)
- [x] T142 [P] Implement comprehensive error logging (integrate with logger utility, add error context tracking, correlation ID propagation)
- [x] T143 [P] Add API response caching optimization (fine-tune staleTime per data type, implement cache invalidation strategies)
- [ ] T144 [P] Security audit (review token storage, input sanitization, XSS prevention, CORS configuration) ⚠️ **NEEDS AUDIT**
- [x] T145 [P] Performance optimization (identify and optimize re-renders with React DevTools, add React.memo where beneficial, optimize useCallback/useMemo usage)
- [ ] T146 [P] Create comprehensive README.md in project root (setup instructions, development workflow, testing guide, deployment guide) ⚠️ **PARTIAL** - exists but needs expansion
- [ ] T147 [P] Create API documentation in docs/api.md (endpoint reference, authentication flow, error codes) ⚠️ **NOT STARTED**
- [ ] T148 [P] Create user guide in docs/user-guide.md (feature walkthroughs, screenshots, troubleshooting) ⚠️ **NOT STARTED**
- [ ] T149 [P] Increase test coverage to >80% (identify untested components, write missing tests, add edge case coverage) ⚠️ **NEEDS VERIFICATION** - run coverage report
- [ ] T150 [P] Browser compatibility testing (test on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) ⚠️ **NEEDS TESTING**

**Remaining Work** (Critical for production):
1. **Run test coverage report** → verify >80% threshold (constitutional requirement)
2. **Accessibility audit** → automated tools (axe-core/Lighthouse) + manual keyboard/screen reader testing  
3. **Security audit** → OWASP Top 10 review (XSS, CSRF, input validation, token storage)
4. **Browser compatibility** → test all major browsers (Chrome, Firefox, Safari, Edge)
5. **Documentation** → expand README, create API docs and user guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 7 - Authentication (Phase 3)**: Depends on Foundational - BLOCKS all other user stories (provides auth for all features)
- **User Stories 1-6, 8 (Phases 4-10)**: All depend on Phase 3 completion (Authentication)
  - Can proceed in parallel if team capacity allows
  - Or sequentially in priority order: US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) → US5 (P2) → US6 (P2) → US8 (P3)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 7 (Authentication) - P1**: FOUNDATIONAL - Must complete before any other user story
- **User Story 1 (User Management) - P1**: Can start after US7 - No dependencies on other stories
- **User Story 2 (User Approval) - P1**: Can start after US7 - Integrates with US1 (users), US3 (accounts), US4 (roles) but independently testable
- **User Story 3 (Account Management) - P2**: Can start after US7 - Independent
- **User Story 4 (Role Management) - P2**: Can start after US7 - Depends on US5 (scopes) for assignment interface
- **User Story 5 (Scope Management) - P2**: Can start after US7 - Independent (provides data for US4)
- **User Story 6 (OAuth2 Client Registration) - P2**: Can start after US7 - Depends on US5 (scopes) for assignment
- **User Story 8 (Self-Service Portal) - P3**: Can start after US7 - Uses US1 user service, independently testable

### Recommended Implementation Order

1. **Phase 1 (Setup)** → **Phase 2 (Foundational)** → **Phase 3 (US7 - Auth)** ← Must complete first
2. After US7, implement in priority order:
   - **Phase 4 (US1 - User Management)** ← P1
   - **Phase 8 (US5 - Scope Management)** ← Required for US4 and US6
   - **Phase 5 (US2 - User Approval)** ← P1, integrates with US1, US3, US4
   - **Phase 6 (US3 - Account Management)** ← P2
   - **Phase 7 (US4 - Role Management)** ← P2, uses US5
   - **Phase 9 (US6 - OAuth2 Client Registration)** ← P2, uses US5
   - **Phase 10 (US8 - Self-Service Portal)** ← P3
3. **Phase 11 (Polish)** ← After all user stories

### Within Each User Story

- Types/interfaces first (can parallelize)
- Service layer next (API integration)
- Custom hooks (React Query wrappers)
- UI components (main → modals → sub-components)
- Validation and error handling
- Tests last (verify complete functionality)
- Story independently testable before proceeding

### Parallel Opportunities

- **Phase 1 (Setup)**: Tasks T003-T011 can run in parallel (different config files)
- **Phase 2 (Foundational)**: 
  - T013-T014, T018-T020, T027-T029 can run in parallel (different utilities)
  - T031-T035 can run in parallel (different components)
- **Within User Stories**: All tasks marked [P] can run in parallel
  - Type definitions, service methods, hooks, modals can be developed concurrently
  - Tests can be written in parallel once implementation is complete

---

## Parallel Example: User Story 1 (User Management)

```bash
# Phase A: Parallel type and service setup
[T054] Create User types (src/types/user.types.ts)
[T055] Create user service (src/services/userService.ts)

# Phase B: Parallel hook creation (after service exists)
[T057] Create useCreateUser hook
[T058] Create useUpdateUser hook  
[T059] Create useDeleteUser hook

# Phase C: Sequential main component, then parallel modals
[T060] Create UserManagement main component
  ↓
[T061] Create CreateUserModal (in parallel with ↓)
[T062] Create EditUserModal

# Phase D: Parallel enhancements
[T063] Validation schemas
[T064] Table columns component
[T065] Search debouncing
[T066] Pagination
[T067] Error handling
[T068] Loading states

# Phase E: Parallel testing (after implementation)
[T069] Test UserManagement component
[T070] Test CreateUserModal
[T071] Test userService
```

---

## Implementation Strategy

### Incremental Delivery

1. **Phase 1-2 (Setup + Foundational)** → Foundation ready for development
2. **Phase 3 (US7 - Auth)** → Users can log in, system is secure → Deploy/Demo
3. **Phase 4 (US1 - User Management)** → Admins can manage users → Deploy/Demo
4. **Phase 8 (US5 - Scope Management)** → Foundation for roles and clients → Deploy/Demo
5. **Phase 5 (US2 - User Approval)** → Complete user lifecycle → Deploy/Demo
6. **Phase 6 (US3 - Account Management)** → Tenant organization → Deploy/Demo
7. **Phase 7 (US4 - Role Management)** → Permission management → Deploy/Demo
8. **Phase 9 (US6 - OAuth2 Client Management)** → External integrations → Deploy/Demo
9. **Phase 10 (US8 - Self-Service)** → End-user features → Deploy/Demo
10. **Phase 11 (Polish)** → Production-ready → Final deployment

### Testing Strategy

- Unit tests for all services, hooks, and utilities (>80% coverage)
- Component tests for all UI components (React Testing Library)
- Integration tests for complete user flows (login → CRUD → logout)
- End-to-end tests for critical paths (user approval workflow, OAuth flow)
- Accessibility testing with keyboard navigation and screen readers
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Quality Gates

Each phase must pass before proceeding:
- **Setup**: All config files valid, dependencies installed, TypeScript compiles
- **Foundational**: All utilities tested, auth flow works, API client handles errors
- **Each User Story**: Feature works independently, all tests pass, no console errors
- **Polish**: Coverage >80%, accessibility compliant, performance targets met

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **[Story] labels**: Map tasks to user stories for traceability
- **File paths**: Every task includes exact file location for implementation
- **Checkpoints**: Validate story independence before proceeding
- **Constitution compliance**: All tasks follow patterns defined in [constitution.md](../input/constitution.md)
- **Baseline context**: Tasks designed for implementing baseline specification from [spec.md](./spec.md)

---

## Task Summary

| Phase | User Story | Task Count | Priority | Dependencies |
|-------|------------|------------|----------|--------------|
| 1 | Setup | 11 | - | None |
| 2 | Foundational | 31 | - | Phase 1 |
| 3 | US7 - Authentication | 11 | P1 | Phase 2 (BLOCKS all others) |
| 4 | US1 - User Management | 18 | P1 | Phase 3 |
| 5 | US2 - User Approval | 12 | P1 | Phase 3 (integrates US1, US3, US4) |
| 6 | US3 - Account Management | 11 | P2 | Phase 3 |
| 7 | US4 - Role Management | 11 | P2 | Phase 3, US5 |
| 8 | US5 - Scope Management | 11 | P2 | Phase 3 |
| 9 | US6 - OAuth2 Client Mgmt | 11 | P2 | Phase 3, US5 |
| 10 | US8 - Self-Service | 10 | P3 | Phase 3 |
| 11 | Polish | 13 | - | All user stories |
| **Total** | **8 User Stories** | **150** | - | - |

**Parallel Opportunities**: 45 tasks marked [P] can execute concurrently
**Independent Stories**: US1, US3, US5, US8 (can develop in parallel after US7)
**Integrated Stories**: US2 (uses US1, US3, US4), US4 (uses US5), US6 (uses US5)
