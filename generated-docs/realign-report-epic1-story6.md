# REALIGN Report: Epic 1 - Story 6
## User Activity Logging & Audit Trail

**Generated:** 2026-02-10
**Story:** Epic 1, Story 6 of 8
**Route:** `/admin/audit-trail`
**Target File:** `app/admin/audit-trail/page.tsx`

---

## Executive Summary

Story 6 builds an Audit Trail Viewer at `/admin/audit-trail` with filtering, search, export, and real-time updates. This REALIGN analysis confirms that **Stories 1-5 provide robust infrastructure** that can be extensively reused. Story 6 primarily needs to add audit-specific API services and a new page component, leveraging existing admin patterns, UI components, and RBAC infrastructure.

---

## Existing Infrastructure (Reuse)

### 1. Authentication & Authorization (Story 1)
**Location:** `web/src/lib/api/auth.ts`, `web/src/lib/auth/`

**What exists:**
- `getCurrentUser()` - Get authenticated user
- `AuthUser` type with `roles` and `permissions` arrays
- JWT token handling via cookies (in `apiClient`)
- Session management

**How Story 6 will use it:**
- Get current user for RBAC checks (Administrator vs Analyst with `audit.view`)
- Determine export permission (`Administrator` can export, `Analyst` cannot)
- Pass `currentUser.username` to audit export API for tracking who exported data

### 2. API Client Infrastructure (Story 1)
**Location:** `web/src/lib/api/client.ts`

**What exists:**
- `apiClient<T>()` - Base fetch wrapper with error handling
- `get<T>()`, `post<T>()`, `put<T>()`, `del<T>()` - Convenience methods
- Binary response handling (`isBinaryResponse` flag) for file downloads
- Query parameter building (`params` object)
- `lastChangedUser` header support for audit trails
- Automatic JWT token injection from cookies

**How Story 6 will use it:**
- All audit API calls will use `get<T>()` with query params for filtering
- Export functionality will use `apiClient()` with `isBinaryResponse: true` to download Excel files
- Same pattern as `exportUsers()` in `web/src/lib/api/users.ts` (lines 284-296)

### 3. Admin Page Layout & Navigation (Stories 3-5)
**Location:** `web/src/app/admin/users/page.tsx`, `web/src/app/admin/roles/page.tsx`

**What exists:**
- Standard admin page structure:
  - Container layout: `<main className="container mx-auto px-4 py-8">`
  - Page header with title and action buttons
  - Loading state with skeleton UI (`role="progressbar"`)
  - Access denied state (`role="alert"`)
  - Filter row with search input and dropdown filters
  - Data table with sortable columns
  - Operation error messages (`role="alert"`)

**How Story 6 will use it:**
- Follow same page structure for consistency
- Reuse loading/error state patterns
- Reuse filter row layout (date range picker + entity type + action dropdown)
- Reuse table layout for audit records list

### 4. RBAC & Permission Checks (Story 1)
**Location:** `web/src/app/admin/users/page.tsx` (lines 146-150), `web/src/app/admin/roles/page.tsx` (lines 235-239)

**What exists:**
```typescript
if (!user.roles.includes('Administrator')) {
  setAccessDenied(true);
  router.replace('/');
  return;
}
```

**How Story 6 will use it:**
- Check for `Administrator` OR `permissions.includes('audit.view')`
- Conditionally hide export button for users without export permission
- Show "Access denied" message if neither condition is met

### 5. Data Table Component (Stories 3-5)
**Location:** `web/src/components/ui/table.tsx`

**What exists:**
- Shadcn `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableHead>`, `<TableBody>`, `<TableCell>`
- Used in both Users page and Roles page

**How Story 6 will use it:**
- Display audit records with columns: Timestamp, User, Action, Entity Type, Entity ID, Details
- Expandable rows for before/after values (similar to accordion pattern in users modal)

### 6. Filter Components (Stories 3-5)
**Location:** `web/src/components/ui/select.tsx`, `web/src/components/ui/input.tsx`

**What exists:**
- `<Select>` with `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>` (used for role/department filters)
- `<Input>` with search functionality (users page line 496-503)
- Enter key handler: `onKeyDown={(e) => { if (e.key === 'Enter') { ... } }}`

