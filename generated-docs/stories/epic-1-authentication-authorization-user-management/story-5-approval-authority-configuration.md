# Story: Approval Authority Configuration

**Epic:** Authentication, Authorization & User Management | **Story:** 5 of 8 | **Wireframe:** Screen 15 (Role & Permission Management - Approval Authority Config tab)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/admin/roles` (Approval Authority Config tab) |
| **Target File** | `app/admin/roles/page.tsx` (tab component) |
| **Page Action** | `modify_existing` |

## User Story
**As an** administrator **I want** to configure which users can approve at each level and designate backup approvers **So that** the approval workflow functions correctly and business continuity is maintained

## Acceptance Criteria

### Happy Path - View Approval Authority
- [ ] Given I am on the Role & Permission Management screen, when I click the "Approval Authority Config" tab, then I see three sections: Level 1 Approval - Operations, Level 2 Approval - Portfolio Manager, Level 3 Approval - Executive
- [ ] Given I am on the Approval Authority Config tab, when I view the Level 1 section, then I see the focus description "Data completeness, file receipt, validation checks"
- [ ] Given I am on the Approval Authority Config tab, when I view a level section, then I see a list of primary approvers with their names, roles, and status (Active, Out of Office with return date)
- [ ] Given I am on the Approval Authority Config tab, when I view a level section, then I see approval rules options: "Any one approver can approve", "Specific approver assigned per batch", "Requires consensus from 2+ approvers"

### Add Primary Approver
- [ ] Given I am on the Approval Authority Config tab, when I click "[+ Add Approver]" in the Level 1 section, then I see a modal to select a user and configure their approval authority
- [ ] Given I am adding a Level 1 approver, when I select a user who has the "Approver Level 1" role, enter Effective From "2026-01-06", and click "[Save]", then the user is added to the Level 1 primary approvers list
- [ ] Given I am adding an approver, when I check "[✓] Backup Approver", then this approver is designated as a backup (not primary)

### Add Approver - Validation
- [ ] Given I am adding an approver, when I select a user who does NOT have the appropriate approver role (e.g., selecting an Analyst for Level 2 approval), then I see the error message "User must have Approver Level 2 role to be designated as Level 2 approver"
- [ ] Given I am adding an approver, when I leave the Effective From date empty and click "[Save]", then I see the error message "Effective from date is required"

### Remove Primary Approver
- [ ] Given I am on the Approval Authority Config tab, when I select an approver and click "[Remove Selected]", then I see a confirmation dialog "Remove approver?"
- [ ] Given I confirm removing an approver, when I click "[Confirm]", then the user is removed from the primary approvers list and their approval authority is marked as inactive in the ApprovalAuthority table
- [ ] Given I remove an approver, when the user has pending approvals assigned, then I see a warning "This user has 2 batches awaiting their approval. Please reassign before removing."

### Configure Backup Approvers
- [ ] Given I am on the Approval Authority Config tab for Level 2, when I click "[Configure Backup Approvers]", then I see the Configure Backup Approvers modal
- [ ] Given I am in the Configure Backup Approvers modal, when I view the table, then I see primary approvers mapped to their backup approvers with status
- [ ] Given I am in the Configure Backup Approvers modal, when I click "[Edit]" for a primary approver, then I can select one or more backup approvers from a dropdown
- [ ] Given I am configuring backups for Michael Chen, when I select "Jessica Martinez" and "Robert Johnson (L3)" as backups and click "[Save]", then both are designated as Michael's backup approvers

### Configure Backup Approvers - Validation
- [ ] Given I am adding a backup approver, when I select a user who has a lower approval level (e.g., L1 user as backup for L2 approver), then I see the error message "Backup approver must have same or higher approval level"
- [ ] Given I am in the Configure Backup Approvers modal, when I view the backup rules, then I see "Primary approver must explicitly designate out-of-office status" and "Batches automatically route to backup when primary is OOO"

### Out of Office Designation
- [ ] Given I am on the Approval Authority Config tab, when I view an approver with out-of-office status, then I see "[Out: Until 2026-01-15] Backup: Michael Chen" displayed next to their name
- [ ] Given an approver is marked as out of office, when a new batch reaches their approval level, then the batch is automatically routed to their designated backup approver
- [ ] Given an approver returns from out of office (return date passes), when new batches reach their approval level, then batches are routed to them (not backup)

### Approval Rules Configuration
- [ ] Given I am on the Approval Authority Config tab for Level 1, when I select "(•) Any one approver can approve", then any of the designated Level 1 approvers can approve any batch
- [ ] Given I am on the Approval Authority Config tab for Level 2, when I select "( ) Specific approver assigned per batch", then batches must be assigned to a specific approver at batch creation time
- [ ] Given I am on the Approval Authority Config tab for Level 3, when I select "( ) Requires consensus from 2+ approvers", then multiple approvers must approve before the batch progresses

### Save Configuration
- [ ] Given I am on the Approval Authority Config tab, when I make changes to approval authority and click "[Save Approval Authority Configuration]", then the changes are saved and I see a success message "Approval authority configuration updated"
- [ ] Given I save approval authority changes, when I view the page bottom, then I see the note "Changes apply to NEW batches only. In-progress batches retain original approver assignments."

### Audit Trail (Per BR-SEC-005)
- [ ] Given I add a new approver, when I check the ApprovalAuthority table, then a record exists with UserId, ApprovalLevel, IsBackup=false, EffectiveFrom date, AssignedBy (my username), AssignedAt timestamp
- [ ] Given I configure a backup approver, when I check the ApprovalAuthority table, then a record exists with IsBackup=true linking the primary and backup approvers
- [ ] Given I remove an approver, when I check the ApprovalAuthority table, then the record is marked as IsActive=false with EffectiveTo date set
- [ ] Given I change approval rules, when I check the UserActivityLog, then a record exists with Action="approvalAuthority.configChanged" and details of the rule change

### Authorization Check
- [ ] Given I do NOT have the Administrator role, when I attempt to modify approval authority configuration, then I see an error message "Access denied. Administrator role required."

### Real-Time Effect for Future Batches
- [ ] Given I add a new Level 1 approver and save the configuration, when a new batch is created, then that approver is included in the Level 1 approver pool
- [ ] Given I remove a Level 2 approver and save the configuration, when a new batch reaches Level 2 approval, then that removed approver is NOT in the routing list

### Historical Batch Preservation
- [ ] Given I modify approval authority, when I view batches created before the change, then those batches still show their original approver assignments (not affected by the change)

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/approval-authority` | Get all approval authority configurations |
| GET | `/v1/approval-authority/level/{level}` | Get approvers for specific level (1, 2, or 3) |
| POST | `/v1/approval-authority` | Add new approval authority |
| PUT | `/v1/approval-authority/{id}` | Update approval authority (e.g., mark OOO) |
| DELETE | `/v1/approval-authority/{id}` | Deactivate approval authority |
| POST | `/v1/approval-authority/{id}/backup` | Configure backup approver |
| GET | `/v1/approval-authority/active` | Get currently active approvers per level |

## Implementation Notes

- **ApprovalAuthority Table**: Stores approval authority with EffectiveFrom/EffectiveTo dates for historical tracking
- **Backup Routing**: When primary approver is OOO (IsActive=false for date range), system automatically routes to backup
- **Batch Assignment**: Approval authority at batch creation time is "frozen" - changes don't affect existing batches
- **Consensus Approval**: If "Requires consensus" is selected, system tracks multiple approvals per level
- **Wireframe Reference**: Screen 15 - Role & Permission Management (Approval Authority Config tab)
- **BRD Requirements**: BR-SEC-003 (Approval Authority Configuration), BR-SEC-005 (Administrative Action Audit)

## Dependencies
- **Story 1**: User Authentication (requires admin to be authenticated)
- **Story 3**: User Lifecycle Management (users must exist)
- **Story 4**: Role Assignment (users must have approver roles before being designated as approvers)

## Story Points
**8** - Complex approval authority logic, backup approver routing, out-of-office handling, multiple approval rules, temporal effective dates, audit trail
