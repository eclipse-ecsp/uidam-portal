# Agent Context: UIDAM Portal Password Reset Feature

**Version**: 1.0  
**Created**: February 3, 2026  
**Purpose**: Provide technology stack and architectural context for AI agents implementing the password reset feature  
**Source**: [constitution.md](../input/constitution.md), [plan.md](./plan.md), package.json

---

## Technology Stack

### Core Framework

**React 18.2.0**
- **Component Model**: Functional components only (no class components)
- **Hooks**: All React hooks permitted (useState, useEffect, useContext, etc.)
- **Custom Hooks**: Encouraged for shared logic
- **Refs**: useRef for DOM access and mutable values
- **Patterns**: Component composition, render props (when needed)

**TypeScript 5.2.2**
- **Mode**: Strict mode enabled (`strict: true` in tsconfig.json)
- **Compilation Target**: ECMAScript 2022 (ES2022)
- **Module System**: ESNext (compiled to ES modules)
- **Type Safety**: All props, state, and function signatures must be typed
- **Any Usage**: Avoid `any` - use `unknown` or proper types
- **Generics**: Use for reusable components and utilities

### UI Component Library

**Material-UI (MUI) 5.15.0**
- **Import Pattern**: Named imports from `@mui/material`
- **Theming**: Use global theme via `ThemeProvider` (already configured)
- **Component Customization**: Use `sx` prop for one-off styles, `styled()` for reusable
- **Icons**: Material Icons from `@mui/icons-material`
- **Responsive**: Use `useMediaQuery` for breakpoint detection
- **Accessibility**: All MUI components are WCAG 2.1 Level AA compliant out of box

**Key Components for Password Reset**:
- `TextField` - form inputs with validation states
- `Button` - action buttons
- `Alert` - success/error messages
- `LinearProgress` - password strength indicator
- `IconButton` - show/hide password toggle
- `FormControl`, `FormHelperText` - form structure
- `Typography` - text styles
- `Box`, `Stack` - layout containers

### Form Management

**React Hook Form 7.48.2**
- **Registration**: Use `register()` for inputs
- **Validation**: Combine with Yup schemas via `yupResolver`
- **State**: Access via `formState.errors`, `formState.isSubmitting`
- **Submission**: `handleSubmit()` wrapper
- **Watch**: `watch()` for reactive fields (e.g., password strength)
- **Reset**: `reset()` after submission
- **Mode**: Validate on blur + submit (default)

**Yup 1.4.0**
- **Schema Definition**: Define validation schemas as constants
- **Composition**: Compose schemas from reusable validators
- **Custom Validators**: Use `.test()` for password policy checks
- **Type Inference**: Use `InferType<typeof schema>` for TypeScript types
- **Error Messages**: Provide user-friendly messages in schema

**Example Pattern**:
```typescript
const passwordResetSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .test('policy', 'Does not meet policy', (value) => validatePolicy(value)),
  confirmPassword: yup.string()
    .required('Please confirm password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

type PasswordResetForm = yup.InferType<typeof passwordResetSchema>;
```

### State Management

**React Query 5.14.2 (@tanstack/react-query)**
- **Usage**: Server state management (API calls, caching)
- **Queries**: Use `useQuery` for GET requests
- **Mutations**: Use `useMutation` for POST/PUT/DELETE
- **Invalidation**: Invalidate queries after mutations
- **Error Handling**: Handle errors in `onError` callback
- **Loading States**: Access via `isLoading`, `isFetching`, `isSuccess`
- **Retry Logic**: Configure per-query (default: 3 retries)
- **Cache Time**: 5 minutes stale time for password policy

**Redux Toolkit 2.0.1**
- **Usage**: Global app state (auth, user session)
- **Slices**: Use `createSlice()` for state + reducers
- **Async Actions**: Use `createAsyncThunk()` for side effects
- **Selectors**: Use `useSelector()` hook in components
- **Dispatch**: Use `useDispatch()` hook
- **For Password Reset**: Access auth state for token, update auth on password change

