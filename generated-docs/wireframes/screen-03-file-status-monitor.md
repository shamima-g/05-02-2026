# Screen: File Status Monitor

## Purpose
Track expected vs received files across all sources (Asset Manager, Bloomberg, Custodian) with real-time status indicators for efficient coordination.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  File Status Monitor                    Batch: [January 2026 v] 🔒 Locked  |
|                                                                              |
|  Overview: 45/45 files received  |  3 processing  |  0 failed              |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  ASSET MANAGER FILES                                      35/35 ✓       |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  Portfolio: Global Equity Fund                            7/7 ✓       |  |
|  |  +-----------------------------------------------------------------+   |  |
|  |  | File Type              | Status    | Received        | Actions  |   |  |
|  |  +-----------------------------------------------------------------+   |  |
|  |  | Holdings               | ✓ Complete| 2026-01-03 09:15| [View]   |   |  |
|  |  | Transactions           | ✓ Complete| 2026-01-03 09:15| [View]   |   |  |
|  |  | Income                 | ✓ Complete| 2026-01-03 09:16| [View]   |   |  |
|  |  | Cash Positions         | ✓ Complete| 2026-01-03 09:16| [View]   |   |  |
|  |  | Performance Attribution| ✓ Complete| 2026-01-03 10:22| [View]   |   |  |
|  |  | Management Fees        | ✓ Complete| 2026-01-03 10:22| [View]   |   |  |
|  |  | Instrument Static Data | ✓ Complete| 2026-01-03 10:23| [View]   |   |  |
|  |  +-----------------------------------------------------------------+   |  |
|  |                                                                        |  |
|  |  Portfolio: Fixed Income Fund                             7/7 ✓       |  |
|  |  [Collapsed - Click to expand]                                         |  |
|  |                                                                        |  |
|  |  [+ Show 3 more portfolios...]                                         |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  BLOOMBERG FILES                                          6/6 ✓        |  |
|  +------------------------------------------------------------------------+  |
|  |  +-----------------------------------------------------------------+   |  |
|  |  | File Type              | Status    | Received        | Actions  |   |  |
|  |  +-----------------------------------------------------------------+   |  |
|  |  | Instrument Static Data | ✓ Complete| 2026-01-04 06:30| [View]   |   |  |
|  |  | Index Pricing          | ✓ Complete| 2026-01-04 06:31| [View]   |   |  |
|  |  | Credit Ratings         | ✓ Complete| 2026-01-04 06:31| [View]   |   |  |
|  |  | Holdings Verification  | ✓ Complete| 2026-01-04 06:32| [View]   |   |  |
|  |  +-----------------------------------------------------------------+   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  CUSTODIAN FILES                                          4/4 ✓        |  |
|  +------------------------------------------------------------------------+  |
|  |  +-----------------------------------------------------------------+   |  |
|  |  | File Type              | Status    | Received        | Actions  |   |  |
|  |  +-----------------------------------------------------------------+   |  |
|  |  | Holdings Verify (USD)  | ✓ Complete| 2026-01-04 14:20| [View]   |   |  |
|  |  | Holdings Verify (ZAR)  | ✓ Complete| 2026-01-04 14:21| [View]   |   |  |
|  |  | Transactions (USD)     | ✓ Complete| 2026-01-04 14:22| [View]   |   |  |
|  |  | Transactions (ZAR)     | ⚙ Process | 2026-01-04 14:23| [Retry]  |   |  |
|  |  | Cash Reconciliation    | ✓ Complete| 2026-01-04 14:24| [View]   |   |  |
|  |  | Custody Fees           | ✓ Complete| 2026-01-04 14:24| [View]   |   |  |
|  |  +-----------------------------------------------------------------+   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Legend: ✓ Complete | ⚙ Processing | ✗ Failed | ○ Missing                  |
|                                                                              |
|  [📥 Manual Upload]  [🔄 Refresh All]  [📊 Export Status Report]           |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Batch Selector | Dropdown | Switch between batches to view file status for different reporting periods |
| 🔒 Locked Indicator | Badge | Shows when batch is in approval phase (data entry locked) |
| Overview Summary | Metric Bar | At-a-glance count: received/expected, processing, failed |
| Source Category Panel | Collapsible Section | Groups files by source (Asset Manager, Bloomberg, Custodian) with completion count |
| Portfolio Subsection | Collapsible Group | Asset Manager files organized by portfolio |
| File Status Table | Data Table | Shows file type, status icon, timestamp, and actions |
| Status Icons | Visual Indicator | ✓ Complete, ⚙ Processing, ✗ Failed, ○ Missing |
| [View] | Link | Opens file processing monitor with detailed import information |
| [Retry] | Button | Re-attempts failed file import (only visible for failed imports) |
| [📥 Manual Upload] | Button | Opens file upload dialog (disabled during approval phases) |
| [🔄 Refresh All] | Button | Triggers re-import for all configured automated file sources |

## User Actions

- **View File Details**: Click [View] to see import timestamp, validation results, record counts
- **Retry Failed Import**: Click [Retry] to re-attempt import without re-uploading file
- **Manual Upload**: Upload file manually when automated import unavailable
- **Refresh All**: Trigger immediate check for new files at all configured locations
- **Expand/Collapse Portfolio**: Toggle detail view for specific portfolio or source category
- **Export Status Report**: Download Excel report of file receipt status for sharing

## Business Rules

- Expected file count defined by source contracts (7 per portfolio for Asset Manager, 4 for Bloomberg, 4+ for Custodian)
- Files automatically imported from configured SFTP locations on schedule
- Manual upload available as fallback when automated import fails
- Import status updates in real-time without manual refresh
- Failed imports show detailed error message on click
- File receipt timestamps tracked for SLA monitoring

## Navigation
- **From:** Dashboard pending actions, main navigation
- **To:** File processing monitor (detailed import logs), Data validation summary

## State Dependencies
- **Data Preparation Phase**: Manual upload enabled, retry enabled for failed imports
- **During Approval**: Manual upload disabled (🔒 shown), view-only access to status
- **After Rejection**: Manual upload re-enabled, can correct and retry failed imports
- **Closed Batch**: Read-only access, no upload or retry capabilities

## Error Handling

Failed files show prominent error indicator:
```
| Transactions (ZAR)     | ✗ Failed  | 2026-01-04 14:23| [View Error] [Retry] |
  Error: Invalid file format - Expected 12 columns, found 11
  Last retry: 2026-01-04 15:30 (3 attempts)
```
