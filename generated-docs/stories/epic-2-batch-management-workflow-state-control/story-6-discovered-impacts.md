# Story 6 Discovered Impacts Analysis: Workflow History & Audit Trail

**Generated:** 2026-03-02
**Epic:** 2 (Batch Management & Workflow State Control)
**Story:** 6 (Workflow History & Audit Trail)
**Route:** `/batches/{id}/workflow` (modifies existing page from Story 3)

---

## Executive Summary

This analysis examines the existing codebase to assess readiness for implementing workflow history with a complete timeline of events including approvals, rejections, state transitions, and automated actions.

**Key Findings:**
- ✅ **API endpoints exist** - `/report-batches/{id}/approvals` for approval history
- ✅ **Audit trail API exists** - `/audit/changes?entityType=ReportBatch&entityId={id}` for state transitions
- ✅ **Polling infrastructure ready** - `usePolling()` hook exists, used in WorkflowClient
- ✅ **WorkflowClient already established** - Story 3 created the page we'll modify
- ✅ **CurrentStagePanel component exists** - Shows current stage details
- ✅ **Shadcn Card, Badge, Button exist** - Core UI components installed
- ✅ **Separator component exists** - For timeline visual separation
- ⚠️ **No Accordion component** - Need to install for expandable automated actions
- ⚠️ **No approval API client functions** - Need to add `getBatchApprovals()` to batches.ts
- ⚠️ **No audit trail for ReportBatch** - Current audit.ts only handles master data entities
- ⚠️ **No timeline components** - Need to create WorkflowHistoryTimeline, WorkflowEvent, EventIcon
- ⚠️ **No Excel export utility** - Need to install xlsx library
- ⚠️ **No pagination for timeline** - Need to implement "Load Earlier Events" functionality
- ⚠️ **ApprovalLogEntry type missing** - Need to add TypeScript interface

**Critical Discovery:** Story 6 is a pure additive feature. We're adding a new section to the existing WorkflowClient page from Story 3. The event aggregation pattern is the main complexity - we need to merge approval history and audit trail data, sort chronologically, and present as unified timeline.

---

## 1. Existing Infrastructure Assessment

### 1.1 API Endpoints ✅

**Approval History Endpoint:**
```yaml
GET /report-batches/{id}/approvals
Returns: ApprovalLogEntry[]

ApprovalLogEntry:
  id: integer
  reportBatchId: integer
  type: "Level1" | "Level2" | "Level3"
  isApproved: boolean
  user: string
  time: string (date-time)
  rejectReason: string | null
```

**Audit Trail Endpoint:**
```yaml
GET /audit/changes?entityType=ReportBatch&entityId={id}
Returns: AuditTrailList

AuditTrailEntry:
  entityType: string
  entityId: integer
  changeType: "Created" | "Updated" | "Deleted"
  changedBy: string
  changedAt: string (date-time)
  changes: Array<{ field, oldValue, newValue }>
```

**Analysis:**
- ✅ Both endpoints exist and are documented in OpenAPI spec
- ✅ Approval history includes user, timestamp, type, and rejection reason
- ✅ Audit trail includes state transitions (field: "status", oldValue: "DataPreparation", newValue: "Level1Pending")
- ✅ Pagination supported via `page` and `pageSize` query params
- ⚠️ ApprovalLogEntry is missing `comment` field - only has `rejectReason` for rejections
- ⚠️ No dedicated endpoint for batch creation events - need to infer from audit trail

**Event Mapping Strategy:**
| Story Event Type | API Source | Mapping Logic |
|-----------------|------------|---------------|
| BATCH CREATED | Audit trail | `changeType: "Created"` |
| DATA CONFIRMED READY | Audit trail | `field: "status"`, `newValue: "Level1Pending"` |
| LEVEL 1 APPROVED | Approvals | `type: "Level1"`, `isApproved: true` |
| LEVEL 1 REJECTED | Approvals | `type: "Level1"`, `isApproved: false` |
| LEVEL 2 APPROVED | Approvals | `type: "Level2"`, `isApproved: true` |
| LEVEL 2 REJECTED | Approvals | `type: "Level2"`, `isApproved: false` |
| LEVEL 3 APPROVED | Approvals | `type: "Level3"`, `isApproved: true` |
| CALCULATIONS COMPLETED | Audit trail | Custom field (backend needs to log this) |
| FILE IMPORT COMPLETED | Audit trail | Custom field (backend needs to log this) |
| MASTER DATA UPDATED | Audit trail | `entityType: "Instrument"` linked to batch |

---

### 1.2 Existing WorkflowClient Page ✅

**Location:** `web/src/app/batches/[id]/workflow/WorkflowClient.tsx`