**Local Component State**
- **Usage**: UI state (form inputs, toggles, modals)
- **Hooks**: useState, useReducer (for complex state)
- **Form State**: Managed by React Hook Form (don't duplicate in useState)

### HTTP Client

**Axios 1.6.2**
- **Base Instance**: Pre-configured in `src/services/api.ts`
- **Interceptors**: Request interceptor adds auth headers
- **Error Handling**: Response interceptor handles common errors (401, 500)
- **Timeout**: 30 seconds default
- **CORS**: Handled by API Gateway
- **Cancellation**: Use `AbortController` for cleanup

**API Service Pattern**:
```typescript
// src/services/userService.ts
class UserService {
  static async resetPassword() {
    return api.post('/v1/users/self/recovery/forgot-password');
  }
}
```

### Build Tool

**Vite 5.0.8**
- **Dev Server**: HMR enabled, proxy to backend
- **Build**: Optimized production bundle
- **Env Variables**: Prefix with `VITE_` to expose to client
- **Plugins**: React plugin, TypeScript support
- **Import Aliases**: `@/` → `src/`
- **CSS**: CSS modules, PostCSS support

### Testing

**Jest 29.7.0 + React Testing Library**
- **Test Location**: `__tests__/` folders alongside source
- **Naming**: `ComponentName.test.tsx`
- **Coverage**: Target >80% line coverage
- **Mocking**: Mock API calls with `jest.mock()`
- **Assertions**: Use `@testing-library/jest-dom` matchers
- **User Events**: `@testing-library/user-event` for interactions
- **Queries**: Prefer accessible queries (`getByRole`, `getByLabelText`)

**Test Pattern**:
```typescript
describe('PasswordResetForm', () => {
  it('validates password policy', async () => {
    render(<PasswordResetForm />);
    const input = screen.getByLabelText('New Password');
    await userEvent.type(input, 'weak');
    expect(screen.getByText(/does not meet policy/i)).toBeInTheDocument();
  });
});
```

---

## Architecture Patterns

### Component Structure

**Feature Module Pattern**:
```
src/features/self-service/password-reset/
├── components/
│   ├── PasswordResetForm.tsx
│   ├── PasswordStrengthIndicator.tsx
│   └── __tests__/
│       ├── PasswordResetForm.test.tsx
│       └── PasswordStrengthIndicator.test.tsx
├── hooks/
│   ├── usePasswordResetMutation.ts
│   ├── usePasswordPolicy.ts
│   └── usePasswordStrength.ts
├── schemas/
│   └── passwordResetSchema.ts
├── types/
│   └── passwordReset.types.ts
└── utils/
    └── passwordValidator.ts
```

**Component Hierarchy**:
```
ProfilePage
  └── PasswordResetForm (smart component)
        ├── TextField (MUI) - current password
        ├── TextField (MUI) - new password
        ├── PasswordStrengthIndicator (dumb component)
        ├── TextField (MUI) - confirm password
        └── Button (MUI) - submit
```

### Service Layer Pattern

**Separation of Concerns**:
- **Components**: UI rendering, user interactions
- **Hooks**: Business logic, side effects
- **Services**: API communication
- **Utils**: Pure functions, helpers
- **Schemas**: Validation rules

**Service Example**:
```typescript
// src/services/userService.ts
export class UserService {
  static async initiatePasswordReset(): Promise<ApiResponse<PasswordResetResponse>> {
    const response = await api.post('/v1/users/self/recovery/forgot-password');
    return response.data;
  }
  
  static async getPasswordPolicy(): Promise<ApiResponse<PasswordPolicyItem[]>> {
    const response = await api.get('/v1/password-policies');
    return response.data;
  }
}
```

### Custom Hook Pattern

**Data Fetching Hook**:
```typescript
// src/features/self-service/password-reset/hooks/usePasswordPolicy.ts
export const usePasswordPolicy = () => {
  return useQuery({
    queryKey: ['password-policy'],
    queryFn: () => UserService.getPasswordPolicy(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**Mutation Hook**:
```typescript
// src/features/self-service/password-reset/hooks/usePasswordResetMutation.ts
export const usePasswordResetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => UserService.initiatePasswordReset(),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    },
  });
};
```

**Business Logic Hook**:
```typescript
// src/features/self-service/password-reset/hooks/usePasswordStrength.ts
export const usePasswordStrength = (password: string, policy: PasswordPolicy) => {
  const [strength, setStrength] = useState<PasswordStrength>('weak');
  
  useEffect(() => {
    const score = calculateStrength(password, policy);
    setStrength(scoreToStrength(score));
  }, [password, policy]);
  
  return strength;
};
```

### Error Handling Pattern

**Layered Error Handling**:
1. **API Level** (axios interceptor): Log errors, handle 401 globally
2. **Service Level**: Transform API errors to domain errors
3. **Hook Level**: Handle mutation errors, provide error state
4. **Component Level**: Display user-friendly messages

**Example**:
```typescript
const { mutate, error, isError } = usePasswordResetMutation();

