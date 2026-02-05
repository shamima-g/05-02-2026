# Screen: Audit Trail Viewer

## Purpose
View complete audit history with filtering by entity type, user, date range, and export capability for compliance reporting and operational troubleshooting.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Admin: Users | Roles & Permissions | [Audit Trail v]                      |
+------------------------------------------------------------------------------+
|                                                                              |
|  Audit Trail Viewer                                                          |
|                                                                              |
|  Tab: [Master Data Changes] | Workflow Events | User Activity | Admin Actions|
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  FILTERS                                                               |  |
|  +------------------------------------------------------------------------+  |
|  |  Date Range:  [2026-01-01] to [2026-01-05]  [Last 7 Days v]  [Apply] |  |
|  |                                                                        |  |
|  |  Entity Type: [All v]  (Instruments, Index Prices, Risk Metrics,      |  |
|  |                         Volatility, Credit Ratings, Custom Holdings)  |  |
|  |                                                                        |  |
|  |  User:        [All Users v]  (Filter by specific user)                |  |
|  |                                                                        |  |
|  |  Action Type: [All v]  (Create, Update, Delete, Deactivate)           |  |
|  |                                                                        |  |
|  |  Batch:       [All Batches v]  (Filter to specific reporting batch)   |  |
|  |                                                                        |  |
|  |  [Clear Filters]  [Export Filtered Results]                           |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Showing 1,247 audit records                                                 |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Timestamp         | User        | Entity Type    | Action | Details   |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 16:30  | John Smith  | Workflow       | Approve| [View]    |  |
|  | Approved Level 1 for batch January 2026                               |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 15:45  | Sarah J.    | Credit Rating  | Update | [View]    |  |
|  | US1234567890: Rating changed BBB → BBB+                                |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 14:30  | John Smith  | Workflow       | Confirm| [View]    |  |
|  | Confirmed data ready for approval - batch January 2026                |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 11:20  | Sarah J.    | Risk Metrics   | Create | [View]    |  |
|  | Added duration 3.45 years for instrument ZA1234567890                 |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 10:15  | Michael C.  | Index Price    | Update | [View]    |  |
|  | MSCI World: Price changed 3,172.45 → 3,245.67                         |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 09:30  | John Smith  | File Import    | Execute| [View]    |  |
|  | Imported 7 files from Asset Manager A (Holdings, Trans, Income...)    |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-04 16:45  | Sarah J.    | Instrument     | Update | [View]    |  |
|  | US5949181045: Sector changed "Information Technology" → "Technology"  |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-04 14:20  | David B.    | User Admin     | Create | [View]    |  |
|  | Created new user: Emily Wilson (Analyst)                              |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-04 11:30  | Jennifer L. | Workflow       | Reject | [View]    |  |
|  | Rejected Level 2 - batch December 2025                                |  |
|  | Reason: "Holdings valuation discrepancy requires investigation"       |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-04 09:15  | Sarah J.    | Custom Holding | Delete | [View]    |  |
|  | Deleted XX0001111222 (Private Equity Fund ABC)                         |  |
|  | Reason: "Position fully redeemed"                                     |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [1] [2] [3] ... [125]                                 Rows per page: 10    |
|                                                                              |
+------------------------------------------------------------------------------+

