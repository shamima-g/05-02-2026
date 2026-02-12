# Story 1 Discovered Impacts Analysis: Batch Creation & Listing

**Generated:** 2026-02-12
**Epic:** 2 (Batch Management & Workflow State Control)
**Story:** 1 (Batch Creation & Listing)
**Target Route:** `/batches`

---

## Executive Summary

This analysis examines the existing codebase built during Epic 1 (Authentication, Authorization & User Management) to identify reusable infrastructure and potential conflicts for implementing Epic 2, Story 1.

**Key Findings:**
- ✅ **Strong foundation exists** - API client, navigation, auth patterns all in place
- ✅ **OpenAPI spec defines batch endpoints** - `/report-batches` endpoints are fully documented
- ✅ **Basic batches.ts API client exists** - needs enhancement to match OpenAPI spec
- ✅ **Page placeholder exists** - `/batches` page at `app/batches/page.tsx` (currently minimal)
- ⚠️ **date-fns NOT installed** - need to add for date formatting
- ⚠️ **Tooltip component NOT installed** - need to add from Shadcn UI
- ⚠️ **Dashboard already references batches** - must ensure consistency with new implementation

---

## 1. Existing Infrastructure to Reuse

### 1.1 API Client Infrastructure ✅

**Location:** `web/src/lib/api/client.ts`

**What's Available:**
- Base `apiClient()` function with error handling, logging, retry logic
- JWT token automatic injection from cookies (line 153-158)
- Convenience methods: `get()`, `post()`, `put()`, `del()`
- Query parameter building (line 99-104)
- Audit trail support via `lastChangedUser` header (line 148-150)
- TypeScript-first with generic type support

**Pattern to Follow:**
```typescript
// From users.ts (line 159-168)
export async function listUsers(params?: {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  search?: string;
}): Promise<UserList> {
  return get<UserList>('/users', params);
}
```

**Recommendation:** Update `web/src/lib/api/batches.ts` to match this pattern for batch endpoints.

---

### 1.2 Existing Batch API Client (Needs Update) ⚠️

**Location:** `web/src/lib/api/batches.ts`

**Current Implementation:**
- Only has `createBatch()` function (line 23-25)
- Uses wrong endpoint: `/v1/batches` (should be `/report-batches` per OpenAPI spec)
- Minimal types: `CreateBatchRequest`, `Batch`

**Required Updates:**
1. Rename endpoint from `/v1/batches` to `/report-batches`
2. Add comprehensive types from OpenAPI spec (lines 3059-3133):
   - `ReportBatch` (with id, reportBatchType, reportDate, workflowInstanceId, status)
   - `ReportBatchList` (with items[], meta)
   - `CreateReportBatchRequest` (reportBatchType, reportDate)
   - `ReportBatchDetail` (extends ReportBatch with fileStatus, dataCompleteness, etc.)
   - `BatchWorkflowStatus`
3. Add missing API functions:
   - `listReportBatches(params)` → GET `/report-batches`
   - `getReportBatch(id)` → GET `/report-batches/{id}`
   - `getReportBatchStatus(id)` → GET `/report-batches/{id}/status`

**OpenAPI Endpoint Reference:**
- `GET /report-batches` (line 861-890 in openapi.yaml)
  - Supports `page`, `pageSize`, `type`, `status`, `from`, `to` query params
  - Returns `ReportBatchList` with pagination
- `POST /report-batches` (line 893-910)
  - Creates new batch with `reportBatchType` and `reportDate`
  - Returns `ReportBatch` with status 201

---

### 1.3 Authentication & Authorization Patterns ✅

**Location:** `web/src/lib/auth/`

**What's Available:**
- Server-side session: `getSession()` from `auth-server.ts`
- Permission checks: `hasPermission()`, `hasPageAccess()` from `auth-helpers.ts` (lines 33-76)
- Client-side user fetching: `getCurrentUser()` from `lib/api/auth.ts`
- RoleGate component for conditional rendering (lines 101-152)

**Pattern for Page Authorization:**
```typescript
// From app/batches/page.tsx (lines 11-20)
const user = await getSession();
if (!user) redirect('/login');
if (!hasPageAccess(user, '/batches')) redirect('/auth/forbidden');
```

**Permission for Create Button:**
According to story acceptance criteria (line 49-51):
- Only **Analysts** can create batches
- Check: `hasRole(user, 'Analyst')` OR use `hasPermission(user, 'batch.create')`

