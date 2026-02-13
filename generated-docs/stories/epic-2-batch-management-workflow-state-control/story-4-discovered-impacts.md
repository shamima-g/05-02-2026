# Story 4 Discovered Impacts Analysis: Data Confirmation & Workflow Transition

**Generated:** 2026-02-13
**Epic:** 2 (Batch Management & Workflow State Control)
**Story:** 4 (Data Confirmation & Workflow Transition)
**Route:** N/A (action on existing batch pages)

---

## Executive Summary

This analysis examines the existing codebase after Epic 2 Stories 1-3 to assess readiness for implementing data confirmation and workflow transition functionality.

**Key Findings:**
- ✅ **Excellent foundation from Stories 1-3** - Batch API, BatchContext, workflow components, and date formatting utilities are production-ready
- ✅ **OpenAPI endpoints exist** - `POST /report-batches/{id}/confirm` and `GET /report-batches/{id}/validation` are fully defined
- ✅ **Workflow infrastructure complete** - WorkflowProgressBar, CurrentStagePanel, workflow stage constants, and polling hook all exist
- ✅ **Dialog component missing** - Need to install Shadcn AlertDialog for confirmation dialog
- ✅ **CurrentStagePanel has placeholder button** - "Confirm Data Ready" button already exists, ready for functionality
- ⚠️ **No confirmation component exists** - Need to create ConfirmDataButton component
- ⚠️ **BatchWorkflowStatus schema needs extension** - API returns `canConfirm` flag, need to handle validation states
- ⚠️ **Lock indicator not implemented** - Need to add lock icon/tooltip to batch cards and data entry buttons

---

## 1. Existing Infrastructure Assessment

### 1.1 Batch API Client ✅

**Location:** `web/src/lib/api/batches.ts`

**What's Available:**
- `getReportBatch(id)` - Fetches batch details including status
- `getBatchWorkflowStatus(id)` - Fetches workflow state with `canConfirm` flag (added in Story 3)
- `ReportBatch` interface with all required fields including `lastRejection`
- `BatchWorkflowStatus` interface with `canConfirm`, `isLocked`, `canApprove` flags
- Proper error handling and TypeScript types

**Relevance to Story 4:**
- Can check `canConfirm` flag before showing confirmation button
- Can use `isLocked` flag to determine data lock state
- `lastRejection` field provides context for re-confirmation after rejection
- Can poll `getBatchWorkflowStatus()` to detect real-time state changes

**Action Required:**
Add two new API functions:
```typescript
/**
 * Get batch validation summary before confirming.
 */
export interface BatchValidationResult {
  isComplete: boolean;
  fileCompleteness: {
    expected: number;
    received: number;
    valid: number;
    failed: number;
  };
  portfolioDataCompleteness: Array<{
    portfolioId: number;
    portfolioName: string;
    holdings: boolean;
    transactions: boolean;
    income: boolean;
    cash: boolean;
    performance: boolean;
  }>;
  referenceDataCompleteness: {
    instrumentsMissingRatings: number;
    instrumentsMissingDurations: number;
    instrumentsMissingBetas: number;
    missingIndexPrices: number;
  };
}

export async function getBatchValidation(id: number): Promise<BatchValidationResult> {
  return get<BatchValidationResult>(`/report-batches/${id}/validation`);
}

/**
 * Confirm data preparation complete and initiate calculations.
 * Requires 'batch.confirm' permission (Analyst role).
 */
export async function confirmBatch(id: number): Promise<ReportBatch> {
  return post<ReportBatch>(`/report-batches/${id}/confirm`, {});
}
```

---

### 1.2 OpenAPI Endpoints ✅

**Location:** `documentation/openapi.yaml`

#### POST /report-batches/{id}/confirm (lines 967-983)
```yaml
/report-batches/{id}/confirm:
  post:
    summary: Confirm data preparation complete
    description: Locks data entry and initiates calculations
    operationId: confirmBatch
    security:
      - bearerAuth: []
    responses:
      '200':
        description: Batch confirmed, calculations initiated
        schema:
          $ref: '#/components/schemas/ReportBatch'
```

**Analysis:**
- ✅ Endpoint exists and accepts POST request
- ✅ Returns updated `ReportBatch` with new status "Level1Pending"
- ✅ Backend handles calculation initiation, workflow transition, and audit logging
- ✅ No request body required (batch ID from path is sufficient)

