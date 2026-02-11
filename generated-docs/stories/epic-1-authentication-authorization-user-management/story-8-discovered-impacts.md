# Story 8: Login Activity Monitoring - REALIGN Analysis

**Epic:** Authentication, Authorization & User Management | **Story:** 8 of 8

**Analysis Date:** 2026-02-11

---

## Executive Summary

Story 8 (Login Activity Monitoring) is the final story in Epic 1. This REALIGN analysis reveals that **Stories 1-7 have built substantial infrastructure** that Story 8 can leverage, including:

- Established API client patterns with audit endpoints
- Consistent page structure and component patterns
- Authorization utilities and RBAC helpers
- Session management infrastructure
- Export functionality patterns

**Key Finding:** Story 8 requires **NEW API endpoints** (`/audit/logins/*`) that are **NOT YET in the OpenAPI spec**. These endpoints must be added to `documentation/openapi.yaml` before implementation begins.

---

## 1. Existing Infrastructure to Reuse

### 1.1 API Client Infrastructure

**Location:** `web/src/lib/api/`

Story 8 should follow the established API client pattern:

#### Audit API Client (`web/src/lib/api/audit.ts`)
- **Existing:** `queryAuditTrail()`, `exportAuditTrail()`, `getUserActivity()`, `getUserHistory()`
- **Pattern to follow:** Use `get()` from `@/lib/api/client` for GET requests
- **Export pattern:** Use `apiClient()` with `isBinaryResponse: true` for Excel exports
- **Type definitions:** Existing `AuditTrailEntry`, `UserActivity`, `PaginationMeta` interfaces

#### Users API Client (`web/src/lib/api/users.ts`)
- **Existing:** `listUsers()`, `getUser()`, `getUserActivity()`, `exportUsers()`
- **Pattern to follow:** Query parameter handling with optional filters
- **Type pattern:** `UserList` with `items[]` and `meta: PaginationMeta`

**Recommendation:** Create `web/src/lib/api/login-activity.ts` following these patterns.

### 1.2 Type Definitions

**Location:** `web/src/types/`

**Existing types to reuse:**
- `PaginationMeta` from `web/src/lib/api/users.ts`
- `AuthUser` from `web/src/types/auth.ts`
- `UserDetail` from `web/src/lib/api/users.ts`

**New types needed for Story 8:**
```typescript
export interface LoginAttempt {
  id: number;
  timestamp: string; // ISO date-time
  username: string | null; // null if user doesn't exist
  userId: number | null;
  isSuccessful: boolean;
  failureReason: string | null; // "Invalid password", "User not found", etc.
  ipAddress: string;
  location: string | null; // "New York" or "Unknown"
  userAgent: string;
  isNewLocation: boolean;
  isImpossibleTravel: boolean;
}

export interface LoginActivityList {
  items: LoginAttempt[];
  meta: PaginationMeta;
  summary: {
    successfulLogins: number;
    failedAttempts: number;
    lockedAccounts: number;
  };
}

export interface SecurityAlert {
  id: number;
  type: 'brute_force' | 'account_locked' | 'new_location' | 'impossible_travel' | 'rate_limit';
  severity: 'low' | 'medium' | 'high';
  message: string;
  ipAddress: string | null;
  username: string | null;
  detectedAt: string;
}
```

### 1.3 Authorization Patterns

**Location:** `web/src/lib/auth/`

**Existing utilities:**
- `hasRole()` from `auth-helpers.ts` - Use to check Administrator role
- `getCurrentUser()` from `web/src/lib/api/auth.ts` - Get current user for auth checks

**Pattern from Story 7 (Session Management):**
```typescript
// In page component useEffect
const user = await getCurrentUser();
if (!user.roles.includes('Administrator')) {
  setAccessDenied(true);
  router.replace('/');
  return;
}
```

**Recommendation:** Use identical authorization pattern in Story 8 login-activity page.

### 1.4 Page Structure Pattern

**Location:** `web/src/app/admin/users/`

**Existing pattern from User Administration:**

1. **Server component page** (`page.tsx`) that imports client component
2. **Client component** (`users-client.tsx`) with:
   - Authorization check in `useEffect`
   - Loading state with skeleton UI
   - Access denied state with error message
   - Table with filters and search
   - Export button
   - Modal dialogs for details

**Pattern to replicate:**
```typescript
// page.tsx (server component)
export default function LoginActivityPage() {
  return <LoginActivityClient />;
}

// login-activity-client.tsx
'use client';
export default function LoginActivityClient() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser();
      if (!user.roles.includes('Administrator')) {
        setAccessDenied(true);
        router.replace('/');
        return;
      }
      // Load data...
    }
    init();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (accessDenied) return <AccessDeniedMessage />;
  return <ActualContent />;
}
```

### 1.5 Component Patterns

**Location:** `web/src/components/ui/`

