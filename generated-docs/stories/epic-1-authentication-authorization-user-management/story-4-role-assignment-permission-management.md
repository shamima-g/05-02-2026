# Story: Role Assignment & Permission Management

**Epic:** Authentication, Authorization & User Management | **Story:** 4 of 8 | **Wireframe:** Screen 15 (Role & Permission Management)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/admin/roles` |
| **Target File** | `app/admin/roles/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As an** administrator **I want** to create and edit roles with page access and action permissions, view role definitions, and assign roles to users **So that** users have appropriate access levels, page visibility is controlled per role, and segregation of duties is maintained

## Acceptance Criteria

### Happy Path - View Role Definitions
- [ ] Given I have the Administrator role, when I navigate to `/admin/roles`, then I see the Role & Permission Management screen with three tabs: Role Definitions, User Role Assignments, Approval Authority Config
- [ ] Given I am on the Role Definitions tab, when the page loads, then I see the 5 default roles displayed: Analyst, Approver L1, Approver L2, Approver L3, Administrator (plus any custom roles created by administrators)
- [ ] Given I am on the Role Definitions tab, when I view a role card, then I see the role name, description, user count, page access summary, and action buttons: [View Permissions], [View Assigned Users], [Edit Role]
- [ ] Given I am on the Role Definitions tab, when I view the Analyst role card, then I see "Pages: All except Approval L1/L2/L3 and User Management"
- [ ] Given I am on the Role Definitions tab, when I view the Approver L1 role card, then I see "Pages: Approval Level 1 only"
- [ ] Given I am on the Role Definitions tab, when I view the Administrator role card, then I see "Pages: Users, Roles"

### Create New Role
- [ ] Given I am on the Role Definitions tab, when I click "[+ Create Role]", then I see the Create Role modal with fields: Role Name, Description, Page Access checklist, and Action Permissions checklist
- [ ] Given I am in the Create Role modal, when I enter Role Name "Data Reviewer", Description "Read-only access to all data pages", check pages [Dashboard, Batches, File Status Monitor, Data Validation], and click "[Save Role]", then the new role is created and appears in the role list
- [ ] Given I am in the Create Role modal, when I view the Page Access section, then I see checkboxes for all available pages: Dashboard, Batches, File Status Monitor, Data Validation, Approval Level 1, Approval Level 2, Approval Level 3, Master Data (sub-pages), Reference Data, User Administration, Role Management, Audit Trail
- [ ] Given I am in the Create Role modal, when I view the Action Permissions section, then I see permissions grouped by category: Batch Management, File Operations, Master Data, Approval, Administration

### Create New Role - Validation
- [ ] Given I am in the Create Role modal, when I leave the Role Name empty and click "[Save Role]", then I see the error "Role name is required"
- [ ] Given I am in the Create Role modal, when I enter a Role Name shorter than 3 characters and click "[Save Role]", then I see the error "Role name must be at least 3 characters"
- [ ] Given I am in the Create Role modal, when I enter a Role Name that already exists and click "[Save Role]", then I see the error "A role with this name already exists"

### Edit Existing Role
- [ ] Given I am on the Role Definitions tab, when I click "[Edit Role]" for the Analyst role, then I see the Edit Role modal with the current name, description, page access, and permissions pre-populated
- [ ] Given I am editing the Analyst role, when I uncheck "Dashboard" from page access and click "[Save Role]", then the Analyst role no longer grants access to the Dashboard page
- [ ] Given I am editing a role, when I add a new action permission and click "[Save Role]", then users with that role gain the new permission on their next session refresh

### View Role Permissions Detail
- [ ] Given I am on the Role Definitions tab, when I click "[View Permissions]" for the Analyst role, then I see a modal showing: Allowed Pages list, Excluded Pages list, and Functional Permissions breakdown by category
- [ ] Given I am viewing Analyst permissions, when I look at the Allowed Pages section, then I see: Dashboard, Batches, File Status Monitor, Data Validation, Master Data (all sub-pages), Reference Data, Audit Trail
- [ ] Given I am viewing Analyst permissions, when I look at the Excluded Pages section, then I see: Approval Level 1, Approval Level 2, Approval Level 3, User Administration, Role Management
- [ ] Given I am viewing role permissions, when I look at State-Based Access Control section, then I see "Data Preparation Phase: Full edit access per permissions" and "During Approval: Read-only access, no modifications allowed"

### View Assigned Users
- [ ] Given I am on the Role Definitions tab, when I click "[View Assigned Users]" for a role, then I see a list of all users currently assigned that role with their names, usernames, departments, and assignment dates

### User Role Assignments Tab
- [ ] Given I am on the Role & Permission Management screen, when I click the "User Role Assignments" tab, then I see a searchable list of all users with their currently assigned roles
- [ ] Given I am on the User Role Assignments tab, when I view a user row, then I see their name, username, department, current roles, and assignment dates
- [ ] Given I am on the User Role Assignments tab, when I type "sarah" in the search box, then I see only users whose name, email, or username contains "sarah"
- [ ] Given I am on the User Role Assignments tab, when I filter by Role: "Approver Level 2", then I see only users who have that role assigned