AUDIT DETAIL VIEW:
+------------------------------------------------------------------------------+
|  Audit Record Details                                           [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  AUDIT RECORD: Credit Rating Update                                          |
|                                                                              |
|  Timestamp:              2026-01-05 15:45:32 UTC                             |
|  User:                   Sarah Johnson (sjohnson)                            |
|  IP Address:             192.168.1.67                                        |
|  Session ID:             a3f7b9c2-1234-5678-90ab-cdef12345678                |
|                                                                              |
|  ENTITY INFORMATION                                                          |
|                                                                              |
|  Entity Type:            Credit Rating                                       |
|  Entity ID:              CR-98765                                            |
|  Instrument ISIN:        US1234567890                                        |
|  Instrument Name:        Corporate Bond A 5.5% 2028                          |
|  Batch:                  January 2026 (2026-01-31)                           |
|                                                                              |
|  ACTION DETAILS                                                              |
|                                                                              |
|  Action Type:            Update                                              |
|  Action Category:        Master Data Maintenance                             |
|                                                                              |
|  CHANGES MADE                                                                |
|                                                                              |
|  Field: Bloomberg Composite Rating (International Scale)                     |
|  Before:                 BBB                                                 |
|  After:                  BBB+                                                |
|                                                                              |
|  Field: Rating Effective Date                                                |
|  Before:                 2025-11-15                                          |
|  After:                  2025-12-15                                          |
|                                                                              |
|  Field: Final Determined Rating (Auto-calculated)                            |
|  Before:                 BBB (Source: Bloomberg Composite)                   |
|  After:                  BBB+ (Source: Bloomberg Composite)                  |
|                                                                              |
|  CHANGE METADATA                                                             |
|                                                                              |
|  Reason:                 "Updated rating per Bloomberg feed 2025-12-15"      |
|  Source:                 Manual entry (from Bloomberg data)                  |
|  Workflow State:         Data Preparation                                    |
|                                                                              |
|  IMPACT ANALYSIS                                                             |
|                                                                              |
|  • Rating upgraded one notch (BBB → BBB+)                                    |
|  • Remains within Investment Grade                                           |
|  • Will appear in Rating Changes Report for January 2026                     |
|  • May affect portfolio credit quality metrics                               |
|                                                                              |
|  RELATED RECORDS                                                             |
|                                                                              |
|  • Instrument Master: US1234567890 (last updated 2026-01-04)                |
|  • Previous Rating Change: 2025-10-10 (Downgrade BBB+ → BBB)                |
|  • Next Rating Change: None                                                  |
|                                                                              |
|  [Export Record]  [View Related Changes]  [Close]                            |
|                                                                              |
+------------------------------------------------------------------------------+

WORKFLOW EVENTS TAB:
+------------------------------------------------------------------------------+
|  Audit Trail Viewer                                                          |
|                                                                              |
|  Tab: Master Data Changes | [Workflow Events] | User Activity | Admin Actions|
|                                                                              |
|  FILTERS: Date Range: [2026-01-01] to [2026-01-05]                          |
|           Batch: [January 2026 v]  Event Type: [All v]                      |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Timestamp         | Event Type      | User        | Details | View    |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 16:30  | Level 1 Approved| John Smith  | Batch:  | [View]  |  |
|  |                   |                 |             | Jan 2026|         |  |
|  |                   | Comment: "All files received. 5 instruments          |  |
|  |                   | missing ratings, documented and acceptable."         |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 14:30  | Data Confirmed  | John Smith  | Batch:  | [View]  |  |
|  |                   | Ready           |             | Jan 2026|         |  |
|  |                   | Automated: Workflow → Level 1 Approval               |  |
|  |                   | Automated: Data entry locked                         |  |
|  |                   | Automated: Notification sent to Level 1 Approver     |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 10:30  | Calculations    | System      | Batch:  | [View]  |  |
|  |                   | Completed       |             | Jan 2026|         |  |
|  |                   | Duration: 2m 34s | Status: Success                   |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-04 14:20  | Level 2 Rejected| Jennifer L. | Batch:  | [View]  |  |
|  |                   |                 |             | Dec 2025|         |  |
|  |                   | Reason: "Holdings valuation discrepancy requires     |  |
|  |                   | investigation"                                       |  |
|  |                   | Automated: Workflow → Data Preparation               |  |
|  |                   | Automated: Calculations cleared                      |  |
|  |                   | Automated: Data entry unlocked                       |  |
|  |                   | Automated: Notification sent to Operations Lead      |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-03 09:15  | Batch Created   | John Smith  | Batch:  | [View]  |  |
|  |                   |                 |             | Jan 2026|         |  |
|  |                   | Reporting Date: 2026-01-31                           |  |
|  |                   | Initial State: Data Preparation                      |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

USER ACTIVITY TAB:
+------------------------------------------------------------------------------+
|  Audit Trail Viewer                                                          |
|                                                                              |
|  Tab: Master Data Changes | Workflow Events | [User Activity] | Admin Actions|
|                                                                              |
|  Select User: [Sarah Johnson v]  Date Range: [Last 30 Days v]               |
|                                                                              |
|  ACTIVITY SUMMARY FOR: Sarah Johnson (sjohnson)                              |
|                                                                              |
|  Total Actions: 347 in last 30 days                                          |
|  Login Sessions: 28                                                          |
|  Most Active: Weekdays 9am-5pm                                               |
|                                                                              |
|  BREAKDOWN BY ACTION TYPE:                                                   |
|  • Instrument Updates: 125 (36%)                                             |
|  • Credit Rating Updates: 89 (26%)                                           |
|  • Risk Metric Updates: 67 (19%)                                             |
|  • Volatility Updates: 45 (13%)                                              |
|  • Other: 21 (6%)                                                            |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Timestamp         | Action Type     | Entity           | Details      |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 16:45  | Login           | Session          | Success      |  |
|  | 2026-01-05 15:45  | Update          | Credit Rating    | US1234567890 |  |
|  | 2026-01-05 15:30  | Update          | Credit Rating    | ZA9876543210 |  |
|  | 2026-01-05 15:15  | Update          | Risk Metrics     | GB1122334455 |  |
|  | 2026-01-05 14:50  | Create          | Risk Metrics     | AU9988776655 |  |
|  | 2026-01-05 14:30  | Update          | Instrument       | US5949181045 |  |
|  | 2026-01-05 14:15  | Export          | Outstanding Items| Excel        |  |
|  | 2026-01-05 11:20  | Create          | Risk Metrics     | ZA1234567890 |  |
|  | 2026-01-05 11:00  | Update          | Volatility       | JP9876543210 |  |
|  | 2026-01-05 08:30  | Login           | Session          | Success      |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Export User Activity Report]  [View Detailed Actions]                     |
|                                                                              |
+------------------------------------------------------------------------------+