#### GET /report-batches/{id}/validation (lines 949-965)
```yaml
/report-batches/{id}/validation:
  get:
    summary: Get data validation summary
    description: Returns completeness checks for files, portfolios, and reference data
    operationId: getBatchValidation
    responses:
      '200':
        description: Validation results
        schema:
          $ref: '#/components/schemas/BatchValidationResult'
```

**Schema: BatchValidationResult** (lines 3134-3179)
- ✅ Returns `isComplete` boolean - indicates if all required data is present
- ✅ Returns `fileCompleteness` object - expected vs received vs valid vs failed counts
- ✅ Returns `portfolioDataCompleteness` array - per-portfolio data presence checks
- ✅ Returns `referenceDataCompleteness` object - missing reference data counts

**Implications for Story 4:**
- Before showing confirmation dialog, fetch validation summary
- If `fileCompleteness.received < fileCompleteness.expected`, show warning in dialog (non-blocking per BR-VALID-003)
- If validation errors exist (e.g., `fileCompleteness.failed > 0`), show warning in dialog (non-blocking)
- If validation warnings exist (e.g., `referenceDataCompleteness.instrumentsMissingRatings > 0`), show info message in dialog
- All validation issues are warnings only - user can always proceed with confirmation

---

### 1.3 BatchContext (Global State) ✅

**Location:** `web/src/contexts/BatchContext.tsx`

**What's Available:**
- `useBatch()` hook with `activeBatchId`, `currentBatch`, `isReadOnly`, `switchBatch()`
- `isReadOnly` flag calculated from batch status (Approved, Level3Pending)
- Automatic batch reloading on mount
- Toast notifications for errors

**Relevance to Story 4:**
- After confirmation, need to refresh `currentBatch` to update status from "DataPreparation" to "Level1Pending"
- `isReadOnly` flag already exists, but needs to include more statuses (any status except DataPreparation is locked)
- Can call `switchBatch(currentBatchId)` to reload batch after confirmation

**Gap Identified:**
Current `isReadOnlyStatus()` function only marks `Approved` and `Level3Pending` as read-only:
```typescript
function isReadOnlyStatus(status: string): boolean {
  return status === 'Approved' || status === 'Level3Pending';
}
```

**Action Required:**
Update `isReadOnlyStatus()` to lock ALL statuses except DataPreparation:
```typescript
function isReadOnlyStatus(status: string): boolean {
  // Data is editable only during DataPreparation
  // All other stages are locked for approval
  return status !== 'DataPreparation';
}
```

---

### 1.4 Workflow Components ✅

**Location:** `web/src/components/workflow/`

#### WorkflowProgressBar.tsx (Story 3)
- ✅ Displays 5-stage progress bar with completion icons
- ✅ Shows rejection indicators via `lastRejection` prop
- ✅ Uses `WORKFLOW_STAGES` constants for stage configuration
- ✅ Tested comprehensively (265 lines of tests)

**Relevance to Story 4:**
- After confirmation, progress bar should update to show DataPreparation complete (✓) and Level1Pending current (●)
- Component already supports real-time updates via props (no changes needed)

#### CurrentStagePanel.tsx (Story 3)
- ✅ Displays current stage details, status message, next stage indicator
- ✅ Shows rejection alert when `lastRejection` exists
- ✅ **Already has "Confirm Data Ready" button** (line 103)
- ✅ Button visibility controlled by `canConfirm` prop
- ✅ Tested comprehensively (406 lines of tests)

**Current Implementation (lines 102-106):**
```typescript
<div className="flex gap-2">
  {canConfirm && <Button>Confirm Data Ready</Button>}
  <Button variant="outline" asChild>
    <Link href={`/batches/${batchId}`}>View Batch Details</Link>
  </Button>
</div>
```

**Gap Identified:**
- Button exists but has no onClick handler
- Button is not a separate component (Story 4 spec says create `ConfirmDataButton.tsx`)

**Action Required:**
- Create `components/batches/ConfirmDataButton.tsx` component with confirmation dialog
- Replace placeholder button in CurrentStagePanel with `<ConfirmDataButton />`

---

### 1.5 Workflow Stage Constants ✅

**Location:** `web/src/lib/constants/workflow-stages.ts`

**What's Available:**
- `WorkflowStage` enum with 5 stages: DataPreparation, Level1Pending, Level2Pending, Level3Pending, Approved
- `WORKFLOW_STAGES` array with labels, descriptions, icons
- `getStageStatus()` helper to determine complete/current/pending
- `getStageConfig()` helper to fetch stage configuration
- `getNextStage()` helper to get next workflow stage