### Modify User Roles
- [ ] Given I am on the User Role Assignments tab, when I click "[Modify Roles]" for a user, then I see the Modify User Roles modal with checkboxes for all available roles (default + custom), each showing its page access summary
- [ ] Given I am in the Modify User Roles modal, when I check "[V] Analyst" role, enter Effective Date "2026-01-06", Reason "Promotion to team lead role", and click "[Save Role Changes]", then the role is assigned effective on that date
- [ ] Given I am modifying user roles, when I uncheck a currently assigned role and click "[Save Role Changes]", then the role is removed from the user
- [ ] Given I am modifying user roles, when I view each role checkbox, then I see the role's page access summary (e.g., "Pages: Approval Level 1 only")

### Modify User Roles - Validation
- [ ] Given I am in the Modify User Roles modal, when I uncheck all roles and click "[Save Role Changes]", then I see the error message "At least one role must be assigned"
- [ ] Given I am in the Modify User Roles modal, when I leave the "Reason for Change" field empty and click "[Save Role Changes]", then I see the error message "Reason for change is required for audit trail"

### Segregation of Duties Warning
- [ ] Given I am modifying user roles, when I check both "Analyst" and "Approver Level 1", then I see a warning modal "Segregation of Duties Violation" explaining the conflict
- [ ] Given I see the segregation of duties warning, when the modal displays, then I see two options: "[Allow with System Check]" and "[Restrict to Single Role]"
- [ ] Given I see the segregation of duties warning, when I click "[Allow with System Check]", then the roles are assigned with a system enforcement rule "User cannot approve batches they prepared"
- [ ] Given I see the segregation of duties warning, when I click "[Restrict to Single Role]", then I am returned to role selection and cannot assign both conflicting roles

### Permission Conflicts
- [ ] Given I am in the Modify User Roles modal, when I select multiple roles, then I see a note "! Note: If multiple roles assigned, most restrictive permission applies when conflicts exist"

### Dynamic Navigation Based on Role Page Access
- [ ] Given a user has the Analyst role, when they view the navigation bar, then they see links to all pages in the Analyst role's allowedPages (Dashboard, Batches, etc.) but NOT Approval Level 1/2/3 or User Management
- [ ] Given a user has the Approver L1 role, when they view the navigation bar, then they see only the Approval Level 1 link
- [ ] Given a user has the Administrator role, when they view the navigation bar, then they see only Users and Roles links

### Audit Trail (Per BR-SEC-005)
- [ ] Given I create a new role, when I check the audit trail, then a record exists showing the role name, page access, permissions, and who created it
- [ ] Given I edit a role's page access, when I check the audit trail, then a record exists showing old vs new page access values
- [ ] Given I assign a new role to a user, when I check the UserActivityLog, then a record exists with Action="role.assigned", the role name, and who made the change
- [ ] Given I remove a role from a user, when I check the UserActivityLog, then a record exists with Action="role.removed" and details showing which role was removed

### Authorization Check
- [ ] Given I do NOT have the Administrator role, when I attempt to navigate to `/admin/roles`, then I see an error message "Access denied. Administrator role required." and am redirected to the dashboard

### Real-Time Effect
- [ ] Given I assign a role to a user who is currently logged in, when they refresh their session, then they immediately have the role's page access and permissions
- [ ] Given I remove a role from a user who is currently logged in, when they attempt to access a page that was granted by that role, then they see "Access denied. Insufficient permissions."
- [ ] Given I edit a role's page access, when a user with that role refreshes their session, then their navigation updates to reflect the new page access

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/roles` | Get all roles with page access and permissions |
| POST | `/v1/roles` | Create a new custom role |
| GET | `/v1/roles/{roleId}` | Get role details with page access and permissions |
| PUT | `/v1/roles/{roleId}` | Update role description, page access, and permissions |
| GET | `/v1/permissions` | Get all available permissions |
| GET | `/v1/users` | Get users with filtering (search, roleId) |
| GET | `/v1/users/{userId}/roles` | Get all roles assigned to a user |
| PUT | `/v1/users/{userId}/roles` | Update user's role assignments |

## Implementation Notes

- **API-Driven Roles**: Roles are stored in the database and managed via API. No hardcoded role enum for access control.
- **Page Access**: Each role has an `allowedPages` array of route strings. Navigation and server-side guards check this dynamically.
- **Permission Matrix**: Permissions are defined in the RolePermission table; backend API checks permissions before allowing operations
- **Segregation of Duties**: System allows conflicting role assignment but enforces "cannot approve own work" rule at approval time
- **Effective Date**: Role changes can be scheduled for future dates (e.g., for promotions)
- **Wireframe Reference**: Screen 15 - Role & Permission Management (all tabs)
- **BRD Requirements**: BR-SEC-002 (Role-Based Access Control), BR-SEC-005 (Administrative Action Audit)
- **Default Roles**: 5 seed roles (Analyst, Approver L1, Approver L2, Approver L3, Administrator). OperationsLead and ReadOnly have been removed.

## Dependencies
- **Story 1**: User Authentication (requires admin to be authenticated)
- **Story 3**: User Lifecycle Management (users must exist before roles can be assigned)

## Story Points
**13** - Complex multi-tab UI with create/edit role modals, page access configuration, action permission management, dynamic navigation, segregation of duties logic, real-time permission updates, comprehensive audit trail
