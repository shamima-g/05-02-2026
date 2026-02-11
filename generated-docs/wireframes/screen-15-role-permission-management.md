# Screen: Role & Permission Management

## Purpose
Create, edit, and manage roles with page access and action permissions. Configure approval authorities and backup approvers. Roles are API/database-driven and fully customizable by administrators.

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
|  [+ Create Role]                                                             |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  ROLES                                                                 |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  [Analyst]                                            8 users          |  |
|  |  Data correction, master data maintenance, commentary                  |  |
|  |  Pages: All except Approval L1/L2/L3 and User Management              |  |
|  |  [View Permissions]  [View Assigned Users]  [Edit Role]               |  |
|  |                                                                        |  |
|  |  [Approver Level 1 - Operations]                      4 users          |  |
|  |  Approve batches at operations level (file completeness, validation)   |  |
|  |  Pages: Approval Level 1 only                                          |  |
|  |  [View Permissions]  [View Assigned Users]  [Edit Role]               |  |
|  |  [Configure Authority]                                                 |  |
|  |                                                                        |  |
|  |  [Approver Level 2 - Portfolio Manager]               2 users          |  |
|  |  Approve batches at PM level (holdings reasonableness, performance)    |  |
|  |  Pages: Approval Level 2 only                                          |  |
|  |  [View Permissions]  [View Assigned Users]  [Edit Role]               |  |
|  |  [Configure Authority]                                                 |  |
|  |                                                                        |  |
|  |  [Approver Level 3 - Executive]                       2 users          |  |
|  |  Final approval before publication (overall report quality)            |  |
|  |  Pages: Approval Level 3 only                                          |  |
|  |  [View Permissions]  [View Assigned Users]  [Edit Role]               |  |
|  |  [Configure Authority]                                                 |  |
|  |                                                                        |  |
|  |  [Administrator]                                      3 users          |  |
|  |  User management, system configuration                                 |  |
|  |  Pages: Users, Roles                                                   |  |
|  |  [View Permissions]  [View Assigned Users]  [Edit Role]               |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

CREATE / EDIT ROLE MODAL:
+------------------------------------------------------------------------------+
|  Create New Role  /  Edit Role: [Role Name]                    [Close X]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  BASIC INFORMATION                                                           |
|                                                                              |
|  Role Name:             [.........................................]          |
|                         (3-50 characters, unique)                            |
|                                                                              |
|  Description:           [.........................................]          |
|                         [.........................................]          |
|                         (Max 500 characters)                                 |
|                                                                              |
|  PAGE ACCESS                                                                 |
|                                                                              |
|  Select which pages this role can access:                                    |
|                                                                              |
|  [ ] Dashboard (/)                                                           |
|  [ ] Batches (/batches)                                                      |
|  [ ] File Status Monitor (/files)                                            |
|  [ ] Data Validation (/validation)                                           |
|  [ ] Approval Level 1 (/approvals/level-1)                                   |
|  [ ] Approval Level 2 (/approvals/level-2)                                   |
|  [ ] Approval Level 3 (/approvals/level-3)                                   |
|  [ ] Master Data - Instruments (/master-data/instruments)                    |
|  [ ] Master Data - Index Prices (/master-data/index-prices)                  |
|  [ ] Master Data - Risk Metrics (/master-data/risk-metrics)                  |
|  [ ] Master Data - Volatility (/master-data/volatility)                      |
|  [ ] Master Data - Credit Ratings (/master-data/credit-ratings)              |
|  [ ] Master Data - Custom Holdings (/master-data/custom-holdings)            |
|  [ ] Reference Data (/master-data/reference-data)                            |
|  [ ] User Administration (/admin/users)                                      |
|  [ ] Role Management (/admin/roles)                                          |
|  [ ] Audit Trail (/admin/audit-trail)                                        |
|                                                                              |
|  ACTION PERMISSIONS                                                          |
|                                                                              |
|  Select action permissions for this role:                                    |
|                                                                              |
|  Batch Management:                                                           |
|  [ ] batch.create    - Create new batches                                    |
|  [ ] batch.view      - View all batches                                      |
|  [ ] batch.confirm   - Confirm data ready for approval                       |
|                                                                              |
|  File Operations:                                                            |
|  [ ] file.upload     - Upload files manually                                 |
|  [ ] file.import     - Trigger automated imports                             |
|  [ ] file.retry      - Retry failed imports                                  |
|  [ ] file.view       - View file status and errors                           |
|                                                                              |
|  Master Data (During Data Preparation Only):                                 |
|  [ ] instrument.create  - Create instruments                                 |
|  [ ] instrument.update  - Edit instruments                                   |
|  [ ] instrument.delete  - Delete instruments                                 |
|  [ ] masterdata.manage  - Manage index prices, risk, volatility, ratings     |
|                                                                              |
|  Approval:                                                                   |
|  [ ] approval.level1   - Approve/reject at Level 1                           |
|  [ ] approval.level2   - Approve/reject at Level 2                           |
|  [ ] approval.level3   - Approve/reject at Level 3                           |
|                                                                              |
|  Administration:                                                             |
|  [ ] users.manage      - Create, edit, deactivate users                      |
|  [ ] roles.manage      - Create and edit roles                               |
|  [ ] audit.view        - View audit trail                                    |
|                                                                              |
|  [Save Role]  [Cancel]                                                       |
|                                                                              |
+------------------------------------------------------------------------------+

