# Screen: Data Validation Summary

## Purpose
Comprehensive completeness checks organized by category (File, Portfolio, Reference Data) with drill-down capability to identify and resolve data gaps.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  Data Validation Summary            Batch: [January 2026 v]                 |
|                                                                              |
|  Overall Status: ⚠ 3 Warnings, 12 Outstanding Items      [Confirm Ready]   |
|                                                                              |
|  ┌──────────────────────────────────────────────────────────────────────┐   |
|  │ VALIDATION CATEGORIES                                                │   |
|  │                                                                      │   |
|  │  [File Completeness     ] ✓  No Issues      0 items    [View >]    │   |
|  │  [Portfolio Data        ] ⚠  3 Warnings    45 items    [View >]    │   |
|  │  [Reference Data        ] ⚠  12 Outstanding 12 items   [View >]    │   |
|  │  [Calculations          ] ✓  Complete       0 errors   [View >]    │   |
|  └──────────────────────────────────────────────────────────────────────┘   |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  FILE COMPLETENESS                                              ✓      |  |
|  +------------------------------------------------------------------------+  |
|  |  [Collapsed - All files received, click to view details]               |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  PORTFOLIO DATA COMPLETENESS                                    ⚠      |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  ✓  Holdings Data: Complete (245 positions across 5 portfolios)       |  |
|  |  ✓  Transaction Data: Complete (89 transactions)                      |  |
|  |  ✓  Income Data: Complete (34 income events)                          |  |
|  |  ✓  Cash Data: Complete (5 portfolios)                                |  |
|  |  ⚠  Performance Data: 2 portfolios missing attribution details         |  |
|  |     [View Details] - Global Equity Fund, Emerging Markets Fund         |  |
|  |  ✓  Fee Data: Complete (5 portfolios)                                 |  |
|  |  ⚠  Custodian Verification: 1 currency pending (ZAR holdings)          |  |
|  |     [View File Status] - File still processing                         |  |
|  |                                                                        |  |
|  |  Business Decision:                                                    |  |
|  |  [ ] Proceed with known gaps (will be visible to approvers)            |  |
|  |  Documentation: [Optional explanation for approvers...............]    |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  REFERENCE DATA COMPLETENESS                                    ⚠      |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  Instrument Master Data:                                               |  |
|  |  ✓  All holdings instruments defined (245/245)                         |  |
|  |                                                                        |  |
|  |  Index Prices:                                                         |  |
|  |  ✓  All required index prices available (8/8)                          |  |
|  |                                                                        |  |
|  |  Credit Ratings:                                                       |  |
|  |  ⚠  5 instruments missing ratings                    [Fix Now >]       |  |
|  |     ISIN: US1234567890, ZA9876543210, GB1122334455...                  |  |
|  |     [Export Missing ISINs to Excel]                                    |  |
|  |                                                                        |  |
|  |  Risk Metrics (Duration/YTM):                                          |  |
|  |  ⚠  4 fixed income instruments missing duration      [Fix Now >]       |  |
|  |     ISIN: US2345678901, ZA8765432109, GB2233445566...                  |  |
|  |                                                                        |  |
|  |  Volatility Metrics (Beta):                                            |  |
|  |  ⚠  3 equity instruments missing beta values         [Fix Now >]       |  |
|  |     ISIN: US3456789012, JP9876543210, DE3344556677                     |  |
|  |                                                                        |  |
|  |  Outstanding Items: 12 total                                           |  |
|  |  [View All Outstanding Items]  [Export Outstanding to Excel]           |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  CALCULATION STATUS                                             ✓      |  |
|  +------------------------------------------------------------------------+  |
|  |  Last Run: 2026-01-05 14:30:22                                         |  |
|  |  Status: All calculations completed successfully                       |  |
|  |  Duration: 2m 34s                                                      |  |
|  |                                                                        |  |
|  |  [View Calculation Details]  [Re-run Calculations]                     |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Confirm Data Ready for Approval]  [Export Validation Report]             |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Overall Status | Summary Banner | Shows total warnings and outstanding items at a glance |
| Validation Categories | Tab Group | High-level summary cards for each validation dimension |
| Status Icons | Visual Indicator | ✓ Complete, ⚠ Warning, ✗ Critical Error |
| Collapsible Section | Expandable Panel | Detailed breakdown of each validation category |
| [Fix Now >] | Action Link | Navigate directly to master data screen to correct missing items |
| Outstanding Items List | Data List | Shows specific ISINs/instruments requiring attention with counts |
| [Export Missing ISINs] | Button | Download list of incomplete instruments for sharing with data providers |
| Business Decision Checkbox | Optional Override | Allow progression despite gaps with documented reason |
| [Confirm Data Ready] | Primary Button | Mark data preparation complete, unlock approval workflow |
| Calculation Status Panel | Status Display | Shows last calculation run time, status, and duration |

## User Actions

- **View Category Details**: Expand/collapse sections to see detailed validation results
- **Fix Outstanding Items**: Click [Fix Now >] to navigate to relevant master data screen
- **Export Outstanding Items**: Download Excel list of instruments requiring data entry
- **Document Business Decision**: Enter explanation for proceeding with known gaps
- **Confirm Data Ready**: Mark data preparation phase complete (enables Level 1 Approval)
- **Re-run Calculations**: Trigger fresh calculation execution after data corrections
- **Export Validation Report**: Download complete validation summary for documentation

## Business Rules

- Validation results update in real-time as data is corrected
- Outstanding items quantified (not just yes/no flags)
- Users can proceed with gaps if business judgment warrants (checkbox + explanation)
- Approvers see same validation results (transparency requirement)
- Calculation checkpoint blocks progression if calculations fail
- Failed calculations show detailed error messages with correction guidance

## Navigation
- **From:** Dashboard pending actions, file status monitor, batch management
- **To:** Master data screens (via [Fix Now >] links), calculation status monitor, approval review

## State Dependencies
- **Data Preparation Phase**: All [Fix Now >] links enabled, [Confirm Ready] button enabled
- **During Approval**: Read-only view, validation results frozen at confirmation time
- **After Rejection**: Edit capabilities restored, validation re-run automatically
- **Closed Batch**: Read-only historical view

## Calculation Checkpoint

When calculations fail, prominent error display:
```
+------------------------------------------------------------------------+
|  CALCULATION STATUS                                             ✗      |
+------------------------------------------------------------------------+
|  Last Run: 2026-01-05 14:30:22                                         |
|  Status: 3 calculations failed                                         |
|                                                                        |
|  Failed Calculations:                                                  |
|  • Portfolio Performance (Global Equity Fund)                          |
|    Error: Missing benchmark price for MSCI World                       |
|  • Risk Attribution (Fixed Income Fund)                                |
|    Error: 4 instruments missing duration values                        |
|  • Fee Calculation (Emerging Markets Fund)                             |
|    Error: Invalid base currency for holdings                           |
|                                                                        |
|  [View Full Error Log]  [Fix Issues and Re-run]                        |
+------------------------------------------------------------------------+

⚠ Calculations must complete successfully before approval can proceed
```
