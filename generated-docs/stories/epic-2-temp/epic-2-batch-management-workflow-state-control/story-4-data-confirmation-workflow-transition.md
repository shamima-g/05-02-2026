# Story: Data Confirmation & Workflow Transition

**Epic:** Batch Management & Workflow State Control | **Story:** 4 of 8 | **Wireframe:** Screen 2 (Batch Management) + Screen 6 (Workflow State Viewer)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (action on existing batch pages) |
| **Target File** | `components/batches/ConfirmDataButton.tsx` (create new) |
| **Page Action** | `create_new` |

## User Story
**As an** Analyst **I want** to confirm that data preparation is complete and initiate calculations **So that** the workflow can progress to the approval stages and prevent further data modifications

## Acceptance Criteria

### Happy Path - Confirm Data Preparation
- [ ] Given I am an Analyst viewing a batch in "Data Preparation" status, when I click "Confirm Data Ready" button, then a confirmation dialog opens with message "This will lock all data entry and initiate calculations. Continue?"
- [ ] Given the confirmation dialog is open, when I click "Confirm", then the batch status transitions from "DataPreparation" to "Level1Pending" and I see success message "Data confirmed. Calculations initiated. Batch transitioned to Level 1 Approval."
- [ ] Given I confirmed data ready, when I check the workflow progress bar, then it shows "[Data Prep ✓] → [L1 Approval ●] → [L2] → [L3] → [Publish]" with Data Prep marked complete and L1 as current stage
- [ ] Given data is confirmed, when I attempt to upload a file or modify master data, then the action is blocked with message "Batch is locked for approval. Cannot modify data."

### Validation Before Confirmation
- [ ] Given I try to confirm a batch with missing required files, when I click "Confirm Data Ready", then I see warning dialog "3 required files are missing. Are you sure you want to proceed?" with options to "Review Issues" or "Proceed Anyway" (confirmation is NOT blocked)
- [ ] Given I try to confirm a batch with validation errors, when I click "Confirm Data Ready", then I see warning dialog "12 validation errors exist. Are you sure you want to proceed?" with options to "Review Errors" or "Proceed Anyway"
- [ ] Given validation warnings exist (not errors), when I click "Confirm Data Ready", then I see info message "3 validation warnings exist. These will be documented for approvers." and confirmation proceeds

### Automated Actions on Confirmation
- [ ] Given I confirm data ready, when I check the backend, then a calculation workflow is automatically triggered (workflowInstanceId is populated)
- [ ] Given I confirm data ready, when I check the audit log, then a record is created with action="DataConfirmed", user, timestamp, and batch ID
- [ ] Given I confirm data ready, when the Level 1 Approver logs in, then they see a notification "Batch January 2026 ready for Level 1 approval"

### Button Visibility and State
- [ ] Given I am an Analyst viewing a batch in "Data Preparation", when the page loads, then I see the "Confirm Data Ready" button enabled
- [ ] Given I am an Analyst (not Analyst), when I view a batch in "Data Preparation", then I do NOT see the "Confirm Data Ready" button (no permission)
- [ ] Given a batch is already in "Level1Pending" or later stages, when I view the batch, then I do NOT see the "Confirm Data Ready" button (already confirmed)
- [ ] Given I click "Confirm Data Ready", when the API call is in progress, then the button shows a loading spinner and text changes to "Confirming..." and is disabled

### Rejection and Re-Confirmation
- [ ] Given a batch was rejected at Level 1 and returned to "Data Preparation", when I view the batch, then I see the "Confirm Data Ready" button again (data unlocked for corrections)
- [ ] Given I re-confirm data after rejection, when the confirmation succeeds, then the batch transitions to "Level1Pending" again and previous rejection history is preserved
- [ ] Given I re-confirm data, when I check the audit log, then a new "DataConfirmed" record is created with note "Resubmitted after rejection"

### Error Handling
- [ ] Given I confirm data ready, when the calculation initiation fails (backend error), then I see error message "Failed to initiate calculations. Please try again or contact support." and the batch remains in "Data Preparation" status
- [ ] Given the API returns a 403 Forbidden error, when I try to confirm, then I see "You do not have permission to confirm this batch"
- [ ] Given the API returns a 409 Conflict error (batch already confirmed), when I try to confirm, then I see "This batch has already been confirmed. Please refresh the page."

### Data Lock Indicator
- [ ] Given I confirmed data ready, when I view the batch card, then I see a lock icon next to the status badge with tooltip "Data locked for approval"
- [ ] Given a batch is locked, when I hover over any data entry button (e.g., "Upload File"), then I see a tooltip "Data entry disabled during approval process"

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/report-batches/{id}/confirm` | Confirm data preparation complete and initiate calculations |
| GET | `/v1/report-batches/{id}/status` | Check current batch status and lock state |
| GET | `/v1/report-batches/{id}/validation` | Get validation summary before confirming |

## Implementation Notes

- **Component**: `components/batches/ConfirmDataButton.tsx` - Reusable button component with confirmation dialog
- **Permission Check**: Verify user has role "Analyst" before showing button (use role context from Epic 1)
- **Validation Check**: Before showing confirmation dialog, fetch validation summary from `/v1/report-batches/{id}/validation`
- **Confirmation Dialog**: Use Shadcn `AlertDialog` component with destructive action styling
- **Optimistic Updates**: After confirmation, immediately update local batch state to "Level1Pending" while API call is in flight
- **Error Recovery**: On API error, revert local state back to "Data Preparation"
- **Audit Logging**: Backend automatically logs state transition per BR-AUD-003
- **Calculation Trigger**: Backend initiates calculation workflow engine (external system) and stores workflowInstanceId
- **Notification System**: Backend sends notification to Level 1 Approver(s) via notification service
- **Wireframe Reference**: Screen 2 (Batch Management) and Screen 6 (Workflow State Viewer) - button appears on both
- **BRD Requirements**:
  - BR-GOV-004 (Monthly Reporting Workflow - Data Preparation Phase)
  - BR-GOV-005 (State-Based Access Control - lock on confirmation)
  - BR-GOV-007 (Calculation Checkpoint)
- **Shadcn Components**: AlertDialog (confirmation), Button (with loading state), Badge (lock indicator)
- **API Client**: Add to `lib/api/batches.ts`: `confirmBatch(batchId)`, `getBatchValidation(batchId)`

## Dependencies
- Story 1 (Batch Creation & Listing) - requires batches to exist
- Story 2 (Batch Context Switching) - uses active batch context
- Story 3 (Workflow State Visualization) - updates workflow progress bar
- Story 5 (State-Based Access Control) - triggers data lock
- Epic 1 Story 4 (Role Assignment) - requires Analyst role check

## Story Points
**5** - Involves confirmation dialog, validation checks, state transitions, permission enforcement, and automated action triggers