**Current Implementation:**
- ✅ Fetches batch data and workflow status
- ✅ Uses `usePolling()` hook to refresh every 30 seconds
- ✅ Renders `WorkflowProgressBar` and `CurrentStagePanel`
- ✅ Error handling and loading states implemented
- ✅ Layout uses `container mx-auto max-w-4xl space-y-6`

**Required Changes:**
- Add `WorkflowHistoryTimeline` component below `CurrentStagePanel`
- Pass `batchId` to timeline component
- No changes needed to polling logic (timeline will have its own data fetching)

**Impact:** Minimal changes to existing code. Story 6 is purely additive.

---

### 1.3 Polling Hook ✅

**Location:** `web/src/hooks/usePolling.ts`

**Functionality:**
```typescript
export function usePolling(
  callback: () => void | Promise<void>,
  interval: number,
  enabled: boolean = true
)
```

**Analysis:**
- ✅ Generic polling hook that accepts any async callback
- ✅ Automatically cleans up on unmount
- ✅ Respects enabled flag
- ✅ Currently used in WorkflowClient with 30-second interval

**Usage in Story 6:**
Timeline component will need its own polling for real-time updates:
```typescript
usePolling(fetchTimelineEvents, 30000, !isLoading && !error);
```

---

### 1.4 Shadcn UI Components

**Installed Components:**
- ✅ `card.tsx` - For event cards
- ✅ `badge.tsx` - For event type badges
- ✅ `button.tsx` - For "Load Earlier Events" and "Export Workflow History"
- ✅ `separator.tsx` - For visual separation between timeline items
- ✅ `alert.tsx` - For empty state message
- ⚠️ **Missing:** `accordion.tsx` - For expandable automated actions section

**Required Installation:**
```bash
cd web
npx shadcn@latest add accordion
```

---

### 1.5 Date Formatting Utilities ✅

**Location:** `web/src/lib/utils/date-formatting.ts`

**Available Functions:**
- ✅ `formatDateTime()` - Formats as "2026-01-06 11:30"
- ✅ `formatRelativeTime()` - Formats as "2 hours ago"
- ✅ `formatReportDate()` - Formats as "January 2026"

**Analysis:**
Story 6 AC specifies timestamp format: "2026-01-06 11:30" which exactly matches `formatDateTime()`. No new utilities needed.

---

## 2. New Infrastructure Needed

### 2.1 API Client Functions ❌

**Location:** `web/src/lib/api/batches.ts`

**Required Additions:**

```typescript
/**
 * Approval log entry from batch approval history
 */
export interface ApprovalLogEntry {
  id: number;
  reportBatchId: number;
  type: 'Level1' | 'Level2' | 'Level3';
  isApproved: boolean;
  user: string;
  time: string; // ISO date-time
  rejectReason: string | null;
  comment?: string; // Optional approval comment
}

/**
 * Get approval history for a batch
 * Maps to GET /report-batches/{id}/approvals
 */
export async function getBatchApprovals(
  id: number
): Promise<ApprovalLogEntry[]> {
  return get<ApprovalLogEntry[]>(`/report-batches/${id}/approvals`);
}

/**
 * Get audit trail for a batch with pagination
 * Maps to GET /audit/changes?entityType=ReportBatch&entityId={id}
 */
export async function getBatchAuditTrail(
  id: number,
  page: number = 1,
  pageSize: number = 20
): Promise<AuditTrailList> {
  return get<AuditTrailList>('/audit/changes', {
    entityType: 'ReportBatch',
    entityId: id.toString(),
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
}
```

**Rationale:**
- Centralized API functions follow existing pattern in batches.ts
- Type definitions match OpenAPI schema
- Pagination parameters for audit trail support "Load Earlier Events"

---

### 2.2 Timeline Components ❌

**Component Structure:**

```
components/workflow/
├── WorkflowHistoryTimeline.tsx    # Main timeline container
├── WorkflowEvent.tsx              # Individual event display
└── EventIcon.tsx                  # Icon selector based on event type
```

**2.2.1 WorkflowHistoryTimeline Component**

**Location:** Create `web/src/components/workflow/WorkflowHistoryTimeline.tsx`

**Responsibilities:**
- Fetch approval history and audit trail data
- Merge and sort events chronologically (newest first)
- Implement pagination (20 events per page)
- Poll for new events every 30 seconds
- Render list of `WorkflowEvent` components
- Handle loading, error, and empty states
- Provide "Load Earlier Events" button
- Provide "Export Workflow History" button

**Key Features:**
```typescript
interface WorkflowHistoryTimelineProps {
  batchId: number;
}

// Internal state:
- events: WorkflowEventData[] (merged approval + audit)
- page: number (for pagination)
- hasMore: boolean (pagination flag)
- isLoading: boolean
- error: string | null
```