**Recommendation:** Use permission-based check (`batch.create`) for better flexibility.

---

### 1.4 Navigation & Layout ✅

**Location:** `web/src/components/layout/AppHeader.tsx`

**What's Available:**
- Navigation already includes "Batches" link (line 31: `{ href: '/batches', label: 'Batches' }`)
- Visibility controlled by `allowedPages` from user's JWT token
- Active link highlighting based on pathname

**No Changes Required** - Navigation already set up correctly.

---

### 1.5 UI Components (Shadcn UI) ✅

**Installed Components:**
- ✅ Button (`components/ui/button.tsx`)
- ✅ Card (`components/ui/card.tsx`)
- ✅ Badge (`components/ui/badge.tsx`)
- ✅ Select (`components/ui/select.tsx`)
- ✅ Table (`components/ui/table.tsx`)
- ✅ Tabs (`components/ui/tabs.tsx`)

**Missing Components:**
- ❌ Tooltip - **REQUIRED** for disabled button explanation (story line 20)

**Action Required:** Install Tooltip component:
```bash
mcp__shadcn__add_component --component tooltip
```

---

### 1.6 Existing WorkflowProgress Component ✅

**Location:** `web/src/components/dashboard/WorkflowProgress.tsx`

**What It Does:**
- Visual workflow progress indicator (Data Prep → L1 → L2 → L3 → Published)
- Shows completed (✓), current (●), and pending (○) states
- Matches wireframe requirement (story line 27)

**Reusability:** This component is PERFECT for batch cards. No changes needed.

**Pattern:**
```tsx
<WorkflowProgress status={batch.status} />
```

**Status values it handles:**
- `DataPreparation`, `Level1Pending`, `Level2Pending`, `Level3Pending`, `Approved`

---

### 1.7 Test Patterns ✅

**Location:** `web/src/app/__tests__/page.test.tsx`, `web/src/app/admin/users/__tests__/page.test.tsx`

**Established Patterns:**
- Story metadata header in test files (lines 1-8)
- Mock factories for test data (e.g., `createMockUser()`)
- Mock Next.js navigation (`useRouter`)
- Mock API functions with vi.mock
- Accessibility testing with vitest-axe
- User-observable behavior assertions (not implementation details)

**Pattern to Follow:**
```typescript
// Mock data factory
const createMockBatch = (overrides: Partial<ReportBatch> = {}): ReportBatch => ({
  id: 1,
  reportBatchType: 'Monthly',
  reportDate: '2026-01-31',
  workflowInstanceId: null,
  status: 'DataPreparation',
  ...overrides,
});

// Mock API calls
vi.mock('@/lib/api/batches', () => ({
  listReportBatches: vi.fn(),
  createReportBatch: vi.fn(),
}));
```

---

## 2. New Infrastructure Needed

### 2.1 Date Formatting Library ❌

**Required:** `date-fns` package

**Why:** Story requires date formatting (story line 76):
- "January 2026" format for display (wireframe line 19, 34)
- "2026-01-31" format for API calls (ISO 8601)
- Last day of month calculation for batch creation

**Action Required:**
```bash
npm install date-fns
```

**Usage Pattern:**
```typescript
import { format, lastDayOfMonth, addMonths } from 'date-fns';

// Display format
const displayDate = format(new Date(batch.reportDate), 'MMMM yyyy'); // "January 2026"

// Calculate next month's last day
const nextMonth = addMonths(new Date(latestBatch.reportDate), 1);
const reportDate = format(lastDayOfMonth(nextMonth), 'yyyy-MM-dd'); // "2026-02-28"
```

---

### 2.2 Batch-Specific Types

**Location:** Create `web/src/types/batches.ts`

**Required Types (from OpenAPI spec):**
```typescript
export interface ReportBatch {
  id: number;
  reportBatchType: 'Monthly' | 'Weekly';
  reportDate: string; // ISO date
  workflowInstanceId: string | null;
  status: 'DataPreparation' | 'Level1Pending' | 'Level2Pending' | 'Level3Pending' | 'Approved' | 'Rejected';
}

export interface ReportBatchList {
  items: ReportBatch[];
  meta: PaginationMeta;
}

export interface CreateReportBatchRequest {
  reportBatchType: 'Monthly' | 'Weekly';
  reportDate: string; // ISO date format (YYYY-MM-DD)
}

export interface BatchWorkflowStatus {
  batchId: number;
  currentStage: string;
  isLocked: boolean;
  canConfirm: boolean;
  canApprove: boolean;
  pendingApprovalLevel: number | null;
  lastUpdated: string; // ISO datetime
}
```

