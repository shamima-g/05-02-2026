# Discovered Impacts

This file tracks cross-story impacts discovered during implementation.

**Last Updated:** 2026-02-06

---

## Epic 1, Story 2: Role-Based Dashboard Landing

### Impact 1: Route Mismatch - Login Redirects to `/dashboard` but Story 2 Targets `/`

**Discovered During:** REALIGN phase (Story 2)
**Source:** Epic 1, Story 1 (User Authentication - AD/LDAP)
**Affects:** Epic 1, Story 2 (Role-Based Dashboard Landing)
**Severity:** High - Blocking
**Type:** Route/Navigation Mismatch

**Description:**

Story 1's login page implementation redirects authenticated users to `/dashboard` in two places:

1. **Line 44** (`web/src/app/login/page.tsx`): Already-authenticated users are redirected via `router.replace('/dashboard')`
2. **Line 82** (`web/src/app/login/page.tsx`): After successful login, users are redirected via `router.push('/dashboard')`

However, Story 2's specification clearly states:

- **Route:** `/` (home/root page)
- **Target File:** `app/page.tsx`
- **Page Action:** `modify_existing`

Story 2's acceptance criteria also consistently refer to "home page (Dashboard)" and use the route `/` throughout.

**Current State:**

- Story 1 redirects to `/dashboard`
- Story 2 expects dashboard at `/` (root)
- Template placeholder still exists at `app/page.tsx` (lines 1-10)
- No `/dashboard` route exists in the codebase

**Recommended Resolution:**

Change Story 1's login redirects from `/dashboard` to `/`:

1. Update line 44: `router.replace('/')` instead of `router.replace('/dashboard')`
2. Update line 82: `router.push('/')` instead of `router.push('/dashboard')`

**Rationale:**

Story 2's metadata is explicit and intentional:
- The dashboard IS the home page, not a separate route
- This aligns with single-purpose applications where the main feature is the landing page
- The BRD wireframe "Screen 1 - Dashboard (Role-Based Home)" confirms this is the primary interface

**Impact on Tests:**

Story 1's test file (`web/src/app/login/__tests__/page.test.tsx`) contains assertions that will fail:

- **Line 92:** `expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');`
- **Line 223:** `expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');`

Both assertions will need to change to expect `'/'` instead of `'/dashboard'`.

**Files Requiring Changes:**

1. `web/src/app/login/page.tsx` - Update redirect routes (lines 44, 82)
2. `web/src/app/login/__tests__/page.test.tsx` - Update test assertions (lines 92, 223)

**Action Required:**

Before implementing Story 2, update Story 1's implementation to redirect to `/` instead of `/dashboard`.

---

### Impact 2: Authentication Check Required for Dashboard

**Discovered During:** REALIGN phase (Story 2)
**Source:** Epic 1, Story 1 (User Authentication - AD/LDAP)
**Affects:** Epic 1, Story 2 (Role-Based Dashboard Landing)
**Severity:** Medium - Required Integration
**Type:** Integration Pattern

**Description:**

Story 2's first acceptance criterion states:

> Given I am authenticated, when I navigate to `/`, then I see the dashboard with the welcome message "Welcome, [My Display Name] - [My Roles]"

The dashboard at `/` (home page) must verify the user is authenticated before rendering role-based content.

**Required Implementation:**

The dashboard page (`app/page.tsx`) must:

1. Check for valid authentication (using `getCurrentUser()` from `@/lib/api/auth`)
2. If not authenticated, redirect to `/login`
3. If authenticated, fetch user data and display role-based dashboard

**Available Auth Infrastructure from Story 1:**

- `getCurrentUser()` - Returns `AuthUser` with `displayName` and `roles[]`
- `useSession()` hook - Tracks session expiry and activity
- Session timeout utilities - 30-minute inactivity timeout

**Example Integration Pattern:**

```typescript
// In app/page.tsx
useEffect(() => {
  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      // User is authenticated, display dashboard
    } catch {
      // Not authenticated, redirect to login
      router.push('/login');
    }
  };
  checkAuth();
}, []);
```

**User Data Required for Story 2:**

From the acceptance criteria, the dashboard needs:
- `displayName` - For "Welcome, [My Display Name]"
- `roles[]` - For "Welcome, [My Display Name] - [My Roles]"

Both are available in the `AuthUser` type returned by `getCurrentUser()`.

**Action Required:**

Integrate `getCurrentUser()` check in Story 2's dashboard implementation.

---

### Impact 3: Cookie-Based Token Storage Established

**Discovered During:** REALIGN phase (Story 2)
**Source:** Epic 1, Story 1 (User Authentication - AD/LDAP)
**Affects:** Epic 1, Story 2 (Role-Based Dashboard Landing)
**Severity:** Low - Informational
**Type:** Architecture Pattern

**Description:**

Story 1 established a cookie-based token storage pattern:

```typescript
// In web/src/app/login/page.tsx, lines 75-76
document.cookie = `accessToken=${response.accessToken}; path=/; max-age=${response.expiresIn}`;
document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=${response.expiresIn * 2}`;
```

**Impact on Story 2:**

The API client (`@/lib/api/client.ts`) will automatically include these cookies in requests to:
- `/v1/dashboard/pending-actions`
- `/v1/batches?status=active`
- `/v1/dashboard/activity`
- `/v1/dashboard/data-quality-summary`

No additional authentication setup is required in Story 2's dashboard implementation. The existing infrastructure will handle authorization headers.

**Action Required:**

None - informational only. Confirm token-based auth is already handled by existing infrastructure.

---

## Instructions

When processing impacts:
1. Read this file before implementing each story (REALIGN phase)
2. Check if any impacts affect the current story
3. Propose story revisions if needed
4. Remove impacts from this file after processing