**Event Aggregation Logic:**
1. Fetch approval history (all)
2. Fetch audit trail page 1 (20 events)
3. Map approvals to WorkflowEventData
4. Map audit entries to WorkflowEventData
5. Merge arrays
6. Sort by timestamp descending (newest first)
7. Display first 20 events

---

**2.2.2 WorkflowEvent Component**

**Location:** Create `web/src/components/workflow/WorkflowEvent.tsx`

**Responsibilities:**
- Display single event with icon, timestamp, event type, user, action description
- Show approval comment or rejection reason
- Expandable automated actions section (Accordion)
- Apply event-specific styling (red for rejections, green for approvals)

**Props:**
```typescript
interface WorkflowEventProps {
  icon: string; // Emoji or lucide icon name
  timestamp: string;
  eventType: string; // "LEVEL 1 APPROVED"
  user: string; // "John Smith (Analyst)"
  action: string; // Description of what happened
  comment?: string; // Approval/rejection comment
  automatedActions?: string[]; // List of system actions
  isRejection?: boolean; // Red styling flag
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ 📍 2026-01-06 11:30 - LEVEL 1 APPROVED             │
│ John Smith (Operations Approver)                    │
│ Approved batch for Level 1                          │
│                                                     │
│ Comment: "All files received. 5 instruments..."    │
│                                                     │
│ ▼ Automated Actions                                 │
│   • Workflow transitioned to Level 2 Approval      │
│   • Data entry capabilities locked                  │
│   • Notification sent to Portfolio Manager          │
└─────────────────────────────────────────────────────┘
```

---

**2.2.3 EventIcon Component**

**Location:** Create `web/src/components/workflow/EventIcon.tsx`

**Responsibilities:**
- Return appropriate icon based on event type
- Map event types to Lucide icons or emojis

**Icon Mapping:**
| Event Type | Icon | Color |
|-----------|------|-------|
| BATCH CREATED | `FileText` (lucide) | Blue |
| DATA CONFIRMED | `CheckCircle` (lucide) | Green |
| APPROVAL | `CheckCircle2` (lucide) | Green |
| REJECTION | `XCircle` (lucide) | Red |
| SYSTEM ACTION | `Cog` (lucide) | Gray |
| MASTER DATA | `Database` (lucide) | Yellow |

---

### 2.3 Event Type Definitions ❌

**Location:** Create `web/src/types/workflow-events.ts`

**Required Types:**

```typescript
/**
 * Unified workflow event type for timeline display
 * Aggregates data from approval history and audit trail
 */
export interface WorkflowEventData {
  id: string; // Unique ID (approval ID or audit ID)
  timestamp: string; // ISO date-time
  eventType: WorkflowEventType;
  user: string; // Display name with role
  action: string; // Human-readable description
  comment?: string; // Approval comment or rejection reason
  automatedActions?: string[]; // List of system actions
  isRejection?: boolean; // Red styling flag
}

export enum WorkflowEventType {
  BATCH_CREATED = 'BATCH_CREATED',
  DATA_CONFIRMED = 'DATA_CONFIRMED',
  LEVEL1_APPROVED = 'LEVEL1_APPROVED',
  LEVEL1_REJECTED = 'LEVEL1_REJECTED',
  LEVEL2_APPROVED = 'LEVEL2_APPROVED',
  LEVEL2_REJECTED = 'LEVEL2_REJECTED',
  LEVEL3_APPROVED = 'LEVEL3_APPROVED',
  LEVEL3_REJECTED = 'LEVEL3_REJECTED',
  CALCULATIONS_COMPLETED = 'CALCULATIONS_COMPLETED',
  FILE_IMPORT = 'FILE_IMPORT',
  MASTER_DATA_UPDATE = 'MASTER_DATA_UPDATE',
}

/**
 * Helper to map API data to WorkflowEventData
 */
export function mapApprovalToEvent(approval: ApprovalLogEntry): WorkflowEventData;
export function mapAuditToEvent(audit: AuditTrailEntry): WorkflowEventData;
```

---

### 2.4 Excel Export Utility ❌

**Library:** `xlsx` (SheetJS)

**Installation:**
```bash
cd web
npm install xlsx
npm install --save-dev @types/xlsx
```

**Location:** Create `web/src/lib/utils/excel-export.ts`

**Required Function:**

```typescript
import * as XLSX from 'xlsx';
import type { WorkflowEventData } from '@/types/workflow-events';

/**
 * Export workflow history to Excel file
 *
 * @param events - Array of workflow events
 * @param batchName - Batch name for filename
 */
export function exportWorkflowHistory(
  events: WorkflowEventData[],
  batchName: string
): void {
  // Convert events to Excel rows
  const rows = events.map(event => ({
    Timestamp: event.timestamp,
    'Event Type': event.eventType,
    User: event.user,
    Action: event.action,
    'Automated Actions': event.automatedActions?.join('; ') || '',
    'Comments/Reasons': event.comment || '',
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Workflow History');

  // Download file
  XLSX.writeFile(workbook, `${batchName}_workflow_history.xlsx`);
}
```

