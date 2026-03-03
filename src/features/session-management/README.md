# Active Sessions Management

## Overview

The Active Sessions Management feature allows users to view and manage all their active login sessions across different devices and browsers. This implements Use Case 9 from the UIDAM Portal requirements.

## Features

### 1. **View Active Sessions**

- Display all active sessions for the current user
- Show device information (desktop, mobile, tablet)
- Display browser and OS details
- Show IP address and location (if available)
- Display login time and last activity timestamp
- Highlight the current session

### 2. **Session Management**

- **Terminate Individual Session**: Remove a specific session from another device
- **Terminate All Other Sessions**: Logout from all devices except current one
- **Auto-refresh**: Sessions list refreshes automatically every 30 seconds
- **Manual Refresh**: Refresh button to update sessions on demand

### 3. **Security Features**

- Confirmation dialogs before terminating sessions
- Cannot terminate current session accidentally
- Real-time session monitoring
- Activity tracking

## Components

### ActiveSessionsManagement Component

**Location**: `src/features/session-management/ActiveSessionsManagement.tsx`

Main component that handles the UI and logic for session management.

**Key Features**:

- Fetches active sessions from the backend
- Auto-refreshes every 30 seconds
- Provides UI to terminate sessions
- Shows confirmation dialogs
- Displays loading and error states

**Props**: None (standalone component)

## Services

### SessionService

**Location**: `src/services/sessionService.ts`

Service layer for session-related API calls.

**Methods**:

- `getActiveSessions()`: Fetch all active sessions
- `getSessionById(sessionId)`: Get details of a specific session
- `terminateSession(sessionId, reason?)`: Terminate a specific session
- `terminateAllOtherSessions()`: Terminate all sessions except current
- `getCurrentSession()`: Get current session details

## Types

### ActiveSession Interface

```typescript
interface ActiveSession {
  sessionId: string;
  deviceInfo: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  location?: string;
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
  userAgent?: string;
}
```

### SessionsResponse Interface

```typescript
interface SessionsResponse {
  sessions: ActiveSession[];
  totalCount: number;
}
```

## Routing

**Path**: `/sessions`

Added to the main navigation menu in `Layout.tsx` and routing in `App.tsx`.

## Navigation

The Active Sessions menu item appears in the sidebar navigation with a "Devices" icon.

## API Endpoints

The service expects the following backend endpoints:

| Endpoint                 | Method | Description                  |
| ------------------------ | ------ | ---------------------------- |
| `/auth/sessions`         | GET    | Get all active sessions      |
| `/auth/sessions/:id`     | GET    | Get specific session details |
| `/auth/sessions/:id`     | DELETE | Terminate specific session   |
| `/auth/sessions/all`     | DELETE | Terminate all other sessions |
| `/auth/sessions/current` | GET    | Get current session info     |

## Backend Requirements

The backend should:

1. Track user sessions with unique session IDs
2. Store device and browser information
3. Track login time and last activity
4. Allow session termination by session ID
5. Support bulk termination of sessions
6. Return session list with current session indicator

## Usage Example

### Accessing the Feature

1. Log in to the UIDAM Portal
2. Click "Active Sessions" in the sidebar navigation
3. View all your active sessions

### Terminating a Session

1. Navigate to Active Sessions page
2. Find the session you want to terminate
3. Click the delete (trash) icon on the session card
4. Confirm in the dialog that appears
5. The session will be terminated and the list will refresh

### Terminating All Other Sessions

1. Navigate to Active Sessions page
2. Click "Terminate All Other Sessions" button in the top right
3. Confirm the action in the dialog
4. All sessions except current will be terminated

## Testing

### Unit Tests

**Location**: `src/features/session-management/ActiveSessionsManagement.test.tsx`

Tests cover:

- Rendering sessions list
- Loading states
- Error handling
- Session termination
- Confirmation dialogs
- Auto-refresh functionality
- Manual refresh

### Service Tests

**Location**: `src/services/sessionService.test.ts`

Tests cover:

- All API calls
- Error handling
- Request payload formatting

### Running Tests

```bash
npm test -- ActiveSessionsManagement
npm test -- sessionService
```

## UI/UX Considerations

1. **Current Session Protection**: The current session is clearly marked and cannot be terminated
2. **Visual Hierarchy**: Current session uses primary color border and badge
3. **Responsive Design**: Sessions displayed in a grid layout (2 columns on desktop, 1 on mobile)
4. **Icons**: Device-specific icons (computer, phone, tablet) based on device info
5. **Confirmation**: All destructive actions require confirmation
6. **Feedback**: Success and error messages displayed using MUI Alerts
7. **Loading States**: Progress indicators during data fetching

## Security Considerations

1. **Authentication**: All endpoints require valid authentication tokens
2. **Authorization**: Users can only manage their own sessions
3. **Audit Trail**: Session terminations should be logged (backend responsibility)
4. **Session Validation**: Backend should validate session ownership
5. **Rate Limiting**: Consider rate limiting on session termination endpoints

## Future Enhancements

Potential improvements:

1. Real-time updates using WebSocket
2. Geolocation mapping on a visual map
3. Session details expansion with more metadata
4. Export session history
5. Email notifications on session termination
6. Suspicious activity detection
7. Session duration limits
8. Concurrent session limits per user

## Dependencies

- Material-UI (@mui/material)
- React Router (react-router-dom)
- date-fns (for date formatting)
- Axios (via api-client)

## Troubleshooting

### Sessions not loading

- Check browser console for API errors
- Verify authentication token is valid
- Ensure backend endpoints are available

### Cannot terminate session

- Verify the session still exists (may have expired)
- Check user has permission to terminate sessions
- Review backend logs for errors

### Auto-refresh not working

- Check browser console for errors
- Verify component is still mounted
- Check if timers are being cleared properly
