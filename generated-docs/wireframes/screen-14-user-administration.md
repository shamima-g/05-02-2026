# Screen: User Administration

## Purpose
User lifecycle management including creation, updates, deactivation, reactivation, and viewing user activity for access control and security.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Admin: [Users v] | Roles & Permissions | Audit Trail                       |
+------------------------------------------------------------------------------+
|                                                                              |
|  User Administration                                                         |
|                                                                              |
|  [+ Add New User]  [📊 Export User List]  [📋 View Login Activity]          |
|                                                                              |
|  Search: [Search by name, email, username.........................]  [🔍]   |
|                                                                              |
|  Filters:                                                                    |
|  Status: [All v]  Role: [All v]  Department: [All v]                        |
|  Show: (•) Active Users  ( ) Inactive Users  ( ) All Users                  |
|                                                                              |
|  Showing 24 active users                                                     |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Name              | Email            | Roles          | Status | Act |  |
|  +------------------------------------------------------------------------+  |
|  | Sarah Johnson     | sarah.j@...      | Analyst        | ✓ Active    |  |
|  | Dept: Operations  | Username: sjohnson|                | [Edit]      |  |
|  | Last Login: 2026-01-05 16:45 | Created: 2025-02-10    | [View]      |  |
|  |                                                        | [Deactivate]|  |
|  |                                                        | [Delete]    |  |
|  +------------------------------------------------------------------------+  |
|  | John Smith        | john.smith@...   | Analyst,       | ✓ Active    |  |
|  | Dept: Operations  | Username: jsmith | Approver L1    | [Edit]      |  |
|  | Last Login: 2026-01-05 14:23 | Created: 2025-01-15    | [View]      |  |
|  |                                                        | [Deactivate]|  |
|  |                                                        | [Delete]    |  |
|  +------------------------------------------------------------------------+  |
|  | Jane Williams     | j.williams@...   | Analyst,       | ✓ Active    |  |
|  | Dept: Operations  | Username: jwilliams| Approver L2   | [Edit]      |  |
|  | Last Login: 2026-01-05 11:30 | Created: 2025-01-15    | [View]      |  |
|  |                                                        | [Deactivate]|  |
|  |                                                        | [Delete]    |  |
|  +------------------------------------------------------------------------+  |
|  | Jennifer Lee      | j.lee@...        | Approver L3    | ✓ Active    |  |
|  | Dept: Executive   | Username: jlee   | (Executive)    | [Edit]      |  |
|  | Last Login: 2026-01-04 09:15 | Created: 2025-01-15    | [View]      |  |
|  |                                                        | [Deactivate]|  |
|  |                                                        | [Delete]    |  |
|  +------------------------------------------------------------------------+  |
|  | David Brown       | d.brown@...      | Administrator, | ✓ Active    |  |
|  | Dept: IT          | Username: dbrown | Analyst        | [Edit]      |  |
|  | Last Login: 2026-01-05 08:00 | Created: 2025-01-15    | [View]      |  |
|  |                                                        | [Deactivate]|  |
|  |                                                        | [Delete]    |  |
|  +------------------------------------------------------------------------+  |
|  | Emily Davis       | e.davis@...      | Analyst        | ⚠ Inactive  |  |
|  | Dept: Operations  | Username: edavis | (Deactivated)  | [Edit]      |  |
|  | Last Login: 2025-11-30 | Deactivated: 2025-12-15       | [View]      |  |
|  | Reason: Left company                                   | [Reactivate]|  |
|  |                                                        | [Delete]    |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [1] [2] [3]                                           Rows per page: 10    |
|                                                                              |
+------------------------------------------------------------------------------+

