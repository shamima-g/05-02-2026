# Screen: Role & Permission Management

## Purpose
Assign roles to users, configure approval authorities, manage permissions, and define role-based access control with approval delegation support.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Admin: Users | [Roles & Permissions v] | Audit Trail                      |
+------------------------------------------------------------------------------+
|                                                                              |
|  Role & Permission Management                                                |
|                                                                              |
|  Tab: [Role Definitions] | User Role Assignments | Approval Authority Config|
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  SYSTEM ROLES                                                          |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  [Operations Lead]                                    12 users         |  |
|  |  Full data entry, file management, workflow orchestration             |  |
|  |  [View Permissions]  [View Assigned Users]                            |  |
|  |                                                                        |  |
|  |  [Analyst]                                             8 users         |  |
|  |  Data correction, master data maintenance, commentary                 |  |
|  |  [View Permissions]  [View Assigned Users]                            |  |
|  |                                                                        |  |
|  |  [Approver Level 1 - Operations]                       4 users         |  |
|  |  Approve batches at operations level (file completeness, validation)  |  |
|  |  [View Permissions]  [View Assigned Users]  [Configure Authority]     |  |
|  |                                                                        |  |
|  |  [Approver Level 2 - Portfolio Manager]                2 users         |  |
|  |  Approve batches at PM level (holdings reasonableness, performance)   |  |
|  |  [View Permissions]  [View Assigned Users]  [Configure Authority]     |  |
|  |                                                                        |  |
|  |  [Approver Level 3 - Executive]                        2 users         |  |
|  |  Final approval before publication (overall report quality)           |  |
|  |  [View Permissions]  [View Assigned Users]  [Configure Authority]     |  |
|  |                                                                        |  |
|  |  [Administrator]                                       3 users         |  |
|  |  User management, system configuration, audit access                  |  |
|  |  [View Permissions]  [View Assigned Users]                            |  |
|  |                                                                        |  |
|  |  [Read-Only]                                          18 users         |  |
|  |  View access only, no modifications                                   |  |
|  |  [View Permissions]  [View Assigned Users]                            |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

