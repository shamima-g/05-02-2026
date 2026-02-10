# REALIGN Report - Epic 1, Story 5: Approval Authority Configuration

**Generated:** 2026-02-10
**Phase:** REALIGN
**Story:** Approval Authority Configuration

## Executive Summary

Story 5 builds upon the existing `/admin/roles` page (Stories 4) to add a third tab for approval authority configuration. The existing codebase has solid foundations (authentication from Story 1, user management from Story 3, role assignment from Story 4), but the OpenAPI spec has **critical gaps** that must be addressed before implementation.

**Status:** ⚠️ **READY WITH API SPEC UPDATES REQUIRED**

## 1. Existing Infrastructure Analysis

### ✅ What Exists and Works

**Story 1 - User Authentication:**
- `getCurrentUser()` API function available
- Admin role check implemented and tested
- Auth context provider available

**Story 3 - User Lifecycle Management:**
- `listUsers()` API function with filtering support
- `UserDetail` type includes roles, department, status
- User search and filtering infrastructure

**Story 4 - Role Assignment:**
- `/admin/roles` page at `app/admin/roles/page.tsx`
- Two tabs already implemented:
  - "Role Definitions" (view roles and permissions)
  - "User Role Assignments" (modify user roles)
- Role data types: `RoleWithPermissions`, `Permission`
- API functions: `listRoles()`, `getRoleWithPermissions()`, `getUsersWithRole()`
- Existing UI components: `Tabs`, `Dialog`, `Table`, `Select`, `Card`, `Badge`
- Admin-only access enforcement working
- Audit trail support via `lastChangedUser` parameter

**Shared Components:**
- All Shadcn UI components needed are already imported/available
- Form validation patterns established
- Modal interaction patterns working

### 🔧 What Needs to Be Built

**New Tab Component:**
- Add "Approval Authority Config" as third tab to existing `/admin/roles` page
- Three level sections (Level 1, Level 2, Level 3) with:
  - Focus descriptions per level
  - Primary approvers list with status indicators
  - Approval rules radio buttons
  - Backup approver configuration
  - Out-of-office designation display

**New API Client Functions:**
- `approval-authorities.ts` file with TypeScript types and API wrappers
- Functions for all CRUD operations on approval authority
- Functions for backup approver configuration
- Functions for active approvers retrieval

**New UI Components:**
- ApprovalLevelSection component (reusable for all 3 levels)
- BackupApproverConfigModal
- AddApproverModal with role validation
- Out-of-office status indicators

## 2. API Spec Analysis

### ❌ Critical API Gaps

The OpenAPI spec at `documentation/openapi.yaml` has approval authority endpoints **but they don't match Story 5 requirements**:

**Existing Endpoints (lines 550-655):**
```yaml
GET    /approval-authorities          # List all (with level/activeOnly filters)
POST   /approval-authorities          # Create new
DELETE /approval-authorities/{id}     # Delete
GET    /approval-authorities/by-level/{level}  # Get by level
```

**Missing from OpenAPI spec:**

1. **PUT `/approval-authorities/{id}`** - Story 5 requires updating approval authority (e.g., mark out-of-office, change effective dates)
   - Story acceptance criteria lines 48-50: OOO status, automatic routing to backup
   - Story endpoint table line 83: `PUT /v1/approval-authority/{id}`

2. **POST `/approval-authorities/{id}/backup`** - Story 5 requires configuring backup approvers
   - Story acceptance criteria lines 38-45: Configure backup approvers, validation
   - Story endpoint table line 85: `POST /v1/approval-authority/{id}/backup`

3. **GET `/approval-authorities/active`** - Story 5 requires getting currently active approvers per level
   - Story acceptance criteria lines 71-72: Real-time effect for future batches
   - Story endpoint table line 86: `GET /v1/approval-authority/active`

4. **Missing schemas for:**
   - `UpdateApprovalAuthorityRequest` (for PUT endpoint)
   - `ConfigureBackupRequest` (for backup configuration)
   - `ApprovalRulesConfiguration` (for "any one", "specific", "consensus" rules)