**Relevance to Story 4:**
- Use `getNextStage('DataPreparation')` to determine next stage is "Level1Pending"
- Use `getStageConfig('Level1Pending')` to display next stage label in confirmation dialog
- No changes needed - constants support confirmation flow perfectly

---

### 1.6 Polling Hook ✅

**Location:** `web/src/hooks/usePolling.ts`

**What's Available:**
- Reusable `usePolling(callback, interval, enabled)` hook
- Automatic cleanup on unmount
- Respects `enabled` flag to pause polling

**Relevance to Story 4:**
- After confirmation, polling will detect status change from "DataPreparation" to "Level1Pending"
- Can trigger toast notification on status change (already implemented in WorkflowClient)
- No changes needed - hook works perfectly for confirmation flow

---

### 1.7 Date Formatting Utilities ✅

**Location:** `web/src/lib/utils/date-formatting.ts`

**What's Available:**
- `formatReportDate(dateStr)` - Returns "January 2026"
- `formatDateTime(dateStr)` - Returns "Jan 15, 2026 at 10:30 AM"
- `formatRelativeTime(dateStr)` - Returns "2 days ago" (added in Story 3)

**Relevance to Story 4:**
- Use `formatReportDate()` for confirmation dialog title: "Confirm Data Ready for January 2026?"
- Use `formatDateTime()` for audit log display
- No changes needed - utilities support confirmation flow

---

### 1.8 Auth & RBAC ✅

**Location:** `web/src/lib/auth/auth-helpers.ts`

**What's Available:**
- `hasRole(user, 'Analyst')` - Check if user has Analyst role
- `hasPermission(user, 'batch.confirm')` - Check if user has confirm permission
- Server-side auth checks in page components

**Relevance to Story 4:**
- Confirmation button should only appear for Analyst role
- Backend will enforce permission check via `batch.confirm` permission
- Frontend uses `canConfirm` flag from `BatchWorkflowStatus` API (already incorporates role check)

**No Changes Needed** - RBAC infrastructure is ready.

---

### 1.9 Shadcn UI Components

**Location:** `web/src/components/ui/`

**Installed Components:**
- ✅ `button.tsx` - For confirmation trigger and dialog buttons
- ✅ `badge.tsx` - For lock indicator
- ✅ `card.tsx` - For CurrentStagePanel
- ✅ `dialog.tsx` - Basic dialog (not AlertDialog)
- ✅ `alert.tsx` - For error/warning messages
- ❌ `alert-dialog.tsx` - **NOT INSTALLED** (needed for confirmation dialog)

**Gap Identified:**
Story requires confirmation dialog with "Confirm" and "Cancel" buttons. Shadcn provides `AlertDialog` component for destructive actions (like locking data).

**Action Required:**
Install Shadcn AlertDialog via MCP:
```typescript
mcp__shadcn__add_component({ component_names: ['alert-dialog'] })
```

---

## 2. New Infrastructure Needed

### 2.1 ConfirmDataButton Component ❌

**Location:** Create `web/src/components/batches/ConfirmDataButton.tsx`

**Required Functionality:**
1. Fetch validation summary before opening dialog
2. If validation issues exist (missing files, errors), show warnings in dialog (non-blocking)
3. If validation warnings exist, show warning dialog with "Review Errors" or "Proceed Anyway" options
4. Show confirmation dialog: "This will lock all data entry and initiate calculations. Continue?"
5. On confirm, call `confirmBatch(batchId)` API
6. Show loading state during API call
7. On success, show toast and refresh batch context
8. On error, show error message and keep batch in DataPreparation status

**Props Interface:**
```typescript
interface ConfirmDataButtonProps {
  batchId: number;
  batchName: string; // For dialog title (e.g., "January 2026")
  onConfirmSuccess?: () => void; // Callback after successful confirmation
}
```