---

## 3. Impacts on Existing Code

### 3.1 WorkflowClient.tsx - Add Timeline Section

**File:** `web/src/app/batches/[id]/workflow/WorkflowClient.tsx`

**Change:** Add WorkflowHistoryTimeline component below CurrentStagePanel

**Before (lines 125-145):**
```typescript
return (
  <div className="container mx-auto max-w-4xl space-y-6 p-6">
    <h1 className="text-3xl font-bold">
      Workflow State - Batch: {formatReportDate(batch.reportDate)}
    </h1>

    <WorkflowProgressBar
      currentStage={workflowStatus.currentStage}
      lastRejection={batch.lastRejection}
    />

    <CurrentStagePanel
      batchId={batchId}
      currentStage={workflowStatus.currentStage}
      lastUpdated={workflowStatus.lastUpdated}
      canConfirm={workflowStatus.canConfirm}
      lastRejection={batch.lastRejection}
      reportDate={batch.reportDate}
    />
  </div>
);
```

**After:**
```typescript
return (
  <div className="container mx-auto max-w-4xl space-y-6 p-6">
    <h1 className="text-3xl font-bold">
      Workflow State - Batch: {formatReportDate(batch.reportDate)}
    </h1>

    <WorkflowProgressBar
      currentStage={workflowStatus.currentStage}
      lastRejection={batch.lastRejection}
    />

    <CurrentStagePanel
      batchId={batchId}
      currentStage={workflowStatus.currentStage}
      lastUpdated={workflowStatus.lastUpdated}
      canConfirm={workflowStatus.canConfirm}
      lastRejection={batch.lastRejection}
      reportDate={batch.reportDate}
    />

    {/* NEW: Workflow History Timeline */}
    <WorkflowHistoryTimeline
      batchId={batchId}
      batchName={formatReportDate(batch.reportDate)}
    />
  </div>
);
```

**Impact:** Single import and single component addition. No breaking changes.

---

### 3.2 batches.ts - Add API Functions

**File:** `web/src/lib/api/batches.ts`

**Change:** Add `ApprovalLogEntry` interface, `getBatchApprovals()`, and `getBatchAuditTrail()` (see Section 2.1)

**Impact:** Pure addition, no breaking changes to existing functions.

---

### 3.3 audit.ts - Extend for ReportBatch Entity

**File:** `web/src/lib/api/audit.ts`

**Current Limitation:**
```typescript
export type AuditableEntityType =
  | 'Instrument'
  | 'Portfolio'
  | 'AssetManager'
  | 'Currency'
  | 'Country'
  | 'Index'
  | 'CreditRating'
  | 'InstrumentDuration'
  | 'InstrumentBeta'
  | 'IndexPrice';
```

**Required Change:**
```typescript
export type AuditableEntityType =
  | 'Instrument'
  | 'Portfolio'
  | 'AssetManager'
  | 'Currency'
  | 'Country'
  | 'Index'
  | 'CreditRating'
  | 'InstrumentDuration'
  | 'InstrumentBeta'
  | 'IndexPrice'
  | 'ReportBatch'; // NEW
```

**Alternative:** Define `getBatchAuditTrail()` in batches.ts (recommended - keeps batch-related functions together)

**Recommendation:** Implement in batches.ts to avoid modifying audit.ts type constraints.

---

## 4. Acceptance Criteria Mapping

### AC: Happy Path - View Workflow History

- ✅ **Timeline section below current stage panel** → Add to WorkflowClient
- ✅ **All 6 events in reverse chronological order** → Sort merged events by timestamp descending
- ✅ **Each event shows icon, timestamp, event type, user, action, automated actions** → WorkflowEvent component layout

**Status:** All requirements can be met with proposed components.

---

### AC: Event Types and Details

- ✅ **Batch created event** → Map from audit trail `changeType: "Created"`
- ✅ **Data confirmed event** → Map from audit trail status change to Level1Pending
- ✅ **Level 1 approval event** → Map from approval history `type: "Level1"`, `isApproved: true`
- ⚠️ **Automated actions** → Backend needs to log these in audit trail or approval record

**Gap:** Story AC assumes automated actions are included in API response. OpenAPI spec does not show this field. Options:
1. **Backend adds automated actions to ApprovalLogEntry** (preferred)
2. **Frontend hardcodes automated actions based on event type** (acceptable fallback)

**Recommendation:** Use fallback approach - map event type to automated actions in frontend utility:

