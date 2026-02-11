# UIDAM Web Admin Portal - Implementation Plan

**Created**: 2026-02-03  
**Baseline Specification**: [spec.md](./spec.md)  
**Purpose**: Technical implementation plan for UIDAM Portal baseline features

---

## Executive Summary

**Primary Requirement**: Implement a secure, enterprise-grade Single Page Application (SPA) for UIDAM platform administration, providing comprehensive user, account, role, scope, and OAuth2 client management capabilities.

**Technical Approach**: React 18-based SPA with TypeScript strict mode, Material-UI component library, OAuth2 PKCE authentication, Redux Toolkit + React Query state management, and RESTful API integration via Axios HTTP client. The application follows a feature-based modular architecture with clear separation between presentation, business logic, and API layers.

---

## Technical Context

**Language/Version**: TypeScript 5.2.2 with strict mode enabled, targeting ES2022

**Primary Dependencies**:
- React 18.2.0 (UI framework, functional components with hooks)
- Material-UI (MUI) 5.15.0 (component library and design system)
- Redux Toolkit 2.0.1 (global state management for auth)
- TanStack React Query 5.14.2 (server state management and caching)
- Axios 1.6.2 (HTTP client with interceptors)
- React Router 6.20.1 (client-side routing)
- React Hook Form 7.48.2 + Yup 1.4.0 (form state management and validation)
- date-fns 3.0.6 (date/time formatting and manipulation)

**Storage**:
- sessionStorage: OAuth2 tokens (access_token, refresh_token), code_verifier
- sessionStorage: User profile and authentication state
- React Query cache: API response caching (in-memory)

**Testing**:
- Jest 29.7.0 (test runner and assertion library)
- React Testing Library 14.1.2 (component testing)
- @testing-library/user-event 14.5.1 (user interaction simulation)
- Target: >80% coverage for critical paths (user management, auth, approval workflows)

**Target Platform**:
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Desktop and tablet responsive layouts (mobile view supported but not optimized)
- Development: Node.js 19.5.0+, npm 9.0.0+

**Build Tool**:
- Vite 5.0.8 (development server with HMR, production builds)
- TypeScript compiler (tsc) for type checking
- ESLint 8.55.0 for code quality
- Prettier 3.1.1 for code formatting

**State Management**:
- Redux Toolkit: Authentication state (user profile, tokens, login status)
- React Query: API data fetching, caching (5min staleTime for dynamic data, 30min for static), synchronization, optimistic updates
- React Hook Form: Form state and validation (Yup schemas)
- Context API: Theme configuration (light/dark mode via MUI Theme Provider)

**Routing**:
- React Router 6.20.1 with declarative routing
- Protected routes with authentication guard
- OAuth2 callback route for authorization code handling
- Lazy loading for feature modules (code splitting)

