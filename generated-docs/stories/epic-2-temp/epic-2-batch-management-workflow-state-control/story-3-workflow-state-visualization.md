# Story: Workflow State Visualization

**Epic:** Batch Management & Workflow State Control | **Story:** 3 of 8 | **Wireframe:** Screen 6 (Workflow State Viewer)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/batches/{id}/workflow` |
| **Target File** | `app/batches/[id]/workflow/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As a** user monitoring batch progress **I want** to see the current workflow stage with visual progress indicators **So that** I can quickly understand where the batch is in the approval process and what happens next

## Acceptance Criteria

### Happy Path - Current Stage Display
- [ ] Given I navigate to the workflow state viewer for January 2026 batch (currently in Level 2 Approval), when the page loads, then I see "Current Workflow Stage" panel showing "Level 2 Approval (Portfolio Manager Review)"
- [ ] Given the batch is in Level 2 Approval, when I view the workflow progress bar, then I see "[Data Prep ✓] → [L1 Approval ✓] → [L2 Approval ●] → [L3] → [Publish]" with visual indicators for completed (✓ green), current (● yellow), and pending (○ gray)
- [ ] Given I view the current stage panel, when the batch is in Level 2 Approval, then I see "Status: Awaiting PM approval since 2026-01-06 11:30" and "Next: Level 3 Approval (Executive) after PM approval"

### Workflow Stage Icons
- [ ] Given I view the workflow progress bar, when a stage is complete, then it shows a green checkmark (✓) icon
- [ ] Given I view the workflow progress bar, when a stage is in progress, then it shows a yellow dot (●) icon
- [ ] Given I view the workflow progress bar, when a stage is pending, then it shows a gray circle (○) icon
- [ ] Given I view the workflow progress bar, when a batch was rejected and returned to Data Prep, then previously completed stages show reset icons (no checkmarks on approval levels)

### Stage Descriptions
- [ ] Given I view the current stage panel, when the batch is in "Data Preparation", then I see description "All required data must be collected, validated, and confirmed before progression"
- [ ] Given I view the current stage panel, when the batch is in "Level 1 Pending", then I see description "Operations approval focusing on file receipt and data validation checks"
- [ ] Given I view the current stage panel, when the batch is in "Level 2 Pending", then I see description "Portfolio Manager approval focusing on holdings reasonableness and performance results"
- [ ] Given I view the current stage panel, when the batch is in "Level 3 Pending", then I see description "Executive approval for final sign-off before publication"

### Status Timestamps
- [ ] Given a batch transitioned to Level 2 Approval at 2026-01-06 11:30, when I view the current stage panel, then I see "Status: Awaiting PM approval since 2026-01-06 11:30"
- [ ] Given a batch has been in Data Preparation for 3 days, when I view the status, then I see "Status: In preparation for 3 days (since 2026-01-05 09:00)"

### Navigation and Actions
- [ ] Given I am on the workflow state viewer, when I click "View Batch Details", then I navigate to the batch details page
- [ ] Given I am on the workflow state viewer, when I click a stage name in the progress bar (e.g., "L1 Approval"), then I see a tooltip showing "Level 1 Approval - Completed on 2026-01-06 11:30 by John Smith"
- [ ] Given I am viewing a batch in Data Preparation, when I have Analyst role, then I see a "Confirm Data Ready" button at the bottom of the page

### Real-Time Updates
- [ ] Given I am viewing the workflow state for a batch, when the batch workflow state changes (e.g., approved at L1), then the page updates automatically to show the new current stage within 5 seconds (via polling or WebSocket)
- [ ] Given the workflow state updates, when I see the change, then I also see a brief notification "Workflow updated: Batch moved to Level 2 Approval"

### Error States
- [ ] Given I navigate to `/batches/999/workflow` for a non-existent batch, when the page loads, then I see error message "Batch not found" and a link to "Return to Batch Management"
- [ ] Given I do not have permission to view a batch, when I try to access its workflow page, then I see "Access denied. You do not have permission to view this batch."

### Rejection State Indicators
- [ ] Given a batch was rejected and returned to Data Preparation, when I view the workflow progress bar, then I see a red warning icon on the stage where rejection occurred
- [ ] Given a batch was rejected at Level 1, when I view the current stage panel, then I see "Status: Returned to Data Preparation after Level 1 rejection" with rejection reason below

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/report-batches/{id}` | Get batch details including current status |
| GET | `/v1/report-batches/{id}/status` | Get detailed workflow status with stage information |

## Implementation Notes

- **Route**: `/batches/[id]/workflow` - dynamic route with batch ID parameter
- **Component Structure**:
  - `app/batches/[id]/workflow/page.tsx` - Main workflow viewer page (server component)
  - `components/workflow/WorkflowProgressBar.tsx` - Visual progress bar with stage indicators
  - `components/workflow/CurrentStagePanel.tsx` - Displays current stage details and status
  - `components/workflow/StageTooltip.tsx` - Tooltip showing stage completion details
- **API Client**: Add to `lib/api/batches.ts`: `getBatchWorkflowStatus(batchId)`
- **Real-Time Updates**: Implement polling (every 30 seconds) using `useEffect` or consider WebSocket for instant updates
- **Stage Mapping**: Create constants file for workflow stages with descriptions and visual indicators
- **Wireframe Reference**: Screen 6 - Workflow State Viewer (top section only - history is Story 6)
- **BRD Requirements**: BR-GOV-004 (Monthly Reporting Workflow), BR-GOV-005 (State-Based Access Control)
- **Shadcn Components**: Card (stage panel), Badge (status indicators), Tooltip (stage details)
- **Accessibility**: Ensure color-coded icons have text alternatives (aria-label) for screen readers
- **Stage Constants**:
  ```typescript
  enum WorkflowStage {
    DataPreparation = 'DataPreparation',
    Level1Pending = 'Level1Pending',
    Level2Pending = 'Level2Pending',
    Level3Pending = 'Level3Pending',
    Approved = 'Approved',
    Rejected = 'Rejected'
  }
  ```

## Dependencies
- Story 1 (Batch Creation & Listing) - requires batches to exist
- Story 2 (Batch Context Switching) - uses active batch context

## Story Points
**5** - Involves new dynamic route, visual progress bar component, real-time polling, and stage state mapping