```typescript
function getAutomatedActionsForEvent(eventType: WorkflowEventType, data: any): string[] {
  switch (eventType) {
    case WorkflowEventType.DATA_CONFIRMED:
      return [
        'Workflow transitioned to Level 1 Approval',
        'Validation snapshot captured',
        'Notification sent to Level 1 Approver',
      ];
    case WorkflowEventType.LEVEL1_APPROVED:
      return [
        'Workflow transitioned to Level 2 Approval',
        'Data entry capabilities locked',
        'Notification sent to Portfolio Manager',
      ];
    // ... etc
  }
}
```

---

### AC: Approval Events with Comments

- ⚠️ **Approval comment field** → OpenAPI spec only has `rejectReason`, no `comment` field for approvals
- ✅ **Expandable automated actions** → Use Shadcn Accordion component

**Gap:** Story AC shows approval comments ("All files received. 5 instruments missing ratings..."), but API only has `rejectReason` for rejections.

**Options:**
1. Backend adds `comment` field to ApprovalLogEntry (requires API change)
2. Frontend shows `rejectReason` only for rejections (spec-compliant)

**Recommendation:** Proceed with option 2 for Story 6. File enhancement request for backend to add optional approval comments in future story.

---

### AC: Rejection Events

- ✅ **Red styling for rejections** → `isRejection` flag passed to WorkflowEvent component
- ✅ **Rejection reason displayed** → Map from `rejectReason` field
- ✅ **Automated actions for rejection** → Hardcoded list based on event type

**Status:** Fully supported with existing API data.

---

### AC: System-Generated Events

- ⚠️ **Calculations completed event** → Backend must log this in audit trail
- ⚠️ **File import completed event** → Backend must log this in audit trail
- ⚠️ **Duration and result fields** → Backend must include in audit trail details

**Gap:** These events require backend logging. Frontend can only display if data exists.

**Recommendation:** Implement frontend components that handle these event types. If backend hasn't implemented logging yet, these events simply won't appear in timeline (graceful degradation).

---

### AC: Master Data Change Events

- ✅ **Master data update event** → Query audit trail for Instrument changes during batch date range
- ⚠️ **Linking instruments to batch** → Need date range filter to only show updates during batch preparation

**Challenge:** Audit trail for Instrument changes is separate from ReportBatch audit trail. Need to query both:
1. `/audit/changes?entityType=ReportBatch&entityId={id}` - Batch state changes
2. `/audit/changes?entityType=Instrument&from={batchCreatedDate}` - Instrument changes

**Recommendation:** For Story 6, focus on batch-specific events only. Master data updates are out of scope unless explicitly linked to batch in audit trail.

---

### AC: Pagination and Performance

- ✅ **20 events per page** → `pageSize=20` parameter in audit trail API
- ✅ **"Load Earlier Events" button** → Increment page number and append to events array
- ✅ **Hide button when all loaded** → Check `meta.totalPages` from API response

**Implementation:**
```typescript
const loadMoreEvents = async () => {
  const nextPage = page + 1;
  const auditData = await getBatchAuditTrail(batchId, nextPage, 20);
  setEvents(prev => [...prev, ...mapAuditData(auditData.items)]);
  setPage(nextPage);
  setHasMore(nextPage < auditData.meta.totalPages);
};
```

---

### AC: Export Functionality

- ✅ **Excel export button** → Call `exportWorkflowHistory()` utility
- ✅ **Excel file with columns** → XLSX library supports column mapping
- ✅ **All events exported** → Pass full events array (no pagination limit)

**Implementation:**
```typescript
<Button onClick={() => exportWorkflowHistory(events, batchName)}>
  Export Workflow History
</Button>
```

---

### AC: Rejection Cycle Visibility

- ✅ **Complete rejection cycle** → Events are chronological, cycle naturally visible
- ✅ **Multiple rejection cycles** → All events displayed in order

**Status:** No special handling needed - chronological sort naturally shows cycles.

---

### AC: Real-Time Updates

- ✅ **30-second polling** → Use `usePolling()` hook in WorkflowHistoryTimeline
- ✅ **New events appear within 10 seconds** → Actual update time is 0-30 seconds (depends on poll timing)
- ⚠️ **Notification "Workflow updated"** → Need to add toast notification

**Implementation:**
```typescript
const [lastEventId, setLastEventId] = useState<string | null>(null);

const checkForNewEvents = async () => {
  const newEvents = await fetchTimelineEvents();
  if (newEvents[0]?.id !== lastEventId) {
    // New event detected
    toast({ title: 'Workflow updated', description: 'New event added' });
    setLastEventId(newEvents[0]?.id);
  }
};

usePolling(checkForNewEvents, 30000, !isLoading);
```

**Required:** Install Shadcn `toast` component if not already installed.

---

### AC: Empty State

- ✅ **"BATCH CREATED" event only** → Check if events array length is 1
- ✅ **"No workflow events yet" message** → Show Alert with empty state message