**Action:** Define these in new file, or inline in `batches.ts` API client.

---

### 2.3 Batch Components

**New Components Required:**
1. `components/batches/BatchList.tsx` - Client component, renders batch cards with filtering/sorting
2. `components/batches/BatchCard.tsx` - Displays individual batch summary
3. `components/batches/CreateBatchButton.tsx` - Button with permission check and tooltip

**Why Separate Components:**
- **Server/Client Boundary** - Page can be server component, BatchList is client (needs interactivity)
- **Reusability** - BatchCard will be used in Dashboard and Batches page
- **Testability** - Easier to test small, focused components

---

## 3. Potential Conflicts

### 3.1 Dashboard Already References Batches ⚠️

**Location:** `web/src/app/page.tsx` (lines 98-352)

**Current Implementation:**
- Calls `getActiveBatches()` from `lib/api/dashboard.ts` (line 116)
- Displays batches in "Active Batches" card (lines 268-353)
- Uses `WorkflowProgress` component (line 307)
- Links to `/batches/{id}` (lines 310-319, 336-345)

**Conflict Risk:**
- Dashboard uses `ActiveBatchesResponse` type from `dashboard.ts`
- New story will define `ReportBatch` type in `batches.ts`
- **These types MUST match** to avoid inconsistencies

**Resolution:**
1. **Move batch types to shared location** (`types/batches.ts`)
2. **Update Dashboard API** to import from `batches.ts` instead of defining its own types
3. **Ensure Dashboard batch display matches new BatchCard component** for consistency

**Action Required in SPECIFY Phase:**
- Review `lib/api/dashboard.ts` (specifically `getActiveBatches()`)
- Ensure it returns `ReportBatchList` compatible data
- Consider refactoring Dashboard to use new `BatchCard` component

---

### 3.2 Page Already Exists (Placeholder) ⚠️

**Location:** `web/src/app/batches/page.tsx`

**Current State:**
- Minimal server component (lines 11-32)
- Has auth check (`getSession()`, `hasPageAccess()`)
- Shows placeholder heading "Batches" and description

**Action:** Replace placeholder with full implementation (no conflict, just overwrite).

---

### 3.3 OpenAPI Endpoint Mismatch ⚠️

**Issue:** Existing `batches.ts` uses `/v1/batches` endpoint (line 24), but OpenAPI spec defines `/report-batches` (line 860).

**Resolution:** Update to `/report-batches` to match spec.

---

## 4. Navigation/Layout Changes Required

### 4.1 No Changes Needed ✅

The navigation is already configured:
- "Batches" link exists in `AppHeader.tsx` (line 31)
- Route `/batches` is defined in `ALL_NAV_LINKS`
- Access controlled by `allowedPages` from JWT token

**Verification:** Ensure backend JWT token includes `/batches` in `allowedPages` for Analysts.

---

## 5. Recommendations (Implementation Order)

### Phase 1: Dependencies & Types
1. **Install date-fns** - `npm install date-fns`
2. **Install Tooltip** - via Shadcn MCP server
3. **Define types** - Create `types/batches.ts` with OpenAPI-aligned types

### Phase 2: API Client
4. **Update batches.ts** - Add `listReportBatches()`, `getReportBatch()`, `getReportBatchStatus()`
5. **Fix endpoint paths** - Change `/v1/batches` to `/report-batches`

### Phase 3: Components (TDD Order)
6. **CreateBatchButton component** - With permission check and tooltip
7. **BatchCard component** - Reusable batch display
8. **BatchList component** - Filtering, sorting, pagination

### Phase 4: Page Implementation
9. **Update app/batches/page.tsx** - Server component that fetches initial data
10. **Wire up client components** - Connect BatchList to server-fetched data

### Phase 5: Integration
11. **Update Dashboard** - Ensure consistency with new BatchCard component
12. **Add tests** - Follow existing test patterns from Epic 1

---

## 6. Test Strategy Notes