// In component JSX:
{isError && (
  <Alert severity="error">
    {error?.message || 'Password reset failed. Please try again.'}
  </Alert>
)}
```

---

## Existing Utilities

### Available Utilities (Reuse Before Creating)

**Location**: `src/utils/`

**String Utilities** (`stringUtils.ts`):
- `isEmpty(str)` - check if string is empty/null/undefined
- `truncate(str, length)` - truncate string with ellipsis
- `capitalize(str)` - capitalize first letter

**Validation Utilities** (`validationUtils.ts`):
- `isValidEmail(email)` - email format validation
- `isValidPhone(phone)` - phone number validation
- Custom validators for Yup schemas

**Date Utilities** (`dateUtils.ts`):
- `formatDate(date, format)` - format dates
- `isExpired(expiresAt)` - check if timestamp expired

**Auth Utilities** (`authUtils.ts`):
- `getAccessToken()` - retrieve token from localStorage
- `getUserId()` - extract user ID from JWT
- `isAuthenticated()` - check if user is logged in

**API Utilities** (`apiUtils.ts`):
- `getApiHeaders()` - construct request headers (Auth, Correlation-ID, user-id)
- `handleApiError(error)` - transform axios errors

### Common Patterns in Codebase

**Loading States**:
```typescript
// Use React Query's built-in states
const { data, isLoading, isError, error } = useQuery(...);

if (isLoading) return <CircularProgress />;
if (isError) return <Alert severity="error">{error.message}</Alert>;
```

**Form Submission**:
```typescript
const { mutate, isLoading } = useMutation(...);

const onSubmit = (data: FormData) => {
  mutate(data, {
    onSuccess: () => {
      // Show success message
      reset(); // Reset form
    },
    onError: (error) => {
      // Show error message
    },
  });
};
```

**Responsive Design**:
```typescript
const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

