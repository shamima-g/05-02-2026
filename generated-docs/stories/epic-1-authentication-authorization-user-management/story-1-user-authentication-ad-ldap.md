# Story: User Authentication with AD/LDAP Integration

**Epic:** Authentication, Authorization & User Management | **Story:** 1 of 8 | **Wireframe:** N/A (backend integration)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/login` |
| **Target File** | `app/login/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As a** user of InvestInsight **I want** to authenticate using my corporate credentials (AD/LDAP) **So that** I can securely access the system without managing separate passwords

## Acceptance Criteria

### Happy Path
- [ ] Given I navigate to the application root, when the page loads and I am not authenticated, then I am redirected to `/login`
- [ ] Given I am on the login page, when I enter valid AD/LDAP credentials and click Sign In, then I am authenticated and redirected to the dashboard
- [ ] Given I successfully authenticate, when I view my session, then it includes my username, display name, email, and assigned roles from the User table
- [ ] Given I am authenticated, when I navigate to `/login`, then I am redirected to the dashboard (already logged in)

### Session Management
- [ ] Given I successfully log in, when I check the session, then it has a 30-minute inactivity timeout
- [ ] Given my session is active, when I perform any action, then the session timeout is reset to 30 minutes
- [ ] Given my session expires, when I attempt any operation, then I see a message "Your session has expired. Please log in again." and am redirected to login
- [ ] Given I am authenticated, when I click Logout, then my session is terminated and I am redirected to `/login`

### Failed Authentication
- [ ] Given I am on the login page, when I enter invalid credentials and click Sign In, then I see the error message "Invalid username or password"
- [ ] Given I am on the login page, when I leave the username field empty and click Sign In, then I see the error message "Username is required"
- [ ] Given I am on the login page, when I leave the password field empty and click Sign In, then I see the error message "Password is required"
- [ ] Given I have failed to log in 3 times consecutively, when I attempt a 4th login, then I see the message "Account temporarily locked. Please contact your administrator."

### Activity Logging (Per BR-AUD-004)
- [ ] Given I successfully log in, when I check the UserLoginLog table, then a record is created with username, timestamp, IP address, user agent, and IsSuccessful=true
- [ ] Given I fail to log in, when I check the UserLoginLog table, then a record is created with username, timestamp, IP address, failure reason, and IsSuccessful=false
- [ ] Given I log out, when I check the UserActivityLog table, then a record is created with action="Logout" and timestamp

### Inactive User Handling
- [ ] Given my user account is deactivated (IsActive=false), when I attempt to log in with valid credentials, then I see the error message "Your account has been deactivated. Please contact your administrator."

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/auth/login` | Authenticate user with AD/LDAP credentials |
| POST | `/v1/auth/logout` | Terminate user session |
| GET | `/v1/auth/session` | Retrieve current session information |
| POST | `/v1/auth/refresh` | Refresh session token |

## Implementation Notes

- **External Authentication**: Integrates with corporate AD/LDAP per Section 7.3 of BRD
- **Session Token**: Backend returns JWT token with user ID, username, roles, and permissions
- **Client-Side Storage**: Store session token in httpOnly cookie (not localStorage for security)
- **Auto-Redirect**: Middleware checks authentication status on all protected routes
- **Rate Limiting**: Backend enforces rate limiting on login endpoint (max 5 attempts per minute per IP)
- **Account Lockout**: After 3 failed attempts, account is temporarily locked for 15 minutes
- **BRD Requirements**: BR-SEC-004 (Authentication & Authorization), BR-AUD-004 (User Activity Tracking)

## Dependencies
- None (foundational story)

## Story Points
**5** - Involves backend AD/LDAP integration, session management, rate limiting, and comprehensive logging