### 6.1 Test File Structure
Follow Epic 1 pattern:
```
web/src/app/batches/__tests__/page.test.tsx (page integration tests)
web/src/components/batches/__tests__/BatchList.test.tsx (component tests)
web/src/components/batches/__tests__/BatchCard.test.tsx (component tests)
web/src/components/batches/__tests__/CreateBatchButton.test.tsx (component tests)
```

### 6.2 Key Test Scenarios

**Create Button Tests:**
- ✅ Visible for Analysts
- ✅ Hidden for Approvers/Admins
- ✅ Disabled when previous batch NOT PendingComplete (with tooltip)
- ✅ Enabled when previous batch IS PendingComplete
- ✅ Creates batch for next month (last day) on click

**Batch List Tests:**
- ✅ Displays batches sorted by latest first
- ✅ Shows status badges with correct colors
- ✅ Displays WorkflowProgress component
- ✅ Filter controls work (Active/Closed/All)
- ✅ Sort controls work (Latest/Oldest)
- ✅ Pagination works (Load More button)

**Batch Card Tests:**
- ✅ Shows batch date in "Month YYYY" format
- ✅ Shows status badge
- ✅ Shows workflow progress
- ✅ Shows file/validation/calc summary
- ✅ Shows rejection alert when applicable

### 6.3 Mock Strategy
```typescript
// Mock API responses
const mockBatchList: ReportBatchList = {
  items: [
    createMockBatch({ id: 1, reportDate: '2026-01-31', status: 'DataPreparation' }),
    createMockBatch({ id: 2, reportDate: '2025-12-31', status: 'Level1Pending' }),
  ],
  meta: { page: 1, pageSize: 10, totalItems: 2, totalPages: 1 },
};

vi.mocked(listReportBatches).mockResolvedValue(mockBatchList);
```

---

## 7. OpenAPI Spec Alignment

### 7.1 Endpoint Mapping

| Story Requirement | OpenAPI Endpoint | Method | Status |
|-------------------|------------------|--------|--------|
| List batches | `/report-batches` | GET | ✅ Defined (line 861) |
| Create batch | `/report-batches` | POST | ✅ Defined (line 893) |
| Get batch details | `/report-batches/{id}` | GET | ✅ Defined (line 913) |
| Get batch status | `/report-batches/{id}/status` | GET | ✅ Defined (line 932) |

### 7.2 Required vs Available Filters

**Story Requirements (lines 30-33):**
- ✅ Status filter (Active/Closed/All) → OpenAPI `status` param (line 874)
- ✅ Sort by date → OpenAPI supports date sorting via pagination

**OpenAPI Additional Filters (lines 870-886):**
- Type filter (Monthly/Weekly) - **NOT needed for MVP** (story de-scoped weekly)
- Date range filter (from/to) - **Future enhancement**

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dashboard batch display inconsistency | Medium | Refactor Dashboard to use shared BatchCard component |
| Missing date-fns dependency | Low | Install before implementation starts |
| OpenAPI endpoint mismatch | Low | Update batches.ts to use `/report-batches` |
| Tooltip component missing | Low | Install from Shadcn UI via MCP |
| Type conflicts (Dashboard vs Batches) | Medium | Define shared types in `types/batches.ts` |

---

## 9. Quality Gates Checklist

Before transitioning to SPECIFY phase, verify:

- [ ] All Epic 1 infrastructure is understood and documented above
- [ ] OpenAPI spec endpoints are mapped to story requirements
- [ ] Missing dependencies are identified (date-fns, tooltip)
- [ ] Type definitions align with OpenAPI spec
- [ ] Test strategy follows Epic 1 patterns
- [ ] Dashboard integration points are identified
- [ ] No breaking changes to existing Epic 1 code

---

## Conclusion

**Ready for SPECIFY Phase:** ✅ Yes

The codebase from Epic 1 provides excellent foundation:
- API client infrastructure is mature and well-tested
- Auth patterns are consistent and reusable
- Navigation is already configured
- WorkflowProgress component is perfect for batch cards
- Test patterns are well-established

**Critical Actions Before Implementation:**
1. Install date-fns and Tooltip component
2. Update batches.ts API client to match OpenAPI spec
3. Define shared batch types
4. Ensure Dashboard consistency with new batch components

**Next Step:** Transition to SPECIFY phase to write comprehensive test specifications for this story.