**UI Framework**:
- Material-UI (MUI) 5.15.0: Core components (Button, TextField, Table, Dialog, Snackbar for notifications, CircularProgress for loading states)
- MUI X Data Grid 6.18.0: Advanced data tables with sorting, pagination, filtering, built-in row virtualization for 10k+ rows
- MUI Icons 5.17.1: Icon library
- Emotion 11.11.1: CSS-in-JS styling (MUI's styling engine)
- MUI Theme Provider: Light/dark mode with custom palette (primary, secondary, error colors)

**Performance Goals**:
- Initial page load (TTI): <3 seconds on standard broadband
- User search response time: <1 second for 10,000 users (with pagination)
- Bundle size: <800KB gzipped (main bundle)
- UI responsiveness: Visual feedback within 200ms for all user actions
- 60fps animations for transitions and loading states

**Constraints**:
- OAuth2 PKCE flow mandatory (RFC 7636 compliance, Web Crypto API for code_verifier/challenge generation)
- API Gateway: All backend requests routed through gateway with bearer token
- CORS: Development uses Vite proxy, production uses nginx reverse proxy
- Accessibility: WCAG 2.1 AA compliance (keyboard navigation, ARIA labels, semantic HTML)
- Security: OWASP best practices (input sanitization, secure token storage in sessionStorage, no sensitive logging)
- Multi-tenancy: tenantId header enriched by API Gateway from JWT claims
- Error Boundaries: Feature-level isolation (one per feature module)
- Search Debouncing: Custom useDebounce hook (minimize API calls per NFR-1)

**Scale/Scope**:
- User base: 1000+ concurrent administrators across multi-tenant deployment
- Data scale: 10,000+ users, 500+ accounts, 100+ roles, 200+ scopes per tenant
- Feature modules: 8 major features (user mgmt, account mgmt, role mgmt, scope mgmt, client mgmt, approval workflow, self-service, dashboard)
- Routes: 20+ application routes with lazy loading
- API endpoints: 30+ RESTful endpoints across User Management and Authorization services

---

## Project Structure

```
uidam-portal/
├── src/
│   ├── features/                    # Feature modules (feature-based organization)
│   │   ├── auth/                    # Authentication (login, OAuth callback, logout)
│   │   │   ├── components/          # Login page, OAuth callback handler
│   │   │   ├── hooks/               # useAuth, useOAuthCallback
│   │   │   └── index.ts             # Public exports
│   │   ├── user-management/         # User CRUD, search, status management
│   │   │   ├── components/          # UserManagement, CreateUserModal, EditUserModal
│   │   │   ├── hooks/               # useUsers, useCreateUser, useUpdateUser
│   │   │   └── index.ts
│   │   ├── user-approval/           # User approval workflow
│   │   │   ├── components/          # UserApproval, ApprovalDialog
│   │   │   ├── hooks/               # usePendingUsers, useApproveUser
│   │   │   └── index.ts
│   │   ├── account-management/      # Account CRUD, hierarchy management
│   │   │   ├── components/          # AccountManagement, CreateAccountModal
│   │   │   ├── hooks/               # useAccounts, useCreateAccount
│   │   │   └── index.ts
│   │   ├── role-management/         # Role CRUD, scope assignment
│   │   │   ├── components/          # RoleManagement, CreateRoleModal
│   │   │   ├── hooks/               # useRoles, useCreateRole
│   │   │   └── index.ts
│   │   ├── scope-management/        # Scope CRUD
│   │   │   ├── components/          # ScopeManagement, CreateScopeModal
│   │   │   ├── hooks/               # useScopes, useCreateScope
│   │   │   └── index.ts
│   │   ├── client-management/       # OAuth2 client registration
│   │   │   ├── components/          # ClientManagement, RegisterClientModal
│   │   │   ├── hooks/               # useClients, useRegisterClient
│   │   │   └── index.ts
│   │   ├── self-service/            # User profile management
│   │   │   ├── components/          # ProfileView, ChangePassword
│   │   │   ├── hooks/               # useProfile, useChangePassword
│   │   │   └── index.ts
│   │   └── dashboard/               # Admin dashboard overview
│   │       ├── components/          # Dashboard, MetricsCard, ActivityFeed
│   │       └── index.ts
│   │
│   ├── components/                  # Shared/reusable components
│   │   ├── layout/                  # ManagementLayout, Sidebar, Header
│   │   ├── ProtectedRoute.tsx       # Authentication guard for routes
│   │   ├── ErrorBoundary.tsx        # Global error boundary
│   │   └── LoadingSpinner.tsx       # Loading indicator
│   │
│   ├── services/                    # API integration layer
│   │   ├── api-client.ts            # Axios instance with interceptors
│   │   ├── apiUtils.ts              # Response handlers, header builders
│   │   ├── auth.service.ts          # OAuth2 PKCE flow, token management
│   │   ├── userService.ts           # User Management API integration
│   │   ├── accountService.ts        # Account Management API integration
│   │   ├── roleService.ts           # Role Management API integration
│   │   ├── scopeService.ts          # Scope Management API integration
│   │   └── clientService.ts         # Client Registration API integration
│   │
│   ├── store/                       # Redux state management
│   │   ├── index.ts                 # Store configuration
│   │   ├── authSlice.ts             # Authentication state slice
│   │   └── hooks.ts                 # Typed useSelector/useDispatch hooks
│   │
│   ├── hooks/                       # Shared custom hooks
│   │   ├── useDebounce.ts           # Debounce for search inputs
│   │   ├── useNotification.ts       # Toast notifications (snackbar)
│   │   └── usePageTitle.ts          # Dynamic page title management
│   │
│   ├── utils/                       # Utility functions
│   │   ├── logger.ts                # Client-side logging utility
│   │   ├── validators.ts            # Input validation helpers
│   │   ├── formatters.ts            # Date/time/string formatters
│   │   └── errorUtils.ts            # Error message mapping
│   │
│   ├── types/                       # Global TypeScript types
│   │   ├── user.types.ts            # User entity and API types
│   │   ├── account.types.ts         # Account entity types
│   │   ├── role.types.ts            # Role entity types
│   │   ├── scope.types.ts           # Scope entity types
│   │   ├── client.types.ts          # OAuth2 client types
│   │   └── api.types.ts             # Generic API response types
│   │
│   ├── config/                      # Application configuration
│   │   ├── app.config.ts            # Runtime config (API URLs, OAuth settings)
│   │   └── theme.config.ts          # Material-UI theme customization
│   │
│   ├── App.tsx                      # Root application component
│   ├── main.tsx                     # Application entry point
│   └── router.tsx                   # Route definitions
│
├── public/
│   ├── config.json                  # Runtime configuration (loaded at startup)
│   └── index.html                   # HTML template
│
├── tests/                           # Test utilities and fixtures
│   ├── setup.ts                     # Jest setup
│   └── mocks/                       # Mock data and services
│
├── .env.development                 # Development environment variables
├── .env.production                  # Production environment variables
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript compiler options
├── jest.config.js                   # Jest test configuration
├── package.json                     # Dependencies and scripts
├── Dockerfile                       # Production containerization
├── nginx.conf                       # Production web server config
└── README.md                        # Project documentation
```

**Key Architectural Decisions**:
1. **Feature-based organization**: Each feature module is self-contained with components, hooks, and types
2. **Service layer abstraction**: All API calls isolated in service modules, not directly in components
3. **Type safety**: Comprehensive TypeScript interfaces for all entities and API contracts
4. **State separation**: Redux for auth (global), React Query for API data (server state), Hook Form for forms (local)
5. **Component reusability**: Shared components in `/components`, feature-specific in `/features/{feature}/components`

---

## Phase 0: Prerequisites & Setup

### Environment Verification
- [x] Node.js 19.5.0+ installed
- [x] npm 9.0.0+ installed
- [x] UIDAM Authorization Server accessible
- [x] UIDAM User Management API accessible
- [x] OAuth2 client registered for portal (clientId: `uidam-portal`)

### Development Environment
- [x] TypeScript 5.2.2 with strict mode
- [x] Vite 5.0.8 configured with React plugin
- [x] ESLint + Prettier configured
- [x] Jest + React Testing Library configured
- [x] Material-UI theme customization applied

### Configuration Files
- [x] `vite.config.ts`: Proxy configuration for API Gateway (development)
- [x] `tsconfig.json`: Strict mode, path aliases (@components, @services, @types, etc.)
- [x] `public/config.json`: Runtime configuration (API URLs, OAuth endpoints)
- [x] `.env.development`: Development-specific environment variables

---

## Phase 1: Design & Contracts

### Data Model Generation
**Output**: `./sdd/output/data-model.md`

Extract and document entities from LLD specifications:

1. **User Entity** (from UIDAM-user-Management-API.md)
   - Fields: id, userName, email, firstName, lastName, status, roles, accounts, etc.
   - Validation: Username pattern, email format, password policy
   - Status enum: ACTIVE, INACTIVE, PENDING, BLOCKED, REJECTED, DELETED, DEACTIVATED

2. **Account Entity** (from UIDAM-Account-Management-API.md)
   - Fields: accountId, accountName, parentId, roles, status
   - Validation: Unique accountName, valid parentId reference
   - Status enum: active, disabled

3. **Role Entity** (from UIDAM-Roles-Scopes-API.md)
   - Fields: id, name, description, scopeNames
   - Validation: Unique name, required description
   - Relationships: Many-to-many with Scopes

4. **Scope Entity** (from UIDAM-Roles-Scopes-API.md)
   - Fields: id, name, description
   - Validation: Unique name
   - Relationships: Many-to-many with Roles

5. **OAuth2 Client Entity** (from UIDAM-Client-Registration-API.md)
   - Fields: clientId, clientSecret, clientName, redirectUris, grantTypes, scopes
   - Validation: Unique clientId, valid URIs
   - Grant types: authorization_code, refresh_token, client_credentials

**Verification**: Cross-reference each entity against LLD entity diagrams

### API Contracts Generation
**Output**: `./sdd/output/contracts.md`

Extract and document API endpoints from HLD/LLD:

**User Management APIs**:
- `POST /v1/users` - Create user (internal admin creation)
- `GET /v1/users` - List users with pagination/filters
- `GET /v1/users/{id}` - Get user by ID
- `PUT /v1/users/{id}` - Update user
- `DELETE /v1/users/{id}` - Delete user
- `POST /v2/users/approve` - Approve pending user

**Account Management APIs**:
- `POST /v1/accounts` - Create account
- `GET /v1/accounts/{accountId}` - Get account
- `POST /v1/accounts/filter` - Filter accounts with pagination
- `POST /v1/accounts/{accountId}` - Update account
- `DELETE /v1/accounts/{accountId}` - Delete account

**Role Management APIs**:
- `POST /v1/roles` - Create role
- `GET /v1/roles/{name}` - Get role by name
- `POST /v1/roles/filter` - Filter roles
- `PATCH /v1/roles/{name}` - Update role
- `DELETE /v1/roles/{name}` - Delete role

**Scope Management APIs**:
- `POST /v1/scopes` - Create scope
- `GET /v1/scopes` - List all scopes
- `GET /v1/scopes/{name}` - Get scope by name
- `PATCH /v1/scopes/{name}` - Update scope
- `DELETE /v1/scopes/{name}` - Delete scope

**OAuth2 Client APIs**:
- `POST /v2/client-registrations` - Register client
- `GET /v2/client-registrations` - List clients
- `GET /v2/client-registrations/{clientId}` - Get client
- `PUT /v2/client-registrations/{clientId}` - Update client
- `DELETE /v2/client-registrations/{clientId}` - Delete client

**Authentication APIs**:
- `GET /oauth2/authorize` - OAuth2 authorization endpoint
- `POST /oauth2/token` - Token exchange/refresh endpoint
- `POST /oauth2/revoke` - Token revocation endpoint

**Verification**: Cross-reference each endpoint against HLD/LLD sequence diagrams

### Agent Context Update
**Output**: `./sdd/output/context.md`

Create agent context file documenting:
- Technology stack summary
- Key architectural patterns (OAuth2 PKCE, Redux + React Query hybrid state)
- Service layer conventions (Axios interceptors, correlation headers)
- Component patterns (functional components, custom hooks, Material-UI)
- Testing conventions (React Testing Library, user behavior testing)
- Error handling strategies (user-friendly messages, structured logging)

---

## Constitution Check

### Pre-Implementation Verification

Review [constitution.md](../input/constitution.md) compliance:

- [x] **Follow Existing Patterns**: All implementations must analyze and match existing codebase patterns
- [x] **TypeScript First**: Strict mode enabled, no `any` types, all interfaces exported
- [x] **Component Architecture**: Functional components only, <300 lines, custom hooks for logic
- [x] **State Management**: Redux for auth, React Query for API data, Hook Form for forms
- [x] **Testing**: React Testing Library for all components, >80% coverage target
- [x] **API Integration**: Service layer pattern, correlation headers, consistent error handling
- [x] **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- [x] **Performance**: Lazy loading, React.memo, useCallback/useMemo, virtualization
- [x] **Error Handling**: User-friendly messages, context logging, no stack traces to users
- [x] **Security**: No sensitive logging, input sanitization, secure token storage

### Post-Design Evaluation

After generating data-model.md and contracts.md:
- [ ] Verify all entities match LLD specifications exactly
- [ ] Verify all API endpoints match HLD/LLD documentation
- [ ] Confirm no deviations from documented designs
- [ ] Validate TypeScript interfaces align with API contracts
- [ ] Review error response handling for each endpoint

---

## Implementation Workflow

### Step 1: Core Infrastructure
1. Setup authentication service (OAuth2 PKCE flow)
2. Configure Redux store with auth slice
3. Setup Axios client with token interceptors
4. Implement ProtectedRoute component
5. Create error boundary and logging utilities

### Step 2: User Management Feature
1. Create User entity types and API service
2. Implement UserManagement component with MUI DataGrid
3. Build CreateUserModal with validation
4. Implement search and pagination
5. Add tests for user CRUD operations

### Step 3: Account Management Feature
1. Create Account entity types and API service
2. Implement AccountManagement component
3. Build account hierarchy visualization
4. Add account filtering and search
5. Test account CRUD workflows

### Step 4: Role & Scope Management
1. Create Role and Scope entity types
2. Implement RoleManagement and ScopeManagement components
3. Build scope assignment interface for roles
4. Add role/scope filtering
5. Test role-scope associations

### Step 5: OAuth2 Client Management
1. Create Client entity types and service
2. Implement ClientManagement component
3. Build client registration form with validation
4. Display client credentials securely (one-time view)
5. Test client registration and updates

### Step 6: Approval Workflow
1. Create approval service and types
2. Implement UserApproval component
3. Build approval dialog with account/role assignment
4. Add approve/reject actions
5. Test approval workflow end-to-end

### Step 7: Self-Service & Dashboard
1. Implement ProfileView component
2. Build ChangePassword component
3. Create Dashboard with metrics
4. Add activity feed
5. Test all self-service features

### Step 8: Integration & E2E Testing
1. End-to-end user flows testing
2. Cross-browser compatibility testing
3. Performance optimization
4. Accessibility audit
5. Security review

---

## Deliverables

1. **data-model.md**: Complete entity definitions with TypeScript interfaces
2. **contracts.md**: API endpoint documentation with request/response schemas
3. **context.md**: Agent context for AI-assisted development
4. **Implementation roadmap**: Phased development plan with verification gates

---

## Notes

- **Baseline Implementation**: This plan documents the existing UIDAM Portal implementation, not a greenfield project
- **LLD Adherence**: All entities and APIs strictly follow LLD specifications (no improvisation)
- **Extensibility**: Architecture supports future enhancements (MFA, audit logging, custom branding)
- **Testing Strategy**: Unit tests for all components/services, integration tests for critical workflows
- **Performance**: Lazy loading and code splitting reduce initial bundle size
- **Security**: OAuth2 PKCE flow, secure token storage, input sanitization, OWASP compliance

---

## User Clarifications

### Session 2026-02-03

The following technical implementation choices were approved after analyzing undefined areas in constitution.md, HLD, and LLD:

1. **Form Validation**: React Hook Form 7.48.2 + Yup 1.4.0 (already in dependencies, declarative schema validation, TypeScript support)

2. **Date/Time Formatting**: date-fns 3.0.6 (already in dependencies, tree-shakeable, functional approach)

3. **Table Virtualization**: MUI X Data Grid 6.18.0 built-in row virtualization (already installed, handles 10,000+ rows smoothly, meets NFR-1 performance goals)

4. **Search Debouncing**: Custom useDebounce hook (lightweight, no additional dependencies, aligns with constitution's "Extract logic into custom hooks" pattern)

5. **Notifications/Toasts**: MUI Snackbar + Custom useNotification hook (built-in MUI component, consistent with UI framework, follows constitution patterns)

6. **API Response Caching**: 
   - Dynamic data (users, accounts): 5-minute staleTime
   - Static data (roles, scopes): 30-minute staleTime
   - Balanced freshness/performance approach

7. **Loading State Management**: React Query `isLoading` + MUI CircularProgress (automatic loading state from React Query, MUI consistency)

8. **Error Boundary Strategy**: Feature-level ErrorBoundaries (one per feature module: user-management, account-management, role-management, etc. - provides isolation without over-engineering)

9. **Theme Customization**: MUI Theme Provider with custom palette (built-in MUI theming, light/dark mode toggle, primary/secondary/error colors)

10. **OAuth2 PKCE Code Verifier**: Web Crypto API (crypto.randomValues for verifier generation, crypto.subtle.digest for SHA-256 challenge, browser-native, cryptographically secure, no dependencies)

**Rationale**: All choices prioritize using already-installed dependencies (from package.json), following constitution patterns (custom hooks, TypeScript strict, functional components), meeting NFR requirements (performance, accessibility, security), and minimizing additional dependencies.
