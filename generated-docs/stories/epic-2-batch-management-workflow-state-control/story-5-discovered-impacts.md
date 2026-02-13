# Story 5 Discovered Impacts Analysis: State-Based Access Control

**Generated:** 2026-02-13
**Epic:** 2 (Batch Management & Workflow State Control)
**Story:** 5 (State-Based Access Control)
**Route:** N/A (global permission system)

---

## Executive Summary

This analysis examines the existing codebase after Epic 2 Stories 1-4 to assess readiness for implementing state-based access control that automatically locks data entry during approval stages.

**Key Findings:**
- ✅ **Excellent foundation from Story 4** - `isReadOnly` flag in BatchContext already updated to lock all non-DataPreparation statuses
- ✅ **Lock state already present** - `BatchWorkflowStatus` API includes `isLocked` boolean field
- ✅ **BatchContext already handles lock logic** - `isReadOnlyStatus()` function correctly returns true for all approval stages
- ✅ **Shadcn Tooltip component exists** - Ready for disabled button tooltips
- ✅ **AlertDialog component exists** - Installed for Story 4
- ✅ **BatchSwitcher shows read-only indicator** - Already displays "read-only" badge when `isReadOnly` is true
- ⚠️ **No permission utility module** - Need to create `lib/permissions/batch-access-control.ts`
- ⚠️ **No custom hook for lock state** - Need to create `useBatchLock()` hook
- ⚠️ **Batch cards missing lock icons** - BatchesClient.tsx needs visual lock indicators
- ⚠️ **No data entry pages exist yet** - File upload, master data, validation pages are future stories
- ⚠️ **No lock events in audit trail** - Backend responsibility, frontend will display them

**Critical Discovery:** Story 4 already implemented the core lock logic in `BatchContext.isReadOnlyStatus()` - it returns `true` for all non-DataPreparation statuses. Story 5's primary work is:
1. Creating reusable utilities/hooks
2. Adding visual indicators (lock icons, tooltips)
3. Preparing infrastructure for future data entry pages

---

## 1. Existing Infrastructure Assessment

### 1.1 BatchContext Lock Logic ✅ (ALREADY COMPLETE)

**Location:** `web/src/contexts/BatchContext.tsx`

**What Exists (lines 52-54):**
```typescript
function isReadOnlyStatus(status: string): boolean {
  return status !== 'DataPreparation';
}
```

**Analysis:**
- ✅ **Lock logic is correct** - All approval stages (Level1Pending, Level2Pending, Level3Pending) are locked
- ✅ **Approved batches are locked** - Permanent read-only
- ✅ **Only DataPreparation is editable** - Correct behavior
- ✅ **Context exposes `isReadOnly` flag** - Available to all components via `useBatch()` hook

**Relevance to Story 5:**
- Core lock enforcement is DONE - no changes needed
- Story 5 will create utilities that wrap this existing logic
- Story 5 will add visual indicators for this existing state

---

### 1.2 Batch API with Lock State ✅

**Location:** `web/src/lib/api/batches.ts`

**What Exists:**
```typescript
export interface BatchWorkflowStatus {
  batchId: number;
  currentStage: string;
  isLocked: boolean;  // Lock state from backend
  canConfirm: boolean;
  canApprove: boolean;
  pendingApprovalLevel: number | null;
  lastUpdated: string;
}

export async function getBatchWorkflowStatus(id: number): Promise<BatchWorkflowStatus> {
  return get<BatchWorkflowStatus>(`/report-batches/${id}/status`);
}
```

**Analysis:**
- ✅ `isLocked` field exists in API response
- ✅ Backend determines lock state based on workflow stage
- ✅ Can be used as authoritative source for lock state
- ✅ Used in WorkflowClient polling to detect real-time lock changes

**Relevance to Story 5:**
- `useBatchLock()` hook can fetch this endpoint
- Lock state can be checked independently of batch context
- Fail-safe validation: compare `isLocked` from API with frontend calculation