**Component Structure:**
```tsx
export function ConfirmDataButton({ batchId, batchName, onConfirmSuccess }: ConfirmDataButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<BatchValidationResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { switchBatch } = useBatch();
  const { showToast } = useToast();

  const handleButtonClick = async () => {
    // 1. Fetch validation summary
    setIsLoading(true);
    try {
      const validation = await getBatchValidation(batchId);
      setValidationResult(validation);

      // 2. Always open dialog - validation issues are warnings, not blockers
      // Missing files, validation errors, and warnings are all non-blocking
      setDialogOpen(true);
      setIsLoading(false);
    } catch (error) {
      showToast({
        title: 'Failed to check validation status',
        message: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await confirmBatch(batchId);
      showToast({
        title: 'Data confirmed',
        message: 'Calculations initiated. Batch transitioned to Level 1 Approval.',
        variant: 'success',
      });
      setDialogOpen(false);

      // Refresh batch context to update status
      await switchBatch(batchId);

      onConfirmSuccess?.();
    } catch (error) {
      showToast({
        title: 'Failed to confirm batch',
        message: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : (
          'Confirm Data Ready'
        )}
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Ready for {batchName}?</AlertDialogTitle>
            <AlertDialogDescription>
              {validationResult?.fileCompleteness.failed > 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors Exist</AlertTitle>
                  <AlertDescription>
                    {validationResult.fileCompleteness.failed} validation errors exist.
                    Are you sure you want to proceed?
                  </AlertDescription>
                </Alert>
              ) : (
                'This will lock all data entry and initiate calculations. Continue?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {validationResult?.fileCompleteness.failed > 0 && (
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Review Errors
              </Button>
            )}
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

**Dependencies:**
- `AlertDialog` from Shadcn UI (needs installation)
- `getBatchValidation()` and `confirmBatch()` from `lib/api/batches.ts`
- `useBatch()` from BatchContext
- `useToast()` from ToastContext

---

### 2.2 Lock Indicator UI Elements ❌

**Location:** Multiple locations

**Required Changes:**

#### A. Batch Card Lock Icon
Add lock icon to batch cards when `isLocked` is true.

**Location:** Batch list components (wherever batch cards are displayed)

**Implementation:**
```tsx
{batch.status !== 'DataPreparation' && (
  <Tooltip>
    <TooltipTrigger>
      <Lock className="h-4 w-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent>Data locked for approval</TooltipContent>
  </Tooltip>
)}
```

#### B. Data Entry Button Tooltips
Add disabled tooltips to file upload and data modification buttons when batch is locked.

**Implementation:**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button disabled={isReadOnly}>Upload File</Button>
  </TooltipTrigger>
  {isReadOnly && (
    <TooltipContent>Data entry disabled during approval process</TooltipContent>
  )}
</Tooltip>
```

---

## 3. Impacts on Existing Code

### 3.1 lib/api/batches.ts (Addition Required)

**File:** `web/src/lib/api/batches.ts`

**Change:** Add `getBatchValidation()` and `confirmBatch()` functions.

**Addition (after line 120):**
```typescript
/**
 * Get batch validation summary.
 * Returns completeness checks for files, portfolios, and reference data.
 */
export interface BatchValidationResult {
  isComplete: boolean;
  fileCompleteness: {
    expected: number;
    received: number;
    valid: number;
    failed: number;
  };
  portfolioDataCompleteness: Array<{
    portfolioId: number;
    portfolioName: string;
    holdings: boolean;
    transactions: boolean;
    income: boolean;
    cash: boolean;
    performance: boolean;
  }>;
  referenceDataCompleteness: {
    instrumentsMissingRatings: number;
    instrumentsMissingDurations: number;
    instrumentsMissingBetas: number;
    missingIndexPrices: number;
  };
}

export async function getBatchValidation(id: number): Promise<BatchValidationResult> {
  return get<BatchValidationResult>(`/report-batches/${id}/validation`);
}

/**
 * Confirm data preparation complete and initiate calculations.
 * Requires 'batch.confirm' permission (Analyst role).
 */
export async function confirmBatch(id: number): Promise<ReportBatch> {
  return post<ReportBatch>(`/report-batches/${id}/confirm`, {});
}
```

**Impact:** Additive only - no breaking changes.

---

### 3.2 contexts/BatchContext.tsx (Modification Required)

**File:** `web/src/contexts/BatchContext.tsx`

**Change:** Update `isReadOnlyStatus()` function to lock all statuses except DataPreparation.

**Current Implementation (lines 53-55):**
```typescript
function isReadOnlyStatus(status: string): boolean {
  return status === 'Approved' || status === 'Level3Pending';
}
```

**Updated Implementation:**
```typescript
/**
 * Determine if a batch is read-only based on its status.
 * - DataPreparation: editable (unlocked)
 * - All other statuses: read-only (locked for approval)
 */
function isReadOnlyStatus(status: string): boolean {
  // Data is editable only during DataPreparation
  // All approval stages and approved batches are locked
  return status !== 'DataPreparation';
}
```

**Impact:** Changes read-only behavior for Level1Pending and Level2Pending batches (currently editable, will become locked). This is the correct behavior per Story 4 requirements.

