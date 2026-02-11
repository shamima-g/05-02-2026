# Screen: Instrument Master Management

## Purpose
CRUD operations for instrument definitions with search, filter, audit history, and identification of incomplete instruments requiring data entry.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Master Data: [Instruments v] | Index Prices | Risk Metrics | Volatility |  |
|               Credit Ratings | Custom Holdings | Reference Data              |
+------------------------------------------------------------------------------+
|                                                                              |
|  Instrument Master Data                 Batch: [January 2026 v] 🔒 Locked   |
|                                                                              |
|  [+ Add New Instrument]  [📥 Bulk Import]  [📊 Export to Excel]             |
|                                                                              |
|  Search: [Search by ISIN, name, issuer..............................]  [🔍] |
|                                                                              |
|  Filters:                                                                    |
|  Asset Class: [All v]  Type: [All v]  Country: [All v]  Status: [Active v] |
|  Show Only: [ ] Missing Ratings  [ ] Missing Risk Metrics  [ ] Incomplete   |
|                                                                              |
|  Showing 245 instruments (12 incomplete)                  [Clear Filters]   |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | ISIN         | Name            | Type | Country | Curr | Actions      |  |
|  +------------------------------------------------------------------------+  |
|  | US0378331005 | Apple Inc       | EQ   | USA     | USD  | [View][Edit] |  |
|  | ✓ Complete   | Common Stock    |      | NASDAQ  |      | [History]    |  |
|  +------------------------------------------------------------------------+  |
|  | US5949181045 | Microsoft Corp  | EQ   | USA     | USD  | [View][Edit] |  |
|  | ✓ Complete   | Common Stock    |      | NASDAQ  |      | [History]    |  |
|  +------------------------------------------------------------------------+  |
|  | ZA1234567890 | SA Govt Bond    | FI   | ZAF     | ZAR  | [View][Edit] |  |
|  | ⚠ Incomplete | 2030 Maturity   |      |         |      | [History]    |  |
|  |              | Missing: Duration, YTM                                  |  |
|  +------------------------------------------------------------------------+  |
|  | GB0002374006 | Diageo PLC      | EQ   | GBR     | GBP  | [View][Edit] |  |
|  | ⚠ Incomplete | Common Stock    |      | LSE     |      | [History]    |  |
|  |              | Missing: Credit Rating                                  |  |
|  +------------------------------------------------------------------------+  |
|  | JP3633400001 | Sony Group      | EQ   | JPN     | JPY  | [View][Edit] |  |
|  | ⚠ Incomplete | Common Stock    |      | TSE     |      | [History]    |  |
|  |              | Missing: Beta                                           |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [1] [2] [3] ... [25]                                    Rows per page: 10  |
|                                                                              |
+------------------------------------------------------------------------------+

DETAIL VIEW/EDIT MODAL (when clicking [View] or [Edit]):
+------------------------------------------------------------------------------+
|  Instrument Details - US5949181045                              [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Tab: [General] | Classification | Pricing | Related Data | Audit History   |
|                                                                              |
|  GENERAL INFORMATION                                    🔒 Locked - Approval |
|                                                                              |
|  ISIN:                    [US5949181045................................]    |
|  Instrument Name:         [Microsoft Corporation......................]    |
|  Short Name:              [MSFT.......................................]    |
|  Issuer:                  [Microsoft Corporation......................]    |
|  Issue Date:              [1986-03-13]  [📅]                                |
|  Maturity Date:           [N/A - Equity........]  [📅]                      |
|                                                                              |
|  CLASSIFICATION                                                              |
|                                                                              |
|  Asset Class:             [Equity v]                                         |
|  Instrument Type:         [Common Stock v]                                   |
|  Sector:                  [Technology v]                                     |
|  Industry:                [Software v]                                       |
|                                                                              |
|  GEOGRAPHIC & CURRENCY                                                       |
|                                                                              |
|  Country:                 [United States v]                                  |
|  Currency:                [USD v]                                            |
|  Exchange:                [NASDAQ...................................]        |
|                                                                              |
|  IDENTIFIERS                                                                 |
|                                                                              |
|  SEDOL:                   [2588173...................................]       |
|  CUSIP:                   [594918104.................................]       |
|  Bloomberg Ticker:        [MSFT US Equity.............................]      |
|                                                                              |
|  STATUS                                                                      |
|                                                                              |
|  Status:                  (•) Active  ( ) Inactive                           |
|  Last Updated:            2026-01-05 14:23 by Sarah Johnson                 |
|  Created:                 2025-01-15 09:30 by System Import                 |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | COMPLETENESS CHECK                                          ✓        |    |
|  +----------------------------------------------------------------------+    |
|  | ✓ Basic Information Complete                                         |    |
|  | ✓ Classification Complete                                            |    |
|  | ✓ Geographic Data Complete                                           |    |
|  | ✓ Credit Rating Available                                            |    |
|  | ✓ Risk Metrics Available (Duration/YTM)                             |    |
|  | ✓ Volatility Metric Available (Beta)                                |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  [Save Changes]  [Cancel]  [Deactivate Instrument]                          |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Add New Instrument] | Button | Opens blank instrument form (disabled during approval phases) |
| [📥 Bulk Import] | Button | Upload Excel file with multiple instruments (disabled during approval) |
| [📊 Export to Excel] | Button | Download current filtered list including ISINs for sharing |
| Search Box | Text Input | Search across ISIN, name, issuer, ticker |
| Filter Dropdowns | Multi-Select | Filter by asset class, type, country, status |
| Completeness Checkboxes | Filter Toggle | Show only instruments with specific data gaps |
| Instrument List Table | Data Table | Shows key fields with completion status and quick actions |
| Completion Status Badge | Visual Indicator | ✓ Complete or ⚠ Incomplete with specific missing items |
| [View] | Link | Opens read-only detail modal |
| [Edit] | Link | Opens editable detail modal (disabled during approval phases) |
| [History] | Link | Opens audit trail viewer filtered to this instrument |
| Detail Modal | Overlay Form | Tabbed interface for all instrument attributes |
| Completeness Check Panel | Status Summary | Shows which related data elements are available |
| 🔒 Locked Indicator | Badge | Shows when batch is in approval phase (edit disabled) |

