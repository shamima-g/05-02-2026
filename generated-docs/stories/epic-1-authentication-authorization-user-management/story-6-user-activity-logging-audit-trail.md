# Story: User Activity Logging & Audit Trail

**Epic:** Authentication, Authorization & User Management | **Story:** 6 of 8 | **Wireframe:** Screen 16 (Audit Trail Viewer)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/admin/audit-trail` |
| **Target File** | `app/admin/audit-trail/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As an** administrator or auditor **I want** to view complete audit trails of all user actions and data changes **So that** I can investigate issues, ensure compliance, and track accountability

## Acceptance Criteria

### Happy Path - View Audit Trail
- [ ] Given I have the Administrator role, when I navigate to `/admin/audit-trail`, then I see the Audit Trail Viewer screen with a searchable list of all user actions
- [ ] Given I am on the Audit Trail Viewer, when the page loads, then I see recent activity sorted by timestamp (most recent first) with columns: Timestamp, User, Action, Entity Type, Entity ID, Details
- [ ] Given I am on the Audit Trail Viewer, when I view an audit record, then I see who performed the action, what they did, when they did it, and what entity was affected

### Filter by Date Range
- [ ] Given I am on the Audit Trail Viewer, when I select Date Range "2026-01-01" to "2026-01-05" and click "[Apply Filters]", then I see only audit records within that date range
- [ ] Given I am on the Audit Trail Viewer, when I select a preset "Last 7 days" from the date range dropdown, then the date range is populated and records are filtered automatically
- [ ] Given I am on the Audit Trail Viewer, when I clear the date range filter, then I see all audit records (no date restriction)

### Filter by User
- [ ] Given I am on the Audit Trail Viewer, when I select User "John Smith" from the filter dropdown and click "[Apply Filters]", then I see only actions performed by John Smith
- [ ] Given I am on the Audit Trail Viewer, when I type "jsmith" in the User filter search box, then the dropdown shows matching usernames

### Filter by Entity Type
- [ ] Given I am on the Audit Trail Viewer, when I select Entity Type "User" from the filter dropdown and click "[Apply Filters]", then I see only audit records related to user management actions
- [ ] Given I am on the Audit Trail Viewer, when I select Entity Type "Instrument" from the filter dropdown, then I see only audit records for instrument master data changes
- [ ] Given I am on the Audit Trail Viewer, when I view entity type options, then I see: User, Role, ApprovalAuthority, Batch, Instrument, Portfolio, AssetManager, IndexPrice, Duration, Beta, CreditRating, CustomHolding

### Filter by Action
- [ ] Given I am on the Audit Trail Viewer, when I select Action "user.created" from the filter dropdown, then I see only user creation events
- [ ] Given I am on the Audit Trail Viewer, when I select Action "role.assigned", then I see only role assignment events
- [ ] Given I am on the Audit Trail Viewer, when I view action options, then I see all tracked actions including: user.created, user.updated, user.deactivated, role.assigned, role.removed, approvalAuthority.added, etc.

### View Audit Record Details
- [ ] Given I am on the Audit Trail Viewer, when I click on an audit record, then I see an expanded view with complete details including before/after values (if applicable)
- [ ] Given I am viewing a record for "user.updated", when I look at the details, then I see "Email changed from 'old@company.com' to 'new@company.com'" with timestamp and who made the change
- [ ] Given I am viewing a record for "role.assigned", when I look at the details, then I see which role was assigned, to which user, effective date, and the reason provided

### Entity-Specific Audit Trail
- [ ] Given I am on the Audit Trail Viewer, when I enter Entity ID "42" and Entity Type "Instrument", then I see complete change history for that specific instrument
- [ ] Given I am viewing entity-specific audit trail, when I look at the results, then I see all changes made to that entity sorted chronologically (oldest to newest)

### Temporal Table Queries (Per BR-AUD-001)
- [ ] Given I am viewing audit trail for a User entity, when I look at the details, then I see data from both the UserHistory temporal table (for before/after values) and UserActivityLog table (for action details)
- [ ] Given I am viewing a master data change, when I look at the audit record, then I see the complete before and after values captured by SQL Server temporal tables

### User Activity Summary
- [ ] Given I am on the Audit Trail Viewer, when I filter by User "John Smith", then I see a summary panel showing "Total Actions: 145 | Date Range: 2025-01-15 to 2026-01-05 | Most Common Action: instrument.updated"
- [ ] Given I am viewing user activity summary, when I click "[View User Profile]", then I am navigated to the User Details screen for that user

