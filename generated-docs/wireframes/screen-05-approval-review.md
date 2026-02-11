# Screen: Approval Review Screens (3 Separate Pages)

## Purpose
Read-only view for approvers showing validation results, comments, approval history, and approve/reject actions with mandatory rejection reason. Each approval level has its own dedicated page:
- `/approvals/level-1` - Approver Level 1 only (Operations approval)
- `/approvals/level-2` - Approver Level 2 only (Portfolio Manager approval)
- `/approvals/level-3` - Approver Level 3 only (Executive approval)

Each approver role can ONLY access their specific level page. The wireframe below shows the shared layout; the header and instructions differ per level.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  Approval Review - LEVEL 2 (Portfolio Manager)                              |
|                                                                              |
|  Batch: January 2026 | Reporting Date: 2026-01-31                           |
|  Submitted for Level 2 Approval: 2026-01-06 10:45 by Analyst        |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  APPROVAL INSTRUCTIONS                                                 |  |
|  +------------------------------------------------------------------------+  |
|  |  As Portfolio Manager, please review:                                  |  |
|  |  • Holdings reasonableness and position sizes                          |  |
|  |  • Performance results vs. expectations                                |  |
|  |  • Risk metrics and exposure summaries                                 |  |
|  |  • Any explanatory comments from analysts                              |  |
|  |                                                                        |  |
|  |  Note: You are reviewing the same data validation results available    |  |
|  |  to the operations team. Data is locked and cannot be modified.        |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  PREVIOUS APPROVALS                                                    |  |
|  +------------------------------------------------------------------------+  |
|  |  ✓  Level 1 (Operations): Approved 2026-01-06 11:30 by John Smith     |  |
|  |     Comment: "All files received. 5 instruments missing ratings,       |  |
|  |               documented and acceptable for this reporting period."    |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  DATA VALIDATION SUMMARY (READ-ONLY)                                   |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  File Completeness:                    ✓  Complete                     |  |
|  |  • Asset Manager Files:  35/35 received                                |  |
|  |  • Bloomberg Files:       6/6 received                                 |  |
|  |  • Custodian Files:       4/4 received                                 |  |
|  |                                                                        |  |
|  |  Portfolio Data:                       ✓  Complete                     |  |
|  |  • 245 holdings across 5 portfolios                                    |  |
|  |  • All required data elements present                                  |  |
|  |  • Independent custodian verification complete                         |  |
|  |                                                                        |  |
|  |  Reference Data:                       ⚠  5 Outstanding Items          |  |
|  |  • Instruments: 245/245 defined                                        |  |
|  |  • Index Prices: 8/8 available                                         |  |
|  |  • Credit Ratings: 240/245 available (5 missing)                       |  |
|  |  • Risk Metrics: 241/245 complete                                      |  |
|  |  • Volatility Metrics: 242/245 complete                                |  |
|  |                                                                        |  |
|  |  [View Outstanding Items Detail]  [View Full Validation Report]        |  |
|  |                                                                        |  |
|  |  Operations Decision:                                                  |  |
|  |  "5 unrated instruments represent <1% of total portfolio value.        |  |
|  |   Acceptable to proceed for timely reporting."                         |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  CALCULATION RESULTS                                                   |  |
|  +------------------------------------------------------------------------+  |
|  |  Status: ✓ All calculations completed successfully                     |  |
|  |  Last Run: 2026-01-06 10:30 | Duration: 2m 34s                          |  |
|  |                                                                        |  |
|  |  [View Calculation Details]                                            |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  ANALYST COMMENTARY                                                    |  |
|  +------------------------------------------------------------------------+  |
|  |  Added by Sarah Johnson (Analyst) on 2026-01-06 09:15:                 |  |
|  |                                                                        |  |
|  |  "Fixed Income Fund performance -2.3% this month reflects rising       |  |
|  |   interest rate environment. Duration positioning reduced as planned.  |  |
|  |   No unexpected exposures or position changes."                        |  |
|  |                                                                        |  |
|  |  [View All Comments]                                                   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  REJECTION HISTORY (if resubmission)                                   |  |
|  +------------------------------------------------------------------------+  |
|  |  No previous rejections for this batch                                 |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  ┌────────────────────────────────────────────────────────────────────────┐ |
|  │ APPROVAL DECISION                                                      │ |
|  │                                                                        │ |
|  │  ( ) Approve - Proceed to Level 3 Approval                            │ |
|  │                                                                        │ |
|  │  ( ) Reject - Return to Data Preparation                              │ |
|  │                                                                        │ |
|  │  If rejecting, you MUST provide a reason:                             │ |
|  │  [Rejection Reason (required)...................................]      │ |
|  │  [.................................................................]      │ |
|  │  [.................................................................]      │ |
|  │                                                                        │ |
|  │  Optional Comment (visible to all subsequent approvers):              │ |
|  │  [Comment...................................................]          │ |
|  │  [.................................................................]      │ |
|  │                                                                        │ |
|  │  [Submit Decision]                                                     │ |
|  └────────────────────────────────────────────────────────────────────────┘ |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Approval Level Header | Title Bar | Shows current approval level and role-specific review focus |
| Approval Instructions | Info Panel | Guides approver on what to review at this level |
| Previous Approvals | Timeline | Shows all prior approval decisions with timestamps and comments |
| Data Validation Summary | Read-Only Display | Same validation results visible to operations team (transparency) |
| Operations Decision | Text Display | Shows business judgment documentation if data gaps exist |
| Calculation Results | Status Panel | Shows calculation success/failure and execution details |
| Analyst Commentary | Comment Display | Shows all explanatory comments added by analysts and operations |
| Rejection History | Alert Panel | Shows any previous rejection events for this batch (if resubmission) |
| Approval Decision Radio | Radio Buttons | Approve or Reject (mutually exclusive) |
| Rejection Reason Field | Required Text Area | MANDATORY when Reject is selected, enforced by validation |
| Optional Comment | Text Area | Additional context visible to subsequent approvers |
| [Submit Decision] | Primary Button | Commits approval decision and progresses workflow |

