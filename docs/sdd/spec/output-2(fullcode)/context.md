# UIDAM Portal - Agent Context

**Created**: 2026-02-03  
**Purpose**: AI agent context for development assistance  
**Last Updated**: 2026-02-03

---

## Technology Stack Summary

### Core Framework
- **React 18.2.0**: Functional components with hooks, concurrent features
- **TypeScript 5.2.2**: Strict mode, ES2022 target
- **Vite 5.0.8**: Build tool with HMR, development proxy

### UI & Styling
- **Material-UI 5.15.0**: Component library (Button, TextField, Table, Dialog, etc.)
- **MUI X Data Grid 6.18.0**: Advanced tables with sorting, pagination, filtering
- **Emotion 11.11.1**: CSS-in-JS (MUI's styling engine)
- **clsx 2.0.0**: Class name utility

### State Management
- **Redux Toolkit 2.0.1**: Global auth state (user, tokens, login status)
- **TanStack React Query 5.14.2**: Server state, caching, mutations
- **React Hook Form 7.48.2**: Form state and validation

### HTTP & APIs
- **Axios 1.6.2**: HTTP client with interceptors
- **API Gateway**: All requests routed through gateway with bearer token

### Routing
- **React Router 6.20.1**: Client-side routing, protected routes, lazy loading

### Testing
- **Jest 29.7.0**: Test runner
- **React Testing Library 14.1.2**: Component testing
- **@testing-library/user-event 14.5.1**: User interaction simulation

### Utilities
- **lodash 4.17.21**: Utility functions
- **date-fns 3.0.6**: Date manipulation
- **yup 1.4.0**: Schema validation

---

## Key Architectural Patterns

### 1. OAuth2 PKCE Authentication

**Implementation**: `src/services/auth.service.ts`

```typescript
// PKCE Flow Steps:
// 1. Generate code_verifier (32-byte random, base64url)
// 2. Generate code_challenge (SHA-256(verifier), base64url)
// 3. Store code_verifier in sessionStorage
// 4. Redirect to /oauth2/authorize with challenge
// 5. Handle callback with authorization code
// 6. Exchange code + verifier for tokens
// 7. Store tokens in sessionStorage
// 8. Automatic refresh on 401 via Axios interceptor
```

**Storage**: sessionStorage for tokens (access_token, refresh_token)

### 2. Hybrid State Management

**Redux**: Authentication state only (global, persistent across navigation)
- `authSlice.ts`: User profile, token expiry, login status
- Actions: loginSuccess, loginFailure, logout, refreshToken

**React Query**: All API data (server state with caching)
- Automatic refetching, stale-while-revalidate
- Optimistic updates for mutations
- Query keys: `['users', filters]`, `['roles']`, `['accounts', filters]`

**React Hook Form**: Form state (local, isolated)
- Form validation (yup schemas)
- Error messages per field
- Controlled components with Material-UI

### 3. Service Layer Pattern

**Convention**: All API calls isolated in `src/services/`

```typescript
// src/services/userService.ts
export const getUsers = async (filters: UserFilterRequest): Promise<User[]> => {
  const response = await apiClient.get('/v1/users', { params: filters });
  return handleApiResponse(response);
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const response = await apiClient.post('/v1/users', userData);
  return handleApiResponse(response);
};
```

**Never call Axios directly in components** - always use service functions.

### 4. Axios Interceptors

**Request Interceptor** (`src/services/api-client.ts`):
- Attach `Authorization: Bearer <token>` header
- Add `X-Correlation-ID: <uuid>` for tracing
- Add `user-id` from JWT claims

**Response Interceptor**:
- Detect 401 (token expired) → attempt refresh
- If refresh succeeds → retry original request
- If refresh fails → logout and redirect to login
- Extract error messages for user display

### 5. Component Patterns

**Feature Module Structure**:
```typescript
src/features/user-management/
  ├── components/
  │   ├── UserManagement.tsx        // Main feature component
  │   ├── CreateUserModal.tsx       // Create dialog
  │   └── EditUserModal.tsx         // Edit dialog
  ├── hooks/
  │   ├── useUsers.ts               // React Query hook for fetching
  │   ├── useCreateUser.ts          // Mutation hook for creation
  │   └── useUpdateUser.ts          // Mutation hook for updates
  └── index.ts                      // Public exports
```

**Custom Hook Pattern**:
```typescript
// src/features/user-management/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@services/userService';

export const useUsers = (filters: UserFilterRequest) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
};
```

### 6. Error Handling Strategy

**User-Friendly Messages**:
```typescript
// src/utils/errorUtils.ts
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;  // Backend error message
  }
  if (error.code === 'NETWORK_ERROR') {
    return 'Network connection lost. Please check your internet.';
  }
  return 'An unexpected error occurred. Please try again.';
};
```

**Structured Logging**:
```typescript
// src/utils/logger.ts
export const logger = {
  error: (context: string, error: any, metadata?: object) => {
    console.error(`[${context}]`, {
      message: error.message,
      correlationId: metadata?.correlationId,
      // Never log tokens, passwords, or PII
    });
  }
};
```

### 7. Accessibility Conventions

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<header>`)
- Add ARIA labels for icon buttons: `aria-label="Delete user"`
- Support keyboard navigation (Tab, Enter, Escape)
- MUI components have built-in ARIA support
- Test with screen readers (NVDA, JAWS)

### 8. Testing Conventions

**React Testing Library** - Test user behavior, not implementation:

```typescript
// ❌ Don't test implementation
expect(component.state.isOpen).toBe(true);

// ✅ Test user-visible behavior
expect(screen.getByRole('dialog')).toBeInTheDocument();
```

**Test Structure**:
```typescript
describe('UserManagement', () => {
  it('displays loading state while fetching users', () => {
    render(<UserManagement />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays user list after loading', async () => {
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('john.doe')).toBeInTheDocument();
    });
  });
});
```

---

## File Path Conventions

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@config/*": ["./src/config/*"],
      "@features/*": ["./src/features/*"]
    }
  }
}
```