### Export Audit Trail
- [ ] Given I am on the Audit Trail Viewer, when I apply filters and click "[📊 Export Audit Trail]", then an Excel file is downloaded containing all visible audit records matching the filters
- [ ] Given I export audit trail, when I open the Excel file, then I see columns: Timestamp, Username, Display Name, Action, Entity Type, Entity ID, Details, IP Address

### Point-in-Time Queries (Per BR-AUD-001)
- [ ] Given I am viewing an entity audit trail, when I select "View as of date: 2025-12-01", then I see the entity's state as it existed on that specific date (using temporal table FOR SYSTEM_TIME AS OF query)

### Security Audit Queries
- [ ] Given I am on the Audit Trail Viewer, when I select preset filter "Failed Login Attempts - Last 7 Days", then I see all failed login attempts from UserLoginLog table
- [ ] Given I am on the Audit Trail Viewer, when I select preset filter "User Deactivations - Last 30 Days", then I see all user deactivation events with reasons
- [ ] Given I am on the Audit Trail Viewer, when I select preset filter "Approval Authority Changes", then I see all changes to approval authority configuration

### Real-Time Updates
- [ ] Given I am on the Audit Trail Viewer with no date filter, when another user performs an action, then the new audit record appears at the top of the list within 5 seconds

### Authorization Check
- [ ] Given I have the Administrator role, when I navigate to `/admin/audit-trail`, then I can view all audit records
- [ ] Given I have the Analyst role with 'audit.view' permission, when I navigate to `/admin/audit-trail`, then I can view audit records but cannot export
- [ ] Given I do NOT have 'audit.view' permission, when I attempt to navigate to `/admin/audit-trail`, then I see an error message "Access denied. Audit view permission required."

### Audit Trail Completeness (Per BR-AUD-002)
- [ ] Given I am on the Audit Trail Viewer, when I filter by Entity Type, then I see audit trails for all master data entities: Instruments, IndexPrices, Durations, Betas, CreditRatings, CustomHoldings, and all reference data entities
- [ ] Given I am on the Audit Trail Viewer, when I filter by Action, then I see create, update, delete, approve, reject actions for all auditable entities

### Performance
- [ ] Given I am on the Audit Trail Viewer, when I query audit records for the last 90 days, then results load within 2 seconds
- [ ] Given I am on the Audit Trail Viewer with 10,000+ matching records, when I scroll, then pagination loads the next page within 1 second

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/audit/activity` | Get user activity log with filtering |
| GET | `/v1/audit/entity/{entityType}/{entityId}` | Get audit trail for specific entity |
| GET | `/v1/audit/entity/{entityType}/{entityId}/history` | Get temporal table history (before/after values) |
| GET | `/v1/audit/logins` | Get login attempt history |
| GET | `/v1/audit/summary/user/{userId}` | Get activity summary for a user |
| GET | `/v1/audit/export` | Export filtered audit trail to Excel |

## Implementation Notes

- **Dual Logging**: User actions logged to UserActivityLog table; data changes captured automatically by SQL Server temporal tables
- **Temporal Tables**: All master data tables use SQL Server temporal tables with SYSTEM_VERSIONING for automatic before/after tracking
- **Point-in-Time Queries**: Use `FOR SYSTEM_TIME AS OF` SQL syntax to query historical state
- **IP Address Tracking**: All audit records include IP address of the user who performed the action
- **Retention**: Audit data retained for 7 years per regulatory requirements (BR-AUD-001)
- **Wireframe Reference**: Screen 16 - Audit Trail Viewer
- **BRD Requirements**: BR-AUD-001 (Complete Audit Trails), BR-AUD-002 (Audit Trail Coverage), BR-AUD-004 (User Activity Tracking), BR-AUD-005 (Audit Trail Access)

## Dependencies
- **Story 1**: User Authentication (audit records link to authenticated users)
- **Story 3**: User Lifecycle Management (user actions generate audit records)
- **Story 4**: Role Assignment (role changes generate audit records)
- **Story 5**: Approval Authority Config (authority changes generate audit records)

## Story Points
**8** - Complex filtering, temporal table queries, point-in-time views, export functionality, performance optimization for large datasets, dual data sources (activity log + temporal tables)
