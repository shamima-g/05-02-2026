# Story: Login Activity Monitoring

**Epic:** Authentication, Authorization & User Management | **Story:** 8 of 8 | **Wireframe:** Screen 14 (User Administration - Login Activity View)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/admin/users/login-activity` |
| **Target File** | `app/admin/users/login-activity/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As an** administrator **I want** to view login attempts, identify failed logins, and monitor security alerts **So that** I can detect unauthorized access attempts and ensure account security

## Acceptance Criteria

### Happy Path - View Login Activity
- [ ] Given I have the Administrator role, when I navigate to `/admin/users/login-activity`, then I see the Login Activity Report with a list of recent login attempts
- [ ] Given I am on the Login Activity Report, when the page loads, then I see columns: Timestamp, Username, Status (Success/Failed), IP Address, Location, User Agent
- [ ] Given I am on the Login Activity Report, when I view the summary, then I see counts: "145 successful logins | 3 failed attempts | 0 locked accounts"

### Filter by Date Range
- [ ] Given I am on the Login Activity Report, when I select Date Range "2026-01-01" to "2026-01-05" and click "[Apply]", then I see only login attempts within that date range
- [ ] Given I am on the Login Activity Report, when I select a preset "Last 7 days", then the date range is populated and results are filtered
- [ ] Given I am on the Login Activity Report, when I select preset "Today", then I see only login attempts from today

### Filter by Status
- [ ] Given I am on the Login Activity Report, when I select Status "All", then I see both successful and failed login attempts
- [ ] Given I am on the Login Activity Report, when I click "[View Failed Logins Only]", then I see only failed login attempts with failure reasons
- [ ] Given I am filtering by failed logins, when I view the results, then I see failure reasons: "Invalid password", "User not found", "Account deactivated", "Account locked"

### Filter by User
- [ ] Given I am on the Login Activity Report, when I select User "John Smith" from the dropdown, then I see only login attempts for that user
- [ ] Given I am on the Login Activity Report, when I type "jsmith" in the User filter search box, then the dropdown shows matching usernames

### Successful Login Display
- [ ] Given I am viewing successful login attempts, when I look at a success record, then I see: Timestamp "2026-01-05 14:23", Username "jsmith", Status "✓ Success", IP Address "192.168.1.45", Location "New York"
- [ ] Given I am viewing a successful login record, when I expand the details, then I see full User Agent string showing browser and operating system

