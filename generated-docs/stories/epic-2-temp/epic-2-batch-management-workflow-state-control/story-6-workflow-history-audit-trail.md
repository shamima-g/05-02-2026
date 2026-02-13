# Story: Workflow History & Audit Trail

**Epic:** Batch Management & Workflow State Control | **Story:** 6 of 8 | **Wireframe:** Screen 6 (Workflow State Viewer - History Section)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/batches/{id}/workflow` (same as Story 3, adds history section) |
| **Target File** | `app/batches/[id]/workflow/page.tsx` (modify existing) |
| **Page Action** | `modify_existing` |

## User Story
**As a** user reviewing batch progress **I want** to see complete workflow history with all state transitions and automated actions **So that** I can understand what happened, when, and by whom for audit and troubleshooting purposes

## Acceptance Criteria

### Happy Path - View Workflow History
- [ ] Given I navigate to the workflow state viewer for January 2026 batch, when the page loads, then I see a "Workflow History" section below the current stage panel with a timeline of all events
- [ ] Given the batch has 6 events in its history, when I view the timeline, then I see all 6 events in reverse chronological order (newest first)
- [ ] Given I view the workflow history, when I see an event, then each event shows icon (📍), timestamp, event type (e.g., "LEVEL 1 APPROVED"), user who triggered it, action description, and automated actions

### Event Types and Details
- [ ] Given a batch was created, when I view the workflow history, then I see event "📍 2026-01-05 09:00 - BATCH CREATED" with user "John Smith (Analyst)", action "Created batch for January 2026 reporting", and reporting date
- [ ] Given data was confirmed, when I view the workflow history, then I see event "📍 2026-01-06 10:45 - DATA CONFIRMED READY" with user, action "Confirmed data ready for approval", and automated actions "Workflow transitioned to Level 1 Approval, Validation snapshot captured, Notification sent to Level 1 Approver"
- [ ] Given Level 1 approval was granted, when I view the workflow history, then I see event "📍 2026-01-06 11:30 - LEVEL 1 APPROVED" with user "John Smith (Analyst)", approval comment, and automated actions "Workflow transitioned to Level 2 Approval, Data entry capabilities locked, Notification sent to Portfolio Manager"

### Approval Events with Comments
- [ ] Given an approver added a comment during approval, when I view the approval event, then I see "Comment: 'All files received. 5 instruments missing ratings, documented and acceptable for this reporting period.'"
- [ ] Given an approval event, when I expand the automated actions section, then I see bulleted list of all actions taken by the system (e.g., "• Workflow transitioned to Level 2 Approval", "• Data entry capabilities locked", "• Notification sent to Portfolio Manager")

### Rejection Events
- [ ] Given a batch was rejected at Level 1, when I view the workflow history, then I see event "📍 2026-01-07 14:20 - LEVEL 1 REJECTED" with prominent red styling
- [ ] Given a rejection event, when I view its details, then I see user "John Smith (Operations Approver)", action "Rejected and returned to Data Preparation", rejection reason "Missing custodian verification files for ZAR holdings. Cannot approve without independent verification.", and automated actions "• Workflow transitioned to Data Preparation, • All calculations cleared, • Data entry capabilities unlocked, • Notification sent to Analyst, • All subsequent approvals reset (Level 2, Level 3)"

### System-Generated Events
- [ ] Given calculations completed, when I view the workflow history, then I see event "📍 2026-01-06 10:30 - CALCULATIONS COMPLETED" with "System Action: Calculations executed successfully", duration "2m 34s", and result "All calculations passed validation"
- [ ] Given files were imported automatically, when I view the workflow history, then I see event "📍 2026-01-04 14:30 - FILE IMPORT COMPLETED" with "System Action: All custodian files imported" and result "45/45 expected files received"

### Master Data Change Events
- [ ] Given master data was updated during data preparation, when I view the workflow history, then I see event "📍 2026-01-05 16:20 - MASTER DATA UPDATED" with user "Sarah Johnson (Analyst)", action "Updated 12 instrument credit ratings", and note "Data still in preparation phase"

### Pagination and Performance
- [ ] Given a batch has more than 20 events in its history, when I view the timeline, then I see the 20 most recent events and a "Load Earlier Events" button
- [ ] Given I click "Load Earlier Events", when the button is clicked, then the next 20 older events are loaded and appended to the timeline
- [ ] Given all events are loaded, when I reach the end of the timeline, then the "Load Earlier Events" button is hidden

### Export Functionality
- [ ] Given I view the workflow history, when I click "Export Workflow History", then an Excel file downloads with all events including timestamps, users, actions, and automated actions
- [ ] Given I export workflow history, when I open the Excel file, then it has columns: Timestamp, Event Type, User, Action Description, Automated Actions, Comments/Reasons

### Rejection Cycle Visibility
- [ ] Given a batch was rejected and then re-approved, when I view the workflow history, then I see the complete rejection cycle showing rejection event, correction events, data re-confirmation, and re-approval events in sequence
- [ ] Given multiple rejection cycles occurred, when I view the timeline, then each cycle is clearly visible with rejection and re-submission events grouped chronologically

### Real-Time Updates
- [ ] Given I am viewing the workflow history, when a new event occurs (e.g., batch approved at L1), then the new event appears at the top of the timeline within 10 seconds without requiring page refresh
- [ ] Given a new event appears, when I see it, then I also see a brief notification "Workflow updated: New event added"

### Empty State
- [ ] Given a batch was just created with no additional events, when I view the workflow history, then I see only the "BATCH CREATED" event
- [ ] Given I view a newly created batch, when no events exist yet, then I see message "No workflow events yet. Events will appear as the batch progresses."

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/report-batches/{id}/approvals` | Get approval history for batch (includes approvals and rejections) |
| GET | `/v1/audit/changes?entityType=ReportBatch&entityId={id}` | Get audit trail for batch including state transitions |