**Implementation:**
```typescript
{events.length === 0 && (
  <Alert>
    <AlertDescription>
      No workflow events yet. Events will appear as the batch progresses.
    </AlertDescription>
  </Alert>
)}
```

---

## 5. Test Strategy

### 5.1 API Client Function Tests

**File:** Create `web/src/lib/api/__tests__/batches-approvals.test.ts`

**Test Scenarios:**

#### getBatchApprovals()
- ✅ Fetches approval history from correct endpoint
- ✅ Returns array of ApprovalLogEntry objects
- ✅ Includes all required fields (id, type, user, time, isApproved, rejectReason)
- ✅ Handles empty array (no approvals yet)
- ✅ Handles 404 error (batch not found)

#### getBatchAuditTrail()
- ✅ Fetches audit trail with pagination params
- ✅ Returns AuditTrailList with items and meta
- ✅ Passes entityType=ReportBatch and entityId correctly
- ✅ Supports pagination (page, pageSize)
- ✅ Handles empty audit trail

**Mock Strategy:**
```typescript
vi.mock('@/lib/api/client', () => ({
  get: vi.fn(),
}));
```

---

### 5.2 Event Mapping Utilities Tests

**File:** Create `web/src/types/__tests__/workflow-events.test.ts`

**Test Scenarios:**

#### mapApprovalToEvent()
- ✅ Maps Level1 approval to LEVEL1_APPROVED event
- ✅ Maps Level1 rejection to LEVEL1_REJECTED event with rejectReason
- ✅ Sets isRejection flag for rejections
- ✅ Formats user display name
- ✅ Generates automated actions for approval

#### mapAuditToEvent()
- ✅ Maps batch creation to BATCH_CREATED event
- ✅ Maps status change to DATA_CONFIRMED event
- ✅ Extracts user from changedBy field
- ✅ Formats timestamp correctly

**Mock Strategy:**
Pure functions - no mocking needed.

---

### 5.3 WorkflowHistoryTimeline Component Tests

**File:** Create `web/src/components/workflow/__tests__/WorkflowHistoryTimeline.test.tsx`

**Test Scenarios:**

#### Happy Path
- ✅ Fetches approval history and audit trail on mount
- ✅ Displays timeline with merged events
- ✅ Shows events in reverse chronological order (newest first)
- ✅ Shows "Load Earlier Events" button when more pages exist
- ✅ Loads next page when button clicked
- ✅ Hides button when all events loaded

#### Real-Time Updates
- ✅ Polls for new events every 30 seconds
- ✅ Shows toast notification when new event detected
- ✅ New event appears at top of timeline

#### Export
- ✅ Clicking "Export" button downloads Excel file
- ✅ Excel file contains all events with correct columns

#### Empty State
- ✅ Shows empty state message when no events
- ✅ Shows only BATCH_CREATED event for new batch

#### Error Handling
- ✅ Shows error alert if API fails
- ✅ Retry button refetches data

**Mock Strategy:**
```typescript
vi.mock('@/lib/api/batches', () => ({
  getBatchApprovals: vi.fn(),
  getBatchAuditTrail: vi.fn(),
}));

vi.mock('@/hooks/usePolling', () => ({
  usePolling: vi.fn(),
}));

vi.mock('@/lib/utils/excel-export', () => ({
  exportWorkflowHistory: vi.fn(),
}));
```

---

### 5.4 WorkflowEvent Component Tests

**File:** Create `web/src/components/workflow/__tests__/WorkflowEvent.test.tsx`

**Test Scenarios:**

#### Display
- ✅ Shows icon, timestamp, event type, user, action
- ✅ Shows approval comment when provided
- ✅ Shows rejection reason for rejections
- ✅ Applies red styling for rejections
- ✅ Shows automated actions in expandable section

#### Accordion
- ✅ Automated actions section is collapsed by default
- ✅ Clicking expands automated actions list
- ✅ Shows bullet points for each automated action

**Mock Strategy:**
No mocking needed - pure presentation component.

---

### 5.5 Integration Tests

**File:** Update `web/src/__tests__/integration/epic-2-story-6-workflow-history.test.tsx`

**Test Scenarios:**

#### Full Workflow History
- ✅ User navigates to workflow page
- ✅ User sees timeline with approval events
- ✅ User sees rejection event with red styling
- ✅ User expands automated actions for approval event
- ✅ User sees all automated actions listed

#### Pagination
- ✅ User sees 20 events initially
- ✅ User clicks "Load Earlier Events"
- ✅ User sees 20 additional events appended
- ✅ Button disappears when all events loaded

#### Export
- ✅ User clicks "Export Workflow History"
- ✅ Excel file download initiated

