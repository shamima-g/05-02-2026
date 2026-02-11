# Story: User Lifecycle Management

**Epic:** Authentication, Authorization & User Management | **Story:** 3 of 8 | **Wireframe:** Screen 14 (User Administration)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/admin/users` |
| **Target File** | `app/admin/users/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As an** administrator **I want** to create, update, and deactivate user accounts **So that** I can control who has access to the system and maintain accurate user records

## Acceptance Criteria

### Happy Path - View Users
- [ ] Given I have the Administrator role, when I navigate to `/admin/users`, then I see a list of all active users with their names, emails, usernames, roles, and last login times
- [ ] Given I am on the User Administration screen, when the page loads with 24 active users, then I see "Showing 24 active users" displayed
- [ ] Given I am on the User Administration screen, when I view a user row, then I see their department, username, assigned roles, creation date, and last login timestamp

### Search and Filtering
- [ ] Given I am on the User Administration screen, when I type "john" in the search box and press Enter, then I see only users whose name, email, or username contains "john"
- [ ] Given I am on the User Administration screen, when I select "Inactive Users" filter, then I see only deactivated users with their deactivation reasons
- [ ] Given I am on the User Administration screen, when I filter by Role: "Analyst", then I see only users assigned the Analyst role
- [ ] Given I am on the User Administration screen, when I filter by Department: "Operations", then I see only users in the Operations department

### Create New User
- [ ] Given I am on the User Administration screen, when I click "[+ Add New User]", then I see a modal with tabs: Basic Info, Roles & Permissions, Contact Details, Security
- [ ] Given I am in the Add New User modal, when I fill in First Name "John", Last Name "Smith", Email "john.smith@company.com", Username "jsmith", Department "Operations" and click "[Create User]", then the user is created and appears in the user list
- [ ] Given I am creating a new user, when I check "[✓] Analyst" role and click "[Create User]", then the user is created with the Analyst role assigned
- [ ] Given I am creating a new user, when I check "[✓] Force password change on first login" and click "[Create User]", then the user must change their password on first login
- [ ] Given I am creating a new user, when I check "[✓] Send welcome email with login instructions" and click "[Create User]", then a welcome email is sent to the user's email address

### Create New User - Validation
- [ ] Given I am in the Add New User modal, when I leave the First Name field empty and click "[Create User]", then I see the error message "First name is required"
- [ ] Given I am in the Add New User modal, when I leave the Email field empty and click "[Create User]", then I see the error message "Email address is required"
- [ ] Given I am in the Add New User modal, when I enter an email address that already exists and click "[Create User]", then I see the error message "Email address already in use"
- [ ] Given I am in the Add New User modal, when I enter a username that already exists and click "[Create User]", then I see the error message "Username already exists"
- [ ] Given I am in the Add New User modal, when I select no roles and click "[Create User]", then I see the error message "At least one role must be assigned"

### Edit Existing User
- [ ] Given I am on the User Administration screen, when I click "[Edit]" for a user, then I see the Edit User modal with the user's current information pre-filled
- [ ] Given I am editing a user, when I change their email from "old@company.com" to "new@company.com" and click "[Save Changes]", then the email is updated and I see a success message "User updated successfully"
- [ ] Given I am editing a user, when I add a new role by checking "[✓] Analyst" and click "[Save Changes]", then the user now has both their existing roles and the Analyst role
- [ ] Given I am editing a user, when I remove a role by unchecking it and click "[Save Changes]", then the user no longer has that role assigned

### View User Details
- [ ] Given I am on the User Administration screen, when I click "[View]" for a user, then I see the User Details modal with tabs: Overview, Activity Log, Permissions, Audit Trail
- [ ] Given I am viewing a user's details, when I look at the Overview tab, then I see their full profile including name, username, email, employee ID, department, job title, manager, account status, and assigned roles
- [ ] Given I am viewing a user's details, when I click the Activity Log tab, then I see their recent actions in the last 30 days with timestamps
- [ ] Given I am viewing a user's details, when I click the Permissions tab, then I see a detailed breakdown of all permissions granted by their assigned roles

### Deactivate User
- [ ] Given I am on the User Administration screen, when I click "[Deactivate]" for an active user, then I see the Deactivate User confirmation modal
- [ ] Given I am in the Deactivate User modal, when I enter a reason "Left company for new opportunity" and click "[Confirm Deactivation]", then the user is deactivated and marked as Inactive
- [ ] Given I deactivate a user, when I check the user list, then the user appears with status "⚠ Inactive" and shows the deactivation reason
- [ ] Given I deactivate a user, when the user attempts to log in, then they see the error message "Your account has been deactivated. Please contact your administrator."
- [ ] Given I deactivate a user who is an approver, when I submit the deactivation, then I must select another user to transfer pending approvals to

### Deactivate User - Validation
- [ ] Given I am in the Deactivate User modal, when I leave the "Reason for Deactivation" field empty and click "[Confirm Deactivation]", then I see the error message "Deactivation reason is required for audit trail"

### Reactivate User
- [ ] Given I am viewing inactive users, when I click "[Reactivate]" for a deactivated user, then the user's account is reactivated and they can log in again
- [ ] Given I reactivate a user, when I check the user list with "Active Users" filter, then the reactivated user appears in the list with status "✓ Active"

### Audit Trail (Per BR-SEC-005)
- [ ] Given I create a new user, when I check the UserActivityLog table, then a record exists with Action="user.created", EntityType="User", and the new user's ID
- [ ] Given I update a user's email, when I check the audit trail via temporal tables, then I can see the before and after values with timestamp and who made the change
- [ ] Given I deactivate a user, when I check the UserActivityLog table, then a record exists with Action="user.deactivated", the reason for deactivation, and who deactivated them

### Export User List
- [ ] Given I am on the User Administration screen, when I click "[📊 Export User List]", then an Excel file is downloaded containing all visible users with their details

### Authorization Check
- [ ] Given I do NOT have the Administrator role, when I attempt to navigate to `/admin/users`, then I see an error message "Access denied. Administrator role required." and am redirected to the dashboard

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/users` | Get all users with filtering options |
| POST | `/v1/users` | Create a new user |
| GET | `/v1/users/{userId}` | Get user details by ID |
| PUT | `/v1/users/{userId}` | Update user information |
| POST | `/v1/users/{userId}/deactivate` | Deactivate user account |
| POST | `/v1/users/{userId}/reactivate` | Reactivate user account |
| GET | `/v1/users/{userId}/activity` | Get user activity log |
| GET | `/v1/users/export` | Export user list to Excel |

## Implementation Notes

- **Soft Delete**: Users are never hard deleted; deactivation sets `IsActive=false` and preserves audit trail
- **Temporal Tables**: SQL Server temporal tables automatically track all changes to User table with before/after values
- **Segregation of Duties**: System enforces that users cannot approve batches they prepared (checked at approval time, not user creation)
- **Wireframe Reference**: Screen 14 - User Administration
- **BRD Requirements**: BR-SEC-001 (User Lifecycle Management), BR-SEC-005 (Administrative Action Audit), BR-AUD-001 (Complete Audit Trails)

## Dependencies
- **Story 1**: User Authentication (requires admin user to be authenticated)
- **Story 2**: Dashboard (navigation from Admin section)

## Story Points
**8** - Complex CRUD operations, multiple validation rules, role assignments, audit trail integration, search/filter functionality
