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
- [ ] Given a user's session token is stored, when I check its format, then it is stored in an httpOnly cookie (not accessible to JavaScript for XSS protection)

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

### Role-Based Page Access
- [ ] Given a user without the Administrator role attempts to access `/admin/users`, when the page loads, then they see "Access denied. Administrator role required." and are redirected to the dashboard
- [ ] Given a user without any approver role attempts to access `/approvals`, when the page loads, then they see "Access denied. Approver role required." and are redirected to the dashboard
- [ ] Given a user with the Operations Lead role attempts to access `/batches`, when the page loads, then the page renders successfully (they have permission)

### Permission Checking Utility Functions
- [ ] Given I call `hasPermission(user, 'instrument.create')` with a user who has Operations Lead role, when I check the result during Data Preparation phase, then it returns `true`
- [ ] Given I call `hasPermission(user, 'instrument.create')` with a user who has Operations Lead role, when I check the result during Approval phase, then it returns `false` (state-based lock)
- [ ] Given I call `hasRole(user, 'Approver Level 2')`, when the user has that role assigned, then it returns `true`
- [ ] Given I call `hasAnyRole(user, ['Operations Lead', 'Analyst'])`, when the user has at least one of those roles, then it returns `true`

### Multiple Role Permission Resolution
- [ ] Given a user has both Operations Lead and Read-Only roles, when I check their permissions, then they have the combined (cumulative) permissions of both roles
- [ ] Given a user has roles with conflicting permissions, when I check their permissions, then the most permissive access is granted (cumulative model)

### State-Based Access Control (Per BR-GOV-005)
- [ ] Given a user has 'instrument.update' permission, when the current batch is in Data Preparation state, then `hasPermission(user, 'instrument.update')` returns `true`
- [ ] Given a user has 'instrument.update' permission, when the current batch is in Level 1 Approval state, then `hasPermission(user, 'instrument.update')` returns `false` (locked)
- [ ] Given a user has 'instrument.update' permission, when the current batch state changes from Approval back to Data Preparation (after rejection), then `hasPermission(user, 'instrument.update')` returns `true` (unlocked)

### Segregation of Duties Enforcement
- [ ] Given a user has both Operations Lead and Approver Level 1 roles, when they attempt to approve a batch they created, then the system returns error "Cannot approve batch you prepared (segregation of duties)"
- [ ] Given a user has both Operations Lead and Approver Level 1 roles, when they attempt to approve a batch created by another user, then the approval is allowed

### Session Invalidation on User Changes
- [ ] Given a user's roles are modified by an administrator, when the user attempts their next action, then the session is refreshed with updated roles
- [ ] Given a user is deactivated by an administrator, when the user attempts any action, then they see "Your account has been deactivated. Please contact your administrator." and their session is terminated
- [ ] Given a user's password is changed, when they attempt any action, then their existing sessions remain valid (password change doesn't invalidate active sessions unless explicitly logged out)

### Concurrent Session Handling
- [ ] Given a user is logged in on one browser, when they log in on a different browser, then both sessions are valid (concurrent sessions allowed)
- [ ] Given a user has multiple active sessions, when they log out from one browser, then only that session is terminated (other sessions remain active)

### Security Headers and CSRF Protection
- [ ] Given any API request is made, when I inspect the response headers, then I see security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`
- [ ] Given a POST/PUT/DELETE request is made from the frontend, when the request is sent, then it includes a CSRF token in the headers
- [ ] Given a POST/PUT/DELETE request without a valid CSRF token is received, when the backend validates it, then it returns HTTP 403 with message "Invalid CSRF token"

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

- **JWT Tokens**: Use short-lived JWT tokens (30 minutes) with httpOnly cookies for storage
- **Session Store**: Consider Redis for session storage in production for scalability
- **Permission Cache**: Cache user permissions in memory; invalidate on role changes
- **Middleware Stack**: Authentication → Authorization → State-based checks → Operation handler
- **CSRF Protection**: Use double-submit cookie pattern or synchronizer token pattern
- **Rate Limiting**: Implement rate limiting on sensitive endpoints (login, password reset)
- **BRD Requirements**: BR-SEC-004 (Authentication & Authorization), BR-GOV-005 (State-Based Access Control)

## Dependencies
- **Story 1**: User Authentication (provides session creation)
- **Story 4**: Role Assignment (provides role/permission mappings)

## Story Points
**5** - Complex middleware logic, state-based permission checks, session management, CSRF protection, segregation of duties enforcement