**How Story 6 will use it:**
- Search input for user search
- Select dropdowns for:
  - Entity Type (User, Role, ApprovalAuthority, Batch, Instrument, etc.)
  - Action (user.created, user.updated, role.assigned, etc.)
  - Preset filters (Failed Logins, Deactivations, etc.)
- Date range picker (new component, see "New Components Required" below)

### 7. Modal/Dialog Components (Stories 3-5)
**Location:** `web/src/components/ui/dialog.tsx`, `web/src/components/ui/tabs.tsx`

**What exists:**
- `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>`, `<DialogFooter>`
- `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` (used in user view modal)

**How Story 6 will use it:**
- Audit record detail modal with tabs:
  - Overview (action, user, timestamp, IP)
  - Before/After (for data change events)
  - Related Events (link to entity-specific audit trail)

### 8. Export Pattern (Story 3)
**Location:** `web/src/lib/api/users.ts` (lines 284-296), `web/src/app/admin/users/page.tsx` (lines 321-338)

**What exists:**
```typescript
// API function
export async function exportUsers(params?: {...}): Promise<Blob> {
  return apiClient<Blob>('/users/export', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined>,
    isBinaryResponse: true,
  });
}

// Page handler
const handleExport = async () => {
  setIsSaving(true);
  setOperationError(null);
  try {
    const blob = await exportUsers();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    setOperationError('Failed to export users. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

**How Story 6 will use it:**
- Create `exportAuditTrail()` API function with same pattern
- Pass current filter params (date range, user, entity type, action) to export
- Download filename: `audit-trail-${dateRange}.xlsx`

### 9. Badge Component (Stories 3-5)
**Location:** `web/src/components/ui/badge.tsx`

**What exists:**
- `<Badge variant="default|destructive|outline">`
- Used for status indicators (Active/Inactive, Out of Office)

**How Story 6 will use it:**
- Action type badges (create=success, update=default, delete=destructive)
- Entity type badges

### 10. State Management Patterns (Stories 3-5)
**What exists:**
- `useState` for form data, modals, filters, loading states
- `useCallback` for memoized fetch functions
- `useEffect` for initial data loading
- Error state management (`operationError`, `createErrors`, etc.)

**How Story 6 will use it:**
- Same patterns for audit data fetching, filter state, modal state
- Error handling for API failures
- Loading states during data fetch and export

### 11. Type Definitions (Stories 1-5)
**Location:** `web/src/lib/api/users.ts`, `web/src/lib/api/roles.ts`, `web/src/lib/api/approval-authority.ts`

**What exists:**
- Type patterns for API responses:
  - List types with `items` and `meta` (pagination)
  - Detail types with full entity data
  - Request types for POST/PUT operations
- `PaginationMeta` interface

**How Story 6 will use it:**
- Define similar types for audit responses (`AuditActivityList`, `AuditRecord`, `AuditFilters`, etc.)

### 12. Test Patterns (Stories 1-5)
**Location:** `web/src/app/admin/users/__tests__/page.test.tsx`

**What exists:**
- Mock factory functions (`createMockAdminUser`, `createMockUserDetail`)
- Vitest mocks for API modules and next/navigation
- Test structure: describe blocks, beforeEach setup, waitFor async assertions
- Accessibility testing with `vitest-axe`
- User event testing with `@testing-library/user-event`

**How Story 6 will use it:**
- Create mock factories: `createMockAuditRecord`, `createMockAuditActivityList`
- Mock audit API functions
- Test filtering, search, export, detail view
- Test RBAC (Administrator vs Analyst permissions)

---

## New Components Required

### 1. Audit Trail Viewer Page
**File:** `web/src/app/admin/audit-trail/page.tsx`

**Functionality:**
- Main audit trail viewer with filters and data table
- Real-time updates (polling or WebSocket - TBD during implementation)
- Export button with permission check
- Detail view modal for audit records
- User activity summary panel (when filtered by user)

**Structure:**
```typescript
export default function AuditTrailPage() {
  // State: filters, audit records, loading, errors, modals
  // Effects: initial load, real-time updates
  // Handlers: filter changes, export, view details
  // Render: filters row, data table, modals
}
```

### 2. Date Range Picker Component
**File:** `web/src/components/audit/DateRangePicker.tsx` (or inline in page)

**Functionality:**
- Start date and end date inputs
- Preset options: Last 7 days, Last 30 days, Last 90 days, Custom
- Clear button

**Pattern to follow:** Standard form inputs with `<Input type="date">` (same as effective date in roles page, line 954-963)

### 3. Audit Record Detail Modal
**Pattern:** Reuse `<Dialog>` with `<Tabs>` for:
- **Overview Tab:** Action, User, Timestamp, IP Address, Entity Type, Entity ID
- **Before/After Tab:** JSON diff or table showing changed fields
- **Related Events Tab:** Link to entity-specific audit trail

### 4. Preset Filter Dropdown
**Pattern:** Reuse `<Select>` with predefined filter options:
- Failed Login Attempts - Last 7 Days
- User Deactivations - Last 30 Days
- Approval Authority Changes
- Master Data Changes - Last 7 Days
- (etc.)

Each preset sets multiple filter values (e.g., action, date range)

---

## New API Services Required

**File:** `web/src/lib/api/audit.ts`

```typescript
// Types
export interface AuditRecord {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  ipAddress: string | null;
  timestamp: string;
}

