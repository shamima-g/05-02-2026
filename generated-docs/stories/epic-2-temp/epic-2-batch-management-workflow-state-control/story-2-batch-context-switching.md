# Story: Batch Context Switching

**Epic:** Batch Management & Workflow State Control | **Story:** 2 of 8 | **Wireframe:** Screen 2 (Batch Management) + Global Header

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (global context state + header component) |
| **Target File** | `components/layout/AppHeader.tsx` (modify existing) |
| **Page Action** | `modify_existing` |

## User Story
**As a** user working with multiple reporting periods **I want** to switch between active batches and view historical batches **So that** I can work on the current month while reviewing or correcting prior months

## Acceptance Criteria

### Happy Path - Batch Switching
- [ ] Given I am on the Batch Management page with multiple batches, when I click "Switch to Batch" on the January 2026 batch card, then the active batch context changes to January 2026 and I see a success message "Switched to batch: January 2026"
- [ ] Given I switched to January 2026 batch, when I view the global header, then I see "Active Batch: January 2026" displayed prominently
- [ ] Given I switched batches, when I navigate to any data entry screen (files, master data, validation), then all data displayed is filtered to the active batch (January 2026)
- [ ] Given I am viewing a specific batch, when I navigate away and return, then the active batch context is preserved (stored in session or local state)

### Active Batch Indicator
- [ ] Given an active batch is selected (January 2026), when I view the global header, then I see a batch switcher dropdown showing "Active Batch: January 2026 | Status: Data Preparation"
- [ ] Given I click the batch switcher in the header, when the dropdown opens, then I see a list of recent batches (max 5) with quick-switch options
- [ ] Given the batch switcher dropdown is open, when I click a different batch from the list, then the active batch context changes immediately and the dropdown closes
- [ ] Given no batch is active, when I view the header, then I see "No Active Batch" with a link to "Select Batch"

### Historical Batch Access (Read-Only)
- [ ] Given I click "View Details" on a closed batch (November 2025, Status: Approved), when the batch details page loads, then all data is read-only and I see a banner "This is a historical batch. No modifications allowed."
- [ ] Given I am viewing a historical batch, when I attempt to upload a file or modify master data, then the action is blocked and I see the message "Cannot modify historical batch. Switch to an active batch to make changes."
- [ ] Given I view a historical batch, when I check the batch card, then I see an "Export Report" button instead of "Switch to Batch"

### Context Persistence
- [ ] Given I selected January 2026 as active batch, when I refresh the page, then January 2026 remains the active batch (context persisted)
- [ ] Given I selected January 2026 as active batch, when I log out and log back in, then January 2026 is still the active batch (server-side preference stored)
- [ ] Given I have never selected a batch, when I first log in, then the system automatically sets the most recent batch (latest by reporting date) as active

### Multi-User Scenarios
- [ ] Given User A is working on January 2026 batch, when User B logs in, then User B can independently select a different active batch (December 2025) without affecting User A's context
- [ ] Given I am working on January 2026, when another user creates a new February 2026 batch, then I see a notification "New batch available: February 2026" with option to switch

### Validation - Status Constraints
- [ ] Given a batch is in Level 2 Approval (locked state), when I switch to this batch as active, then I can view it but receive a notification "This batch is locked for approval. Data entry disabled."
- [ ] Given a batch is rejected and returned to Data Preparation, when I switch to this batch, then I can edit data and I see "Batch unlocked after rejection. Ready for corrections."

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/report-batches` | List batches for switcher dropdown |
| GET | `/v1/report-batches/{id}` | Get batch details when switching |
| GET | `/v1/report-batches/{id}/status` | Check batch workflow status for context validation |

**Note:** Active batch context is stored client-side (React Context) and optionally persisted to user preferences in backend.

## Implementation Notes

- **Global Context**: Create React Context (`BatchContext`) to store active batch ID across the application
- **Context Provider**: Wrap application in `BatchContextProvider` at root layout level
- **Header Component**: Modify existing `components/layout/AppHeader.tsx` to add batch switcher dropdown
- **Persistence Strategy**:
  - Client-side: localStorage for immediate persistence across page refreshes
  - Server-side: User preference API endpoint to store last selected batch per user
- **Permission Check**: Verify user has access to batch before allowing switch (based on role and batch visibility rules)
- **Read-Only Detection**: Check batch status (Approved = historical) and display appropriate UI indicators
- **Shadcn Components**: DropdownMenu (batch switcher), Badge (status indicator), Alert (read-only banner)
- **Wireframe Reference**: Screen 2 (Batch Management) + Global Header across all screens
- **BRD Requirements**: BR-GOV-006 (Batch Management - "Users can switch between active batches without data loss")
- **State Synchronization**: When batch context changes, trigger re-fetch of data on current screen

## Dependencies
- Story 1 (Batch Creation & Listing) - requires batches to exist before switching
- Epic 1 Story 1 (Authentication) - user context required for batch preferences

## Story Points
**5** - Involves global context creation, header modification, localStorage/API persistence, and read-only state detection