ADD/EDIT USER MODAL:
+------------------------------------------------------------------------------+
|  Add New User                                                   [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Tab: [Basic Info] | Roles & Permissions | Contact Details | Security      |
|                                                                              |
|  BASIC INFORMATION                                                           |
|                                                                              |
|  First Name:             [John.................................]             |
|  Last Name:              [Smith................................]             |
|  Email Address:          [john.smith@company.com...............]            |
|                          (Used for login and notifications)                  |
|                                                                              |
|  Username:               [jsmith..............]                              |
|                          (Unique identifier for login)                       |
|                                                                              |
|  Employee ID:            [EMP-12345........]  (Optional)                     |
|                                                                              |
|  ORGANIZATIONAL                                                              |
|                                                                              |
|  Department:             [Operations v]                                      |
|                          (Operations, Portfolio Management, Executive, IT)   |
|                                                                              |
|  Job Title:              [Analyst.............................]                |
|  Manager:                [David Brown v]  (Reporting manager)                |
|                                                                              |
|  CONTACT DETAILS (Tab)                                                       |
|                                                                              |
|  Office Phone:           [+1-555-0123........]                               |
|  Mobile Phone:           [+1-555-0124........]                               |
|  Office Location:        [New York HQ........]                               |
|                                                                              |
|  SECURITY (Tab)                                                              |
|                                                                              |
|  Initial Password:       [Generate Random]  [Manual Entry]                   |
|  If Manual:              [............]  (Min 12 chars, complexity required) |
|                                                                              |
|  Password Options:                                                           |
|  [✓] Force password change on first login                                    |
|  [✓] Send welcome email with login instructions                              |
|                                                                              |
|  Multi-Factor Auth:      [Enabled v]  (Enabled, Optional, Disabled)         |
|                                                                              |
|  Session Timeout:        [30...] minutes of inactivity                       |
|                                                                              |
|  Account Status:         (•) Active  ( ) Inactive                            |
|  Activation Date:        [2026-01-06]  [📅]  (When user gets access)        |
|  Expiration Date:        [None...]  [📅]  (Optional, for contractors)       |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | ROLES & PERMISSIONS (Tab)                                            |    |
|  +----------------------------------------------------------------------+    |
|  | Select one or more roles for this user:                              |    |
|  |                                                                      |    |
|  | [✓] Analyst                                                          |    |
|  |     • Data correction and master data maintenance                    |    |
|  |     • Commentary and documentation                                   |    |
|  |     • Pages: All except Approval L1/L2/L3 and User Management       |    |
|  |                                                                      |    |
|  | [ ] Approver Level 1 (Operations)                                    |    |
|  |     • Approve batches at operations level                            |    |
|  |     • Focus: File completeness, data validation                      |    |
|  |     • Pages: Approval Level 1 only                                   |    |
|  |                                                                      |    |
|  | [ ] Approver Level 2 (Portfolio Manager)                             |    |
|  |     • Approve batches at portfolio manager level                     |    |
|  |     • Focus: Holdings reasonableness, performance                    |    |
|  |     • Pages: Approval Level 2 only                                   |    |
|  |                                                                      |    |
|  | [ ] Approver Level 3 (Executive)                                     |    |
|  |     • Final approval before publication                              |    |
|  |     • Focus: Overall report quality                                  |    |
|  |     • Pages: Approval Level 3 only                                   |    |
|  |                                                                      |    |
|  | [ ] Administrator                                                    |    |
|  |     • User management and system configuration                       |    |
|  |     • Pages: Users, Roles only                                       |    |
|  |                                                                      |    |
|  | (Custom roles also appear here if created by administrators)         |    |
|  |                                                                      |    |
|  | ⚠ Note: User cannot approve their own work (segregation of duties)  |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  BACKUP APPROVER DESIGNATION (if Approver role selected)                    |
|                                                                              |
|  Backup Approvers:       [Sarah Johnson v]  [+ Add Backup]                  |
|                          (Users who can approve when primary unavailable)    |
|                                                                              |
|  Out of Office:          [ ] Currently out of office                         |
|  If OOO, delegate to:    [Sarah Johnson v]                                   |
|  Return Date:            [2026-01-15]  [📅]                                  |
|                                                                              |
|  [Create User]  [Cancel]                                                     |
|                                                                              |
+------------------------------------------------------------------------------+

USER DETAIL VIEW:
+------------------------------------------------------------------------------+
|  User Details - John Smith                                      [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Tab: [Overview] | Activity Log | Permissions | Audit Trail                 |
|                                                                              |
|  BASIC INFORMATION                                                           |
|                                                                              |
|  Name:                   John Smith                                          |
|  Username:               jsmith                                              |
|  Email:                  john.smith@company.com                              |
|  Employee ID:            EMP-12345                                           |
|                                                                              |
|  Department:             Operations                                          |
|  Job Title:              Analyst                                             |
|  Manager:                David Brown                                         |
|                                                                              |
|  ACCOUNT STATUS                                                              |
|                                                                              |
|  Status:                 ✓ Active                                            |
|  Created:                2025-01-15 by David Brown                           |
|  Last Modified:          2025-11-20 by David Brown                           |
|  Last Login:             2026-01-05 14:23 from IP 192.168.1.45               |
|  Failed Login Attempts:  0 (since last success)                              |
|                                                                              |
|  ASSIGNED ROLES                                                              |
|                                                                              |
|  • Analyst (Assigned: 2025-01-15)                                            |
|                                                                              |
|  ACTIVITY SUMMARY (Tab: Activity Log)                                        |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Recent Activity (Last 30 days)                                         |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 14:23 - Login (IP: 192.168.1.45)                           |  |
|  | 2026-01-05 14:30 - Updated 12 credit ratings                           |  |
|  | 2026-01-05 15:45 - Confirmed data ready for approval (Batch Jan 2026) |  |
|  | 2026-01-05 16:30 - Approved Level 1 (Batch Jan 2026)                  |  |
|  | 2026-01-05 17:00 - Logout                                              |  |
|  |                                                                        |  |
|  | 2026-01-04 08:15 - Login (IP: 192.168.1.45)                           |  |
|  | 2026-01-04 09:30 - Imported 45 files (Asset Manager A)                 |  |
|  | 2026-01-04 11:45 - Updated instrument master data (15 instruments)     |  |
|  | 2026-01-04 16:00 - Logout                                              |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [View Full Activity Log]  [Export Activity]                                 |
|                                                                              |
|  PERMISSIONS DETAIL (Tab: Permissions)                                       |
|                                                                              |
|  Analyst Role:                                                               |
|  Page Access: All except Approval L1/L2/L3 and User Management              |
|  ✓ Data correction and master data maintenance                               |
|  ✓ Modify master data during Data Preparation                                |
|  ✓ Add commentary and documentation                                          |
|  ✓ View validation and calculation results                                   |
|  ✗ Cannot approve batches                                                    |
|  ✗ Cannot modify data during approval phases                                 |
|  ✗ Cannot access User Management or Role Management                          |
|                                                                              |
+------------------------------------------------------------------------------+

DEACTIVATE USER MODAL:
+------------------------------------------------------------------------------+
|  Deactivate User - John Smith                                  [Close ✕]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  Are you sure you want to deactivate this user?                              |
|                                                                              |
|  User: John Smith (jsmith)                                                   |
|  Roles: Approver Level 1                                                     |
|  Last Login: 2026-01-05 14:23                                                |
|                                                                              |
|  ⚠ DEACTIVATION WILL:                                                        |
|  • Immediately revoke all system access                                      |
|  • Prevent user from logging in                                              |
|  • Preserve user record and audit trail                                      |
|  • Remove from active approver lists                                         |
|                                                                              |
|  ⚠ APPROVAL IMPACT:                                                          |
|  This user is currently designated as Level 1 Approver.                      |
|  Batches awaiting their approval will need to be reassigned.                 |
|                                                                              |
|  Effective Date:         [2026-01-06]  [📅]  (Immediate or future date)     |
|                                                                              |
|  Reason for Deactivation: [Left company for new opportunity........]        |
|                          [................................................]   |
|                          (Required for audit trail and HR purposes)         |
|                                                                              |
|  Transfer Pending Work To: [Sarah Johnson v]                                 |
|                            (Reassign batches awaiting this user's approval)  |
|                                                                              |
|  [Confirm Deactivation]  [Cancel]                                            |
|                                                                              |
+------------------------------------------------------------------------------+

DELETE USER MODAL:
+------------------------------------------------------------------------------+
|  Delete User - John Smith                                    [Close ✕]      |
+------------------------------------------------------------------------------+
|                                                                              |
|  ⚠ WARNING: This action is permanent and cannot be undone.                  |
|                                                                              |
|  Are you sure you want to permanently delete this user?                      |
|                                                                              |
|  User: John Smith (jsmith)                                                   |
|  Email: john.smith@company.com                                               |
|  Roles: Analyst, Approver Level 1                                            |
|  Last Login: 2026-01-05 14:23                                                |
|                                                                              |
|  ⚠ DELETION WILL:                                                            |
|  • Permanently remove the user record from the system                        |
|  • Remove all role assignments                                               |
|  • This action cannot be reversed                                            |
|                                                                              |
|  Type the username "jsmith" to confirm deletion:                             |
|  [.........................................]                                  |
|                                                                              |
|  [Confirm Delete]  [Cancel]                                                  |
|                                                                              |
+------------------------------------------------------------------------------+

LOGIN ACTIVITY VIEW:
+------------------------------------------------------------------------------+
|  Login Activity Report                                          [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Date Range: [2026-01-01] to [2026-01-05]  [Apply]                          |
|                                                                              |
|  Filters: Status: [All v]  User: [All v]                                    |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Timestamp         | User        | Status   | IP Address   | Location |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 14:23  | jsmith      | ✓ Success| 192.168.1.45 | New York |  |
|  | 2026-01-05 11:30  | mchen       | ✓ Success| 192.168.1.52 | New York |  |
|  | 2026-01-05 09:15  | jlee        | ✓ Success| 192.168.1.30 | New York |  |
|  | 2026-01-05 08:00  | dbrown      | ✓ Success| 192.168.1.88 | New York |  |
|  | 2026-01-04 23:45  | unknown     | ✗ Failed | 203.45.67.89 | Unknown  |  |
|  |                   | (invalid pw)| Attempt 3| (Blocked)    |          |  |
|  | 2026-01-04 16:45  | sjohnson    | ✓ Success| 192.168.1.67 | New York |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Summary: 145 successful logins | 3 failed attempts | 0 locked accounts     |
|                                                                              |
|  [Export Login Report]  [View Failed Logins Only]                           |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Add New User] | Button | Create new user account |
| [📊 Export User List] | Button | Download user list to Excel |
| [📋 View Login Activity] | Button | View login success/failure report |
| User Table | Data Table | Shows users with roles, status, and last login |
| Status Badge | Visual Indicator | ✓ Active or ⚠ Inactive with reason |
| [Edit] | Link | Modify user details and roles |
| [View] | Link | View complete user details and activity |
| [Deactivate] | Link | Deactivate user account (soft delete) |
| [Delete] | Link | Permanently delete user from the system |
| [Reactivate] | Link | Restore access for inactive user |
| Delete Modal | Confirmation Dialog | Username confirmation required for permanent deletion |
| Add/Edit Modal - Tabbed | Multi-Tab Form | Basic info, roles, contact, security settings |
| Roles Checklist | Checkbox List | Assign one or more roles with permission descriptions |
| Backup Approver Selector | Dropdown | Designate backup approvers for continuity |
| User Detail View | Modal Display | Overview, activity log, permissions, audit trail tabs |
| Activity Log | Timeline | Recent user actions with timestamps |
| Deactivate Modal | Confirmation Dialog | Collect reason and reassign pending work |
| Login Activity Report | Data Table | Login success/failure tracking with IP addresses |

## User Actions

- **Add New User**: Create user account with roles and permissions
- **Edit User**: Modify user details, roles, or settings
- **View User Details**: See complete user information and activity
- **Deactivate User**: Revoke access immediately (soft delete, preserves audit trail)
- **Delete User**: Permanently remove user from the system (requires username confirmation)
- **Reactivate User**: Restore access for previously deactivated user
- **View Login Activity**: See login attempts, successes, failures across all users
- **Export User List**: Download user list for reporting or auditing
- **Assign Backup Approver**: Designate backup for business continuity
- **View Activity Log**: See user's recent actions in the system

## Business Rules

- Users can be permanently deleted (hard delete) with username confirmation
- Deactivation is preferred for audit trail preservation; deletion is for permanent removal
- User changes fully audited (who, what, when)
- Deactivated users lose all access immediately
- User changes take effect in real-time
- Users can have multiple roles (permissions are cumulative)
- Users cannot approve their own work (segregation of duties)
- Failed login attempts logged for security monitoring
- Account lockout after configurable failed attempts
- Session timeouts enforced for security
- Multi-factor authentication configurable per user

## Navigation
- **From:** Admin section, user profile dropdown
- **To:** Role & permission management, audit trail viewer

## State Dependencies
- Only administrators can access this screen
- User activation/deactivation takes immediate effect across system
- Deactivating approver requires reassignment of pending approvals

## Security Features

- Password complexity requirements enforced
- Force password change on first login option
- Multi-factor authentication support
- Session timeout configuration
- Failed login attempt tracking
- Account lockout protection
- IP address logging for security audits

## Segregation of Duties

The system enforces:
- Users cannot approve batches they prepared
- Approval authority cannot overlap with data entry for same batch
- Administrator role separated from operational roles
- Audit trail access controlled separately

## Backup Approver Workflow

When primary approver is unavailable:
```
+------------------------------------------------------------------------+
|  OUT OF OFFICE NOTIFICATION                                            |
+------------------------------------------------------------------------+
|  John Smith (Approver Level 1) is currently out of office.             |
|  Return Date: 2026-01-15                                               |
|                                                                        |
|  Approvals delegated to: Sarah Johnson                                 |
|                                                                        |
|  All batches awaiting John Smith's approval will be routed to Sarah    |
|  Johnson until return date.                                            |
+------------------------------------------------------------------------+
```

## Initial Users (Seed Data)

The system must be pre-configured with the following users:

| User | Roles |
|------|-------|
| **Analyst** | Analyst, Approval Level 1 |
| **Senior Analyst** | Analyst, Approval Level 2 |
| **Head of Investments** | Approval Level 3 |
| **Administrator** | Administrator, Analyst |

**Note:** A user can have multiple roles. Permissions are cumulative across all assigned roles.