**Usage in imports**:
```typescript
import { User } from '@types/user.types';
import { useUsers } from '@features/user-management/hooks/useUsers';
import { apiClient } from '@services/api-client';
```

---

## Environment Configuration

### Development (`public/config.json`)

```json
{
  "apiGatewayUrl": "http://localhost:8080/api",
  "authServerUrl": "http://localhost:9000",
  "clientId": "uidam-portal",
  "redirectUri": "http://localhost:3000/auth/callback",
  "scopes": "openid profile email ManageUsers ManageAccounts ManageUserRolesAndPermissions OAuth2ClientMgmt"
}
```

### Vite Proxy (vite.config.ts)

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      }
    }
  }
});
```

---

## Code Quality Standards

### TypeScript Strict Mode

- **No `any` type**: Use `unknown` if type is uncertain, then narrow
- **Explicit return types**: For public functions
- **Interface over type**: For object shapes
- **Readonly arrays**: `readonly string[]` for immutable data

### ESLint Rules

- `no-console`: Error (use logger utility)
- `@typescript-eslint/no-explicit-any`: Error
- `react-hooks/exhaustive-deps`: Warn
- `react/jsx-key`: Error

### Naming Conventions

- **Components**: PascalCase (`UserManagement.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUsers.ts`)
- **Services**: camelCase with service suffix (`userService.ts`)
- **Types/Interfaces**: PascalCase (`User`, `CreateUserRequest`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

---

## Performance Optimizations

### Code Splitting

```typescript
// src/router.tsx
const UserManagement = lazy(() => import('@features/user-management'));
const AccountManagement = lazy(() => import('@features/account-management'));
```

### React.memo for Expensive Components

```typescript
export const UserTable = React.memo(({ users }: UserTableProps) => {
  // Only re-renders if users prop changes
});
```

### useCallback for Event Handlers

```typescript
const handleDelete = useCallback((userId: number) => {
  deleteUserMutation.mutate(userId);
}, [deleteUserMutation]);
```

### React Query Caching

```typescript
queryClient.setQueryDefaults(['users'], {
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## Security Best Practices

### Token Storage

✅ **Use sessionStorage** (not localStorage)
- Tokens cleared on browser close
- Limited to single tab
- Reduced XSS attack surface

❌ **Never**:
- Log tokens in console
- Store tokens in localStorage
- Include tokens in error messages

### Input Sanitization

```typescript
// Client-side validation only for UX
// Backend enforces all security rules
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');  // Basic XSS prevention
};
```

### CORS Handling

- **Development**: Vite proxy (no CORS issues)
- **Production**: nginx reverse proxy

---

## Common Pitfalls

### ❌ Don't

- Use `any` type
- Call Axios directly in components
- Mutate Redux state directly (use Immer via Redux Toolkit)
- Skip error handling
- Leave console.log statements
- Test implementation details
- Hardcode API URLs
- Store sensitive data in localStorage

### ✅ Do

- Use TypeScript strict mode
- Use service layer for API calls
- Use React Query for server state
- Use React Hook Form for forms
- Handle all error states
- Use logger utility for debugging
- Test user-visible behavior
- Load config from public/config.json
- Use sessionStorage for tokens

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
# Vite server: http://localhost:3000
# Auto-reload on file changes
```

### 2. Type Check

```bash
npm run type-check
# Runs tsc --noEmit (no compilation, just type checking)
```

### 3. Lint

```bash
npm run lint
# ESLint check

npm run lint:fix
# Auto-fix linting issues
```

### 4. Test

```bash
npm test
# Run all tests

npm run test:watch
# Watch mode for development

npm run test:coverage
# Generate coverage report
```

### 5. Build

```bash
npm run build
# TypeScript compilation + Vite build
# Output: dist/
```

---

## Manual Additions Section

<!-- BEGIN MANUAL ADDITIONS -->
<!-- Add custom agent context below this line -->
<!-- AI agents should preserve this section -->

<!-- END MANUAL ADDITIONS -->

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-03 | Initial context creation for UIDAM Portal baseline |
