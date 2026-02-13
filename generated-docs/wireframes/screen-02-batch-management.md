# Screen: Batch Management

## Purpose
Create new reporting batches, view active batches, switch between reporting periods, and access historical batches.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch Management                    [+ Create New Batch (Feb 2026)]        |
|                                                                              |
|  Filter: ( ) Active  ( ) Closed  (•) All          Sort: [Latest First v]   |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  BATCH: January 2026                              Status: Level 1 ✓    |  |
|  +------------------------------------------------------------------------+  |
|  |  Created: 2026-01-05 by Analyst                                |  |
|  |  Reporting Date: 2026-01-31                                            |  |
|  |  Current Stage: Level 2 Approval (Awaiting PM Review)                  |  |
|  |                                                                        |  |
|  |  Workflow Progress:                                                    |  |
|  |  [Data Prep ✓] → [L1 Approval ✓] → [L2 Approval ●] → [L3] → [Publish]|  |
|  |                                                                        |  |
|  |  Files: 45/45 received  |  Validation: 3 warnings  |  Calcs: Complete |  |
|  |                                                                        |  |
|  |  [View Details]  [Switch to Batch]  [View Audit Log]                  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  BATCH: December 2025                                Status: Closed ✓ |  |
|  +------------------------------------------------------------------------+  |
|  |  Created: 2025-12-02 | Closed: 2025-12-20                              |  |
|  |  Reporting Date: 2025-12-31                                            |  |
|  |  Final Approval: 2025-12-20 by Executive                               |  |
|  |                                                                        |  |
|  |  [View Details (Read Only)]  [View Audit Log]  [Export Report]        |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  BATCH: November 2025                                 Status: Closed ✓ |  |
|  +------------------------------------------------------------------------+  |
|  |  Created: 2025-11-01 | Closed: 2025-11-20                              |  |
|  |  Reporting Date: 2025-11-30                                            |  |
|  |  Final Approval: 2025-11-20 by Executive                               |  |
|  |                                                                        |  |
|  |  [View Details (Read Only)]  [View Audit Log]  [Export Report]        |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Showing 3 of 8 batches                                    [Load More...]  |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Create New Batch (Month Year)] | Button | Creates batch for next sequential month (last day). Disabled with tooltip when any existing batch is not Approved. Only visible to Analysts. No modal - single click action. |
| Batch Card | Expandable Panel | Shows summary info with workflow progress, file status, validation status |
| Workflow Progress | Visual Indicator | Shows stages with completed (✓), current (●), and pending states |
| Status Badge | Label | Color-coded: Data Prep (blue), Approval stages (yellow), Closed (green) |
| [Switch to Batch] | Button | Makes selected batch the active working batch (changes context globally) |
| [View Details] | Link | Opens detailed view with full workflow history and statistics |
| Rejection Information | Alert Box | Shows last rejection reason prominently when batch returned to Data Prep |
| Filter/Sort Controls | Toggle + Dropdown | Filter by status, sort by date or status |

## User Actions

- **Create New Batch**: Single click creates batch for the next sequential month (last day). No modal or date selection. Only available when all existing batches are Approved.
- **Switch to Batch**: Change active working context to selected batch (affects all screens)
- **View Details**: See comprehensive batch information including complete workflow history
- **View Audit Log**: Navigate to audit trail viewer filtered to this batch
- **View Rejection History**: See all rejection events for batch with reasons and timestamps
- **Export Report**: Download approved batch data for external analysis (closed batches only)

## Business Rules

- **Monthly only** - weekly batches are de-scoped; only monthly batches are available
- **Sequential creation** - new batch is always for the next month; no date picker; all existing batches must be Approved before a new one can be created
- Only one batch may be in a non-Approved state at any time (the current batch)
- Only one batch is "active" at a time (shown in header across all screens); users can switch between batches for viewing
- Historical batches are read-only (no data modifications allowed)
- Batch cannot be deleted (soft delete only for audit trail preservation)
- **Rejection always returns batch to Data Preparation** with rejection reason visible; calculations cleared automatically
- **Batches always end at a complete status** - "Rejected" is not a terminal state; it's a return to Data Preparation for correction
- Each batch has unique identifier and reporting date (last day of month)

## Navigation
- **From:** Dashboard, global batch switcher in header
- **To:** File status monitor, validation summary, master data screens (all filtered to active batch)

## State Dependencies
- **Data Preparation**: Full edit access to files and master data
- **During Approval**: Read-only access, workflow progression visible
- **After Rejection**: Edit access restored, rejection reason displayed, calculations cleared
- **Closed**: Read-only access, export capability enabled
