# Screen: Workflow State Viewer

## Purpose
Visual representation of current workflow stage with complete history of state transitions for transparency and audit.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  Workflow State - Batch: January 2026                                       |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  CURRENT WORKFLOW STAGE                                                |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |    [Data Prep]  →  [L1 Approval]  →  [L2 Approval]  →  [L3]  →  [✓]  |  |
|  |        ✓               ✓                   ●            ○         ○   |  |
|  |                                                                        |  |
|  |    Current: Level 2 Approval (Portfolio Manager Review)                |  |
|  |    Status: Awaiting PM approval since 2026-01-06 11:30                 |  |
|  |    Next: Level 3 Approval (Executive) after PM approval                |  |
|  |                                                                        |  |
|  |    ✓ Complete  |  ● In Progress  |  ○ Pending                          |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  WORKFLOW HISTORY                                                      |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  📍 2026-01-06 11:30 - LEVEL 1 APPROVED                                |  |
|  |  ├─ User: John Smith (Analyst)                                 |  |
|  |  ├─ Action: Approved for Level 2                                       |  |
|  |  ├─ Comment: "All files received. 5 instruments missing ratings,       |  |
|  |  │           documented and acceptable for this reporting period."     |  |
|  |  └─ Automated Actions:                                                 |  |
|  |     • Workflow transitioned to Level 2 Approval                        |  |
|  |     • Data entry capabilities locked                                   |  |
|  |     • Notification sent to Portfolio Manager                           |  |
|  |                                                                        |  |
|  |  📍 2026-01-06 10:45 - DATA CONFIRMED READY                            |  |
|  |  ├─ User: John Smith (Analyst)                                 |  |
|  |  ├─ Action: Confirmed data ready for approval                          |  |
|  |  └─ Automated Actions:                                                 |  |
|  |     • Workflow transitioned to Level 1 Approval                        |  |
|  |     • Validation snapshot captured                                     |  |
|  |     • Notification sent to Level 1 Approver                            |  |
|  |                                                                        |  |
|  |  📍 2026-01-06 10:30 - CALCULATIONS COMPLETED                          |  |
|  |  ├─ System Action: Calculations executed successfully                  |  |
|  |  ├─ Duration: 2m 34s                                                   |  |
|  |  └─ Result: All calculations passed validation                         |  |
|  |                                                                        |  |
|  |  📍 2026-01-05 16:20 - MASTER DATA UPDATED                             |  |
|  |  ├─ User: Sarah Johnson (Analyst)                                      |  |
|  |  ├─ Action: Updated 12 instrument credit ratings                       |  |
|  |  └─ Note: Data still in preparation phase                              |  |
|  |                                                                        |  |
|  |  📍 2026-01-04 14:30 - FILE IMPORT COMPLETED                           |  |
|  |  ├─ System Action: All custodian files imported                        |  |
|  |  └─ Result: 45/45 expected files received                              |  |
|  |                                                                        |  |
|  |  📍 2026-01-05 09:00 - BATCH CREATED                                   |  |
|  |  ├─ User: John Smith (Analyst)                                 |  |
|  |  ├─ Action: Created batch for January 2026 reporting                   |  |
|  |  └─ Reporting Date: 2026-01-31                                         |  |
|  |                                                                        |  |
|  |  [Load Earlier Events...]                                              |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Export Workflow History]  [View Batch Details]                            |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Workflow Progress Bar | Visual Timeline | Shows all workflow stages with completion status indicators |
| Current Stage Panel | Info Display | Shows current stage, status, and next expected action |
| Stage Status Icons | Visual Indicator | ✓ Complete, ● In Progress, ○ Pending |
| Workflow History Timeline | Event List | Chronological list of all state transitions and actions |
| Event Entry | Timeline Item | Shows timestamp, user, action, and automated consequences |
| Automated Actions List | Nested Info | Shows system actions triggered by state transition |
| [Load Earlier Events] | Lazy Load Button | Fetch older history events for long-running batches |
| [Export Workflow History] | Button | Download complete workflow log for audit or documentation |

## User Actions

- **View Event Details**: Expand timeline entry to see full details and automated actions
- **Load Earlier Events**: Fetch additional historical events (pagination for performance)
- **Export Workflow History**: Download complete audit trail for batch
- **Navigate to Related Screens**: Click batch details, user names, or related entities

## Event Types Tracked

### Manual User Actions
- Batch creation
- Data confirmation
- Approval decisions (approve/reject)
- Master data changes
- File uploads
- Commentary additions

### System Actions
- Automated file imports
- Calculation executions
- Workflow state transitions
- Data locking/unlocking
- Notifications sent
- Validation runs

### Rejection Events (Example)
```
📍 2025-12-15 14:20 - LEVEL 1 REJECTED
├─ User: John Smith (Operations Approver)
├─ Action: Rejected and returned to Data Preparation
├─ Rejection Reason: "Missing custodian verification files for ZAR holdings.
│                      Cannot approve without independent verification."
└─ Automated Actions:
   • Workflow transitioned to Data Preparation
   • All calculations cleared
   • Data entry capabilities unlocked
   • Notification sent to Analyst
   • All subsequent approvals reset (Level 2, Level 3)
```

## Business Rules

- All state transitions logged with user, timestamp, and action
- Automated actions explicitly recorded for transparency
- Event log is immutable (cannot be edited or deleted)
- Rejection events prominently displayed with full reason
- Complete audit trail retained for minimum 7 years
- Events sortable chronologically (newest first by default)

## Navigation
- **From:** Dashboard, batch management, approval review
- **To:** Batch details, user profiles, related data screens

## State Dependencies
- Timeline updates in real-time as workflow progresses
- Historical batches show complete closed workflow
- Active batches show live status updates

## Rejection Workflow Example

Complete rejection cycle shown in timeline:
```
📍 2026-01-10 15:45 - LEVEL 1 APPROVED (2nd Attempt)
├─ User: John Smith (Analyst)
├─ Action: Approved after corrections
└─ Automated Actions: Transitioned to Level 2 Approval

📍 2026-01-09 10:30 - DATA CONFIRMED READY (Resubmission)
├─ User: John Smith (Analyst)
├─ Action: Confirmed corrections complete, ready for approval
└─ Automated Actions: Calculations re-executed, validation snapshot captured

📍 2026-01-08 16:20 - FILE IMPORT COMPLETED (Correction)
├─ System Action: ZAR custodian files imported
└─ Result: All required files now present (45/45)

📍 2026-01-07 14:20 - LEVEL 1 REJECTED
├─ User: John Smith (Operations Approver)
├─ Action: Rejected - returned to Data Preparation
├─ Rejection Reason: "Missing custodian verification files for ZAR holdings"
└─ Automated Actions:
   • Calculations cleared
   • Data entry unlocked
   • Notification sent to Analyst
```
