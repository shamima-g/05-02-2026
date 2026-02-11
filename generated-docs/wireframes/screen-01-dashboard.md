# Screen: Dashboard (Role-Based Home)

## Purpose
Landing page that provides role-specific view of pending actions, workflow status, and alerts to guide users to their most important tasks.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  Welcome, [User Name] - [Role(s)]                     [Today's Date]        |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  PENDING ACTIONS (3)                                                   |  |
|  +------------------------------------------------------------------------+  |
|  |  [ ! ]  Batch Jan 2026 - Awaiting Level 2 Approval        [Review >] |  |
|  |  [ ! ]  5 Instruments Missing Duration Values              [Fix >]    |  |
|  |  [i]   Bloomberg Files - 2 files pending import            [View >]   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +----------------------------------+  +----------------------------------+  |
|  |  ACTIVE BATCHES                  |  |  RECENT ACTIVITY                 |  |
|  +----------------------------------+  +----------------------------------+  |
|  |  Jan 2026                        |  |  3 min ago: User A updated...    |  |
|  |  Status: Level 1 Approved        |  |  15 min ago: File imported...    |  |
|  |  [View Details]                  |  |  1 hour ago: Batch created...    |  |
|  |                                  |  |  [View Full Log]                 |  |
|  |  Dec 2025                        |  +----------------------------------+  |
|  |  Status: Data Preparation        |                                        |
|  |  [View Details]                  |  +----------------------------------+  |
|  |                                  |  |  WORKFLOW STATUS                 |  |
|  |  Nov 2025 (Closed)               |  +----------------------------------+  |
|  |  [View Only]                     |  |                                  |  |
|  +----------------------------------+  |   Data Prep → L1 → L2 → L3 → ✓  |  |
|                                       |                                  |  |
|  +----------------------------------+  |   Jan 2026:  ✓ ───> ● ─ ─ ─ ─  |  |
|  |  DATA QUALITY ALERTS             |  |   Dec 2025:  ●                   |  |
|  +----------------------------------+  |                                  |  |
|  |  [ ⚠ ]  3 validation warnings    |  |   ● = Current    ✓ = Complete   |  |
|  |  [ ⚠ ]  12 outstanding items     |  +----------------------------------+  |
|  |  [View All Alerts]               |                                        |
|  +----------------------------------+                                        |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Pending Actions Panel | Alert List | Role-filtered list of items requiring user attention with priority indicators |
| Active Batches | Card List | Shows batches user has access to with current workflow state |
| Recent Activity | Timeline | Real-time feed of system activity relevant to user role |
| Workflow Status | Visual Progress | Shows workflow stages for active batches with current position |
| Data Quality Alerts | Summary Panel | Aggregated count of validation warnings and outstanding items |
| [Review >], [Fix >], [View >] | Action Links | Quick navigation to relevant screens |

## User Actions

- **Click Pending Action**: Navigate directly to screen where action can be taken
- **View Batch Details**: Open batch management screen for selected batch
- **View Full Log**: Navigate to complete audit trail viewer
- **View All Alerts**: Navigate to data validation summary screen

## Role-Specific Behavior

### Analyst
- Sees file status alerts, validation summaries, workflow progression
- Pending actions focus on data preparation tasks, confirmation readiness, data correction, and commentary
- Sees outstanding master data items requiring maintenance

### Approver (Levels 1-3)
- Sees batches awaiting their approval level only
- Pending actions show batches ready for review with approve/reject options

### Administrator
- Sees user management alerts, system configuration notifications
- Pending actions focus on administrative tasks

## Navigation
- **From:** Login authentication
- **To:** All major sections via top navigation bar; Quick actions to specific screens via pending actions panel

## State Dependencies
- Dashboard content adapts to workflow state (locked/unlocked indicators for data entry)
- Pending actions refresh in real-time as workflow progresses
- Historical batches show read-only indicators