return (
  <Box sx={{ padding: isMobile ? 2 : 4 }}>
    {/* Content */}
  </Box>
);
```

---

## Environment Configuration

### Environment Variables

**Available Variables** (from `.env`):
```bash
VITE_API_BASE_URL=http://localhost:8080  # Backend API URL
VITE_AUTH_SERVER_URL=http://localhost:9000  # Authorization server
VITE_ENV=development  # Environment (development, staging, production)
```

**Access in Code**:
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

### API Gateway Integration

**Proxy Configuration** (Vite dev server):
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

**Request Flow**:
```
Browser → Vite Dev Server (port 5173) → API Gateway (port 8080) → Backend Services
```

---

## Code Style Guidelines

### TypeScript Conventions

**Naming**:
- **Components**: PascalCase (`PasswordResetForm`)
- **Hooks**: camelCase with `use` prefix (`usePasswordPolicy`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces/Types**: PascalCase (`PasswordResetFormData`)
- **Files**: kebab-case (`password-reset-form.tsx`) OR PascalCase for components (`PasswordResetForm.tsx`)

**Type Definitions**:
- Prefer `interface` for object shapes
- Use `type` for unions, intersections, primitives
- Export types from `types/` directory
- Co-locate component-specific types with component

**Example**:
```typescript
// types/passwordReset.types.ts
export interface PasswordResetFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordPolicyItem {
  policyKey: string;
  description: string;
  required: boolean;
  rules: Record<string, any>;
  priority: number;
}
```

### Import Organization

**Order**:
1. React imports
2. Third-party libraries
3. MUI components
4. Internal utilities/services
5. Types
6. Styles/assets

**Example**:
```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button, Alert } from '@mui/material';
import { UserService } from '@/services/userService';
import { usePasswordPolicy } from './hooks/usePasswordPolicy';
import { PasswordResetFormData } from './types/passwordReset.types';
import { passwordResetSchema } from './schemas/passwordResetSchema';
```

### Component Structure

**Functional Component Template**:
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';

interface ComponentNameProps {
  // Props definition
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  // Destructured props
}) => {
  // Hooks (useState, useEffect, custom hooks)
  
  // Event handlers
  
  // Derived state/memoized values
  
  // Early returns (loading, error states)
  
  // Main JSX return
  return (
    <Box>
      <Typography variant="h6">Component Content</Typography>
    </Box>
  );
};
```

---

## Security Considerations

### Token Management

**Access Token**:
- Stored in `localStorage.getItem('accessToken')`
- Included in `Authorization: Bearer {token}` header
- Expires after 1 hour (handled by auth interceptor)

**Refresh Token**:
- Stored in `localStorage.getItem('refreshToken')`
- Used to obtain new access token
- Expires after 7 days

**Token Revocation**:
- Call `/oauth2/revoke` after password change
- Clear tokens from localStorage
- Redirect to login page

### Input Validation

**Client-Side Validation**:
- Form validation with Yup schemas
- Sanitize user input (automatic with React)
- Validate against password policy

**Server-Side Validation**:
- Always authoritative (never trust client)
- API validates all inputs
- Password policy enforced server-side

### XSS Prevention

**React's Built-in Protection**:
- JSX escapes all values automatically
- Avoid `dangerouslySetInnerHTML`
- Validate URLs before using in href/src

### CSRF Protection

**Token-Based Auth**:
- CSRF not applicable (using JWT, not cookies)
- All state-changing requests require Bearer token

---

## Browser Compatibility

**Supported Browsers**:
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Polyfills**: Not required (ES2022 features supported by all target browsers)

**Testing**: Automated tests run in JSDOM environment (Jest default)

---

## Performance Optimization

### React Query Caching

**Password Policy Query**:
- Stale Time: 5 minutes
- Cache Time: 10 minutes
- Refetch on window focus: true (default)
- Retry: 3 attempts with exponential backoff

### Component Optimization

**Memoization**:
- Use `useMemo` for expensive computations (e.g., password strength calculation)
- Use `useCallback` for event handlers passed to child components
- Use `React.memo` for pure components that re-render frequently

**Code Splitting**:
- Lazy load feature modules if needed: `const PasswordReset = lazy(() => import('./PasswordReset'))`
- Suspense boundaries for loading states

### Bundle Size

**Current Bundle** (from package.json):
- Main chunk: ~800KB (production, gzipped)
- Vendor chunk: ~400KB (React, MUI, dependencies)

**Optimization**:
- Tree-shaking enabled (Vite default)
- Import only needed MUI components
- Avoid large libraries unless necessary

---

## Accessibility (a11y)

### WCAG 2.1 Level AA Compliance

**Keyboard Navigation**:
- All interactive elements focusable via Tab
- Form fields accessible with Tab, Enter, Space
- Focus indicators visible (MUI default)

**Screen Reader Support**:
- Use semantic HTML (`<form>`, `<label>`, `<button>`)
- ARIA labels for icon buttons
- Error messages announced via `aria-live` regions