---

### 1.3 BatchSwitcher Lock Indicator ✅

**Location:** `web/src/components/batch/BatchSwitcher.tsx`

**What Exists (lines 127-131):**
```typescript
{isReadOnly && (
  <Badge variant="destructive" className="text-xs">
    read-only
  </Badge>
)}
```

**Analysis:**
- ✅ **Already shows lock state** - Displays "read-only" badge when batch is locked
- ✅ **Uses BatchContext** - Gets `isReadOnly` from `useBatch()` hook
- ✅ **Visible in header** - Users see lock state globally
- ✅ **Correct variant** - Red badge for critical state

**Gap Identified:**
- Lock icon (🔒) would be more intuitive than text badge
- Could show lock icon + tooltip "Data locked for approval"

**Action for Story 5:**
- Replace or supplement "read-only" badge with lock icon

---

### 1.4 Shadcn UI Components ✅

**Location:** `web/src/components/ui/`

**Installed Components:**
- ✅ `tooltip.tsx` - For disabled button tooltips
- ✅ `alert-dialog.tsx` - Installed in Story 4
- ✅ `badge.tsx` - For lock indicators
- ✅ `button.tsx` - Already supports `disabled` prop

**Analysis:**
All required UI primitives exist. No new component installations needed.

---

### 1.5 Workflow Stage Constants ✅

**Location:** `web/src/lib/constants/workflow-stages.ts`

**What Exists:**
```typescript
export enum WorkflowStage {
  DataPreparation = 'DataPreparation',
  Level1Pending = 'Level1Pending',
  Level2Pending = 'Level2Pending',
  Level3Pending = 'Level3Pending',
  Approved = 'Approved',
}
```

**Analysis:**
- ✅ Enum defines all workflow stages
- ✅ Can be used in permission utilities to determine lock state
- ✅ Type-safe status checking

**Relevance to Story 5:**
- `isBatchLocked(status)` utility can use this enum
- Type safety for lock state calculations

---

### 1.6 Auth & RBAC Helpers ✅

**Location:** `web/src/lib/auth/auth-helpers.ts`

**What Exists:**
```typescript
export function hasRole(user: AuthUser | null | undefined, role: string): boolean
export function hasPermission(user: AuthUser | null | undefined, permission: string): boolean
```

**Analysis:**
- ✅ Permission checking infrastructure exists
- ✅ Used throughout the app for role-based access

**Relevance to Story 5:**
- **Lock is absolute** - Story 5 spec says "no role-based override"
- Lock state does NOT depend on user role
- Even Admins cannot modify locked batches
- Auth helpers NOT needed for lock checking (lock trumps all permissions)

---

## 2. New Infrastructure Needed

### 2.1 Batch Access Control Utility ❌

**Location:** Create `web/src/lib/permissions/batch-access-control.ts`

**Required Functionality:**