### Failed Login Display
- [ ] Given I am viewing failed login attempts, when I look at a failure record, then I see: Timestamp, Username (or "unknown" if user doesn't exist), Status "✗ Failed", IP Address, and Failure Reason
- [ ] Given I am viewing a failed login with reason "Invalid password", when I check if it's part of a pattern, then I see "Attempt 3" if this is the 3rd consecutive failure for that user
- [ ] Given I am viewing a failed login from unknown IP, when I look at the Location column, then I see "Unknown" and IP is flagged with "(Blocked)" if rate limit exceeded

### Security Alerts
- [ ] Given there have been 5+ failed login attempts from the same IP in the last 5 minutes, when I view the Login Activity Report, then I see a security alert banner "⚠ Multiple failed login attempts detected from IP 203.45.67.89"
- [ ] Given there have been 3 consecutive failed login attempts for the same username, when I view the Login Activity Report, then I see an alert "⚠ Account 'jsmith' temporarily locked after 3 failed attempts"
- [ ] Given an account is locked due to failed attempts, when I view the user row, then I see a status indicator "🔒 Locked until 2026-01-05 15:00"

### Account Lockout Details
- [ ] Given I am viewing login activity for a locked account, when I look at the latest record, then I see "(Account automatically locked for 15 minutes)"
- [ ] Given an account is locked, when 15 minutes pass since the lockout, then the account is automatically unlocked
- [ ] Given an account is locked, when an administrator manually unlocks it via User Administration, then the lockout is immediately removed

### IP Address Geolocation
- [ ] Given I am viewing login activity, when I see an IP address from the corporate network (192.168.x.x), then the Location shows "New York" (corporate office location)
- [ ] Given I am viewing login activity, when I see an external IP address, then the Location shows city/country based on IP geolocation lookup
- [ ] Given I am viewing login activity, when geolocation fails for an IP, then the Location shows "Unknown"

### Suspicious Activity Detection
- [ ] Given a user logs in from a new location they've never used before, when I view the login record, then I see a flag "⚠ New location" next to the location
- [ ] Given a user logs in from two different locations within 1 hour, when I view the login records, then I see a flag "⚠ Impossible travel" (e.g., New York then Tokyo)
- [ ] Given a user account receives 10+ failed login attempts from different IPs in 1 hour, when I view the activity, then I see an alert "⚠ Potential brute force attack on user 'jsmith'"

### Export Login Activity Report
- [ ] Given I am on the Login Activity Report, when I click "[Export Login Report]", then an Excel file is downloaded containing all visible login records matching the filters
- [ ] Given I export the login report, when I open the Excel file, then I see columns: Timestamp, Username, User ID (if exists), Status, IP Address, Location, User Agent, Failure Reason (if failed)

### Real-Time Updates
- [ ] Given I am on the Login Activity Report with "Today" filter, when a new login occurs, then the record appears at the top of the list within 5 seconds

### User-Specific Login History
- [ ] Given I am on the User Administration screen, when I click "[View]" for a user and select the Activity Log tab, then I see their recent login attempts (both successful and failed)
- [ ] Given I am viewing a user's login history, when I see multiple failed attempts, then I can identify potential security issues for that specific user

### Authorization Check
- [ ] Given I have the Administrator role, when I navigate to `/admin/users/login-activity`, then I can view all login activity
- [ ] Given I do NOT have the Administrator role, when I attempt to navigate to `/admin/users/login-activity`, then I see an error message "Access denied. Administrator role required."

### Navigate from User Administration
- [ ] Given I am on the User Administration screen (Screen 14), when I click "[📋 View Login Activity]", then I am navigated to the Login Activity Report

### Performance
- [ ] Given I am on the Login Activity Report, when I query login records for the last 30 days, then results load within 2 seconds
- [ ] Given the UserLoginLog table has 100,000+ records, when I filter and sort, then pagination loads the next page within 1 second

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/audit/logins` | Get login attempt history with filtering |
| GET | `/v1/audit/logins/failed` | Get only failed login attempts |
| GET | `/v1/audit/logins/user/{userId}` | Get login history for specific user |
| GET | `/v1/audit/logins/alerts` | Get security alerts (lockouts, brute force attempts) |
| GET | `/v1/audit/logins/export` | Export login activity report to Excel |
| POST | `/v1/users/{userId}/unlock` | Manually unlock locked account |

## Implementation Notes

- **UserLoginLog Table**: All login attempts (successful and failed) logged with username, userId (if exists), timestamp, IP address, user agent, isSuccessful, failureReason
- **Account Lockout**: After 3 consecutive failed login attempts, account is locked for 15 minutes (configurable)
- **Rate Limiting**: IPs with 10+ failed login attempts in 5 minutes are temporarily blocked
- **Geolocation**: Use IP geolocation API (e.g., MaxMind GeoLite2) for location lookup
- **Suspicious Activity**: Flag new locations, impossible travel, and brute force patterns
- **Retention**: Login logs retained for 1 year per security policy
- **Wireframe Reference**: Screen 14 - User Administration (Login Activity View modal)
- **BRD Requirements**: BR-AUD-004 (User Activity Tracking), BR-SEC-004 (Authentication & Authorization)

## Dependencies
- **Story 1**: User Authentication (generates login log records)
- **Story 3**: User Lifecycle Management (links login activity to user records)

## Story Points
**5** - Login log display, multiple filters, security alert detection, geolocation lookup, suspicious activity flagging, export functionality