export interface AuditActivityList {
  items: AuditRecord[];
  meta: PaginationMeta; // Reuse from users.ts
}

export interface AuditFilters {
  fromDate?: string;
  toDate?: string;
  userId?: number;
  entityType?: string;
  action?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UserActivitySummary {
  userId: number;
  username: string;
  displayName: string;
  totalActions: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  mostCommonAction: string;
  actionCounts: Record<string, number>;
}

// API Functions
export async function getAuditActivity(filters?: AuditFilters): Promise<AuditActivityList>
export async function getEntityAuditTrail(entityType: string, entityId: number): Promise<AuditActivityList>
export async function getEntityHistory(entityType: string, entityId: number, asOfDate?: string): Promise<unknown>
export async function getLoginHistory(filters?: { fromDate?: string; toDate?: string }): Promise<AuditActivityList>
export async function getUserActivitySummary(userId: number): Promise<UserActivitySummary>
export async function exportAuditTrail(filters?: AuditFilters): Promise<Blob>
```

**Pattern:** Same as existing API services (uses `get<T>()`, `apiClient()` with `isBinaryResponse`)

---

## New Types Required

**File:** `web/src/types/audit.ts` (or inline in `web/src/lib/api/audit.ts`)

- `AuditRecord` - Single audit log entry
- `AuditActivityList` - Paginated list of audit records
- `AuditFilters` - Filter parameters for audit queries
- `UserActivitySummary` - Summary stats for a user
- `EntityType` - Union type of all auditable entities:
  ```typescript
  export type EntityType =
    | 'User'
    | 'Role'
    | 'ApprovalAuthority'
    | 'Batch'
    | 'Instrument'
    | 'Portfolio'
    | 'AssetManager'
    | 'IndexPrice'
    | 'Duration'
    | 'Beta'
    | 'CreditRating'
    | 'CustomHolding';
  ```
- `AuditAction` - Union type of all tracked actions (user.created, user.updated, etc.)

---

## Dependencies Verified

### Story 1: User Authentication ✅
- `getCurrentUser()` exists
- `AuthUser` type includes `roles` and `permissions`
- JWT token handling in place
- RBAC infrastructure ready

### Story 3: User Lifecycle Management ✅
- User CRUD operations generate audit records (backend responsibility)
- User data types available for reference
- Export pattern established

### Story 4: Role Assignment ✅
- Role management operations generate audit records (backend responsibility)
- Role types available for filtering
- Modal patterns established

### Story 5: Approval Authority Config ✅
- Approval authority operations generate audit records (backend responsibility)
- Authority types available for filtering
- Multi-level configuration patterns established

---

## Potential Risks / Notes

### 1. Real-Time Updates Implementation
**Risk:** Story requires "new audit record appears within 5 seconds" (AC line 71)

**Options:**
- **Polling:** `setInterval()` to call `getAuditActivity()` every 5 seconds when no date filter is set
- **WebSocket:** More efficient but requires backend support
- **Server-Sent Events:** Alternative to WebSocket

**Recommendation:** Start with polling (simplest), verify with user if WebSocket is needed

### 2. Date Range Picker UI
**Note:** No existing date range component - will need to build or use Shadcn date picker

**Options:**
- Two separate `<Input type="date">` fields (start, end) - **Simplest**
- Shadcn date range picker component (if available via MCP)
- Third-party library (react-day-picker)

**Recommendation:** Start with two date inputs (matches existing pattern in roles page), add preset dropdown for common ranges

### 3. Before/After Value Display
**Note:** Temporal table data may be complex (JSON blobs)

**Recommendation:**
- Parse JSON and display as table with "Field | Before | After" columns
- For simple values, show inline: "Email changed from 'old@company.com' to 'new@company.com'"
- For complex objects, show JSON diff with syntax highlighting (consider `react-json-view` or similar)

### 4. Performance with Large Datasets
**Note:** AC line 83-84: "10,000+ matching records" should paginate within 1 second

**Recommendation:**
- Rely on backend pagination (already implemented via `PaginationMeta`)
- Default page size: 50 records
- Infinite scroll or "Load More" button for UX

### 5. Point-in-Time Queries (AC line 63)
**Note:** "View as of date: 2025-12-01" requires temporal table `FOR SYSTEM_TIME AS OF` query

**Recommendation:**
- Add "View as of date" input in entity-specific audit trail modal
- Call `getEntityHistory(entityType, entityId, asOfDate)` API
- Display snapshot of entity state at that date

### 6. Export Permission Check
**Implementation:**
```typescript
const canExport = currentUser?.roles.includes('Administrator') || false;
// Analyst with audit.view can VIEW but cannot EXPORT per AC line 75
```

### 7. IP Address Display
**Note:** All audit records include IP address (AC line 61, line 100)

**Recommendation:** Add "IP Address" column to table, include in export

---

## Discovered Impacts

### Impact 6.1: Missing Audit API Endpoints in OpenAPI Spec
**Severity:** Critical
**Status:** ⚠️ NEEDS USER CONFIRMATION

**Description:** The story references 6 audit endpoints (AC lines 86-95), but we have not verified if these exist in the OpenAPI spec at `documentation/`.

**Required Endpoints:**
1. `GET /v1/audit/activity` - Get user activity log with filtering
2. `GET /v1/audit/entity/{entityType}/{entityId}` - Get audit trail for specific entity
3. `GET /v1/audit/entity/{entityType}/{entityId}/history` - Get temporal table history
4. `GET /v1/audit/logins` - Get login attempt history
5. `GET /v1/audit/summary/user/{userId}` - Get activity summary for a user
6. `GET /v1/audit/export` - Export filtered audit trail to Excel

**Action Required:**
- User to confirm these endpoints exist in OpenAPI spec or backend implementation
- If missing from spec, add to spec before SPECIFY phase
- If backend is not ready, IMPLEMENT phase will need to use mocked data

**BLOCKER:** Cannot proceed to SPECIFY until API contract is confirmed

---

## Summary

**Reuse:** 85% of infrastructure exists (auth, API client, UI components, admin patterns, export, RBAC, table, filters, modals, types, test patterns)

**Build New:** 15% (audit API services, audit page component, date range picker, audit-specific types)

**Next Steps:**
1. **User to confirm:** Audit API endpoints exist and match OpenAPI spec
2. **If spec missing:** Define audit endpoints in OpenAPI spec
3. **Once confirmed:** Transition to SPECIFY phase to write tests

**Estimated Complexity:** Story 6 is rated **8 story points** due to:
- Complex filtering (5 filter types)
- Temporal table queries
- Point-in-time views
- Export with permission checks
- Real-time updates
- Dual data sources (UserActivityLog + temporal tables)

However, with existing infrastructure, implementation should be straightforward - primarily adding a new page and API service layer.

---

**End of REALIGN Report**