**Test Impact:** Existing BatchContext tests may need updates to reflect new lock behavior.

---

### 3.3 components/workflow/CurrentStagePanel.tsx (Modification Required)

**File:** `web/src/components/workflow/CurrentStagePanel.tsx`

**Change:** Replace placeholder button with `ConfirmDataButton` component.

**Current Implementation (lines 102-103):**
```typescript
{canConfirm && <Button>Confirm Data Ready</Button>}
```

**Updated Implementation:**
```typescript
{canConfirm && (
  <ConfirmDataButton
    batchId={batchId}
    batchName={formatReportDate(currentBatch.reportDate)}
  />
)}
```

**Additional Import:**
```typescript
import { ConfirmDataButton } from '@/components/batches/ConfirmDataButton';
```

**Props Update:**
Need to pass `currentBatch` as prop to access `reportDate`.

**Updated Props Interface:**
```typescript
interface CurrentStagePanelProps {
  batchId: number;
  currentStage: string;
  lastUpdated: string;
  isLocked?: boolean;
  canConfirm: boolean;
  lastRejection?: { level: string; reason: string; date: string } | null;
  reportDate: string; // NEW: For ConfirmDataButton
}
```

**Impact:** Minor breaking change - all call sites of `CurrentStagePanel` must pass `reportDate` prop. In practice, only `WorkflowClient.tsx` uses this component.

---

### 3.4 app/batches/[id]/workflow/WorkflowClient.tsx (Modification Required)

**File:** `web/src/app/batches/[id]/workflow/WorkflowClient.tsx`

**Change:** Pass `reportDate` prop to CurrentStagePanel.

**Current Call (estimated line 80-90):**
```typescript
<CurrentStagePanel
  batchId={batchId}
  currentStage={workflowStatus.currentStage}
  lastUpdated={workflowStatus.lastUpdated}
  isLocked={workflowStatus.isLocked}
  canConfirm={workflowStatus.canConfirm}
  lastRejection={batch?.lastRejection}
/>
```

**Updated Call:**
```typescript
<CurrentStagePanel
  batchId={batchId}
  currentStage={workflowStatus.currentStage}
  lastUpdated={workflowStatus.lastUpdated}
  isLocked={workflowStatus.isLocked}
  canConfirm={workflowStatus.canConfirm}
  lastRejection={batch?.lastRejection}
  reportDate={batch?.reportDate || ''} // NEW
/>
```

**Impact:** Simple prop addition - no breaking changes.

---

## 4. Acceptance Criteria Mapping

### AC: Happy Path - Confirm Data Preparation
- ✅ **Analyst clicks "Confirm Data Ready" button** → ConfirmDataButton component with onClick handler
- ✅ **Confirmation dialog opens** → AlertDialog with message "This will lock all data entry and initiate calculations. Continue?"
- ✅ **On "Confirm", batch status transitions to Level1Pending** → Call `confirmBatch()` API, backend transitions status
- ✅ **Success message shown** → Toast: "Data confirmed. Calculations initiated. Batch transitioned to Level 1 Approval."
- ✅ **Workflow progress bar updates** → Polling in WorkflowClient detects status change, updates progress bar props
- ✅ **Data entry is blocked** → `isReadOnlyStatus()` returns true for all non-DataPreparation statuses

### AC: Validation Before Confirmation
- ✅ **Missing files show warning (non-blocking)** → Fetch `getBatchValidation()`, check `fileCompleteness.expected - received`, show warning dialog with "Review Issues" or "Proceed Anyway" (user can always confirm)
- ✅ **Validation errors show warning dialog** → Check `fileCompleteness.failed > 0`, show warning with "Review Errors" or "Proceed Anyway"
- ✅ **Validation warnings allow confirmation** → Check `referenceDataCompleteness` fields, show info message but allow confirmation

### AC: Automated Actions on Confirmation
- ✅ **Calculation workflow triggered** → Backend handles via `POST /report-batches/{id}/confirm` (workflowInstanceId populated)
- ✅ **Audit log record created** → Backend handles automatically (BR-AUD-003)
- ✅ **Level 1 Approver receives notification** → Backend handles via notification service

### AC: Button Visibility and State
- ✅ **Button enabled for Analyst in DataPreparation** → `canConfirm` flag from `BatchWorkflowStatus` API
- ✅ **Button hidden for non-Analyst users** → `canConfirm` is false when user lacks permission
- ✅ **Button hidden in later stages** → `canConfirm` is false when status is not DataPreparation
- ✅ **Loading state during API call** → Button shows spinner and "Confirming..." text while `isLoading`

