# Story: Session Management & Authorization Checks

**Epic:** Authentication, Authorization & User Management | **Story:** 7 of 8 | **Wireframe:** N/A (backend middleware)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (applies to all routes) |
| **Target File** | `middleware.ts`, `lib/auth/session.ts`, `lib/auth/permissions.ts` |
| **Page Action** | `create_new` |

## User Story
**As a** system **I want** to securely manage user sessions and enforce authorization checks on all operations **So that** users can only access functionality they have permission for and sessions expire appropriately

## Acceptance Criteria

### Session Creation and Management
- [ ] Given a user successfully authenticates, when they log in, then a session is created with a JWT token containing userId, username, displayName, roles, and expiration timestamp
- [ ] Given a user has an active session, when they perform any action, then the session token is validated before processing the request
- [ ] Given a session token is valid, when I decode it, then I can extract the user's ID, username, and array of role names
- [ ] ~~Given a user's session token is stored, when I check its format, then it is stored in an httpOnly cookie~~ **DEFERRED** - httpOnly cookie requires backend `Set-Cookie` header; will address later

### Session Timeout and Refresh
- [ ] Given a user has an active session, when 30 minutes pass without any activity, then their session expires
- [ ] Given a user performs any action, when the action completes, then the session timeout is reset to 30 minutes from that moment
- [ ] Given a user's session is about to expire (5 minutes remaining), when they are on any page, then they see a warning toast "Your session will expire in 5 minutes. Save your work."
- [ ] Given a user's session has expired, when they attempt any operation, then they see the message "Your session has expired. Please log in again." and are redirected to `/login`
- [ ] Given a user's session is valid but nearing expiration (15 minutes remaining), when the frontend detects this, then it automatically calls `/v1/auth/refresh` to extend the session

### Authorization Middleware
- [ ] Given a user attempts to access a protected route, when the middleware runs, then it checks if the user is authenticated before allowing access
- [ ] Given an unauthenticated user attempts to access `/admin/users`, when the middleware runs, then the user is redirected to `/login` with returnUrl parameter
- [ ] Given an authenticated user returns to login after being redirected, when they log in successfully, then they are redirected to the original returnUrl they were trying to access

### Operation-Level Permission Checks
- [ ] Given a user attempts to create a batch, when the operation executes, then the system checks if the user has 'batch.create' permission
- [ ] Given a user without 'batch.create' permission attempts to create a batch, when the API receives the request, then it returns HTTP 403 with message "Insufficient permissions: batch.create required"
- [ ] Given a user with 'instrument.view' but not 'instrument.update' permission attempts to update an instrument, when the API receives the request, then it returns HTTP 403 with message "Insufficient permissions: instrument.update required"

### Dynamic Page Access (via Role allowedPages)
- [ ] Given a user's role does not include `/admin/users` in its allowedPages, when the user attempts to access `/admin/users`, then they see "Access denied." and are redirected to `/auth/forbidden`
- [ ] Given a user's role does not include `/approvals/level-1` in its allowedPages, when the user attempts to access `/approvals/level-1`, then they see "Access denied." and are redirected to `/auth/forbidden`
- [ ] Given a user with the Analyst role attempts to access `/batches`, when the page loads, then the page renders successfully (Analyst allowedPages includes `/batches`)
- [ ] Given a user with the Approver L1 role attempts to access `/approvals/level-1`, when the page loads, then the page renders successfully
- [ ] Given a user with the Approver L1 role attempts to access `/approvals/level-2`, when the page loads, then they are redirected to `/auth/forbidden` (not in their allowedPages)
- [ ] Given a user with the Administrator role attempts to access `/batches`, when the page loads, then they are redirected to `/auth/forbidden` (Administrator only has access to Users and Roles pages)
- [ ] Given a user has multiple roles, when determining page access, then the allowed pages from all roles are combined (cumulative)

### Permission Checking Utility Functions
- [ ] Given I call `hasPermission(user, 'instrument.create')` with a user who has the Analyst role, then it returns `true`
- [ ] Given I call `hasRole(user, 'ApproverL2')`, when the user has that role assigned, then it returns `true`
- [ ] Given I call `hasAnyRole(user, ['Analyst', 'Administrator'])`, when the user has at least one of those roles, then it returns `true`
- [ ] Given I call `hasPageAccess(user, '/approvals/level-1')`, when the user has Approver L1 role, then it returns `true`
- [ ] Given I call `hasPageAccess(user, '/admin/users')`, when the user has only the Analyst role, then it returns `false`

### Multiple Role Permission Resolution
- [ ] Given a user has both Analyst and Approver L1 roles, when I check their page access, then they have the combined (cumulative) allowed pages of both roles
- [ ] Given a user has roles with conflicting permissions, when I check their permissions, then the most permissive access is granted (cumulative model)

### State-Based Access Control (Per BR-GOV-005) — DEFERRED to Epic 2+
> State-based access control depends on batch workflow states which are implemented in Epic 2+.

### Segregation of Duties Enforcement — DEFERRED to Epic 2+
> Segregation of duties depends on batch ownership tracking which is implemented in Epic 2+.

### Session Invalidation on User Changes
- [ ] Given a user's roles are modified by an administrator, when the user attempts their next action, then the session is refreshed with updated roles
- [ ] Given a user is deactivated by an administrator, when the user attempts any action, then they see "Your account has been deactivated. Please contact your administrator." and their session is terminated
- [ ] Given a user's password is changed, when they attempt any action, then their existing sessions remain valid (password change doesn't invalidate active sessions unless explicitly logged out)

### Concurrent Session Handling
- [ ] Given a user is logged in on one browser, when they log in on a different browser, then both sessions are valid (concurrent sessions allowed)
- [ ] Given a user has multiple active sessions, when they log out from one browser, then only that session is terminated (other sessions remain active)

### Security Headers and CSRF Protection — DEFERRED
> CSRF protection requires backend coordination; will address later.
> Security headers are typically set at the backend/reverse proxy level.

### Performance
- [ ] Given a permission check is performed, when the check executes, then it completes within 10ms (in-memory role/permission cache)
- [ ] Given a user's permissions are cached, when their roles change, then the cache is invalidated and refreshed on their next request

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/auth/refresh` | Refresh session token before expiration |
| GET | `/v1/auth/session` | Retrieve current session and permissions |
| POST | `/v1/auth/logout` | Terminate current session |
| GET | `/v1/auth/permissions` | Get all permissions for current user |

## Implementation Notes

- **JWT Tokens**: Use short-lived JWT tokens (30 minutes) stored in cookies
- **Token Refresh**: Auto-refresh via `/v1/auth/refresh` when 15 minutes remaining
- **Session Warning**: Toast notification at 5 minutes remaining
- **Permission Cache**: Cache user permissions in memory; invalidate on role changes
- **Middleware Stack**: Authentication → Authorization → Operation handler
- **Logout**: Server-side session termination via `/v1/auth/logout`
- **BRD Requirements**: BR-SEC-004 (Authentication & Authorization)

### Deferred to Later
- httpOnly cookies (requires backend `Set-Cookie` header)
- CSRF protection (requires backend coordination)
- State-based access control (Epic 2+ - batch workflow)
- Segregation of duties (Epic 2+ - batch ownership)

## Dependencies
- **Story 1**: User Authentication (provides session creation)
- **Story 4**: Role Assignment (provides role/permission mappings)

## Story Points
**5** - Complex middleware logic, state-based permission checks, session management, CSRF protection, segregation of duties enforcement