ROLE PERMISSIONS DETAIL VIEW:
+------------------------------------------------------------------------------+
|  Role Permissions - Analyst                                    [Close X]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  Role: Analyst                                                               |
|  Description: Data correction, master data maintenance, commentary           |
|  Assigned Users: 8                                                           |
|                                                                              |
|  PAGE ACCESS                                                                 |
|                                                                              |
|  Allowed Pages:                                                              |
|  * Dashboard                                                                 |
|  * Batches                                                                   |
|  * File Status Monitor                                                       |
|  * Data Validation                                                           |
|  * Master Data (all sub-pages)                                               |
|  * Reference Data                                                            |
|  * Audit Trail                                                               |
|                                                                              |
|  Excluded Pages:                                                             |
|  x Approval Level 1                                                          |
|  x Approval Level 2                                                          |
|  x Approval Level 3                                                          |
|  x User Administration                                                       |
|  x Role Management                                                           |
|                                                                              |
|  FUNCTIONAL PERMISSIONS                                                      |
|                                                                              |
|  Master Data (During Data Preparation Phase Only):                           |
|  * Create, edit, delete instruments                                          |
|  * Manage index prices                                                       |
|  * Manage risk metrics (duration, YTM)                                       |
|  * Manage volatility metrics (beta)                                          |
|  * Manage credit ratings                                                     |
|  * Manage custom holdings                                                    |
|  x Cannot modify during approval phases (state-based lock)                   |
|                                                                              |
|  Validation & Calculations:                                                  |
|  * View validation results                                                   |
|  * View calculation status and errors                                        |
|  * Export validation reports                                                  |
|                                                                              |
|  Commentary:                                                                 |
|  * Add commentary and documentation                                          |
|                                                                              |
|  STATE-BASED ACCESS CONTROL:                                                 |
|  - Data Preparation Phase: Full edit access per permissions                  |
|  - During Approval: Read-only access, no modifications allowed               |
|  - After Rejection: Full edit access restored                                |
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
|  Search User: [Search by name, email, username......................]  [O]  |
|                                                                              |
|  Filters: Role: [All v]  Department: [All v]  Status: [Active v]            |
|                                                                              |
|  Showing 24 active users                                                     |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | User              | Current Roles                | Actions             |  |
|  +------------------------------------------------------------------------+  |
|  | Sarah Johnson     | * Analyst                    | [Modify Roles]      |  |
|  | sjohnson          | Assigned: 2025-02-10         | [View Permissions]  |  |
|  | Dept: Operations  |                              |                     |  |
|  +------------------------------------------------------------------------+  |
|  | Michael Chen      | * Approver Level 2 (PM)      | [Modify Roles]      |  |
|  | mchen             | Assigned: 2025-01-15         | [View Permissions]  |  |
|  | Dept: Portfolio   |                              |                     |  |
|  +------------------------------------------------------------------------+  |
|  | Jennifer Lee      | * Approver Level 3 (Exec)    | [Modify Roles]      |  |
|  | jlee              | Assigned: 2025-01-15         | [View Permissions]  |  |
|  | Dept: Executive   |                              |                     |  |
|  +------------------------------------------------------------------------+  |
|  | David Brown       | * Administrator              | [Modify Roles]      |  |
|  | dbrown            | Assigned: 2025-01-15         | [View Permissions]  |  |
|  | Dept: IT          |                              |                     |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

