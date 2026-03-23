# UIDAM Admin Portal — Release Notes

**Product:** UIDAM Web Admin Portal (`uidam-web-admin-portal`)  
**Version:** 1.0.0  
**Release Date:** 23 March 2026  
**License:** Apache-2.0

---

## 1. Release Summary

This release delivers core User Identity and Access Management (UIDAM) portal capabilities including user management with pagination and filtering, Role-Based Access Control (RBAC) for portal pages, active session management for both self and admin use cases, consistent URL routing under the `/uidam` prefix, and security hardening around session lifecycle (cross-tab logout and remote session termination).

---

## 2. New Features

### 2.1 Pagination for User Management List

- The User Management page now supports server-side pagination.
- Default page size is **10 records per page**; options available: 5, 10, 25, 50, 100.
- When the current page returns a full set of results, a secondary API call is made to accurately determine the total record count for the pagination control.
- Page resets to 0 automatically when search term or status filter is changed.

---

### 2.2 Search Users by Status

- A **Status Filter** dropdown has been added alongside the username search box.
- Supported statuses: `ACTIVE`, `PENDING`, `BLOCKED`, `REJECTED`, `DEACTIVATED`.
- Selecting "All Status" clears the filter and returns all users.
- Search term and status filter can be combined simultaneously.
- Both filters apply server-side via the `filterUsersV2` API.

---

### 2.3 Unlock a Locked User Account

- Admins with the `ManageUsers` scope can edit a blocked/locked user account.
- The **Edit User** action is accessible from the per-row actions menu (⋮) in User Management.
- Changing the user's status from `BLOCKED` back to `ACTIVE` effectively unlocks the account.

---

### 2.4 UIDAM Portal URL Routing Consistency

- All portal routes are now consistently prefixed with `/uidam/`:
  - `/uidam/dashboard`
  - `/uidam/users`
  - `/uidam/accounts`
  - `/uidam/roles`
  - `/uidam/scopes`
  - `/uidam/approvals`
  - `/uidam/clients`
  - `/uidam/assistant`
  - `/uidam/sessions`
  - `/uidam/profile`
  - `/uidam/change-password`
- This ensures no route conflicts with other applications hosted on the same domain.

---

### 2.5 RBAC-Based Access to Portal Pages

- Navigation items in the left sidebar are dynamically filtered based on OAuth2 token scopes.
- Pages requiring specific scopes are hidden from users who do not hold those scopes:

| Page               | Required Scope(s)                  |
| ------------------ | ---------------------------------- |
| User Management    | `ViewUsers` or `ManageUsers`       |
| Account Management | `ViewAccounts` or `ManageAccounts` |
| Role Management    | `ManageUserRolesAndPermissions`    |

- Write actions (Create, Edit, Delete, Manage Accounts) within User Management require the `ManageUsers` scope.
- Read-only users with `ViewUsers` can still view user details.

---

### 2.6 Pagination with Search Filters

- Pagination state is preserved when navigating between pages while a search term or status filter is active.
- All paginated API calls include `sortBy: USER_NAMES`, `sortOrder: ASC`, `ignoreCase: true`, `searchType: CONTAINS`.
- Changing the rows-per-page selection resets to page 0.

---

### 2.7 UIDAM Prefix Added

- The application title in the browser and AppBar displays **"UIDAM Admin Portal"**.
- The UIDAM logo (`/images/logo.svg`) is shown in the AppBar.
- The sidebar header displays **"UIDAM Admin"**.
- All internal route paths use the `/uidam/` prefix for namespace isolation.

---

### 2.8 Manage Active Sessions — Self (Avatar Dropdown)

- A **"Manage Active Sessions"** option has been added to the Avatar dropdown menu in the top-right corner.
- Clicking it navigates to `/uidam/sessions` — the user's own active sessions page.
- The sessions page shows all active tokens with device info, browser, OS, IP address, login time, and last activity.
- Users can:
  - **Terminate a specific session** (single delete icon per session card)
  - **Terminate all other sessions** (bulk action button)
- The page auto-refreshes every **30 seconds**.
- The current session is clearly labelled and cannot be terminated from this view.

> **Note:** The "Active Sessions" item has been removed from the left navigation panel to avoid confusion — the Avatar dropdown is the single entry point.

---

### 2.9 Admin Session Management — User Management

- Admins with the `ManageUsers` scope can view and terminate **any user's** active sessions.
- A **"Manage Active Sessions"** option appears in the per-row actions menu (⋮) for every user row — **except the admin's own row** (to prevent accidental self-termination; self-sessions are managed via the Avatar dropdown).
- Clicking the option opens the **Admin Sessions Modal** showing all active sessions for the selected user.
- Admins can terminate individual sessions for the target user.

---

### 2.10 Cross-Tab Logout

- Logging out in one browser window/tab **automatically logs out all other open tabs/windows** of the same browser profile on the same origin.
- Implemented using the browser's native `storage` event — there is zero polling delay; logout is reflected instantly via the event listener in `Layout.tsx`.
- Applies only within the same browser profile (regular Chrome windows share `localStorage`).