ADMIN ACTIONS TAB:
+------------------------------------------------------------------------------+
|  Audit Trail Viewer                                                          |
|                                                                              |
|  Tab: Master Data Changes | Workflow Events | User Activity | [Admin Actions]|
|                                                                              |
|  FILTERS: Date Range: [Last 90 Days v]  Admin User: [All v]                 |
|           Action Type: [All v]                                               |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Timestamp         | Admin User  | Action Type      | Details | View   |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-04 14:20  | David Brown | User Created     | Emily   | [View] |  |
|  |                   |             |                  | Wilson  |        |  |
|  |                   | Roles: Analyst, Read-Only                            |  |
|  |                   | Reason: "New hire for operations team"               |  |
|  +------------------------------------------------------------------------+  |
|  | 2025-12-20 09:30  | David Brown | User Deactivated | Mark    | [View] |  |
|  |                   |             |                  | Taylor  |        |  |
|  |                   | Reason: "Left company for new opportunity"           |  |
|  |                   | Pending work transferred to: Sarah Johnson           |  |
|  +------------------------------------------------------------------------+  |
|  | 2025-12-15 11:45  | David Brown | Role Modified    | John    | [View] |  |
|  |                   |             |                  | Smith   |        |  |
|  |                   | Added role: Approver Level 1                         |  |
|  |                   | Reason: "Promotion to team lead"                     |  |
|  +------------------------------------------------------------------------+  |
|  | 2025-11-30 10:00  | David Brown | Approval Auth    | Level 2 | [View] |  |
|  |                   |             | Changed          | Config  |        |  |
|  |                   | Added Jessica Martinez as backup for Michael Chen    |  |
|  +------------------------------------------------------------------------+  |
|  | 2025-11-15 14:30  | David Brown | Reference Data   | Fee Rate| [View] |  |
|  |                   |             | Updated          | Change  |        |  |
|  |                   | Emerging Markets Fund: Fee rate 1.15% → 1.25%       |  |
|  |                   | Effective: 2026-01-01 (future periods only)          |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