## User Actions

- **Select Approve**: Choose to approve and proceed to next level
- **Select Reject**: Choose to reject and return to Data Preparation (requires reason)
- **Enter Rejection Reason**: REQUIRED field when rejecting, cannot submit without reason
- **Add Optional Comment**: Provide additional context for subsequent approvers or operations team
- **View Outstanding Items**: Drill down to see specific instruments missing data
- **View Full Validation Report**: See complete validation details in separate view
- **View Calculation Details**: See detailed calculation execution log
- **View All Comments**: See complete comment history from all users
- **Submit Decision**: Commit approval/rejection and trigger workflow transition

## Business Rules

- Approvers see read-only data (cannot modify during approval)
- Approvers see same validation results as operations team (transparency)
- Rejection reason is MANDATORY at all approval levels (enforced by form validation)
- Rejection returns workflow to Data Preparation (not to previous approval level)
- Rejection automatically clears calculations to ensure fresh recalculations
- All approval decisions logged with user, timestamp, and reason
- Approvers cannot approve their own work (segregation of duties)
- Decision is final once submitted (no undo capability)

## Role-Specific Views

### Level 1 (Operations Approval)
Focus on:
- File receipt completeness
- Data validation checks
- All expected data elements present

### Level 2 (Portfolio Manager Approval)
Focus on:
- Holdings reasonableness
- Performance results
- Risk metrics accuracy
- Position size validation

### Level 3 (Executive Approval)
Focus on:
- Overall report quality
- Material issues or concerns
- Final sign-off before publication

## Routes

| Route | Role Required | Focus |
|-------|--------------|-------|
| `/approvals/level-1` | Approver Level 1 | File completeness, data validation |
| `/approvals/level-2` | Approver Level 2 | Holdings reasonableness, performance |
| `/approvals/level-3` | Approver Level 3 | Overall report quality, final sign-off |

## Navigation
- **From:** Dashboard pending actions (when batch awaiting user's approval level)
- **To:** Dashboard (after decision submission), validation details, calculation monitor

## State Dependencies
- Each approval page is ONLY accessible to users with the corresponding approver role
- Users without the matching role are redirected to `/auth/forbidden`
- Only visible when batch is at user's approval level
- All data is read-only (no edit capabilities)
- [Submit Decision] button disabled until radio selection made
- [Submit Decision] validation enforces rejection reason when Reject selected

## Validation Behavior

When user clicks [Submit Decision] with Reject selected but no reason:
```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠ Rejection Reason Required                                           │
│                                                                        │
│ You must provide a reason when rejecting a batch.                     │
│ This helps the operations team understand what needs to be corrected. │
│                                                                        │
│ [OK]                                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

## Rejection Impact Display

When Reject is selected, show impact warning:
```
⚠ Rejecting this batch will:
  • Return workflow to Data Preparation phase
  • Clear all calculations (will require re-execution)
  • Unlock data entry capabilities for corrections
  • Reset all subsequent approval levels
  • Notify operations team via email
```
