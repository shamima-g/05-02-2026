# Story: Batch Creation & Listing

**Epic:** Batch Management & Workflow State Control | **Story:** 1 of 8 | **Wireframe:** Screen 2 (Batch Management)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/batches` |
| **Target File** | `app/batches/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As an** Analyst **I want** to create new reporting batches and view all batches with their workflow status **So that** I can manage multiple reporting periods simultaneously and track progress

## Acceptance Criteria

### Happy Path - Create Batch
- [ ] Given I am on the Batch Management page, when I click "Create New Batch", then a modal opens with fields for Report Type (Monthly/Weekly) and Reporting Date
- [ ] Given the Create Batch modal is open, when I select "Monthly" as type and "2026-01-31" as reporting date and click Create, then a new batch is created with status "Data Preparation" and I see a success message "Batch January 2026 created successfully"
- [ ] Given a new batch is created, when I view the batch list, then the new batch appears at the top with status badge "Data Preparation" (blue color)
- [ ] Given a new batch is created, when I check the database, then it has a unique ID, reportDate, reportBatchType=Monthly, status=DataPreparation, and workflowInstanceId is null

### Happy Path - View Batches
- [ ] Given I am on the Batch Management page, when the page loads, then I see all batches I have permission to view sorted by latest first
- [ ] Given multiple batches exist, when I view the batch list, then each batch card shows reporting date, status, created date, created by user, current workflow stage, and file/validation/calculation summary
- [ ] Given a batch is in Level 2 Approval, when I view its card, then I see "Workflow Progress: [Data Prep ✓] → [L1 Approval ✓] → [L2 Approval ●] → [L3] → [Publish]" with completed (✓), current (●), and pending (○) indicators

### Filtering and Sorting
- [ ] Given I am on the Batch Management page, when I select the "Active" filter, then I see only batches with status NOT "Approved" (excludes closed batches)
- [ ] Given I am on the Batch Management page, when I select the "Closed" filter, then I see only batches with status "Approved"
- [ ] Given I am on the Batch Management page, when I select "All" filter, then I see all batches regardless of status
- [ ] Given I am viewing batches, when I change the sort dropdown to "Oldest First", then batches are re-sorted by creation date ascending

### Rejection Visibility
- [ ] Given a batch was rejected at Level 1, when I view its card, then I see a prominent alert box showing "Last Rejection: 2025-12-15 by Level 1 Approver" and the rejection reason
- [ ] Given a rejected batch, when I view its status, then it shows "Data Preparation (Correcting after rejection)" and calculations show "Cleared"

### Validation - Duplicate Prevention
- [ ] Given a Monthly batch already exists for reporting date 2026-01-31, when I try to create another Monthly batch for the same date, then I see the error message "A Monthly batch already exists for this reporting date"
- [ ] Given I open the Create Batch modal, when I leave the Reporting Date field empty and click Create, then I see the error message "Reporting date is required"

### Pagination
- [ ] Given more than 10 batches exist, when I view the Batch Management page, then I see the first 10 batches and a "Load More" button
- [ ] Given I see the "Load More" button, when I click it, then the next 10 batches are loaded and displayed

### Permission Control
- [ ] Given I am an Analyst, when I view the Batch Management page, then I see the "Create New Batch" button
- [ ] Given I am an Analyst (not Analyst), when I view the Batch Management page, then I do NOT see the "Create New Batch" button (view only)
- [ ] Given I am an Approver, when I view the Batch Management page, then I can view batches but cannot create new ones

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/report-batches` | List all report batches with filtering and pagination |
| POST | `/v1/report-batches` | Create new report batch |
| GET | `/v1/report-batches/{id}` | Get detailed batch information |
| GET | `/v1/report-batches/{id}/status` | Get batch workflow status |

## Implementation Notes

- **Route**: `/batches` - new page in App Router
- **Component Structure**:
  - `app/batches/page.tsx` - Main batch list page (server component)
  - `components/batches/BatchList.tsx` - Client component for batch cards
  - `components/batches/CreateBatchModal.tsx` - Client component for batch creation
  - `components/batches/BatchCard.tsx` - Reusable batch display card
  - `components/batches/WorkflowProgress.tsx` - Visual workflow progress indicator
- **API Client**: Create `lib/api/batches.ts` with functions: `listBatches()`, `createBatch()`, `getBatch()`, `getBatchStatus()`
- **State Management**: Use React state for filter/sort controls; server-side filtering preferred when possible
- **Wireframe Reference**: Screen 2 - Batch Management
- **BRD Requirements**: BR-GOV-006 (Batch Management), BR-GOV-004 (Monthly Reporting Workflow)
- **Shadcn Components**: Dialog (modal), Button, Card, Badge, Select (filters/sort)
- **Date Formatting**: Use `date-fns` for date display formatting (e.g., "January 2026")
- **Status Color Coding**:
  - Data Preparation: Blue
  - Level 1/2/3 Pending: Yellow
  - Approved: Green
  - Rejected: Red

## Dependencies
- Epic 1 Story 1 (Authentication) - must be logged in to access
- Epic 1 Story 4 (Role Assignment) - permissions check for Create button visibility

## Story Points
**8** - Involves new page creation, modal, API integration, filtering/sorting logic, and complex batch card display with workflow visualization