## User Actions

- **Add New Instrument**: Open blank form to create instrument definition
- **Bulk Import**: Upload Excel file with multiple instruments for batch creation
- **Search**: Find specific instruments by ISIN, name, issuer, or ticker
- **Filter**: Narrow list to specific asset class, type, country, or completion status
- **View Details**: See complete read-only instrument information
- **Edit Instrument**: Modify instrument attributes (only during Data Preparation)
- **View History**: See complete audit trail of changes for specific instrument
- **Deactivate**: Soft delete instrument (cannot delete if used in holdings)
- **Export**: Download filtered list to Excel for analysis or sharing with data providers

## Business Rules

- All changes fully audited (user, timestamp, before/after values)
- Historical data preserved (soft delete only, no hard deletion)
- Modifications only permitted during Data Preparation phase
- Incomplete instruments identifiable for targeted correction
- ISIN must be unique (validation on save)
- Cannot deactivate instrument if used in current or historical holdings
- Referential integrity enforced (country, currency must exist in reference data)

## Navigation
- **From:** Dashboard outstanding items, data validation summary, file processing
- **To:** Risk metrics management, credit ratings, volatility management (via completeness check)

## State Dependencies
- **Data Preparation Phase**: Full CRUD access, all buttons enabled
- **During Approval**: Read-only access, [Edit], [Add New], [Bulk Import] disabled, 🔒 shown
- **After Rejection**: Edit access restored immediately
- **Closed Batch**: Read-only access to historical instrument data

## Audit History Tab

When clicking [History] or viewing Audit History tab:
```
+------------------------------------------------------------------------+
|  AUDIT HISTORY - Microsoft Corporation (US5949181045)                  |
+------------------------------------------------------------------------+
|                                                                        |
|  2026-01-05 14:23 - Sarah Johnson (Analyst)                            |
|  Field Changed: Sector                                                 |
|  Before: "Information Technology"                                      |
|  After: "Technology"                                                   |
|  Reason: "Standardizing sector classifications"                        |
|                                                                        |
|  2025-11-12 09:45 - John Smith (Analyst)                       |
|  Field Changed: Exchange                                               |
|  Before: [empty]                                                       |
|  After: "NASDAQ"                                                       |
|  Reason: "Adding exchange information for all equity holdings"         |
|                                                                        |
|  2025-01-15 09:30 - System Import                                      |
|  Action: Instrument Created                                            |
|  Source: "Asset Manager File Import - January 2025"                    |
|                                                                        |
|  [Export Audit History]                                                |
+------------------------------------------------------------------------+
```

## Incomplete Instrument Alert

When filtering to show incomplete instruments:
```
+------------------------------------------------------------------------+
|  ⚠ 12 INCOMPLETE INSTRUMENTS                                           |
+------------------------------------------------------------------------+
|  These instruments are missing required data for calculations:         |
|                                                                        |
|  • 5 instruments missing credit ratings                                |
|  • 4 instruments missing risk metrics (Duration/YTM)                   |
|  • 3 instruments missing volatility metrics (Beta)                     |
|                                                                        |
|  [Export Missing ISINs to Excel]  [View Outstanding Items by Type]    |
+------------------------------------------------------------------------+
```
