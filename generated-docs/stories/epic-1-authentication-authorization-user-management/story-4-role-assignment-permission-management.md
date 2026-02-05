# Story: Role Assignment & Permission Management

**Epic:** Authentication, Authorization & User Management | **Story:** 4 of 8 | **Wireframe:** Screen 15 (Role & Permission Management)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/admin/roles` |
| **Target File** | `app/admin/roles/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As an** administrator **I want** to view role definitions, assign roles to users, and understand permission implications **So that** users have appropriate access levels and segregation of duties is maintained

## Acceptance Criteria

### Happy Path - View Role Definitions
- [ ] Given I have the Administrator role, when I navigate to `/admin/roles`, then I see the Role & Permission Management screen with three tabs: Role Definitions, User Role Assignments, Approval Authority Config
- [ ] Given I am on the Role Definitions tab, when the page loads, then I see all 7 system roles displayed: Operations Lead, Analyst, Approver L1, Approver L2, Approver L3, Administrator, Read-Only
- [ ] Given I am on the Role Definitions tab, when I view a role card, then I see the role name, description, user count, and action buttons: [View Permissions], [View Assigned Users]

### View Role Permissions Detail
- [ ] Given I am on the Role Definitions tab, when I click "[View Permissions]" for Operations Lead, then I see a modal showing detailed permissions breakdown by category: Batch Management, File Operations, Master Data, Validation & Calculations, Workflow, Reporting
- [ ] Given I am viewing Operations Lead permissions, when I look at the Master Data section, then I see "✓ Create, edit, delete instruments" with note "(During Data Preparation Phase Only)"
- [ ] Given I am viewing Operations Lead permissions, when I look at the Workflow section, then I see "✗ Cannot approve batches (must be done by designated approvers)"
- [ ] Given I am viewing role permissions, when I look at State-Based Access Control section, then I see "Data Preparation Phase: Full edit access to files and master data" and "During Approval: Read-only access, no modifications allowed"

### View Assigned Users
- [ ] Given I am on the Role Definitions tab, when I click "[View Assigned Users]" for a role, then I see a list of all users currently assigned that role with their names, usernames, departments, and assignment dates

### User Role Assignments Tab
- [ ] Given I am on the Role & Permission Management screen, when I click the "User Role Assignments" tab, then I see a searchable list of all users with their currently assigned roles
- [ ] Given I am on the User Role Assignments tab, when I view a user row, then I see their name, username, department, current roles, and assignment dates
- [ ] Given I am on the User Role Assignments tab, when I type "john" in the search box, then I see only users whose name, email, or username contains "john"
- [ ] Given I am on the User Role Assignments tab, when I filter by Role: "Approver Level 2", then I see only users who have that role assigned

### Modify User Roles
- [ ] Given I am on the User Role Assignments tab, when I click "[Modify Roles]" for a user, then I see the Modify User Roles modal with checkboxes for all available roles
- [ ] Given I am in the Modify User Roles modal, when I check "[✓] Analyst" role, enter Effective Date "2026-01-06", Reason "Promotion to team lead role", and click "[Save Role Changes]", then the role is assigned effective on that date
- [ ] Given I am modifying user roles, when I uncheck a currently assigned role and click "[Save Role Changes]", then the role is removed from the user
- [ ] Given I am modifying user roles, when I view the current assignments, then checked roles indicate currently assigned roles

### Modify User Roles - Validation
- [ ] Given I am in the Modify User Roles modal, when I uncheck all roles and click "[Save Role Changes]", then I see the error message "At least one role must be assigned"
- [ ] Given I am in the Modify User Roles modal, when I leave the "Reason for Change" field empty and click "[Save Role Changes]", then I see the error message "Reason for change is required for audit trail"

### Segregation of Duties Warning
- [ ] Given I am modifying user roles, when I check both "Operations Lead" and "Approver Level 1", then I see a warning modal "Segregation of Duties Violation" explaining the conflict
- [ ] Given I see the segregation of duties warning, when the modal displays, then I see two options: "[Allow with System Check]" and "[Restrict to Single Role]"
- [ ] Given I see the segregation of duties warning, when I click "[Allow with System Check]", then the roles are assigned with a system enforcement rule "User cannot approve batches they prepared"
- [ ] Given I see the segregation of duties warning, when I click "[Restrict to Single Role]", then I am returned to role selection and cannot assign both conflicting roles

### Permission Conflicts
- [ ] Given I am in the Modify User Roles modal, when I select multiple roles, then I see a note "⚠ Note: If multiple roles assigned, most restrictive permission applies when conflicts exist"

### Multiple Role Assignment
- [ ] Given I modify a user's roles, when I assign both "Operations Lead" and "Read-Only" roles, then the user has the combined permissions of both roles (cumulative permissions)
- [ ] Given a user has multiple roles, when I view their permissions in User Details, then I see all permissions granted across all assigned roles

### Audit Trail (Per BR-SEC-005)
- [ ] Given I assign a new role to a user, when I check the UserRole table, then a record exists showing UserId, RoleId, AssignedBy (my username), AssignedAt timestamp
- [ ] Given I remove a role from a user, when I check the UserActivityLog, then a record exists with Action="role.removed", EntityType="UserRole", and details showing which role was removed
- [ ] Given I modify user roles, when I view the user's audit trail, then I see complete history of all role changes with before/after values, timestamps, and who made each change

### Authorization Check
- [ ] Given I do NOT have the Administrator role, when I attempt to navigate to `/admin/roles`, then I see an error message "Access denied. Administrator role required." and am redirected to the dashboard

### Real-Time Effect
- [ ] Given I assign the "Operations Lead" role to a user who is currently logged in, when they refresh their session, then they immediately have Operations Lead permissions
- [ ] Given I remove a role from a user who is currently logged in, when they attempt an action requiring that role, then they see "Access denied. Insufficient permissions."

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/roles` | Get all system roles |
| GET | `/v1/roles/{roleId}` | Get role details with permissions |
| GET | `/v1/roles/{roleId}/users` | Get users assigned to a specific role |
| GET | `/v1/roles/{roleId}/permissions` | Get detailed permissions for a role |
| POST | `/v1/users/{userId}/roles` | Assign roles to a user |
| DELETE | `/v1/users/{userId}/roles/{roleId}` | Remove role from a user |
| GET | `/v1/users/{userId}/roles` | Get all roles assigned to a user |

## Implementation Notes

- **System Roles**: The 7 roles are defined in the database and cannot be created/deleted by admins (only assignment changes)
- **Permission Matrix**: Permissions are defined in the RolePermission table; backend API checks permissions before allowing operations
- **Segregation of Duties**: System allows conflicting role assignment but enforces "cannot approve own work" rule at approval time
- **Effective Date**: Role changes can be scheduled for future dates (e.g., for promotions)
- **Wireframe Reference**: Screen 15 - Role & Permission Management (Role Definitions and User Role Assignments tabs)
- **BRD Requirements**: BR-SEC-002 (Role-Based Access Control), BR-SEC-005 (Administrative Action Audit)

## Dependencies
- **Story 1**: User Authentication (requires admin to be authenticated)
- **Story 3**: User Lifecycle Management (users must exist before roles can be assigned)

## Story Points
**8** - Complex multi-tab UI, role permission visualization, segregation of duties logic, real-time permission updates, comprehensive audit trail