MODIFY USER ROLES MODAL:
+------------------------------------------------------------------------------+
|  Modify Roles - Sarah Johnson                                  [Close X]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  User: Sarah Johnson (sjohnson)                                              |
|  Department: Operations                                                      |
|                                                                              |
|  SELECT ROLES (multiple allowed):                                            |
|                                                                              |
|  [V] Analyst                                                                 |
|      Data correction and master data maintenance                             |
|      Pages: All except Approval L1/L2/L3 and User Management                |
|                                                                              |
|  [ ] Approver Level 1 (Operations)                                           |
|      Approve batches at operations level                                     |
|      Pages: Approval Level 1 only                                            |
|                                                                              |
|  [ ] Approver Level 2 (Portfolio Manager)                                    |
|      Approve batches at portfolio manager level                              |
|      Pages: Approval Level 2 only                                            |
|                                                                              |
|  [ ] Approver Level 3 (Executive)                                            |
|      Final approval before publication                                       |
|      Pages: Approval Level 3 only                                            |
|                                                                              |
|  [ ] Administrator                                                           |
|      User management and system configuration                                |
|      Pages: Users, Roles                                                     |
|                                                                              |
|  PERMISSION CONFLICTS:                                                       |
|  ! Note: If multiple roles assigned, most restrictive permission applies     |
|          when conflicts exist                                                |
|                                                                              |
|  SEGREGATION OF DUTIES:                                                      |
|  V User cannot approve batches they prepared                                 |
|  V Approval authority and data entry separated for same batch                |
|                                                                              |
|  Effective Date:         [2026-01-06]  [cal]  (When changes take effect)    |
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
|  |  * John Smith (Approver L1)                   [Active]                 |  |
|  |  * Sarah Johnson (Approver L1)                [Active]                 |  |
|  |                                                                        |  |
|  |  [+ Add Approver]  [Remove Selected]                                   |  |
|  |                                                                        |  |
|  |  Approval Rules:                                                       |  |
|  |  ( ) Any one approver can approve                                      |  |
|  |  (*) Specific approver assigned per batch                              |  |
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
|  |  * Michael Chen (Approver L2)                 [Active]                 |  |
|  |  * Jessica Martinez (Approver L2)             [Out: Until 2026-01-15]  |  |
|  |    Backup: Michael Chen                                                |  |
|  |                                                                        |  |
|  |  [+ Add Approver]  [Remove Selected]                                   |  |
|  |                                                                        |  |
|  |  Approval Rules:                                                       |  |
|  |  (*) Any one approver can approve                                      |  |
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
|  |  * Jennifer Lee (Approver L3)                 [Active]                 |  |
|  |  * Robert Johnson (Approver L3)               [Active]                 |  |
|  |                                                                        |  |
|  |  [+ Add Approver]  [Remove Selected]                                   |  |
|  |                                                                        |  |
|  |  Approval Rules:                                                       |  |
|  |  (*) Any one approver can approve                                      |  |
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
|  Configure Backup Approvers - Level 2                          [Close X]    |
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
|  - Backup approver must have same or higher approval level                   |
|  - Primary approver must explicitly designate out-of-office status           |
|  - Batches automatically route to backup when primary is OOO                 |
|  - Audit trail records who approved (primary or backup)                      |
|                                                                              |
|  [Save Backup Configuration]  [Cancel]                                       |
|                                                                              |
+------------------------------------------------------------------------------+