**Existing Shadcn components used in User Administration:**
- `Table`, `TableHeader`, `TableRow`, `TableCell`
- `Button`, `Input`, `Label`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Badge` - Use for status indicators (Success/Failed)

**New components needed:**
- Alert banner component for security alerts (can use existing `Badge` with custom styling)

### 1.6 Export Functionality Pattern

**Location:** `web/src/app/admin/users/users-client.tsx` (lines 321-338)

**Pattern to reuse:**
```typescript
const handleExport = async () => {
  setIsSaving(true);
  setOperationError(null);

  try {
    const blob = await exportLoginActivity(); // New function
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'login-activity.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    setOperationError('Failed to export login activity. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

### 1.7 Session Management Integration

**Location:** `web/src/lib/auth/session.ts`

**Existing utilities:**
- `logout()` - Clears session and redirects to login
- `logActivity()` from `web/src/lib/api/auth.ts` - Logs user actions

**Note:** Login attempts are logged by the **backend authentication service**, NOT by frontend calls to `logActivity()`. The frontend displays this data but doesn't create it.

---

## 2. New Infrastructure Needed

### 2.1 API Endpoints (NOT in OpenAPI spec yet)

**Critical Issue:** Story 8 requires the following endpoints that are **MISSING from `documentation/openapi.yaml`:**

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/v1/audit/logins` | Get login attempt history with filtering | **MISSING** |
| GET | `/v1/audit/logins/failed` | Get only failed login attempts | **MISSING** |
| GET | `/v1/audit/logins/user/{userId}` | Get login history for specific user | **MISSING** |
| GET | `/v1/audit/logins/alerts` | Get security alerts | **MISSING** |
| GET | `/v1/audit/logins/export` | Export login activity to Excel | **MISSING** |
| POST | `/v1/users/{userId}/unlock` | Manually unlock locked account | **MISSING** |

**Action Required:** Add these endpoints to `documentation/openapi.yaml` with:
- Request/response schemas
- Query parameter definitions (filters, date ranges, pagination)
- Error responses (401, 403, 404, 500)

### 2.2 New API Client File

**File:** `web/src/lib/api/login-activity.ts`

Should include:
```typescript
export async function getLoginActivity(filters: LoginActivityFilters): Promise<LoginActivityList>
export async function getFailedLogins(filters: LoginActivityFilters): Promise<LoginActivityList>
export async function getUserLoginHistory(userId: number, filters?: LoginActivityFilters): Promise<LoginActivityList>
export async function getSecurityAlerts(): Promise<SecurityAlert[]>
export async function exportLoginActivity(filters: LoginActivityFilters): Promise<Blob>
export async function unlockUserAccount(userId: number, lastChangedUser: string): Promise<UserDetail>
```

### 2.3 Filter Component

**File:** `web/src/components/login-activity/LoginActivityFilters.tsx` (NEW)

Should support:
- Date range picker (preset options: Today, Last 7 days, Last 30 days, Custom)
- Status filter dropdown (All, Success, Failed)
- User filter with autocomplete/search
- IP address filter input

### 2.4 Security Alert Banner Component

**File:** `web/src/components/login-activity/SecurityAlertBanner.tsx` (NEW)

Display alerts:
- Multiple failed login attempts from same IP
- Account locked due to failed attempts
- Brute force attack detection
- Impossible travel detection

---

## 3. Potential Conflicts

### 3.1 User Administration Integration

**Location:** `web/src/app/admin/users/users-client.tsx`

**Story 8 Requirement (AC #81):**
> Given I am on the User Administration screen, when I click "[📋 View Login Activity]", then I am navigated to the Login Activity Report

**Current state:** User Administration page (`users-client.tsx`) does NOT have a "View Login Activity" button.

**Action Required:**
- Add button to User Administration page header (near "Export User List" and "+ Add New User")
- Button should navigate to `/admin/users/login-activity`

**Code change needed:**
```typescript
// In web/src/app/admin/users/users-client.tsx
// Add button in header section (around line 460)
<Button
  onClick={() => router.push('/admin/users/login-activity')}
  variant="outline"
  aria-label="View Login Activity"
>
  📋 View Login Activity
</Button>
```

### 3.2 View User Modal - Activity Log Tab

**Location:** `web/src/app/admin/users/users-client.tsx` (lines 909-981)

**Story 8 Requirement (AC #72-74):**
> Given I am viewing a user's login history, when I see multiple failed attempts, then I can identify potential security issues

**Current state:** View User Details modal has an "Activity Log" tab that shows general user activity (from `getUserActivity()`), NOT login-specific activity.

**Action Required:**
- The existing Activity Log tab shows ALL user actions (approvals, edits, etc.)
- Login activity should be shown in a SEPARATE tab: "Login History"
- Add new tab to View User Details modal with login-specific data

**Code change needed:**
```typescript
// In View User Details Modal (around line 917)
<TabsList>
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="activity">Activity Log</TabsTrigger>
  <TabsTrigger value="loginHistory">Login History</TabsTrigger> {/* NEW */}
  <TabsTrigger value="permissions">Permissions</TabsTrigger>
  <TabsTrigger value="audit">Audit Trail</TabsTrigger>
</TabsList>

<TabsContent value="loginHistory" className="space-y-3 mt-4">
  {/* Show user-specific login attempts with success/failure status */}
</TabsContent>
```

---

## 4. Recommendations

### 4.1 Implementation Order

1. **First:** Update `documentation/openapi.yaml` with missing login activity endpoints
2. **Second:** Create type definitions in `web/src/lib/api/login-activity.ts`
3. **Third:** Create API client functions following existing patterns
4. **Fourth:** Create standalone login activity page (`/admin/users/login-activity`)
5. **Fifth:** Add "View Login Activity" button to User Administration page
6. **Sixth:** Add "Login History" tab to View User Details modal

### 4.2 Patterns to Follow

#### Date Range Filtering
- Use ISO date strings (YYYY-MM-DD format)
- Preset options: "Today", "Last 7 days", "Last 30 days", "Custom"
- Store filter state in component state, pass to API as query params

#### Pagination
- Reuse existing `PaginationMeta` type
- Default page size: 50 records (login activity can be high-volume)
- Show pagination controls at bottom of table

#### Real-Time Updates (AC #69-70)
- Use `setInterval()` to refresh data every 5 seconds when "Today" filter is active
- Clear interval when component unmounts
- Only auto-refresh if user hasn't manually filtered/searched

#### Geolocation Display
- Corporate IPs (192.168.x.x): Show "New York" or configured office location
- External IPs: Show geolocation API result (city, country)
- Unknown: Show "Unknown" if geolocation fails

#### Security Alert Detection
- Backend should return alerts via `/audit/logins/alerts` endpoint
- Display alert banner at top of page if alerts exist
- Color-code by severity: Red (high), Orange (medium), Yellow (low)

### 4.3 Test Coverage

**Existing test patterns to follow:**
- Authorization tests: User with/without Administrator role
- Loading state tests: Loading skeleton visible during data fetch
- Filter tests: Date range, status, user filters work correctly
- Export tests: Excel file downloads with correct filename
- Error handling: API errors display error messages

**New test scenarios for Story 8:**
- Security alert banner visibility based on alert data
- Failed login attempts display failure reasons
- Account lockout indicator visible for locked accounts
- IP address geolocation display logic
- Suspicious activity flags (new location, impossible travel)

### 4.4 Performance Considerations

**Story 8 AC #84-85 (Performance):**
- Query last 30 days: Results load within 2 seconds
- Pagination: Next page loads within 1 second

**Recommendations:**
- Add loading indicators for long-running queries
- Use pagination with reasonable page size (50 records)
- Consider adding indexes to backend UserLoginLog table on: timestamp, userId, ipAddress, isSuccessful
- Cache geolocation results for frequently-seen IPs

---

## 5. Dependencies Resolved

**Story 1 (User Authentication):**
- ✅ Login functionality generates login log records (backend responsibility)
- ✅ Authentication flow is complete

**Story 3 (User Lifecycle Management):**
- ✅ User records exist with IDs that can be linked to login attempts
- ✅ User Administration page exists and can be modified

**Story 7 (Session Management):**
- ✅ Session timeout and logout functionality logs activity
- ✅ `logout()` function already calls `logActivity()` for audit trail

---

## 6. Open Questions for User

1. **OpenAPI Spec:** Should I generate the missing `/audit/logins/*` endpoints in `documentation/openapi.yaml` before proceeding to SPECIFY phase?

2. **Geolocation Service:** Do you have a preferred IP geolocation API (MaxMind GeoLite2, IP-API, etc.), or should the backend mock this for now?

3. **Account Lockout Configuration:** Story 8 notes mention "3 consecutive failed attempts" and "15-minute lockout" are configurable. Should these be admin-configurable settings, or hardcoded constants?

4. **Real-Time Updates:** AC #69-70 require "new login appears within 5 seconds". Should this use:
   - Polling with `setInterval()` (simpler, works with current REST API)
   - WebSocket/SSE (more efficient, requires backend changes)

5. **Integration with User Administration:** Should the "View Login Activity" button open the login activity page in a new tab, or navigate in the same window?

---

## Summary

Story 8 can leverage significant infrastructure from Stories 1-7, particularly:
- API client patterns and utilities
- Authorization and RBAC helpers
- Page structure and component patterns
- Export functionality

**Critical blocker:** Missing API endpoints in OpenAPI spec must be added before implementation.

**Minor integrations needed:** Add navigation button to User Administration page and new tab to View User Details modal.

**Recommended approach:** Follow existing patterns closely to maintain consistency across Epic 1.

---

**Next Step:** Transition to SPECIFY phase after OpenAPI endpoints are added.