ROLE PERMISSIONS DETAIL VIEW:
+------------------------------------------------------------------------------+
|  Role Permissions - Operations Lead                             [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Role: Operations Lead                                                       |
|  Description: Orchestrates the end-to-end reporting process                  |
|  Assigned Users: 12                                                          |
|                                                                              |
|  FUNCTIONAL PERMISSIONS                                                      |
|                                                                              |
|  Batch Management:                                                           |
|  ✓ Create new batches                                                        |
|  ✓ View all batches                                                          |
|  ✓ Switch between batches                                                    |
|  ✓ Confirm data ready for approval                                           |
|  ✗ Cannot delete batches                                                     |
|                                                                              |
|  File Operations:                                                            |
|  ✓ Upload files manually                                                     |
|  ✓ Trigger automated imports                                                 |
|  ✓ Retry failed imports                                                      |
|  ✓ View file status and error details                                        |
|  ✓ Cancel and reprocess files                                                |
|                                                                              |
|  Master Data (During Data Preparation Phase Only):                           |
|  ✓ Create, edit, delete instruments                                          |
|  ✓ Manage index prices                                                       |
|  ✓ Manage risk metrics (duration, YTM)                                       |
|  ✓ Manage volatility metrics (beta)                                          |
|  ✓ Manage credit ratings                                                     |
|  ✓ Manage custom holdings                                                    |
|  ✗ Cannot modify during approval phases (state-based lock)                   |
|                                                                              |
|  Validation & Calculations:                                                  |
|  ✓ View validation results                                                   |
|  ✓ Run calculations                                                          |
|  ✓ View calculation status and errors                                        |
|  ✓ Export validation reports                                                 |
|                                                                              |
|  Workflow:                                                                   |
|  ✓ Confirm data ready for approval                                           |
|  ✓ View workflow status                                                      |
|  ✓ Add commentary and documentation                                          |
|  ✗ Cannot approve batches (must be done by designated approvers)             |
|                                                                              |
|  Reporting:                                                                  |
|  ✓ Export data to Excel                                                      |
|  ✓ View audit trails                                                         |
|  ✓ View calculation logs                                                     |
|                                                                              |
|  STATE-BASED ACCESS CONTROL:                                                 |
|  • Data Preparation Phase: Full edit access to files and master data         |
|  • During Approval: Read-only access, no modifications allowed               |
|  • After Rejection: Full edit access restored                                |
|                                                                              |
|  [Close]                                                                     |
|                                                                              |
+------------------------------------------------------------------------------+

USER ROLE ASSIGNMENTS TAB:
+------------------------------------------------------------------------------+
|  Role & Permission Management                                                |
|                                                                              |
|  Tab: Role Definitions | [User Role Assignments] | Approval Authority Config|
|                                                                              |
|  Search User: [Search by name, email, username......................]  [🔍] |
|                                                                              |
|  Filters: Role: [All v]  Department: [All v]  Status: [Active v]            |
|                                                                              |
|  Showing 24 active users                                                     |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | User              | Current Roles                | Actions             |  |
|  +------------------------------------------------------------------------+  |
|  | John Smith        | • Operations Lead            | [Modify Roles]      |  |
|  | jsmith            | • Approver Level 1           | [View Permissions]  |  |
|  | Dept: Operations  | Assigned: 2025-01-15         |                     |  |
|  +------------------------------------------------------------------------+  |
|  | Sarah Johnson     | • Analyst                    | [Modify Roles]      |  |
|  | sjohnson          | • Read-Only                  | [View Permissions]  |  |
|  | Dept: Operations  | Assigned: 2025-02-10         |                     |  |
|  +------------------------------------------------------------------------+  |
|  | Michael Chen      | • Approver Level 2 (PM)      | [Modify Roles]      |  |
|  | mchen             | • Read-Only                  | [View Permissions]  |  |
|  | Dept: Portfolio   | Assigned: 2025-01-15         |                     |  |
|  +------------------------------------------------------------------------+  |
|  | Jennifer Lee      | • Approver Level 3 (Exec)    | [Modify Roles]      |  |
|  | jlee              | • Read-Only                  | [View Permissions]  |  |
|  | Dept: Executive   | Assigned: 2025-01-15         |                     |  |
|  +------------------------------------------------------------------------+  |
|  | David Brown       | • Administrator              | [Modify Roles]      |  |
|  | dbrown            | • Read-Only                  | [View Permissions]  |  |
|  | Dept: IT          | Assigned: 2025-01-15         |                     |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

MODIFY USER ROLES MODAL:
+------------------------------------------------------------------------------+
|  Modify Roles - John Smith                                      [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  User: John Smith (jsmith)                                                   |
|  Department: Operations                                                      |
|                                                                              |
|  SELECT ROLES (multiple allowed):                                            |
|                                                                              |
|  [✓] Operations Lead                                                         |
|      Full data entry capabilities during Data Preparation                    |
|      File management and workflow orchestration                              |
|                                                                              |
|  [ ] Analyst                                                                 |
|      Data correction and master data maintenance                             |
|      Commentary and documentation                                            |
|                                                                              |
|  [✓] Approver Level 1 (Operations)                                           |
|      Approve batches at operations level                                     |
|      Focus: File completeness, data validation                               |
|                                                                              |
|  [ ] Approver Level 2 (Portfolio Manager)                                    |
|      Approve batches at portfolio manager level                              |
|      Focus: Holdings reasonableness, performance                             |
|                                                                              |
|  [ ] Approver Level 3 (Executive)                                            |
|      Final approval before publication                                       |
|      Focus: Overall report quality                                           |
|                                                                              |
|  [ ] Administrator                                                           |
|      User management and system configuration                                |
|      Audit trail access, reference data management                           |
|                                                                              |
|  [ ] Read-Only                                                               |
|      View access only, no modifications                                      |
|                                                                              |
|  PERMISSION CONFLICTS:                                                       |
|  ⚠ Note: If multiple roles assigned, most restrictive permission applies     |
|          when conflicts exist                                                |
|                                                                              |
|  SEGREGATION OF DUTIES:                                                      |
|  ✓ User cannot approve batches they prepared                                 |
|  ✓ Approval authority and data entry separated for same batch                |
|                                                                              |
|  Effective Date:         [2026-01-06]  [📅]  (When changes take effect)     |
|                                                                              |
|  Reason for Change:      [Promotion to team lead role................]      |
|                         [................................................]     |
|                         (Required for audit trail)                          |
|                                                                              |
|  [Save Role Changes]  [Cancel]                                               |
|                                                                              |
+------------------------------------------------------------------------------+

APPROVAL AUTHORITY CONFIGURATION TAB:
+------------------------------------------------------------------------------+
|  Role & Permission Management                                                |
|                                                                              |
|  Tab: Role Definitions | User Role Assignments | [Approval Authority Config]|
|                                                                              |
|  Configure which users can approve at each level with backup approvers       |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  LEVEL 1 APPROVAL - OPERATIONS                                         |  |
|  +------------------------------------------------------------------------+  |
|  |  Focus: Data completeness, file receipt, validation checks             |  |
|  |                                                                        |  |
|  |  Primary Approvers:                                                    |  |
|  |  • John Smith (Operations Lead)                [Active]                |  |
|  |  • Sarah Johnson (Analyst)                     [Active]                |  |
|  |  • David Williams (Operations Lead)            [Active]                |  |
|  |  • Lisa Anderson (Analyst)                     [Active]                |  |
|  |                                                                        |  |
|  |  [+ Add Approver]  [Remove Selected]                                   |  |
|  |                                                                        |  |
|  |  Approval Rules:                                                       |  |
|  |  ( ) Any one approver can approve                                      |  |
|  |  (•) Specific approver assigned per batch                              |  |
|  |  ( ) Requires consensus from 2+ approvers                              |  |
|  |                                                                        |  |
|  |  [Configure Backup Approvers]                                          |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  LEVEL 2 APPROVAL - PORTFOLIO MANAGER                                  |  |
|  +------------------------------------------------------------------------+  |
|  |  Focus: Holdings reasonableness, performance results, risk metrics     |  |
|  |                                                                        |  |
|  |  Primary Approvers:                                                    |  |
|  |  • Michael Chen (Portfolio Manager)            [Active]                |  |
|  |  • Jessica Martinez (Portfolio Manager)        [Out: Until 2026-01-15] |  |
|  |    Backup: Michael Chen                                                |  |
|  |                                                                        |  |
|  |  [+ Add Approver]  [Remove Selected]                                   |  |
|  |                                                                        |  |
|  |  Approval Rules:                                                       |  |
|  |  (•) Any one approver can approve                                      |  |
|  |  ( ) Specific approver assigned per batch                              |  |
|  |  ( ) Requires consensus from 2+ approvers                              |  |
|  |                                                                        |  |
|  |  [Configure Backup Approvers]                                          |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  LEVEL 3 APPROVAL - EXECUTIVE                                          |  |
|  +------------------------------------------------------------------------+  |
|  |  Focus: Overall report quality, material issues, final sign-off        |  |
|  |                                                                        |  |
|  |  Primary Approvers:                                                    |  |
|  |  • Jennifer Lee (Chief Investment Officer)     [Active]                |  |
|  |  • Robert Johnson (CFO)                        [Active]                |  |
|  |                                                                        |  |
|  |  [+ Add Approver]  [Remove Selected]                                   |  |
|  |                                                                        |  |
|  |  Approval Rules:                                                       |  |
|  |  (•) Any one approver can approve                                      |  |
|  |  ( ) Specific approver assigned per batch                              |  |
|  |  ( ) Requires consensus from 2+ approvers                              |  |
|  |                                                                        |  |
|  |  [Configure Backup Approvers]                                          |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Changes apply to NEW batches only. In-progress batches retain original      |
|  approver assignments.                                                       |
|                                                                              |
|  [Save Approval Authority Configuration]                                     |
|                                                                              |
+------------------------------------------------------------------------------+

BACKUP APPROVER CONFIGURATION MODAL:
+------------------------------------------------------------------------------+
|  Configure Backup Approvers - Level 2                           [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Level: Level 2 - Portfolio Manager Approval                                 |
|                                                                              |
|  Backup approvers ensure business continuity when primary approvers are      |
|  unavailable (vacation, sick leave, etc.)                                    |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Primary Approver     | Backup Approver(s)        | Status             |  |
|  +------------------------------------------------------------------------+  |
|  | Michael Chen         | Jessica Martinez          | [Edit]             |  |
|  |                      | Robert Johnson (L3)       |                    |  |
|  +------------------------------------------------------------------------+  |
|  | Jessica Martinez     | Michael Chen              | [Edit]             |  |
|  |                      | (Currently OOO until      |                    |  |
|  |                      |  2026-01-15)              |                    |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [+ Add Backup Mapping]                                                      |
|                                                                              |
|  BACKUP RULES:                                                               |
|  • Backup approver must have same or higher approval level                   |
|  • Primary approver must explicitly designate out-of-office status           |
|  • Batches automatically route to backup when primary is OOO                 |
|  • Audit trail records who approved (primary or backup)                      |
|                                                                              |
|  [Save Backup Configuration]  [Cancel]                                       |
|                                                                              |
+------------------------------------------------------------------------------+

SEGREGATION OF DUTIES WARNING:
+------------------------------------------------------------------------------+
|  Segregation of Duties Violation                                [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  ⚠ CANNOT ASSIGN ROLES: Segregation of Duties Conflict                      |
|                                                                              |
|  User: John Smith                                                            |
|  Attempted Role Assignment: Operations Lead + Approver Level 1               |
|                                                                              |
|  This combination creates a segregation of duties conflict:                  |
|  • Operations Lead can prepare data for batches                              |
|  • Approver Level 1 can approve batches at operations level                  |
|  • Same user cannot prepare and approve the same batch                       |
|                                                                              |
|  RESOLUTION OPTIONS:                                                         |
|                                                                              |
|  1. Allow roles but enforce system check                                     |
|     System will prevent user from approving batches they prepared            |
|     (Recommended - provides flexibility while maintaining controls)          |
|                                                                              |
|  2. Restrict to single role                                                  |
|     User must choose either Operations Lead OR Approver Level 1              |
|     (Strictest control, may limit operational flexibility)                   |
|                                                                              |
|  [Allow with System Check]  [Restrict to Single Role]  [Cancel]             |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Role Definitions Tab | Tab Panel | Shows all system roles with permission summaries |
| Role Card | Expandable Panel | Shows role name, description, user count, and actions |
| [View Permissions] | Link | View detailed permission breakdown for role |
| [View Assigned Users] | Link | See all users with this role |
| [Configure Authority] | Link | Configure approval authority for approver roles |
| User Role Assignments Tab | Tab Panel | Shows users with their assigned roles |
| [Modify Roles] | Link | Change role assignments for specific user |
| Approval Authority Config Tab | Tab Panel | Configure which users can approve at each level |
| Primary Approvers List | User List | Shows designated approvers with status |
| Approval Rules Selector | Radio Buttons | Configure approval workflow (any one, specific, consensus) |
| [Configure Backup Approvers] | Button | Set up backup approver mappings |
| Backup Approver Mapping | Table | Shows primary-to-backup approver relationships |
| Out-of-Office Indicator | Status Badge | Shows when approver is OOO with return date |

## User Actions

- **View Role Permissions**: See detailed permission breakdown for any role
- **View Assigned Users**: See all users assigned to specific role
- **Modify User Roles**: Change role assignments for user (requires reason)
- **Configure Approval Authority**: Designate which users can approve at each level
- **Set Backup Approvers**: Configure backup approver mappings for continuity
- **Mark Out of Office**: Designate approver as OOO with automatic delegation
- **View Permission Conflicts**: See warnings when role combinations conflict

## Business Rules

- Users can have multiple roles (permissions are cumulative)
- Most restrictive permission applies when conflicts exist
- Role assignments audited with user, timestamp, and reason
- Changes take effect immediately for new batches
- In-progress batches retain original approver assignments
- Backup approvers must have same or higher approval level
- System enforces segregation of duties (user cannot approve own work)
- Approval authority changes logged for audit
- Out-of-office status automatically routes approvals to backup

## Navigation
- **From:** Admin section, user administration screen
- **To:** User administration, audit trail viewer

## State Dependencies
- Only administrators can modify roles and approval authority
- Role changes take effect immediately for new operations
- Existing workflow states preserve original role assignments

## Approval Rules

Three approval workflow options per level:

1. **Any One Approver**: First designated approver to review can approve
2. **Specific Approver Assigned**: Batch assigned to specific approver at creation
3. **Requires Consensus**: Multiple approvers must agree (2+ approvals required)

## Permission Hierarchy

Roles listed in order of data access scope:

1. **Administrator**: Full system access including configuration
2. **Operations Lead**: Full data entry and workflow control during Data Prep
3. **Approver (all levels)**: Read-only access with approve/reject authority
4. **Analyst**: Data entry and correction access during Data Prep
5. **Read-Only**: View access only, no modifications

## State-Based Access Control

All roles except Administrator subject to state-based locking:

- **Data Preparation Phase**: Full edit access per role permissions
- **During Approval Process**: Read-only access (locked)
- **After Rejection**: Edit access restored per role permissions
- **Closed Batch**: Read-only access for all users

## Audit Trail

All role and permission changes logged:
- User making change
- Affected user
- Old roles vs new roles
- Effective date
- Reason for change
- Timestamp