SEGREGATION OF DUTIES WARNING:
+------------------------------------------------------------------------------+
|  Segregation of Duties Violation                               [Close X]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  ! CANNOT ASSIGN ROLES: Segregation of Duties Conflict                      |
|                                                                              |
|  User: John Smith                                                            |
|  Attempted Role Assignment: Analyst + Approver Level 1                       |
|                                                                              |
|  This combination creates a segregation of duties conflict:                  |
|  - Analyst can prepare/modify data for batches                               |
|  - Approver Level 1 can approve batches at operations level                  |
|  - Same user cannot prepare and approve the same batch                       |
|                                                                              |
|  RESOLUTION OPTIONS:                                                         |
|                                                                              |
|  1. Allow roles but enforce system check                                     |
|     System will prevent user from approving batches they prepared            |
|     (Recommended - provides flexibility while maintaining controls)          |
|                                                                              |
|  2. Restrict to single role                                                  |
|     User must choose either Analyst OR Approver Level 1                      |
|     (Strictest control, may limit operational flexibility)                   |
|                                                                              |
|  [Allow with System Check]  [Restrict to Single Role]  [Cancel]             |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Create Role] | Button | Open Create Role modal to define a new role |
| Role Card | Panel | Shows role name, description, user count, page access summary, and actions |
| [View Permissions] | Link | View detailed permission and page access breakdown for role |
| [View Assigned Users] | Link | See all users with this role |
| [Edit Role] | Link | Open Edit Role modal with current values pre-populated |
| [Configure Authority] | Link | Configure approval authority for approver roles |
| Create/Edit Role Modal | Multi-Section Form | Role name, description, page access checklist, action permissions checklist |
| Page Access Checklist | Checkbox List | All available pages in the system; checked pages are accessible to the role |
| Action Permissions Checklist | Checkbox List | Granular action permissions grouped by category |
| User Role Assignments Tab | Tab Panel | Shows users with their assigned roles |
| [Modify Roles] | Link | Change role assignments for specific user |
| Approval Authority Config Tab | Tab Panel | Configure which users can approve at each level |
| Primary Approvers List | User List | Shows designated approvers with status |
| Approval Rules Selector | Radio Buttons | Configure approval workflow (any one, specific, consensus) |
| [Configure Backup Approvers] | Button | Set up backup approver mappings |
| Backup Approver Mapping | Table | Shows primary-to-backup approver relationships |
| Out-of-Office Indicator | Status Badge | Shows when approver is OOO with return date |

## User Actions

- **Create New Role**: Define a new role with name, description, page access, and action permissions
- **Edit Existing Role**: Modify a role's description, page access, or action permissions
- **View Role Permissions**: See detailed permission and page access breakdown for any role
- **View Assigned Users**: See all users assigned to specific role
- **Modify User Roles**: Change role assignments for user (requires reason)
- **Configure Approval Authority**: Designate which users can approve at each level
- **Set Backup Approvers**: Configure backup approver mappings for continuity
- **Mark Out of Office**: Designate approver as OOO with automatic delegation
- **View Permission Conflicts**: See warnings when role combinations conflict

## Business Rules

- Roles are stored in the database and managed via API (POST /roles, PUT /roles/{id})
- Administrators can create new roles and edit existing roles
- Each role defines both page access (which pages are visible) and action permissions (what the user can do)
- Navigation is dynamically rendered based on the user's role(s) allowedPages
- Server-side route guards check allowedPages before rendering pages
- Users can have multiple roles (page access and permissions are cumulative)
- Most restrictive permission applies when conflicts exist
- Role assignments audited with user, timestamp, and reason
- Changes take effect immediately for new batches
- In-progress batches retain original approver assignments
- System enforces segregation of duties (user cannot approve own work)

## Default Roles (Initial Seed Data)

| Role | Page Access | Key Permissions |
|------|------------|-----------------|
| **Analyst** | All pages EXCEPT Approval L1/L2/L3, Users, Roles | Master data CRUD, commentary, validation view |
| **Approver L1** | Approval Level 1 only | approval.level1 |
| **Approver L2** | Approval Level 2 only | approval.level2 |
| **Approver L3** | Approval Level 3 only | approval.level3 |
| **Administrator** | Users, Roles only | users.manage, roles.manage |

## Navigation
- **From:** Admin section, user administration screen
- **To:** User administration, audit trail viewer

## State Dependencies
- Only administrators can create/edit roles and modify approval authority
- Role changes take effect immediately for new operations
- Existing workflow states preserve original role assignments

## Approval Rules

Three approval workflow options per level:

1. **Any One Approver**: First designated approver to review can approve
2. **Specific Approver Assigned**: Batch assigned to specific approver at creation
3. **Requires Consensus**: Multiple approvers must agree (2+ approvals required)

## State-Based Access Control

All roles subject to state-based locking:

- **Data Preparation Phase**: Full edit access per role permissions
- **During Approval Process**: Read-only access (locked)
- **After Rejection**: Edit access restored per role permissions
- **Closed Batch**: Read-only access for all users

## Audit Trail

All role and permission changes logged:
- User making change
- Affected role or user
- Old values vs new values (page access, permissions)
- Effective date
- Reason for change
- Timestamp