**Note:** Workflow history combines data from approval history and general audit trail to create comprehensive timeline.

## Implementation Notes

- **Component Structure**:
  - `components/workflow/WorkflowHistoryTimeline.tsx` - Main timeline component
  - `components/workflow/WorkflowEvent.tsx` - Individual event display with expandable automated actions
  - `components/workflow/EventIcon.tsx` - Icon display for different event types
- **Event Aggregation**: Fetch data from both approval history and audit trail endpoints, then merge and sort chronologically
- **Event Type Styling**:
  - Batch Created: Blue icon
  - Data Confirmed: Green icon
  - Approval: Green checkmark icon
  - Rejection: Red warning icon
  - System Actions: Gray icon
  - Master Data Updates: Yellow icon
- **Pagination**: Implement "Load Earlier Events" with page size 20 events
- **Real-Time Updates**: Poll approval history endpoint every 30 seconds to detect new events
- **Export**: Use SheetJS (xlsx) library to generate Excel file with formatted columns
- **Wireframe Reference**: Screen 6 - Workflow State Viewer (bottom section - "Workflow History")
- **BRD Requirements**:
  - BR-AUD-003 (Workflow Audit Trail) - PRIMARY
  - BR-GOV-001 (Three-Level Approval Hierarchy - logging requirements)
  - BR-GOV-003 (Rejection Workflow - audit trail)
- **Shadcn Components**: Card (event cards), Badge (event type badges), Accordion (expandable automated actions), Button (export, load more)
- **Date Formatting**: Use `date-fns` for consistent timestamp formatting (e.g., "2026-01-06 11:30")
- **API Client**: Add to `lib/api/batches.ts`: `getBatchApprovals(batchId)`, `getBatchAuditTrail(batchId, page, pageSize)`
- **Testing Focus**: User sees events, timestamps, users, and descriptions (NOT internal API structure)

## Dependencies
- Story 1 (Batch Creation & Listing) - requires batches with events
- Story 3 (Workflow State Visualization) - modifies same page to add history section
- Story 4 (Data Confirmation) - generates events to display
- Epic 1 Story 6 (User Activity Logging) - uses audit trail infrastructure

## Story Points
**8** - Involves event aggregation from multiple sources, timeline visualization, pagination, export functionality, and real-time updates