**Mock Strategy:**
```typescript
// Mock API responses with realistic data
mockGetBatchApprovals.mockResolvedValue([
  {
    id: 1,
    type: 'Level1',
    isApproved: true,
    user: 'John Smith',
    time: '2026-01-06T11:30:00Z',
    rejectReason: null,
  },
]);

mockGetBatchAuditTrail.mockResolvedValue({
  items: [
    {
      entityType: 'ReportBatch',
      entityId: 1,
      changeType: 'Created',
      changedBy: 'John Smith',
      changedAt: '2026-01-05T09:00:00Z',
      changes: [],
    },
  ],
  meta: { page: 1, pageSize: 20, totalItems: 6, totalPages: 1 },
});
```

---

## 6. Implementation Order (TDD)

### Phase 1: Install Dependencies
1. **Install Shadcn Accordion** - `npx shadcn@latest add accordion`
2. **Install xlsx library** - `npm install xlsx @types/xlsx`
3. **Verify Shadcn toast exists** - Check if already installed, install if not

### Phase 2: API Client Layer
4. **Add TypeScript types** - `ApprovalLogEntry` interface in batches.ts
5. **Write API client tests** - `batches-approvals.test.ts`
6. **Implement API functions** - `getBatchApprovals()` and `getBatchAuditTrail()`
7. **Run tests** - Verify API client functions work

### Phase 3: Event Mapping Utilities
8. **Create event types** - `workflow-events.ts` with enums and interfaces
9. **Write mapping tests** - `workflow-events.test.ts`
10. **Implement mappers** - `mapApprovalToEvent()` and `mapAuditToEvent()`
11. **Implement automated actions helper** - `getAutomatedActionsForEvent()`
12. **Run tests** - Verify event mapping logic

### Phase 4: Excel Export Utility
13. **Create export utility** - `excel-export.ts`
14. **Write export tests** - `excel-export.test.ts`
15. **Implement export function** - `exportWorkflowHistory()`
16. **Run tests** - Verify Excel generation

### Phase 5: UI Components (Bottom-Up)
17. **Create EventIcon component** - Icon mapping logic
18. **Write EventIcon tests** - Verify correct icons returned
19. **Create WorkflowEvent component** - Individual event display
20. **Write WorkflowEvent tests** - Verify layout, accordion, styling
21. **Run tests** - Verify event rendering

### Phase 6: Timeline Component
22. **Create WorkflowHistoryTimeline component** - Main timeline container
23. **Write timeline tests** - Fetch, merge, sort, paginate, poll, export
24. **Implement timeline logic** - Event aggregation and display
25. **Run tests** - Verify timeline behavior

### Phase 7: Integration
26. **Update WorkflowClient** - Add timeline component to page
27. **Write integration test** - Full user workflow with timeline
28. **Run tests** - Verify end-to-end behavior
29. **Manual testing** - Verify real-time polling, export, pagination

---

## 7. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Approval comments not in API** | Medium | Use fallback - show rejectReason only for rejections. File backend enhancement request for approval comments. |
| **Automated actions not in API** | Medium | Hardcode automated actions in frontend based on event type. Document mapping for future backend integration. |
| **System-generated events missing** | Medium | Graceful degradation - timeline shows only events that exist. Backend can add logging in future stories. |
| **Master data events not linked to batch** | Low | Out of scope for Story 6. Focus on batch-specific events only. |
| **Event aggregation performance** | Low | Pagination limits events to 20 per page. Total events per batch unlikely to exceed 100. |
| **Real-time polling overhead** | Low | 30-second interval is conservative. Can increase to 60 seconds if needed. |
| **Excel export fails on large datasets** | Low | XLSX library handles 10k+ rows easily. Batch workflow history unlikely to exceed 1000 events. |
| **Timeline doesn't update after approval action** | Medium | Polling detects changes within 30 seconds. Consider refetch on navigation back to page. |

---

## 8. Quality Gates Checklist

Before transitioning to SPECIFY phase, verify:

- [x] API endpoints exist for approval history and audit trail
- [x] WorkflowClient page exists from Story 3
- [x] Polling hook exists and is functional
- [x] Date formatting utilities exist
- [x] Shadcn Card, Badge, Button, Separator exist
- [x] Event aggregation strategy defined (merge + sort)
- [x] Pagination strategy defined (page param, "Load Earlier Events")
- [x] Real-time update strategy defined (polling + toast)
- [x] Export strategy defined (xlsx library)
- [x] Test strategy covers API, utilities, components, integration
- [x] Fallback strategies defined for missing API fields

---

## 9. Open Questions for SPECIFY Phase

1. **Approval comment field:**
   Should we file a backend enhancement request to add optional `comment` field to ApprovalLogEntry? Or proceed with rejectReason-only approach?

   **Recommendation:** Proceed without comments for Story 6. File enhancement request for future story.

