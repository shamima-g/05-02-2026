# SPECIFY Report: Epic 1, Story 5 - Approval Authority Configuration

**Date:** 2026-02-10
**Phase:** SPECIFY → IMPLEMENT
**Status:** ✅ Complete

## Summary

Created comprehensive failing tests for Story 5: Approval Authority Configuration. This story adds a third tab to the existing `/admin/roles` page for configuring approval authorities at each level (L1, L2, L3), managing backup approvers, out-of-office status, and approval rules.

## Test Coverage

### Test File Created
- `web/src/__tests__/story-5-approval-authority-configuration.test.tsx` (26 test cases)

### Supporting API Module Created
- `web/src/lib/api/approval-authority.ts` (API client for approval authority endpoints)

## Test Cases by Acceptance Criteria

### Happy Path - View Approval Authority (5 tests)
- ✅ Displays Approval Authority Config tab as third tab on Role & Permission Management screen
- ✅ Displays three level sections when Approval Authority Config tab is clicked
- ✅ Displays focus description for Level 1 section
- ✅ Displays list of primary approvers with names, roles, and status
- ✅ Displays approval rules options for each level section

**Coverage:** All "View Approval Authority" criteria covered

### Add Primary Approver (3 tests)
- ✅ Opens modal to add approver when Add Approver button is clicked
- ✅ Adds user with Approver Level 1 role as Level 1 approver with effective date
- ✅ Allows designating approver as backup approver via checkbox

**Coverage:** Modal display, role validation, effective date handling, backup checkbox

### Add Approver - Validation (2 tests)
- ✅ Shows error when user does not have appropriate approver role
- ✅ Shows error when effective from date is empty

**Coverage:** Role validation error, required field validation

### Remove Primary Approver (3 tests)
- ✅ Shows confirmation dialog when Remove Selected button is clicked
- ✅ Removes approver and marks as inactive when Confirm is clicked
- ✅ Shows warning when approver has pending approvals

**Coverage:** Confirmation dialog, deactivation, pending approvals warning

### Configure Backup Approvers (3 tests)
- ✅ Opens Configure Backup Approvers modal when button is clicked
- ✅ Displays table with primary approvers mapped to backup approvers
- ✅ Allows editing backup approvers for a primary approver

**Coverage:** Modal display, backup mapping table, multi-select backup assignment

### Configure Backup Approvers - Validation (2 tests)
- ✅ Shows error when backup approver has lower approval level
- ✅ Displays backup rules in Configure Backup Approvers modal

**Coverage:** Level validation, backup routing rules display

### Out of Office Designation (1 test)
- ✅ Displays out-of-office status with return date and backup name

**Coverage:** OOO status display with backup information

### Approval Rules Configuration (3 tests)
- ✅ Selects "Any one approver can approve" rule for Level 1
- ✅ Selects "Specific approver assigned per batch" rule for Level 2
- ✅ Selects "Requires consensus from 2+ approvers" rule for Level 3

**Coverage:** All three approval rule types, rule selection and saving

### Save Configuration (2 tests)
- ✅ Displays success message when Save Approval Authority Configuration is clicked
- ✅ Displays note that changes apply to new batches only

**Coverage:** Save success feedback, batch preservation note

### Authorization Check (1 test)
- ✅ Shows access denied error for non-admin users

**Coverage:** Admin-only access restriction

### Accessibility (1 test)
- ✅ Has no accessibility violations on Approval Authority Config tab

**Coverage:** vitest-axe accessibility validation

## Acceptance Criteria Not Directly Tested

The following criteria are backend behaviors that will be validated through E2E testing:

1. **Automatic batch routing to backup when primary is OOO** - Backend logic, not directly testable in component tests
2. **Batches route back to primary when return date passes** - Backend logic
3. **New batches include new approvers after configuration save** - Backend integration
4. **In-progress batches retain original approvers after configuration change** - Backend data integrity
5. **Audit trail records creation** - Backend database records

These behaviors are referenced in the test mocks (e.g., `isOutOfOffice`, `pendingApprovalCount`) and will be validated during backend implementation and E2E testing.

## Expected Failures (TDD Red Phase)

All 25 tests (excluding authorization check) are expected to fail with:
- `Unable to find role="tab" and name="/approval authority config/i"` - Tab doesn't exist yet
- Component imports will succeed (approval-authority API module created)

**Status:** ✅ All tests fail as expected - TDD red phase successful

## Test Quality Validation

```
✅ No test quality issues found!
```

All tests follow project testing standards:
- Use accessibility-first queries (`getByRole`, `getByText`, `getByLabelText`)
- Test user-observable behavior, not implementation details
- Mock only external dependencies (API client)
- Import real components (will fail until implemented)
- No error suppressions (`eslint-disable`, `@ts-ignore`)

## Build & Lint Status

- ✅ Lint passes (no errors)
- ✅ Build passes (Next.js production build successful)

## API Client Module

Created `web/src/lib/api/approval-authority.ts` with the following functions:

| Function | Purpose |
|----------|---------|
| `listApprovalAuthorities` | GET all approval authorities (with level/activeOnly filters) |
| `assignApprovalAuthority` | POST new approval authority |
| `updateApprovalAuthority` | PUT update (e.g., mark OOO) |
| `removeApprovalAuthority` | DELETE deactivate |
| `configureBackupApprovers` | POST configure backup approvers |
| `getApprovalRules` | GET approval rules config |
| `updateApprovalRules` | PUT update approval rules |

All types derived from OpenAPI spec `ApprovalAuthority` endpoints.

## Workflow State

Successfully transitioned from SPECIFY to IMPLEMENT:

```json
{
  "status": "ok",
  "epic": 1,
  "story": 5,
  "phase": "IMPLEMENT"
}
```

## Next Steps for IMPLEMENT Phase

The developer agent should:

1. Add third tab "Approval Authority Config" to existing `/admin/roles` page
2. Implement three level sections (L1, L2, L3) with focus descriptions
3. Create "Add Approver" modal with user selection, effective date, backup checkbox
4. Add role validation (user must have appropriate approver role for level)
5. Implement "Remove Selected" with confirmation dialog and pending approvals warning
6. Create "Configure Backup Approvers" modal with primary→backup mapping
7. Add backup level validation (same or higher level required)
8. Display out-of-office status with return date and backup name
9. Implement approval rules radio buttons for each level
10. Add "Save Approval Authority Configuration" button with success message
11. Display note: "Changes apply to NEW batches only. In-progress batches retain original approver assignments."
12. After implementation, commit tests AND implementation together (TDD green phase)

## Files Modified/Created

### Created
- `web/src/__tests__/story-5-approval-authority-configuration.test.tsx` (1,684 lines)
- `web/src/lib/api/approval-authority.ts` (203 lines)
- `generated-docs/specify-report-epic1-story5.md` (this file)

### To Be Modified (IMPLEMENT phase)
- `web/src/app/admin/roles/page.tsx` (add third tab and approval authority configuration UI)

## Notes

- Tests intentionally left UNCOMMITTED (will be committed with implementation after IMPLEMENT phase)
- All tests fail as expected (TDD red phase) - components don't exist yet
- Test quality validation passes
- Lint and build pass (excluding expected failures in new tests)
- API module created with TypeScript types from OpenAPI spec