5. **Incomplete `ApprovalAuthorityEntry` schema (lines 2361-2393):**
   - Missing: `roleName` (display name of user's role)
   - Missing: `backupApproverId` (reference to backup approver)
   - Missing: `isOutOfOffice` (current OOO status)
   - Missing: `outOfOfficeUntil` (return date)
   - Missing: `approvalRule` (which rule applies to this level)

6. **Missing validation in `CreateApprovalAuthorityRequest`:**
   - No `roleId` field to validate user has appropriate approver role (Story AC line 29)
   - No way to specify backup approver relationship

### 🔧 Required OpenAPI Spec Updates

**Before implementing Story 5, the OpenAPI spec must be updated with:**

1. **Add PUT endpoint:**
```yaml
/approval-authorities/{id}:
  put:
    tags: [ApprovalAuthority]
    summary: Update approval authority
    description: Update approval authority record (e.g., mark out-of-office)
    parameters:
      - $ref: '#/components/parameters/IdParam'
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/UpdateApprovalAuthorityRequest'
    responses:
      '200':
        description: Authority updated
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApprovalAuthorityEntry'
```

2. **Add backup configuration endpoint:**
```yaml
/approval-authorities/{id}/backup:
  post:
    tags: [ApprovalAuthority]
    summary: Configure backup approver
    description: Set backup approver for primary approver
    parameters:
      - $ref: '#/components/parameters/IdParam'
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ConfigureBackupRequest'
    responses:
      '200':
        description: Backup configured
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApprovalAuthorityEntry'
```

3. **Add active approvers endpoint:**
```yaml
/approval-authorities/active:
  get:
    tags: [ApprovalAuthority]
    summary: Get currently active approvers
    description: Get all active approvers per level (excludes OOO and inactive)
    responses:
      '200':
        description: Active approvers by level
        content:
          application/json:
            schema:
              type: object
              properties:
                level1:
                  type: array
                  items:
                    $ref: '#/components/schemas/ApproverSummary'
                level2:
                  type: array
                  items:
                    $ref: '#/components/schemas/ApproverSummary'
                level3:
                  type: array
                  items:
                    $ref: '#/components/schemas/ApproverSummary'
```

4. **Add schemas:**
```yaml
UpdateApprovalAuthorityRequest:
  type: object
  properties:
    isActive:
      type: boolean
    isOutOfOffice:
      type: boolean
    outOfOfficeUntil:
      type: string
      format: date
      nullable: true
    effectiveTo:
      type: string
      format: date
      nullable: true

ConfigureBackupRequest:
  type: object
  properties:
    backupUserId:
      type: integer
  required: [backupUserId]

ApprovalRulesConfig:
  type: object
  properties:
    level:
      type: integer
      enum: [1, 2, 3]
    rule:
      type: string
      enum: [any_one, specific_assignee, consensus]
    consensusRequired:
      type: integer
      nullable: true
      description: "Number of approvals required if rule=consensus"
```

5. **Expand `ApprovalAuthorityEntry` schema:**
```yaml
ApprovalAuthorityEntry:
  type: object
  properties:
    id:
      type: integer
    userId:
      type: integer
    username:
      type: string
    displayName:
      type: string
    email:
      type: string
      nullable: true
    roleName:
      type: string
      description: "User's role name (e.g., 'Approver Level 1')"
    approvalLevel:
      type: integer
      enum: [1, 2, 3]
    isBackup:
      type: boolean
    isActive:
      type: boolean
    isOutOfOffice:
      type: boolean
    outOfOfficeUntil:
      type: string
      format: date
      nullable: true
    backupApproverId:
      type: integer
      nullable: true
      description: "User ID of backup approver for this primary approver"
    backupApproverName:
      type: string
      nullable: true
      description: "Display name of backup approver"
    effectiveFrom:
      type: string
      format: date
    effectiveTo:
      type: string
      format: date
      nullable: true
    assignedBy:
      type: string
    assignedAt:
      type: string
      format: date-time
```

6. **Add validation error responses:**
   - Error code for "User does not have appropriate approver role" (Story AC line 29)
   - Error code for "Backup approver must have same or higher level" (Story AC line 44)
   - Error code for "User has pending approvals, cannot remove" (Story AC line 35)

## 3. Discovered Impacts on Other Stories

### No Impacts on Previous Stories

Story 5 is purely additive:
- Adds a new tab to existing page (doesn't modify Stories 1-4 functionality)
- Uses existing auth, user management, and role infrastructure
- No changes required to acceptance criteria for Stories 1-4

### Potential Future Story Impacts

**Story 6 (Batch Creation & Workflow)** will depend on:
- Approval authority configuration being available
- Active approvers endpoint working
- Batch assignment to specific approvers (if "specific approver" rule is configured)

**Story 7 (Multi-Level Approval Workflow)** will depend on:
- Backup approver routing logic
- Out-of-office status checking
- Approval rules configuration (any one, specific, consensus)

## 4. Implementation Approach Recommendations

### Phase 1: OpenAPI Spec Updates (BEFORE coding)
1. Update `documentation/openapi.yaml` with all missing endpoints and schemas above
2. Commit spec changes separately for traceability
3. Document the additions in a spec changelog or commit message

### Phase 2: TypeScript Types & API Client
1. Create `web/src/lib/api/approval-authorities.ts` with:
   - TypeScript interfaces matching OpenAPI schemas
   - API wrapper functions for all endpoints
   - Proper error handling and audit trail parameters

### Phase 3: UI Components
1. Extend `app/admin/roles/page.tsx`:
   - Add third tab "Approval Authority Config"
   - Create state management for approval authorities
2. Build reusable components:
   - `ApprovalLevelSection` (displays one level's configuration)
   - `AddApproverModal` (with role validation)
   - `BackupApproverConfigModal` (backup mapping UI)
   - `OutOfOfficeIndicator` (status badge)

### Phase 4: Business Logic
1. Role validation when adding approvers
2. Backup approver level validation (same or higher)
3. Pending approvals check before removal
4. Approval rules persistence
5. Effective date handling (changes apply to new batches only)

### Phase 5: Tests
1. Role validation tests
2. Backup approver configuration tests
3. Out-of-office routing tests
4. Approval rules configuration tests
5. Audit trail verification tests

## 5. Story Acceptance Criteria Revisions

### No Revisions Needed

All acceptance criteria are valid and implementable **once the OpenAPI spec is updated**. The story is well-defined with:
- Clear user-observable behaviors
- Specific validation rules
- Audit trail requirements
- Authorization checks
- Edge cases covered

**Recommendation:** Proceed to SPECIFY phase after confirming OpenAPI spec will be updated.

## 6. Dependencies Check

### ✅ All Dependencies Met

- **Story 1 (Auth):** Admin authentication working
- **Story 3 (User Management):** User listing and details available
- **Story 4 (Role Assignment):** Roles page structure ready, user-role relationship established

### 🔧 External Dependency: OpenAPI Spec

The **only blocker** is the OpenAPI spec updates. This is an external dependency that requires:
1. Backend team to implement missing endpoints
2. OpenAPI spec file to be updated
3. Spec validation before frontend implementation begins

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| OpenAPI spec not updated before implementation | **HIGH** - Cannot implement without endpoint contracts | Get spec updates approved and committed first |
| Backup approver logic complexity | **MEDIUM** - Circular dependencies, validation rules | Thorough testing of edge cases |
| Out-of-office automatic routing | **MEDIUM** - Date-based logic, timezone handling | Use date-only fields (no time), server-side validation |
| Approval rules not persisted | **LOW** - Current spec unclear where rules are stored | Clarify with backend: separate table or config field? |

## 8. Next Steps

### Before SPECIFY Phase:

1. **REQUIRED:** Update OpenAPI spec with missing endpoints and schemas
   - Present proposed spec changes to user for approval
   - Commit updated spec to `documentation/openapi.yaml`
   - Ensure backend team agrees to implement endpoints

2. **OPTIONAL:** Clarify approval rules storage:
   - Are approval rules (any one, specific, consensus) stored per-level in a separate config table?
   - Or are they batch-specific (set when batch is created)?
   - Wireframe suggests per-level configuration, but OpenAPI spec doesn't define this

3. **TRANSITION:** After spec is updated, transition to SPECIFY phase and hand off to test-generator

## Conclusion

Story 5 has **solid foundations** from previous stories but requires **critical OpenAPI spec updates** before implementation can begin. The existing `/admin/roles` page provides the perfect foundation (two tabs already working), and the new tab will integrate seamlessly.

**Recommendation:**
1. Present OpenAPI spec gaps to user
2. Get approval to update spec
3. Commit spec changes
4. Transition to SPECIFY phase

**Estimated Complexity:** 8 story points (as assigned) - accurate given approval rules logic, backup approver routing, OOO handling, temporal effective dates, and audit trail requirements.