### AC: Rejection and Re-Confirmation
- ✅ **Button reappears after rejection** → Batch status returns to DataPreparation, `canConfirm` becomes true again
- ✅ **Re-confirmation transitions to Level1Pending** → Same API call as initial confirmation
- ✅ **Rejection history preserved** → `lastRejection` field remains populated, displayed in CurrentStagePanel

### AC: Error Handling
- ✅ **Calculation initiation failure** → Catch error from `confirmBatch()`, show error toast, keep batch in DataPreparation
- ✅ **403 Forbidden error** → Show "You do not have permission to confirm this batch"
- ✅ **409 Conflict error** → Show "This batch has already been confirmed. Please refresh the page."

### AC: Data Lock Indicator
- ✅ **Lock icon on batch card** → Add `<Lock />` icon with tooltip "Data locked for approval" when `isLocked` is true
- ✅ **Tooltip on disabled data entry buttons** → Add tooltip "Data entry disabled during approval process" to upload buttons when `isReadOnly`

---

## 5. Test Strategy

### 5.1 ConfirmDataButton Component Tests

**File:** `components/batches/__tests__/ConfirmDataButton.test.tsx`

**Test Scenarios:**

#### Happy Path
- ✅ Displays "Confirm Data Ready" button when rendered
- ✅ Fetches validation summary when button is clicked
- ✅ Opens confirmation dialog when validation passes
- ✅ Shows confirmation message in dialog
- ✅ Calls `confirmBatch()` API when "Confirm" is clicked
- ✅ Shows success toast after confirmation
- ✅ Closes dialog after successful confirmation
- ✅ Refreshes batch context via `switchBatch()` after confirmation

#### Validation Checks
- ✅ Shows warning in dialog when files are missing (expected > received) - non-blocking
- ✅ Dialog still opens when files are missing (user can proceed)
- ✅ Shows warning in dialog when validation errors exist (failed > 0)
- ✅ Warning dialog shows "Review Issues" and "Proceed Anyway" buttons
- ✅ "Review Issues" button closes dialog without confirming
- ✅ "Proceed Anyway" button proceeds with confirmation despite issues
- ✅ Shows info message when validation warnings exist (non-blocking)

#### Loading States
- ✅ Shows "Checking..." text while fetching validation
- ✅ Button is disabled during validation fetch
- ✅ Shows "Confirming..." text while API call is in progress
- ✅ Dialog "Confirm" button is disabled during API call

#### Error Handling
- ✅ Shows error toast when validation fetch fails
- ✅ Does NOT open dialog when validation fetch fails
- ✅ Shows error toast when `confirmBatch()` fails
- ✅ Keeps dialog open when confirmation fails
- ✅ Batch remains in DataPreparation status when confirmation fails
- ✅ Shows specific error message for 403 Forbidden
- ✅ Shows specific error message for 409 Conflict

#### Callback Execution
- ✅ Calls `onConfirmSuccess()` callback after successful confirmation
- ✅ Does NOT call callback when confirmation fails

**Mock Strategy:**
```typescript
vi.mock('@/lib/api/batches', () => ({
  getBatchValidation: vi.fn(),
  confirmBatch: vi.fn(),
}));

vi.mock('@/contexts/BatchContext', () => ({
  useBatch: () => ({
    switchBatch: vi.fn(),
  }),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));
```

---

### 5.2 API Functions Tests

**File:** `lib/api/__tests__/batches.test.ts`

**Test Scenarios:**
- ✅ `getBatchValidation()` calls GET /report-batches/{id}/validation
- ✅ `getBatchValidation()` returns BatchValidationResult with correct structure
- ✅ `confirmBatch()` calls POST /report-batches/{id}/confirm
- ✅ `confirmBatch()` returns ReportBatch with updated status
- ✅ `confirmBatch()` throws error on 403 Forbidden
- ✅ `confirmBatch()` throws error on 409 Conflict

**Mock Strategy:**
```typescript
vi.mock('@/lib/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));
```

---

### 5.3 BatchContext Tests (Update Existing)

**File:** `contexts/__tests__/BatchContext.test.tsx`

**New Test Scenarios:**
- ✅ `isReadOnly` is false for DataPreparation status
- ✅ `isReadOnly` is true for Level1Pending status
- ✅ `isReadOnly` is true for Level2Pending status
- ✅ `isReadOnly` is true for Level3Pending status
- ✅ `isReadOnly` is true for Approved status