> **Important:** Incognito windows have isolated `localStorage` and are unaffected by this feature by browser design. Incognito sessions can be managed via **Admin Session Management** or by the user from their own **Manage Active Sessions** page.

---

## 3. Bug Fixes

| #   | Issue                                                                                                                                                                                                         | Root Cause                                                                                                                                                                                                                                                                                | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Remote session termination not reflected** — After an admin terminated another browser's session (e.g. Edge) from Chrome, the terminated browser remained logged in and showed no indication of revocation. | The backend revokes the token server-side, but the terminated browser still holds the token in `localStorage` and had no mechanism to detect the revocation. The `SessionService` used native `fetch` and on a `401` response only showed an error message — it did not log the user out. | (a) `SessionService.request()` now intercepts `401` responses: clears all 4 localStorage keys (`accessToken`, `refreshToken`, `expires_at`, `user_profile`) and immediately redirects to `/login`. (b) A **30-second heartbeat** was added to `Layout.tsx` that calls `SessionService.getActiveSessions()` in the background — so even an idle session in the terminated browser detects the revocation within 30 seconds and is automatically logged out. |

---

## 4. Security Improvements

| Area                        | Detail                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Token revocation detection  | Sessions revoked server-side are detected client-side within 30 seconds via background heartbeat, or instantly on the next user interaction. |
| Cross-tab session coherence | All tabs are kept in sync via the `storage` event; no tab can remain authenticated after logout.                                             |
| Admin cannot self-terminate | The "Manage Active Sessions" action is hidden for an admin's own user row to prevent accidental self-lockout.                                |
| RBAC enforcement            | All write actions are guarded by `ManageUsers` scope check both in the UI and implicitly enforced by the backend.                            |

---

## 5. Known Limitations

| Limitation               | Detail                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incognito isolation      | Incognito windows have separate `localStorage`; cross-tab logout does not propagate to/from Incognito sessions. Manage via Admin Session Management. |
| Heartbeat interval       | Remote session revocation is detected within a maximum of **30 seconds** for idle sessions. Active sessions (any API call) detect it instantly.      |
| Status update for unlock | There is no dedicated "Unlock" button; unlocking is done by editing the user's status via the Edit User modal.                                       |

---

## 6. Test Coverage

| File                 | Tests      | Coverage                                               |
| -------------------- | ---------- | ------------------------------------------------------ |
| `UserManagement.tsx` | 48 passing | **93.22%**                                             |
| `sessionService.ts`  | —          | Lint-clean; `any` types replaced with typed interfaces |

**Coverage maintained above the 85% project threshold.**

---

## 7. Configuration

No changes to `public/config.json` are required for this release. All existing configuration keys continue to apply:

| Key                                   | Purpose                                             |
| ------------------------------------- | --------------------------------------------------- |
| `REACT_APP_SESSION_API_PREFIX`        | API path prefix for session endpoints (e.g. `/sdp`) |
| `REACT_APP_TOKEN_STORAGE_KEY`         | localStorage key for access token                   |
| `REACT_APP_REFRESH_TOKEN_STORAGE_KEY` | localStorage key for refresh token                  |
| `REACT_APP_UIDAM_AUTH_SERVER_URL`     | Auth server base URL for session API calls          |

---

## 8. Deployment Notes

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Run unit tests with coverage
npm run test:coverage
```

- Build output goes to `/dist`
- Serve via nginx using the provided `nginx.conf`
- Ensure `public/config.json` is populated with correct environment values before serving

---

## 9. Changelog Summary

| Component                 | Change Type | Description                                                                  |
| ------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `Layout.tsx`              | Feature     | Cross-tab logout via `storage` event listener                                |
| `Layout.tsx`              | Feature     | 30-second session heartbeat                                                  |
| `Layout.tsx`              | Feature     | "Manage Active Sessions" in Avatar dropdown                                  |
| `Layout.tsx`              | Removed     | "Active Sessions" removed from left navigation panel                         |
| `sessionService.ts`       | Bug Fix     | Force logout on 401 in `request()` method                                    |
| `sessionService.ts`       | Improvement | Replaced `any` types with typed interfaces (`RawToken`, `RawTokensResponse`) |
| `UserManagement.tsx`      | Feature     | Pagination (server-side)                                                     |
| `UserManagement.tsx`      | Feature     | Status filter dropdown                                                       |
| `UserManagement.tsx`      | Feature     | Admin Session Management modal per user row                                  |
| `UserManagement.tsx`      | Security    | Hide "Manage Active Sessions" for admin's own row                            |
| `UserManagement.test.tsx` | Fix         | Added Redux `Provider` wrapper; added `AdminSessionsModal` mock              |
| `UserManagement.test.tsx` | Coverage    | 6 new tests for previously uncovered branches                                |
| `App.tsx`                 | Feature     | `/uidam/sessions` route added                                                |
| Routes                    | Feature     | All routes prefixed with `/uidam/`                                           |

---

_Prepared by: UIDAM Development Team_  
_Document version: 1.0_
