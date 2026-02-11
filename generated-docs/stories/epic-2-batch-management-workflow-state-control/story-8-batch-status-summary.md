# Story: Batch Status Summary

**Epic:** Batch Management & Workflow State Control | **Story:** 8 of 8 | **Wireframe:** Screen 2 (Batch Management - expanded view)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/batches/{id}` |
| **Target File** | `app/batches/[id]/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As a** user monitoring batch progress **I want** to view comprehensive batch status including files, validation, calculations, and workflow state **So that** I can quickly assess data completeness and identify any issues requiring attention

## Acceptance Criteria

### Happy Path - View Batch Summary
- [ ] Given I navigate to `/batches/123` for January 2026 batch, when the page loads, then I see batch header showing "Batch: January 2026", reporting date "2026-01-31", status badge "Level 2 Approval", and created by "John Smith on 2026-01-05"
- [ ] Given I view the batch summary, when the page loads, then I see four main sections: File Status, Validation Summary, Calculation Status, and Workflow Information
- [ ] Given a batch has complete data, when I view the summary, then I see overall status indicator "✓ Ready for Review" (green)

### File Status Section
- [ ] Given the batch has 45 files expected and 45 received, when I view the File Status section, then I see "Files: 45/45 received (100%)" with green checkmark
- [ ] Given the batch has 42 files received out of 45 expected, when I view the File Status section, then I see "Files: 42/45 received (93%)" with yellow warning and "3 files missing" message
- [ ] Given I view the file status, when I click "[View Details]", then I navigate to the File Status Monitor page for this batch
- [ ] Given files have processing errors, when I view the File Status section, then I see "3 files failed validation" with red error indicator

### Validation Summary Section
- [ ] Given the batch has 3 validation warnings, when I view the Validation Summary section, then I see "Validation: 3 warnings" with yellow warning icon
- [ ] Given the batch has 12 validation errors (missing data), when I view the Validation Summary section, then I see "Validation: 12 errors" with red error icon and expandable list showing error categories
- [ ] Given I expand the validation errors, when the section expands, then I see breakdown: "5 missing credit ratings", "4 missing durations", "3 missing index prices"
- [ ] Given I view validation summary, when I click "[View Full Validation Report]", then I navigate to the Data Validation Summary page
- [ ] Given the batch has no validation issues, when I view the Validation Summary section, then I see "Validation: All checks passed ✓" (green)

### Calculation Status Section
- [ ] Given calculations completed successfully, when I view the Calculation Status section, then I see "Calculations: Complete ✓" with timestamp "Completed on 2026-01-06 10:30 (Duration: 2m 34s)"
- [ ] Given calculations are in progress, when I view the Calculation Status section, then I see "Calculations: Running..." with spinner icon and estimated time remaining
- [ ] Given calculations failed, when I view the Calculation Status section, then I see "Calculations: Failed (5 errors)" with red error icon
- [ ] Given I view calculation status, when I click "[View Calculation Details]", then I navigate to the Calculation Status Monitor page
- [ ] Given calculations were cleared after rejection, when I view the Calculation Status section, then I see "Calculations: Cleared (awaiting rerun)" with info icon

### Workflow Information Section
- [ ] Given the batch is in Level 2 Approval, when I view the Workflow Information section, then I see current stage "Level 2 Approval", current approver "Portfolio Manager (Sarah Johnson)", and time in current stage "18 hours"
- [ ] Given the batch has approval history, when I view the Workflow Information section, then I see "Previous Approvals: Level 1 ✓ (Approved by John Smith on 2026-01-06 11:30)"
- [ ] Given I view workflow information, when I click "[View Full Workflow History]", then I navigate to the Workflow State Viewer page
- [ ] Given the batch was rejected, when I view the Workflow Information section, then I see "Last Rejection: Level 1 on 2026-01-07 14:20" with expandable rejection reason

### Overall Status Indicator
- [ ] Given all files received, validation passed, and calculations complete, when I view the batch summary, then I see overall status "✓ Data Complete - Ready for Approval" (green banner)
- [ ] Given files missing or validation errors exist, when I view the batch summary, then I see overall status "⚠ Data Incomplete - 5 issues requiring attention" (yellow banner)
- [ ] Given calculations failed, when I view the batch summary, then I see overall status "✗ Calculation Errors - Cannot proceed to approval" (red banner)

### Data Completeness Progress Bar
- [ ] Given a batch has 80% file completeness, 90% validation completeness, and 100% calculations complete, when I view the batch summary, then I see a multi-segment progress bar showing each metric
- [ ] Given I hover over a segment in the progress bar, when the mouse hovers, then I see a tooltip with detailed breakdown (e.g., "Files: 42/45 received, 3 missing")