EXPORT OPTIONS:
+------------------------------------------------------------------------------+
|  Export Audit Trail                                             [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Export Format:      (•) Excel (.xlsx)  ( ) CSV  ( ) PDF Report             |
|                                                                              |
|  Date Range:         [2026-01-01] to [2026-01-05]                           |
|                                                                              |
|  Include:            [✓] Timestamp and user                                  |
|                      [✓] Entity type and ID                                  |
|                      [✓] Before and after values                             |
|                      [✓] Change reason and metadata                          |
|                      [✓] IP address and session info                         |
|                      [ ] System-generated events (calculations, imports)     |
|                                                                              |
|  Filter by:          Entity Type: [Credit Rating v]                          |
|                      User: [All Users v]                                     |
|                      Batch: [All Batches v]                                  |
|                                                                              |
|  Records to Export:  1,247 records matching filters                          |
|                                                                              |
|  Purpose (optional): [Compliance audit Q1 2026.................]            |
|                                                                              |
|  [Generate Export]  [Cancel]                                                 |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Tab Navigation | Tab Bar | Master Data Changes, Workflow Events, User Activity, Admin Actions |
| Filter Panel | Multi-Filter Form | Date range, entity type, user, action type, batch |
| [Clear Filters] | Button | Reset all filters to defaults |
| [Export Filtered Results] | Button | Export current filtered view to Excel/CSV |
| Audit Records Table | Data Table | Shows timestamp, user, entity, action, and summary |
| [View] | Link | Open detailed audit record with before/after values |
| Detail View Modal | Overlay | Complete audit record with all metadata and impact analysis |
| Date Range Selector | Date Picker | Custom range or preset (Last 7/30/90 Days) |
| User Activity Summary | Stats Panel | Breakdown of user actions by type and frequency |
| Admin Actions Log | Filtered View | Security-sensitive administrative changes |
| Export Options Modal | Dialog | Configure export format and content |

## User Actions

- **Filter by Date Range**: Narrow audit trail to specific time period
- **Filter by Entity Type**: Show only specific data types (instruments, ratings, etc.)
- **Filter by User**: See all actions by specific user
- **Filter by Batch**: See all changes related to specific reporting batch
- **View Detail**: See complete audit record with before/after values
- **Export Filtered Results**: Download audit trail for compliance or analysis
- **View User Activity Summary**: See statistics for specific user's actions
- **View Related Changes**: Navigate to related audit records

## Business Rules

- Audit trails immutable (cannot be deleted or modified)
- Retained per data retention policy (minimum 7 years for financial data)
- Accessible to authorized users (administrators, compliance team, auditors)
- Searchable and filterable by date, user, entity, action type
- Exportable for compliance reporting and investigations
- All changes include user, timestamp, IP address, session ID
- Before and after values captured for all updates
- Change reason captured where applicable
- System-generated actions clearly labeled

## Navigation
- **From:** Dashboard, any data screen's [History] link, admin section
- **To:** User administration (when viewing user activity), related entity detail views

## Audit Record Details

Each audit record captures:
- **Who**: User name, username, employee ID
- **What**: Entity type, entity ID, action type, field changes
- **When**: Timestamp (UTC), session ID
- **Where**: IP address, location (if available)
- **Why**: Change reason, source (manual/automated/import)
- **Impact**: Related records affected, calculation impacts

## Access Control

Audit trail access controlled by role:
- **Administrators**: Full access to all audit trails
- **Compliance Team**: Read-only access to all audit trails
- **External Auditors**: Read-only access with export capability
- **Regular Users**: Access to audit trails for own actions only
- **Approvers**: Access to workflow event logs for batches they review

## Compliance Features

- Tamper-proof audit trail (immutable records)
- Complete change history for regulatory compliance
- User activity tracking for security audits
- Administrative action logging for governance
- Export capability for formal audit requests
- Retention policy enforcement (7+ years for financial data)
- IP address and session tracking for security investigations

## Search Performance

For large audit trails (millions of records):
- Indexed by timestamp, user, entity type, batch
- Pagination for performance (10-100 records per page)
- Summary statistics before full detail query
- Export runs as background job for large data sets