```typescript
/**
 * Batch Access Control Utilities
 *
 * Centralized lock state checking for batch data entry.
 * Lock is absolute - no role-based overrides.
 */

import { WorkflowStage } from '@/lib/constants/workflow-stages';

/**
 * Determine if a batch is locked based on its workflow status.
 *
 * Lock Rules:
 * - DataPreparation: Unlocked (editable)
 * - Level1Pending, Level2Pending, Level3Pending: Locked (approval in progress)
 * - Approved: Locked (permanent read-only)
 *
 * @param status - Batch workflow status
 * @returns true if batch is locked, false if editable
 */
export function isBatchLocked(status: string): boolean {
  return status !== WorkflowStage.DataPreparation;
}

/**
 * Determine if a user can modify data in a batch.
 *
 * Lock enforcement is absolute - no role-based override.
 * Even system administrators cannot modify locked batches.
 *
 * @param batchStatus - Batch workflow status
 * @returns true if data can be modified, false if locked
 */
export function canModifyBatchData(batchStatus: string): boolean {
  return !isBatchLocked(batchStatus);
}

/**
 * Get user-friendly message explaining why batch is locked.
 *
 * @param status - Batch workflow status
 * @returns Message explaining lock reason
 */
export function getLockMessage(status: string): string {
  if (status === WorkflowStage.DataPreparation) {
    return 'Batch is editable';
  }

  if (status === WorkflowStage.Approved) {
    return 'Batch is locked - already approved and published';
  }

  if (status.includes('Pending')) {
    return 'Data locked during approval process';
  }

  return 'Batch is locked';
}

/**
 * Determine lock state category.
 */
export enum BatchLockState {
  Unlocked = 'Unlocked',  // DataPreparation
  Locked = 'Locked',      // Any approval stage
  Archived = 'Archived'   // Approved (permanent read-only)
}

/**
 * Get lock state category from batch status.
 */
export function getBatchLockState(status: string): BatchLockState {
  if (status === WorkflowStage.DataPreparation) {
    return BatchLockState.Unlocked;
  }

  if (status === WorkflowStage.Approved) {
    return BatchLockState.Archived;
  }

  return BatchLockState.Locked;
}
```

**Rationale:**
- Centralized lock logic prevents duplication
- Story 5 spec requires these utility functions
- Future data entry pages will import from this module

---

### 2.2 useBatchLock Custom Hook ❌

**Location:** Create `web/src/hooks/useBatchLock.ts`

**Required Functionality:**

```typescript
/**
 * useBatchLock - React hook for batch lock state
 *
 * Provides lock state, loading state, and error handling.
 * Fetches from API for fail-safe verification.
 */

import { useState, useEffect } from 'react';
import { getBatchWorkflowStatus } from '@/lib/api/batches';
import { isBatchLocked, getLockMessage, getBatchLockState, BatchLockState } from '@/lib/permissions/batch-access-control';

export interface BatchLockInfo {
  isLocked: boolean;
  lockState: BatchLockState;
  lockMessage: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get batch lock state.
 *
 * Fetches workflow status from API and determines lock state.
 * Defaults to locked if API fails (fail-safe).
 *
 * @param batchId - Batch ID to check
 * @returns Lock state information
 */
export function useBatchLock(batchId: number | null): BatchLockInfo {
  const [isLocked, setIsLocked] = useState(true); // Fail-safe: default to locked
  const [lockState, setLockState] = useState<BatchLockState>(BatchLockState.Locked);
  const [lockMessage, setLockMessage] = useState('Batch is locked');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (batchId === null) {
      setIsLocked(true);
      setLockState(BatchLockState.Locked);
      setLockMessage('No active batch');
      setIsLoading(false);
      return;
    }

    const fetchLockState = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const workflowStatus = await getBatchWorkflowStatus(batchId);
        const locked = isBatchLocked(workflowStatus.currentStage);
        const state = getBatchLockState(workflowStatus.currentStage);
        const message = getLockMessage(workflowStatus.currentStage);

        setIsLocked(locked);
        setLockState(state);
        setLockMessage(message);
      } catch (err) {
        // Fail-safe: default to locked on error
        setIsLocked(true);
        setLockState(BatchLockState.Locked);
        setLockMessage('Unable to verify batch lock status. Data entry blocked as precaution.');
        setError(err instanceof Error ? err.message : 'Failed to check lock status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLockState();
  }, [batchId]);

  return {
    isLocked,
    lockState,
    lockMessage,
    isLoading,
    error,
  };
}
```

**Alternative: Use BatchContext Instead**

Story 5 spec says to create `useBatchLock()` hook, but `useBatch()` already provides `isReadOnly`. Consider:

**Option A:** Create new `useBatchLock()` hook (as spec'd)
- Fetches from API independently
- Fail-safe validation
- Can be used without BatchContext

**Option B:** Extend existing `useBatch()` hook
- Add `lockState`, `lockMessage` to context
- Use existing `isReadOnly` flag
- Simpler, less duplication

**Recommendation:** Create `useBatchLock()` as spec'd for:
1. Independent lock checking (e.g., in pages without BatchContext)
2. Fail-safe API validation
3. Explicit lock-focused API

---

### 2.3 Lock Icons on Batch Cards ❌

**Location:** `web/src/app/batches/BatchesClient.tsx`

**Current Implementation (lines 93-159):**
```typescript
function BatchCard({ batch }: BatchCardProps) {
  // ... existing code ...
  return (
    <article>
      <Link href={`/batches/${batch.id}/workflow`} className="block">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <h2>{formatReportDate(batch.reportDate)}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Created by {batch.createdBy}
                </p>
              </div>
              <Badge className={getStatusBadgeColor(batch.status)}>
                {statusText}
              </Badge>
            </div>
          </CardHeader>
          {/* ... rest of card ... */}
        </Card>
      </Link>
    </article>
  );
}
```

**Required Changes:**

```typescript
import { Lock, Unlock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isBatchLocked, getLockMessage } from '@/lib/permissions/batch-access-control';

function BatchCard({ batch }: BatchCardProps) {
  const isLocked = isBatchLocked(batch.status);
  const lockMessage = getLockMessage(batch.status);

  return (
    <article>
      <Link href={`/batches/${batch.id}/workflow`} className="block">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <h2>{formatReportDate(batch.reportDate)}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created by {batch.createdBy}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" aria-label="Locked" />
                        ) : (
                          <Unlock className="h-4 w-4 text-green-600" aria-label="Unlocked" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{lockMessage}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge className={getStatusBadgeColor(batch.status)}>
                {statusText}
              </Badge>
            </div>
          </CardHeader>
          {/* ... rest of card ... */}
        </Card>
      </Link>
    </article>
  );
}
```

**Impact:**
- Visual indicator on each batch card
- Tooltip explains why locked/unlocked
- Uses existing `isBatchLocked()` utility
- Accessible (aria-label on icons)

---

### 2.4 Lock Icon in BatchSwitcher ❌

**Location:** `web/src/components/batch/BatchSwitcher.tsx`

**Current Implementation (lines 127-131):**
```typescript
{isReadOnly && (
  <Badge variant="destructive" className="text-xs">
    read-only
  </Badge>
)}
```

**Proposed Enhancement:**

```typescript
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ... in render:
{isReadOnly && (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Lock className="h-4 w-4 text-destructive" aria-label="Locked" />
      </TooltipTrigger>
      <TooltipContent>Data locked for approval</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)}
```

**Alternative:** Keep badge, add lock icon

```typescript
{isReadOnly && (
  <Badge variant="destructive" className="text-xs flex items-center gap-1">
    <Lock className="h-3 w-3" />
    Locked
  </Badge>
)}
```

**Recommendation:** Use icon + tooltip for header (cleaner), keep badge as fallback for extra emphasis.

---

## 3. Impacts on Existing Code

### 3.1 BatchContext - NO CHANGES NEEDED ✅

**File:** `web/src/contexts/BatchContext.tsx`

**Status:** Lock logic already correct (updated in Story 4)

**Analysis:**
Story 4 updated `isReadOnlyStatus()` to return `true` for all non-DataPreparation statuses. This is exactly what Story 5 requires.

**No Changes Needed.**

---

### 3.2 BatchesClient - Add Lock Icons (Enhancement)

**File:** `web/src/app/batches/BatchesClient.tsx`

**Change:** Add lock/unlock icons to batch cards (see Section 2.3 above)

**Impact:** Visual enhancement only - no breaking changes

---

### 3.3 BatchSwitcher - Add Lock Icon (Enhancement)

**File:** `web/src/components/batch/BatchSwitcher.tsx`

**Change:** Replace or supplement "read-only" badge with lock icon (see Section 2.4 above)

**Impact:** Visual enhancement only - no breaking changes

---

### 3.4 Future Data Entry Pages (Not Yet Built)

**Locations (future stories):**
- File upload pages
- Instrument master data pages
- Validation pages
- Custom holdings pages

**Required Pattern:**
All future data entry components should follow this pattern:

```typescript
import { useBatch } from '@/contexts/BatchContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function DataEntryPage() {
  const { isReadOnly } = useBatch();

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span> {/* Wrapper for tooltip on disabled button */}
              <Button disabled={isReadOnly}>
                Upload File
              </Button>
            </span>
          </TooltipTrigger>
          {isReadOnly && (
            <TooltipContent>Data locked during approval process</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
```

**Note:** Tooltip requires wrapper `<span>` for disabled buttons (Radix UI limitation).

---

## 4. Acceptance Criteria Mapping

### AC: Happy Path - Data Lock on Approval Entry

- ✅ **Lock automatically applied when batch enters Level1Pending** → `isReadOnlyStatus()` returns true
- ✅ **Upload button disabled** → Future story will use `isReadOnly` from BatchContext
- ✅ **Tooltip shows lock message** → Pattern documented in Section 3.4
- ⚠️ **Master data save button disabled** → Future story (master data pages don't exist yet)
- ⚠️ **Credit rating update blocked** → Future story (credit rating pages don't exist yet)
- ⚠️ **Custom holding action blocked** → Future story (custom holding pages don't exist yet)

**Status:** Core infrastructure ready. AC will be fully testable when data entry pages are built.

---

### AC: Happy Path - Data Unlock on Rejection

- ✅ **Batch unlocked after rejection** → Status returns to DataPreparation, `isReadOnly` becomes false
- ✅ **Upload button enabled** → Future story will check `!isReadOnly`
- ✅ **All edit/save/delete buttons enabled** → Future stories will check `!isReadOnly`
- ⚠️ **Unlock notification shown** → Need to add toast notification on batch switch
- ✅ **Unlock icon visible** → Will be implemented in BatchCard

**Status:** Unlock logic works. Visual indicators and notifications need implementation.

---

### AC: Read-Only Access During Approval

- ✅ **View access maintained** → `isReadOnly` doesn't hide content, just disables actions
- ✅ **All action buttons disabled** → Pattern documented for future pages
- ✅ **Search and view still work** → Read operations unaffected

**Status:** Pattern ready for future data entry pages.

---

### AC: Lock Scope - Data Entry Only

- ✅ **Lock doesn't affect read access** → `isReadOnly` only disables write actions
- ✅ **Workflow state viewer works** → No lock checks in workflow pages
- ✅ **Audit trail accessible** → No lock checks in audit pages

**Status:** Correct behavior already implemented.

---

### AC: Lock State Indicator

- ⚠️ **Lock icon on batch card** → Needs implementation (Section 2.3)
- ⚠️ **Unlock icon on DataPreparation batch** → Needs implementation (Section 2.3)
- ⚠️ **Lock icon in header** → Needs enhancement (Section 2.4)

**Status:** Visual indicators need to be added.

---

### AC: Multi-Batch Scenarios

- ✅ **Lock is batch-specific** → Each batch has its own status
- ✅ **Switching batches updates lock state** → BatchContext refetches batch on switch
- ✅ **Other users' actions don't affect my batch** → Batches are independent

**Status:** Already works correctly.

---

### AC: Permission Override for Approvers

- ✅ **No role-based override** → Lock is absolute, checked via status only
- ✅ **Approvers cannot modify** → `isReadOnly` doesn't check user role
- ✅ **Even Analysts blocked when locked** → Lock trumps all permissions

**Status:** Correct behavior already implemented.

---

### AC: Validation - Immediate Enforcement

- ✅ **Lock enforced immediately on transition** → Status change triggers `isReadOnly` recalculation
- ✅ **Unlock applied immediately on rejection** → Status change triggers `isReadOnly` recalculation
- ✅ **No grace period** → Lock state is synchronous

**Status:** Already works correctly.

---

### AC: Error Handling

- ✅ **Fail-safe: default to locked** → `useBatchLock()` defaults to locked on error
- ⚠️ **Warning message shown** → Need to implement error display in `useBatchLock()` consumers
- ⚠️ **API blocks locked modifications** → Backend responsibility, not frontend

**Status:** Fail-safe logic will be implemented in `useBatchLock()` hook.

---

### AC: Audit Trail for Lock Events

- ⚠️ **Lock event logged** → Backend responsibility
- ⚠️ **Unlock event logged** → Backend responsibility
- ✅ **Events visible in workflow history** → Frontend will display them (no code changes needed)

**Status:** Backend handles logging. Frontend just displays existing events.

---

## 5. Test Strategy

### 5.1 Batch Access Control Utility Tests

**File:** Create `web/src/lib/permissions/__tests__/batch-access-control.test.ts`

**Test Scenarios:**

#### isBatchLocked()
- ✅ Returns false for DataPreparation
- ✅ Returns true for Level1Pending
- ✅ Returns true for Level2Pending
- ✅ Returns true for Level3Pending
- ✅ Returns true for Approved
- ✅ Returns true for unknown status (fail-safe)

#### canModifyBatchData()
- ✅ Returns true for DataPreparation
- ✅ Returns false for approval stages
- ✅ Returns false for Approved

#### getLockMessage()
- ✅ Returns appropriate message for each status
- ✅ Returns generic message for unknown status

#### getBatchLockState()
- ✅ Returns Unlocked for DataPreparation
- ✅ Returns Locked for approval stages
- ✅ Returns Archived for Approved

**Mock Strategy:**
Unit tests - no mocking needed (pure functions).

---

### 5.2 useBatchLock Hook Tests

**File:** Create `web/src/hooks/__tests__/useBatchLock.test.ts`

**Test Scenarios:**

#### Happy Path
- ✅ Fetches workflow status from API
- ✅ Returns correct lock state for DataPreparation
- ✅ Returns correct lock state for Level1Pending
- ✅ Returns correct lock message
- ✅ isLoading is true during fetch, false after

#### Error Handling
- ✅ Defaults to locked state on API error
- ✅ Shows fail-safe message when API fails
- ✅ Sets error state with error message

#### Null Batch ID
- ✅ Returns locked state when batchId is null
- ✅ Shows "No active batch" message

**Mock Strategy:**
```typescript
vi.mock('@/lib/api/batches', () => ({
  getBatchWorkflowStatus: vi.fn(),
}));
```

---

### 5.3 BatchCard Lock Icon Tests

**File:** Update `web/src/app/batches/__tests__/BatchesClient.test.tsx`

**New Test Scenarios:**
- ✅ Shows lock icon for Level1Pending batch
- ✅ Shows unlock icon for DataPreparation batch
- ✅ Lock icon has tooltip "Data locked during approval process"
- ✅ Unlock icon has tooltip "Batch is editable"
- ✅ Lock icon has aria-label for accessibility

**Mock Strategy:**
```typescript
vi.mock('@/lib/permissions/batch-access-control', () => ({
  isBatchLocked: vi.fn(),
  getLockMessage: vi.fn(),
}));
```

---

### 5.4 BatchSwitcher Lock Icon Tests

**File:** Update `web/src/components/batch/__tests__/BatchSwitcher.test.tsx`

**New Test Scenarios:**
- ✅ Shows lock icon when isReadOnly is true
- ✅ Does not show lock icon when isReadOnly is false
- ✅ Lock icon has tooltip
- ✅ Lock icon has aria-label

**Mock Strategy:**
Same as existing BatchSwitcher tests - mock `useBatch()` context.

---

### 5.5 Integration Tests (Future Data Entry Pages)

**File:** Future test files for data entry pages

**Test Pattern:**
```typescript
describe('File Upload Page with Lock State', () => {
  it('disables upload button when batch is locked', async () => {
    // Mock useBatch to return isReadOnly: true
    render(<FileUploadPage />);

    const uploadButton = screen.getByRole('button', { name: /upload file/i });
    expect(uploadButton).toBeDisabled();

    // Hover to show tooltip
    await userEvent.hover(uploadButton);
    expect(await screen.findByText(/data locked during approval/i)).toBeInTheDocument();
  });

  it('enables upload button when batch is unlocked', async () => {
    // Mock useBatch to return isReadOnly: false
    render(<FileUploadPage />);

    const uploadButton = screen.getByRole('button', { name: /upload file/i });
    expect(uploadButton).not.toBeDisabled();
  });
});
```

**Focus:** User-observable behavior (button disabled, tooltip visible).

---

## 6. Implementation Order (TDD)

### Phase 1: Utility Module (Pure Functions)
1. **Create `lib/permissions/batch-access-control.ts`** - All utility functions
2. **Write tests** - `batch-access-control.test.ts` with all scenarios
3. **Run tests** - Verify pure functions work correctly

### Phase 2: Custom Hook
4. **Create `hooks/useBatchLock.ts`** - React hook for lock state
5. **Write tests** - `useBatchLock.test.ts` with API mocking
6. **Run tests** - Verify hook behavior and fail-safe

### Phase 3: Visual Indicators - Batch Cards
7. **Update `BatchesClient.tsx`** - Add lock icons to batch cards
8. **Write tests** - Update existing tests with lock icon assertions
9. **Run tests** - Verify icons appear correctly

### Phase 4: Visual Indicators - Header
10. **Update `BatchSwitcher.tsx`** - Add lock icon to header
11. **Write tests** - Update existing tests with lock icon assertions
12. **Run tests** - Verify header lock indicator

### Phase 5: Documentation
13. **Update component README** - Document lock-aware component pattern
14. **Create example component** - Show tooltip + disabled button pattern for future pages

### Phase 6: Integration Testing (Optional)
15. **Create mock data entry page** - For testing lock behavior
16. **Write integration tests** - Full user flow with lock state
17. **Run tests** - Verify end-to-end lock enforcement

---

## 7. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| No data entry pages exist yet | Medium | Build infrastructure now, validate with mock page. Full validation happens in data entry stories. |
| Tooltip doesn't work on disabled buttons | Low | Use wrapper `<span>` pattern (documented in Section 3.4). Known Radix UI limitation. |
| Lock state out of sync between client and server | Low | `useBatchLock()` fetches from API for fail-safe validation. BatchContext also syncs on batch switch. |
| User confused why buttons are disabled | Medium | Add tooltips to ALL disabled buttons. Lock message should be clear. |
| Lock icon not visible on small screens | Low | Use responsive design - show icon on desktop, badge on mobile. |
| Failing to detect lock state on API error | High | Fail-safe: default to locked state. Show warning message. Never allow data entry on error. |
| Backend allows modification of locked batch | Critical | Backend must enforce lock at API level. Frontend lock is UX only, not security. |

---

## 8. Quality Gates Checklist

Before transitioning to SPECIFY phase, verify:

- [x] BatchContext already has correct lock logic (`isReadOnly` flag)
- [x] `BatchWorkflowStatus` API includes `isLocked` field
- [x] Shadcn Tooltip component exists
- [x] Shadcn AlertDialog component exists (from Story 4)
- [x] BatchSwitcher already shows "read-only" badge
- [x] Workflow stage constants exist
- [x] No data entry pages exist yet (future stories)
- [x] Lock logic is status-based, not role-based (correct per spec)
- [x] Fail-safe strategy documented (default to locked on error)
- [x] Test strategy follows accessibility-first query pattern

---

## 9. Open Questions for SPECIFY Phase

1. **Lock icon placement on batch cards:**
   - Next to title? (as shown in Section 2.3)
   - Next to status badge?
   - Both locations?

   **Recommendation:** Next to title, with tooltip. Status badge is already color-coded.

2. **Lock notification when switching batches:**
   Should we show a toast when switching to a locked batch?

   **Recommendation:** No. BatchSwitcher already shows lock indicator. Toast would be noisy.

3. **Unlock notification after rejection:**
   Story 5 AC says "Batch unlocked. You can now make corrections."

   **Where should this show?**
   - Toast notification? ✅ Recommended
   - Alert banner on page? Optional
   - Both? Excessive

   **Implementation:** Add toast in BatchContext when batch status changes from approval to DataPreparation.

4. **Lock icon vs "Locked" text badge in header:**
   Current: "read-only" badge
   Options:
   - A. Replace with lock icon + tooltip
   - B. Keep badge, add lock icon
   - C. Keep badge as-is

   **Recommendation:** Option A (icon + tooltip) for cleaner header.

5. **Future data entry pages - should they use `useBatchLock()` or `useBatch().isReadOnly`?**

   **Analysis:**
   - `useBatch().isReadOnly` - Simpler, already available, synced with context
   - `useBatchLock()` - Independent validation, fail-safe, can be used without context

   **Recommendation:** Use `useBatch().isReadOnly` for pages with BatchContext. Use `useBatchLock()` for standalone components or fail-safe validation.

---

## 10. Discovered Patterns to Follow

### Pattern 1: Tooltip on Disabled Buttons (Radix UI Workaround)

Radix UI Tooltip doesn't trigger on disabled elements. Wrap in `<span>`:

```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span tabIndex={0}> {/* Allows keyboard focus */}
        <Button disabled={isReadOnly}>
          Upload File
        </Button>
      </span>
    </TooltipTrigger>
    {isReadOnly && (
      <TooltipContent>Data locked during approval process</TooltipContent>
    )}
  </Tooltip>
</TooltipProvider>
```

**Apply to:** All data entry buttons that can be disabled by lock state.

---

### Pattern 2: Fail-Safe Error Handling

When lock state cannot be determined, default to locked:

```typescript
try {
  const status = await getBatchWorkflowStatus(batchId);
  setIsLocked(isBatchLocked(status.currentStage));
} catch (error) {
  // Fail-safe: assume locked
  setIsLocked(true);
  setError('Unable to verify batch lock status. Data entry blocked as precaution.');
}
```

**Apply to:** `useBatchLock()` hook, any API calls that affect lock state.

---

### Pattern 3: Accessibility-First Lock Indicators

Lock icons must have:
- `aria-label` for screen readers
- Tooltip for visual users
- Semantic meaning (Lock = locked, Unlock = editable)

```typescript
{isLocked ? (
  <Lock className="h-4 w-4" aria-label="Locked" />
) : (
  <Unlock className="h-4 w-4" aria-label="Unlocked" />
)}
```

**Apply to:** BatchCard, BatchSwitcher, any component showing lock state.

---

## Conclusion

**Ready for SPECIFY Phase:** ✅ Yes

Story 4 provided excellent foundation - lock logic is already implemented in `BatchContext.isReadOnlyStatus()`. Story 5's primary work is:

1. **Create utilities** - `batch-access-control.ts` and `useBatchLock()` hook
2. **Add visual indicators** - Lock icons on batch cards and header
3. **Document patterns** - For future data entry pages
4. **Test infrastructure** - Ensure fail-safe behavior

**Critical Success Factors:**
1. Utility functions follow fail-safe principle (default to locked)
2. Visual indicators are accessible (aria-labels, tooltips)
3. Documentation is clear for future data entry page developers
4. Tests focus on user-observable behavior

**Known Limitations (Acceptable for Story 5):**
- No data entry pages exist yet - lock enforcement will be validated in future stories
- Backend lock enforcement is backend's responsibility - frontend provides UX only
- Audit trail events for lock/unlock are backend-generated - frontend just displays them

**Next Step:** Transition to SPECIFY phase to write comprehensive test specifications for utility module, custom hook, and visual indicators.