**Color Contrast**:
- Text: 4.5:1 ratio minimum
- UI components: 3:1 ratio minimum
- MUI theme enforces WCAG AA contrast

**Form Accessibility**:
```typescript
<TextField
  label="New Password"
  id="new-password"
  type={showPassword ? 'text' : 'password'}
  error={!!errors.newPassword}
  helperText={errors.newPassword?.message}
  inputProps={{
    'aria-describedby': 'password-policy-hint',
    'aria-invalid': !!errors.newPassword,
  }}
/>
```

---

## Logging and Monitoring

### Client-Side Logging

**Console Logging**:
- Development: All logs visible
- Production: Errors only (warnings/info filtered)

**Error Tracking**:
- Implement error boundary for React errors
- Log API errors to monitoring service (e.g., Sentry)
- Include correlation ID in error logs

**Example**:
```typescript
try {
  await mutate(data);
} catch (error) {
  console.error('Password reset failed:', {
    correlationId: error.response?.headers['x-correlation-id'],
    status: error.response?.status,
    message: error.message,
  });
}
```

### Audit Trail

**Server-Side Audit**:
- All password reset attempts logged to `AuditLog` table
- Includes: userId, eventType, timestamp, status, correlationId
- Retention: 90+ days minimum

**Client-Side Tracking**:
- Track feature usage with analytics (if configured)
- Do NOT log sensitive data (passwords, tokens)

---

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

### Git Workflow

**Branch Naming**:
- Feature: `feature/password-reset-flow`
- Bugfix: `bugfix/password-validation`
- Hotfix: `hotfix/security-patch`

**Commit Messages**:
- Format: `<type>(<scope>): <message>`
- Example: `feat(password-reset): add password strength indicator`
- Types: feat, fix, docs, style, refactor, test, chore

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] All props/state typed
- [ ] Unit tests written (>80% coverage)
- [ ] Accessibility verified (keyboard nav, screen reader)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] API errors handled gracefully
- [ ] No console.log in production code
- [ ] Comments for complex logic
- [ ] No hardcoded values (use constants)

---

## Implementation Notes

### For AI Agents

**When implementing this feature**:
1. ✅ **Reuse existing patterns** - check `src/features/self-service/password-recovery/` for reference
2. ✅ **Follow file structure** - create files in `password-reset/` directory per plan.md
3. ✅ **Use existing services** - extend `UserService` with new methods
4. ✅ **Leverage existing hooks** - create custom hooks for data fetching and mutations
5. ✅ **Match code style** - follow existing component patterns in codebase
6. ✅ **Test thoroughly** - write tests alongside components (not after)
7. ✅ **Validate types** - ensure TypeScript strict mode compliance
8. ✅ **Check accessibility** - use semantic HTML and ARIA attributes
9. ✅ **Handle errors** - implement error boundaries and user-friendly messages
10. ✅ **Document changes** - add JSDoc comments for complex functions

**Available Context**:
- constitution.md - development guidelines ✅
- spec.md - feature requirements ✅
- data-model.md - entity definitions ✅
- contracts.md - API specifications ✅
- plan.md - implementation phases ✅
- This file (context.md) - technology stack ✅

**Next Steps**:
1. Review undefined-area analysis for technical decisions
2. Implement components per plan.md phases
3. Write tests for each component
4. Verify against spec.md success criteria

---

## References

**Documentation Links**:
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Material-UI: https://mui.com/material-ui/getting-started/
- React Hook Form: https://react-hook-form.com/
- React Query: https://tanstack.com/query/latest
- Yup: https://github.com/jquense/yup

**Internal Documentation**:
- [constitution.md](../input/constitution.md) - Development guidelines
- [spec.md](./spec.md) - Feature specification
- [data-model.md](./data-model.md) - Data models
- [contracts.md](./contracts.md) - API contracts
- [plan.md](./plan.md) - Implementation plan

---

**Document Status**: ✅ Complete  
**Last Updated**: February 3, 2026  
**Maintained By**: Development Team
