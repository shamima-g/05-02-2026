# Story: State-Based Access Control

**Epic:** Batch Management & Workflow State Control | **Story:** 5 of 8 | **Wireframe:** N/A (system behavior across all screens)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (global permission system) |
| **Target File** | `lib/permissions/batch-access-control.ts` (create new) |
| **Page Action** | `create_new` |

## User Story
**As a** system enforcing data integrity **I want** to automatically lock data entry when a batch enters approval stages and unlock when rejected **So that** approvers review the exact data that will be published and unauthorized changes cannot undermine the approval process

## Acceptance Criteria

### Happy Path - Data Lock on Approval Entry
- [ ] Given a batch transitions from "Data Preparation" to "Level1Pending", when I attempt to upload a file, then the upload button is disabled and shows tooltip "Data locked during approval process"
- [ ] Given a batch is in "Level1Pending" status, when I attempt to modify instrument master data, then the save button is disabled with message "Cannot modify data during approval"
- [ ] Given a batch is in "Level2Pending" status, when I attempt to update a credit rating, then I see error message "Batch is locked for approval. Data modifications are not allowed."
- [ ] Given a batch is in "Level3Pending" status, when I attempt to add a custom holding, then the action is blocked and I see "Data entry disabled while batch is under review"

### Happy Path - Data Unlock on Rejection
- [ ] Given a batch is rejected at Level 1 and returns to "Data Preparation", when I view the file upload page, then the upload button is enabled and I see a notification "Batch unlocked. You can now make corrections."
- [ ] Given a batch is unlocked after rejection, when I attempt to modify master data, then all edit/save/delete buttons are enabled
- [ ] Given a batch is unlocked after rejection, when I check the batch status, then I see "Status: Data Preparation (Correcting after rejection)" with a green unlock icon

### Read-Only Access During Approval
- [ ] Given a batch is in "Level1Pending", when I navigate to the file status page, then I can view all file information but all action buttons (Upload, Delete, Retry) are disabled
- [ ] Given a batch is in approval, when I view the instrument master list, then I can search and view records but cannot click Edit or Add New
- [ ] Given a batch is locked, when I view the validation summary, then I can see all validation results but cannot trigger manual re-validation

### Lock Scope - Data Entry Only
- [ ] Given a batch is locked, when I navigate to the approval review page, then I can view all data normally (lock does not affect read access)
- [ ] Given a batch is locked, when I navigate to the workflow state viewer, then I can view workflow history normally
- [ ] Given a batch is locked, when I navigate to the audit trail, then I can search and export audit records normally (lock only affects data entry)

### Lock State Indicator
- [ ] Given a batch is locked, when I view the batch card, then I see a lock icon (🔒) next to the status badge
- [ ] Given a batch is unlocked, when I view the batch card, then I see an unlock icon (🔓) next to "Data Preparation" status
- [ ] Given a batch is locked, when I view the global header active batch indicator, then I see "January 2026 | Locked" with a lock icon

### Multi-Batch Scenarios
- [ ] Given I have January 2026 batch active (locked, in Level1Pending) and switch to December 2025 batch (unlocked, in Data Preparation), when I view file upload page, then upload buttons are enabled for December but would be disabled if I switch back to January
- [ ] Given I am working on an unlocked batch (Dec 2025), when another user confirms a different batch (Jan 2026) causing it to lock, then my current batch (Dec 2025) remains unlocked (locks are batch-specific)

### Permission Override for Approvers
- [ ] Given I am a Level 1 Approver viewing a batch in "Level1Pending", when I view the approval review page, then I can see all data in read-only mode (approvers cannot modify data even if they have other roles)
- [ ] Given I am an Analyst who is also a Level 1 Approver, when I try to edit data in a locked batch, then the action is blocked (no role-based override - lock is absolute)

### Validation - Immediate Enforcement
- [ ] Given a batch just transitioned to "Level1Pending" (within last 5 seconds), when I try to upload a file, then the lock is enforced immediately (no grace period)
- [ ] Given a batch just returned to "Data Preparation" after rejection, when I try to edit data, then the unlock is applied immediately (no delay)

### Error Handling
- [ ] Given the API fails to return lock status, when I attempt data entry, then the system defaults to locked state (fail-safe) and shows warning "Unable to verify batch lock status. Data entry blocked as precaution."
- [ ] Given I try to force a data modification by calling the API directly (bypassing UI), when the batch is locked, then the API returns 409 Conflict with error message "Cannot modify data: batch is locked for approval"

### Audit Trail for Lock Events
- [ ] Given a batch transitions to locked state, when I view the workflow history, then I see an event "Data entry locked - Batch entered Level 1 Approval" with timestamp and user who confirmed data
- [ ] Given a batch returns to unlocked state, when I view the workflow history, then I see an event "Data entry unlocked - Batch rejected and returned to Data Preparation" with timestamp and rejecting user

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/report-batches/{id}/status` | Check batch lock status (isLocked field) |

**Note:** Lock enforcement happens at multiple levels:
1. **UI Level**: Disable buttons, show tooltips (this story)
2. **API Level**: Backend validates lock state before allowing any data modifications (backend responsibility)

## Implementation Notes

- **Permission Utility**: Create `lib/permissions/batch-access-control.ts` with functions:
  - `isBatchLocked(status: WorkflowStatus): boolean` - Check if batch is locked based on status
  - `canModifyData(batch: Batch, userRole: string): boolean` - Comprehensive permission check
  - `getBatchLockState(batchId: number): Promise<BatchLockState>` - Fetch lock state from API
- **Lock State Enum**:
  ```typescript
  enum BatchLockState {
    Unlocked = 'Unlocked',  // Data Preparation
    Locked = 'Locked',      // Any approval stage
    Archived = 'Archived'   // Approved/Closed (permanent read-only)
  }
  ```
- **React Hook**: Create custom hook `useBatchLock(batchId)` that components can use to check lock state
- **Context Integration**: Integrate lock state into BatchContext from Story 2
- **UI Components**: All data entry buttons should check lock state before enabling
- **Visual Indicators**: Use lock/unlock icons consistently across all screens
- **Wireframe Reference**: N/A - applies to all screens with data entry (files, master data, validation)
- **BRD Requirements**:
  - BR-GOV-005 (State-Based Access Control) - PRIMARY
  - BR-GOV-004 (Monthly Reporting Workflow)
- **Shadcn Components**: Tooltip (for disabled buttons), Badge (lock indicator), Alert (lock notification banner)
- **Testing Strategy**: Focus on user-observable behavior (buttons disabled, error messages shown), NOT internal API calls
- **Fail-Safe Design**: Default to locked state if lock status cannot be determined (security-first approach)

## Dependencies
- Story 1 (Batch Creation & Listing) - requires batches with status
- Story 2 (Batch Context Switching) - integrates with batch context
- Story 4 (Data Confirmation) - triggers lock when data confirmed

## Story Points
**8** - Involves creating permission system, custom React hook, integration across multiple screens, comprehensive validation, and fail-safe error handling