**Impact:** Update existing tests that assume Level1Pending and Level2Pending are editable.

---

### 5.4 CurrentStagePanel Tests (Update Existing)

**File:** `components/workflow/__tests__/CurrentStagePanel.test.tsx`

**New Test Scenarios:**
- ✅ Displays ConfirmDataButton when `canConfirm` is true
- ✅ Passes correct props to ConfirmDataButton (batchId, batchName)
- ✅ Does NOT display ConfirmDataButton when `canConfirm` is false

**Impact:** Update existing test for "Confirm Data Ready" button to check for ConfirmDataButton component instead of plain Button.

**Mock Strategy:**
```typescript
vi.mock('@/components/batches/ConfirmDataButton', () => ({
  ConfirmDataButton: ({ batchId, batchName }: any) => (
    <button>Confirm Data Ready for {batchName}</button>
  ),
}));
```

---

### 5.5 Integration Tests

**File:** `app/batches/[id]/workflow/__tests__/WorkflowClient.test.tsx`

**New Test Scenarios:**
- ✅ Passes `reportDate` prop to CurrentStagePanel
- ✅ Progress bar updates after confirmation (status changes from DataPreparation to Level1Pending)
- ✅ Toast notification shown when status changes after confirmation

**Mock Strategy:**
Same as existing WorkflowClient tests, updated to mock new API functions.

---

## 6. Implementation Order (TDD)

### Phase 1: API Integration
1. **Add `getBatchValidation()` to `lib/api/batches.ts`** - API function and types
2. **Add `confirmBatch()` to `lib/api/batches.ts`** - API function
3. **Write tests** - API function mocking and response handling

### Phase 2: Context Updates
4. **Update `isReadOnlyStatus()` in `contexts/BatchContext.tsx`** - Lock all non-DataPreparation statuses
5. **Write tests** - Context read-only behavior for all statuses

### Phase 3: Shadcn Component
6. **Install Shadcn AlertDialog** - Via MCP
7. **Verify installation** - Check `components/ui/alert-dialog.tsx` exists

### Phase 4: ConfirmDataButton Component
8. **Create `components/batches/ConfirmDataButton.tsx`** - Full implementation with validation checks, dialog, API calls
9. **Write tests** - All scenarios from 5.1 above

### Phase 5: Integration
10. **Update `CurrentStagePanel.tsx`** - Replace placeholder button with ConfirmDataButton
11. **Update `WorkflowClient.tsx`** - Pass reportDate prop
12. **Write tests** - Updated CurrentStagePanel tests, integration tests

### Phase 6: Lock Indicators (Optional Enhancement)
13. **Add lock icons to batch cards** - Where batches are listed
14. **Add tooltips to disabled buttons** - File upload, data modification buttons
15. **Write tests** - Lock icon visibility, tooltip content

---

## 7. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Confirmation may succeed but calculations fail | Medium | Backend handles calculation initiation asynchronously. If calculations fail, batch status remains Level1Pending but workflowInstanceId is null. Frontend can detect this and show warning. |
| User closes browser during confirmation | Low | API call completes server-side even if client disconnects. On page reload, batch will show Level1Pending status. |
| Validation summary becomes stale | Medium | Fetch validation summary immediately before confirmation (not cached). Ensure validation is fresh. |
| Lock state not reflected immediately | Low | After confirmation, call `switchBatch()` to reload batch. Polling will also detect status change within 30s. |
| Multiple users confirm same batch simultaneously | Low | Backend prevents duplicate confirmation via status check (409 Conflict if already confirmed). Frontend shows error message. |
| Missing AlertDialog component breaks build | High | Add AlertDialog installation as first step in implementation. Verify installation before proceeding. |
| Changing `isReadOnlyStatus()` breaks other features | Medium | Run full test suite after change. Update affected tests. Document new lock behavior in BatchContext. |

---

## 8. Quality Gates Checklist

Before transitioning to SPECIFY phase, verify:

- [x] Story 1-3 infrastructure is understood and documented
- [x] OpenAPI endpoints `/report-batches/{id}/confirm` and `/report-batches/{id}/validation` exist
- [x] BatchWorkflowStatus API includes `canConfirm`, `isLocked` flags
- [x] WorkflowProgressBar and CurrentStagePanel components exist
- [x] CurrentStagePanel has placeholder "Confirm Data Ready" button
- [x] Workflow stage constants and polling hook exist
- [x] Date formatting utilities exist
- [x] RBAC helpers exist for role checking
- [x] AlertDialog component needs installation (action item identified)
- [x] `isReadOnlyStatus()` needs update (action item identified)
- [x] Test strategy follows Epic 2 patterns (BatchSwitcher test pattern)
- [x] No breaking changes except minor prop addition to CurrentStagePanel