### Key Metrics Panel
- [ ] Given I view the batch summary, when the page loads, then I see a Key Metrics panel showing: Total Portfolios (5), Total Instruments (234), Holdings Count (567), Total Value ($1.2B)
- [ ] Given the batch is in approval stage, when I view key metrics, then I see "Data Locked Since: 2026-01-06 11:30" with lock icon

### Action Buttons Based on Status and Role
- [ ] Given I am an Analyst and the batch is in Data Preparation with complete data, when I view the batch summary, then I see "[Confirm Data Ready]" button prominently displayed
- [ ] Given I am a Level 1 Approver and the batch is in Level1Pending, when I view the batch summary, then I see "[Review & Approve]" button
- [ ] Given I am an Analyst and the batch is locked, when I view the batch summary, then I do NOT see action buttons (read-only view)
- [ ] Given the batch is historical (Approved), when I view the batch summary, then I see "[Export Report]" and "[View Audit Log]" buttons only

### Rejection Information
- [ ] Given a batch was rejected, when I view the batch summary, then I see a prominent "Rejection Information" panel with rejecting user, timestamp, rejection level, and full rejection reason
- [ ] Given a batch was rejected multiple times, when I view the rejection information, then I see a history of all rejections with "[View All Rejections]" link

### Real-Time Updates
- [ ] Given I am viewing the batch summary, when the batch status changes (e.g., file uploaded), then the relevant section updates within 30 seconds without requiring page refresh
- [ ] Given calculations complete while I am viewing the page, when the status changes, then I see a notification "Calculations completed successfully" and the Calculation Status section updates

### Navigation Shortcuts
- [ ] Given I view the batch summary, when I see a specific issue (e.g., "5 missing credit ratings"), then the issue text is a clickable link that navigates to the Credit Ratings management page with filters applied
- [ ] Given I view the file status "3 files missing", when I click the text, then I navigate to the File Status Monitor page filtered to show only missing files

### Export Functionality
- [ ] Given I view the batch summary, when I click "[Export Summary Report]", then a PDF downloads with all summary information formatted for printing/sharing
- [ ] Given the batch is approved, when I click "[Export Data]", then an Excel file downloads with all batch data

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/report-batches/{id}` | Get detailed batch information with all status summaries |
| GET | `/v1/report-batches/{id}/status` | Get batch workflow status |
| GET | `/v1/report-batches/{id}/validation` | Get data validation summary |
| GET | `/v1/report-batches/{id}/files` | Get file status for batch |
| GET | `/v1/report-batches/{id}/calculations` | Get calculation status |
| GET | `/v1/report-batches/{id}/approvals` | Get approval history |

## Implementation Notes

- **Route**: `/batches/[id]` - dynamic route with batch ID parameter
- **Component Structure**:
  - `app/batches/[id]/page.tsx` - Main batch details page (server component)
  - `components/batches/BatchHeader.tsx` - Batch title and status
  - `components/batches/FileStatusSection.tsx` - File completeness summary
  - `components/batches/ValidationSummarySection.tsx` - Validation results
  - `components/batches/CalculationStatusSection.tsx` - Calculation progress
  - `components/batches/WorkflowInfoSection.tsx` - Workflow state and approvals
  - `components/batches/OverallStatusBanner.tsx` - Overall status indicator
  - `components/batches/KeyMetricsPanel.tsx` - Key batch metrics
- **Data Aggregation**: Fetch data from multiple endpoints and combine into comprehensive summary
- **Real-Time Updates**: Poll batch status, validation, and calculation endpoints every 30 seconds
- **Conditional Rendering**: Show/hide sections and buttons based on batch status and user role
- **Wireframe Reference**: Screen 2 - Batch Management (detailed view when card is expanded)
- **BRD Requirements**:
  - BR-GOV-006 (Batch Management - batch details visibility)
  - BR-DATA-004 (File Status Visibility)
  - BR-VALID-001 (Data Validation)
  - BR-GOV-007 (Calculation Checkpoint)
- **Shadcn Components**: Card (sections), Badge (status indicators), Progress (completeness bar), Alert (overall status banner), Button (action buttons)
- **Export**: Use jsPDF for PDF export and SheetJS for Excel export
- **Performance**: Server-side initial data fetch; client-side polling for updates
- **API Client**: Add to `lib/api/batches.ts`: `getBatchDetails(batchId)`, `exportBatchSummary(batchId)`, `exportBatchData(batchId)`
- **Testing Focus**: User sees correct status, metrics, and action buttons based on batch state and role

## Dependencies
- Story 1 (Batch Creation & Listing) - requires batches to view
- Story 3 (Workflow State Visualization) - uses workflow state data
- Story 4 (Data Confirmation) - action button integration
- Story 5 (State-Based Access Control) - lock indicators
- Story 6 (Workflow History) - links to workflow history page

## Story Points
**8** - Involves new dynamic route, multiple data sources, real-time polling, conditional rendering, export functionality, and comprehensive status aggregation