2. **System-generated events:**
   Should Story 6 be blocked if backend hasn't implemented logging for calculations/file imports? Or proceed with display logic and graceful degradation?

   **Recommendation:** Proceed with frontend implementation. Backend can add logging in parallel or future story.

3. **Master data event linkage:**
   Should timeline show Instrument changes during batch preparation? If yes, how to determine which Instrument changes are relevant to this batch?

   **Recommendation:** Out of scope for Story 6. Focus on batch-specific events only.

4. **Toast notification component:**
   Is Shadcn toast already installed? If not, should we use toast or alternative notification method?

   **Action:** Check installation status. Install if missing.

5. **Excel filename format:**
   Story AC doesn't specify filename. Should it be `{batchName}_workflow_history.xlsx` or different format?

   **Recommendation:** Use `January_2026_workflow_history.xlsx` (formatted batch date + suffix).

6. **Automated actions source of truth:**
   Should automated actions be hardcoded in frontend or requested from backend?

   **Recommendation:** Hardcode in frontend mapping utility for Story 6. Backend can provide authoritative list in future API enhancement.

---

## 10. Discovered Patterns to Follow

### Pattern 1: Event Aggregation (Merge Multiple APIs)

When timeline events come from multiple sources (approvals + audit), use this pattern:

```typescript
const fetchTimelineEvents = async () => {
  const [approvals, audit] = await Promise.all([
    getBatchApprovals(batchId),
    getBatchAuditTrail(batchId, page, 20),
  ]);

  const approvalEvents = approvals.map(mapApprovalToEvent);
  const auditEvents = audit.items.map(mapAuditToEvent);

  const allEvents = [...approvalEvents, ...auditEvents];
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return allEvents.slice(0, 20); // First page only
};
```

**Apply to:** WorkflowHistoryTimeline component

---

### Pattern 2: Pagination with "Load More" Button

For infinite scroll pattern without actual scroll:

```typescript
const [events, setEvents] = useState<WorkflowEventData[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const nextPage = page + 1;
  const newData = await getBatchAuditTrail(batchId, nextPage, 20);

  setEvents(prev => [...prev, ...newData.items.map(mapAuditToEvent)]);
  setPage(nextPage);
  setHasMore(nextPage < newData.meta.totalPages);
};

// In JSX:
{hasMore && (
  <Button onClick={loadMore}>Load Earlier Events</Button>
)}
```

**Apply to:** WorkflowHistoryTimeline component

---

### Pattern 3: Real-Time Update Notification

Detect new events and show toast:

```typescript
const [lastEventId, setLastEventId] = useState<string | null>(null);

const checkForNewEvents = useCallback(async () => {
  const latestEvents = await fetchTimelineEvents();

  if (latestEvents[0]?.id !== lastEventId) {
    if (lastEventId !== null) {
      // Not first load - new event detected
      toast({
        title: 'Workflow updated',
        description: 'New event added',
      });
    }
    setLastEventId(latestEvents[0]?.id);
    setEvents(latestEvents);
  }
}, [lastEventId]);

usePolling(checkForNewEvents, 30000, !isLoading);
```

**Apply to:** WorkflowHistoryTimeline component

---

### Pattern 4: Conditional Styling for Event Types

Use Tailwind conditional classes for event-specific styling:

```typescript
<Card className={cn(
  'border-l-4',
  isRejection ? 'border-l-destructive bg-destructive/5' : 'border-l-green-500'
)}>
  {/* Event content */}
</Card>
```

**Apply to:** WorkflowEvent component

---

## Conclusion

**Ready for SPECIFY Phase:** ✅ Yes

Story 6 adds a comprehensive workflow history timeline to the existing WorkflowClient page. The main complexity is event aggregation from two API sources (approvals + audit trail).

**Critical Success Factors:**
1. Event aggregation logic correctly merges and sorts events from multiple sources
2. Pagination works smoothly with "Load Earlier Events" pattern
3. Real-time polling detects new events within 30 seconds
4. Excel export includes all required columns
5. Fallback strategies handle missing API fields gracefully

**Known Limitations (Acceptable for Story 6):**
- Approval comments not in API - only rejection reasons displayed
- Automated actions hardcoded in frontend - future backend enhancement
- System-generated events depend on backend logging - graceful degradation if missing
- Master data events not linked to batch - out of scope for Story 6

**Implementation Estimate:**
- **API client layer:** 2 hours
- **Event mapping utilities:** 3 hours
- **Excel export utility:** 2 hours
- **UI components (EventIcon, WorkflowEvent):** 4 hours
- **Timeline component with pagination and polling:** 6 hours
- **Integration and testing:** 3 hours
- **Total:** ~20 hours (Story Points: 8)

**Next Step:** Transition to SPECIFY phase to write comprehensive test specifications for all components, utilities, and integration scenarios.