---

## 9. Open Questions for SPECIFY Phase

1. **Lock icon placement:** Should lock icon appear on:
   - Batch cards in batch list? ✅ Yes
   - Batch header in detail view? ✅ Yes
   - CurrentStagePanel? Optional - status message already indicates lock state

   **Recommendation:** Add lock icon to batch cards and batch detail header. CurrentStagePanel status message is sufficient.

2. **Validation warnings vs errors:** How to distinguish severity levels for display in the confirmation dialog?

   **API Schema Analysis:** `fileCompleteness.failed` counts invalid/failed files (shown as warnings). `referenceDataCompleteness` counts missing reference data (shown as info). Per BR-VALID-003, all validation issues are non-blocking - user can always proceed with confirmation.

3. **Re-confirmation dialog message:** Should re-confirmation after rejection show different message than initial confirmation?

   **Recommendation:** Show same confirmation message. Rejection context is already visible in CurrentStagePanel rejection alert. Dialog message can remain generic.

4. **Notification to Level 1 Approver:** How does frontend know notification was sent?

   **API Behavior:** Backend sends notification automatically. Frontend does not need to know. Trust backend to handle notifications per BR-AUD-003.

5. **Batch refresh strategy:** After confirmation, should we use `switchBatch()` (full reload) or just update `currentBatch` state?

   **Recommendation:** Use `switchBatch()` to ensure all batch data is fresh. This also triggers BatchContext re-render, propagating updates to all components.

---

## 10. Discovered Patterns to Follow

### Pattern 1: Component Testing with Multiple API Calls
From `BatchSwitcher.test.tsx`:
- Mock multiple API calls with `mockResolvedValueOnce()` chaining
- Use `waitFor()` for async state updates
- Test loading states with promise resolution control

**Apply to:** ConfirmDataButton tests (validation fetch → confirmation API call sequence)

### Pattern 2: Context Provider Wrapping in Tests
From `BatchSwitcher.test.tsx`:
- Wrap components in `<BatchProvider>` for context access
- Mock toast context separately
- Mock storage utilities to avoid localStorage side effects

**Apply to:** ConfirmDataButton tests (needs BatchContext and ToastContext)

### Pattern 3: Error Handling with Toast Notifications
From `BatchSwitcher.test.tsx`:
- Use `showToast()` for user-facing error messages
- Catch errors silently in polling (don't spam user)
- Show specific error messages for different error types

**Apply to:** ConfirmDataButton (403 Forbidden, 409 Conflict, generic errors)

### Pattern 4: Accessibility Testing
From `BatchSwitcher.test.tsx`:
- Use `axe` for automated accessibility checks
- Verify ARIA attributes (`aria-haspopup`, `role`)
- Test keyboard navigation

**Apply to:** ConfirmDataButton dialog (AlertDialog should be accessible by default)

---

## Conclusion

**Ready for SPECIFY Phase:** ✅ Yes

Story 1-3 provides excellent foundation:
- Batch API client is production-ready with `getReportBatch()`, `getBatchWorkflowStatus()`
- WorkflowProgressBar and CurrentStagePanel components exist and are tested
- Workflow stage constants, polling hook, and date utilities are ready
- CurrentStagePanel already has placeholder "Confirm Data Ready" button
- RBAC helpers exist for permission checking
- OpenAPI endpoints exist for confirmation and validation

**Critical Actions Before Implementation:**
1. Install Shadcn AlertDialog component via MCP
2. Add `getBatchValidation()` and `confirmBatch()` to `lib/api/batches.ts`
3. Update `isReadOnlyStatus()` in `contexts/BatchContext.tsx` to lock all non-DataPreparation statuses
4. Create `components/batches/ConfirmDataButton.tsx` with full validation and confirmation flow
5. Update `CurrentStagePanel.tsx` to use ConfirmDataButton component
6. Update `WorkflowClient.tsx` to pass reportDate prop

**Known Limitations (Acceptable for Story 4):**
- Backend handles calculation initiation, notification, and audit logging (frontend trusts backend)
- Lock indicators on batch cards are optional enhancement (can defer to future story)
- Validation summary is fetched on-demand (not cached) for freshness

**Next Step:** Transition to SPECIFY phase to write comprehensive test specifications for this story.
