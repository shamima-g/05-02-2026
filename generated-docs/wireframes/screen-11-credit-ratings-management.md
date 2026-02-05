# Screen: Credit Ratings Management

## Purpose
Maintain credit ratings from multiple agencies with change detection, rating history, and decision flow re-execution for regulatory compliance and risk reporting.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Master Data: Instruments | Index Prices | Risk Metrics | Volatility |      |
|               [Credit Ratings v] | Custom Holdings | Reference Data         |
+------------------------------------------------------------------------------+
|                                                                              |
|  Credit Ratings                         Batch: [January 2026 v]             |
|                                                                              |
|  [+ Add Rating]  [📥 Bulk Upload]  [📊 Export]  [⚠ Outstanding Items]      |
|  [🔄 Re-run Rating Decision Logic]  [📈 View Rating Changes]                |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  COMPLETENESS & CHANGE SUMMARY                                         |  |
|  +------------------------------------------------------------------------+  |
|  |  Rated Instruments: 240/245  |  Missing: 5  |  Unrated Class: 12       |  |
|  |  Rating Changes: 3 upgrades, 2 downgrades                              |  |
|  |  [View Missing Ratings]  [View Rating Changes Report]                  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Search: [Search by ISIN, instrument name...........................]  [🔍] |
|                                                                              |
|  Filters:                                                                    |
|  Portfolio: [All v]  Rating Agency: [All v]  Change: [All v]                |
|  Show Only: [ ] Missing Ratings  [ ] Rating Changes  [✓] All Rated          |
|                                                                              |
|  Showing 245 instruments                                                     |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | ISIN         | Instrument      | Final Rating | Change | Actions     |  |
|  +------------------------------------------------------------------------+  |
|  | US1234567890 | Corp Bond A     | BBB+         | ▲ Up   | [View]      |  |
|  |              | Source: Fitch   | (Nat: BBB+)  |        | [Edit]      |  |
|  |              | Previous: BBB   | Upgraded 2025-12-15  | [History]   |  |
|  +------------------------------------------------------------------------+  |
|  | ZA9876543210 | SA Govt Bond    | Baa2         | ─ None | [View]      |  |
|  |              | Source: Moody's | (Nat: A-)    |        | [Edit]      |  |
|  |              | Unchanged                            | [History]   |  |
|  +------------------------------------------------------------------------+  |
|  | GB1122334455 | UK Corporate    | A            | ▼ Down | [View]      |  |
|  |              | Source: S&P     | (Nat: A)     |        | [Edit]      |  |
|  |              | Previous: A+    | Downgraded 2026-01-10| [History]   |  |
|  +------------------------------------------------------------------------+  |
|  | US2345678901 | Muni Bond       | ⚠ MISSING    | —      | [Add]       |  |
|  |              |                 |              |        | [View]      |  |
|  |              | No ratings available                  | [History]   |  |
|  +------------------------------------------------------------------------+  |
|  | US9999888877 | Equity ETF      | UNRATED      | —      | [View]      |  |
|  |              | (Class: Unrated)|              |        | [History]   |  |
|  |              | Auto-assigned per instrument class                   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [1] [2] [3] ... [25]                                  Rows per page: 10    |
|                                                                              |
+------------------------------------------------------------------------------+

VIEW/EDIT RATINGS MODAL:
+------------------------------------------------------------------------------+
|  Credit Ratings - Corp Bond A (US1234567890)                    [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  INSTRUMENT DETAILS                                                          |
|  ISIN:                   US1234567890                                        |
|  Instrument:             Corporate Bond A 5.5% 2028                          |
|  Portfolio:              Fixed Income Fund                                   |
|  Instrument Class:       Corporate Bond (Rated)                              |
|                                                                              |
|  Tab: [Ratings Data] | Decision Logic | Rating History | Change Analysis    |
|                                                                              |
|  RATINGS FROM MULTIPLE SOURCES                                               |
|                                                                              |
|  Bloomberg Composite:    [BBB+.......]  Scale: [International v]            |
|                          Effective: [2026-01-15]  [📅]                       |
|                                                                              |
|  Fitch Rating:           [BBB+.......]  Scale: [International v]            |
|                          Effective: [2025-12-15]  [📅]                       |
|                                                                              |
|  Moody's Rating:         [Baa1......]  Scale: [International v]            |
|                          Effective: [2025-11-20]  [📅]                       |
|                                                                              |
|  S&P Rating:             [BBB.......]  Scale: [International v]            |
|                          Effective: [2025-10-10]  [📅]                       |
|                                                                              |
|  Fund Manager (Inst):    [BBB+.......]  Scale: [International v]            |
|                          Effective: [2026-01-05]  [📅]                       |
|                                                                              |
|  Fund Manager (Issuer):  [BBB.......]  Scale: [International v]            |
|                          Effective: [2025-12-01]  [📅]                       |
|                                                                              |
|  NATIONAL SCALE RATINGS (Optional)                                           |
|                                                                              |
|  Fitch National:         [BBB+.......]  Country: [USA v]                     |
|  S&P National:           [BBB.......]  Country: [USA v]                     |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | FINAL RATING DETERMINATION (Auto-calculated per BR-RULE-001)         |    |
|  +----------------------------------------------------------------------+    |
|  | International Scale: BBB+ (Source: Bloomberg Composite - Priority 1) |    |
|  | National Scale: BBB+ (Source: Fitch National)                        |    |
|  |                                                                      |    |
|  | Decision Hierarchy Applied:                                          |    |
|  | 1. ✓ Bloomberg Composite Rating Available → BBB+ (SELECTED)          |    |
|  | 2. ✓ Fitch Rating Available → BBB+ (not used, lower priority)       |    |
|  | 3. ✓ Moody's Rating Available → Baa1 (not used, lower priority)     |    |
|  | 4. ✓ S&P Rating Available → BBB (not used, lower priority)           |    |
|  | 5. ✓ Fund Manager Instrument → BBB+ (not used, lower priority)      |    |
|  | 6. ✓ Fund Manager Issuer → BBB (not used, lower priority)           |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  Manual Override:        [ ] Override automatic decision                     |
|  If overriding:          [Final rating......]  Reason: [..................]  |
|                                                                              |
|  Notes:                  [Optional notes about ratings................]     |
|                         [................................................]     |
|                                                                              |
|  [Save Ratings]  [Cancel]                                                    |
|                                                                              |
+------------------------------------------------------------------------------+

RATING HISTORY TAB:
+------------------------------------------------------------------------------+
|  Credit Ratings - Corp Bond A (US1234567890)                    [Close ✕]   |
+------------------------------------------------------------------------------+
|  Tab: Ratings Data | Decision Logic | [Rating History] | Change Analysis    |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | RATING HISTORY                                                         |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  | Batch        | Final Rating | Source          | Change               |  |
|  +------------------------------------------------------------------------+  |
|  | Jan 2026     | BBB+         | Bloomberg Comp  | ▲ Upgrade from BBB   |  |
|  |              | (2026-01-31) |                 | Upgraded: 2025-12-15 |  |
|  +------------------------------------------------------------------------+  |
|  | Dec 2025     | BBB          | Bloomberg Comp  | ─ No change          |  |
|  |              | (2025-12-31) |                 |                      |  |
|  +------------------------------------------------------------------------+  |
|  | Nov 2025     | BBB          | Fitch           | ─ No change          |  |
|  |              | (2025-11-30) |                 |                      |  |
|  +------------------------------------------------------------------------+  |
|  | Oct 2025     | BBB          | Fitch           | ▼ Downgrade from BBB+|  |
|  |              | (2025-10-31) |                 | Downgraded: 2025-09-20|  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  | 📈 [View Rating Trend Chart]  [Export History]                        |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

RATING CHANGES REPORT:
+------------------------------------------------------------------------------+
|  Rating Changes Report - January 2026                           [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Period: 2025-12-31 → 2026-01-31                                             |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  UPGRADES (3)                                                    ▲     |  |
|  +------------------------------------------------------------------------+  |
|  |  US1234567890 - Corp Bond A                                            |  |
|  |  Previous: BBB | Current: BBB+ | Source: Bloomberg Composite            |  |
|  |  Change Date: 2025-12-15 | Impact: Investment Grade (maintained)        |  |
|  |                                                                        |  |
|  |  ZA1111222233 - SA Corporate                                           |  |
|  |  Previous: BB+ | Current: BBB- | Source: Fitch                          |  |
|  |  Change Date: 2026-01-05 | Impact: Investment Grade (upgraded)          |  |
|  |                                                                        |  |
|  |  US3333444455 - Financial Services                                     |  |
|  |  Previous: A- | Current: A | Source: S&P                                |  |
|  |  Change Date: 2025-12-20 | Impact: Investment Grade (maintained)        |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  DOWNGRADES (2)                                                  ▼     |  |
|  +------------------------------------------------------------------------+  |
|  |  GB1122334455 - UK Corporate                                           |  |
|  |  Previous: A+ | Current: A | Source: S&P                                |  |
|  |  Change Date: 2026-01-10 | Impact: Investment Grade (maintained)        |  |
|  |                                                                        |  |
|  |  US6666777788 - Tech Company                                           |  |
|  |  Previous: BBB- | Current: BB+ | Source: Moody's                        |  |
|  |  Change Date: 2026-01-12 | Impact: ⚠ BELOW INVESTMENT GRADE            |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Export Rating Changes]  [Notify Portfolio Managers]                       |
|                                                                              |
+------------------------------------------------------------------------------+

OUTSTANDING ITEMS VIEW:
+------------------------------------------------------------------------------+
|  Outstanding Credit Ratings                                     [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  5 rated instruments missing credit ratings                            |  |
|  |  (12 unrated class instruments auto-assigned "UNRATED")                |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  Missing Ratings:                                                      |  |
|  |  • US2345678901 - Muni Bond (USA)                                     |  |
|  |  • GB5555666677 - UK Local Authority Bond (GBR)                       |  |
|  |  • JP7777888899 - Japanese Corporate (JPN)                            |  |
|  |  • AU1111222233 - Australian Bond (AUS)                               |  |
|  |  • CA9999888877 - Canadian Provincial (CAN)                           |  |
|  |                                                                        |  |
|  |  [Export Missing ISINs to Excel]                                       |  |
|  |  [Bulk Upload Ratings]                                                 |  |
|  |                                                                        |  |
|  |  Impact on Reporting:                                                  |  |
|  |  • Credit risk analysis incomplete                                     |  |
|  |  • Investment policy compliance checks may be affected                 |  |
|  |  • Regulatory reporting may require explanation                        |  |
|  |                                                                        |  |
|  |  Missing instruments represent 0.8% of rated holdings value.           |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Close]                                                                     |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Add Rating] | Button | Add ratings for single instrument |
| [📥 Bulk Upload] | Button | Upload Excel file with multiple ratings |
| [📊 Export] | Button | Download current ratings to Excel |
| [⚠ Outstanding Items] | Button | View instruments missing ratings |
| [🔄 Re-run Rating Decision Logic] | Button | Recalculate final ratings using current hierarchy rules |
| [📈 View Rating Changes] | Button | Open rating changes report showing upgrades/downgrades |
| Completeness & Change Summary | Alert Panel | Shows missing ratings count and change summary |
| Instrument Table | Data Table | Shows final rating, change indicator, and source |
| Change Indicator | Visual Icon | ▲ Upgrade, ▼ Downgrade, ─ No change |
| Rating Modal - Multiple Tabs | Tabbed Form | Ratings data entry, decision logic, history, change analysis |
| Rating Sources Fields | Input Fields | All 6 rating sources per BR-RULE-001 hierarchy |
| Final Rating Panel | Auto-calculated Display | Shows which rating was selected and why (decision hierarchy) |
| Manual Override | Checkbox + Input | Allow manual override with required reason |
| Rating History Tab | Timeline View | Shows rating evolution across reporting periods |
| Rating Changes Report | Summary Report | Upgrades and downgrades with investment grade impact |
| National Scale Fields | Optional Inputs | Support both international and national rating scales |

## User Actions

- **Add Rating**: Enter ratings from multiple sources for single instrument
- **Edit Rating**: Modify existing ratings (only during Data Preparation)
- **View Outstanding Items**: See instruments missing ratings
- **View Rating Changes**: See period-over-period upgrades and downgrades
- **Re-run Decision Logic**: Recalculate final ratings when hierarchy rules change
- **Export Missing ISINs**: Download list for sharing with data providers
- **View History**: See rating evolution over time for specific instrument
- **Override Automatic Decision**: Manually select final rating with documented reason
- **Export Rating Changes**: Download upgrade/downgrade report

## Business Rules

- Ratings determined by 6-source hierarchy (BR-RULE-001): Bloomberg → Fitch → Moody's → S&P → Fund Manager Instrument → Fund Manager Issuer
- "Unrated" instrument classes automatically assigned "UNRATED" (excluded from hierarchy)
- Rating changes explicitly tracked period-over-period
- Historical ratings retained indefinitely for compliance
- Modifications only during Data Preparation phase
- All changes audited with user and timestamp
- Both international and national rating scales supported
- Manual overrides require documented reason (audit trail)
- Decision logic can be re-run when rules change
- Investment grade changes (crossing BBB-/Baa3 threshold) highlighted

## Navigation
- **From:** Data validation summary outstanding items, dashboard alerts, instrument master
- **To:** Data validation summary (to verify completion), instrument master

## State Dependencies
- **Data Preparation Phase**: Full edit access, all buttons enabled
- **During Approval**: Read-only access, [Add], [Edit], [Bulk Upload] disabled
- **After Rejection**: Edit access restored immediately
- **Closed Batch**: Read-only historical view

## Decision Logic Tab

Shows rating hierarchy and decision path:
```
+------------------------------------------------------------------------+
|  RATING DECISION LOGIC (BR-RULE-001)                                   |
+------------------------------------------------------------------------+
|  Instrument Class: Corporate Bond (Rated)                              |
|                                                                        |
|  Decision Hierarchy:                                                   |
|  1. Bloomberg Composite Rating → If available, use this (HIGHEST)      |
|  2. Fitch Rating → If Bloomberg unavailable, use this                  |
|  3. Moody's Rating → If Bloomberg and Fitch unavailable, use this      |
|  4. S&P Rating → If top 3 unavailable, use this                        |
|  5. Fund Manager Instrument → If external ratings unavailable          |
|  6. Fund Manager Issuer Rating → Last resort (LOWEST)                  |
|                                                                        |
|  For "Unrated" instrument classes:                                     |
|  • Auto-assign "UNRATED" (hierarchy does not apply)                    |
|                                                                        |
|  Current Decision for US1234567890:                                    |
|  Step 1: Bloomberg Composite = BBB+ ✓ Available → SELECTED            |
|  Final Rating: BBB+ (International), BBB+ (National)                   |
+------------------------------------------------------------------------+
```

## Rating Change Impact Alert

When rating crosses investment grade threshold:
```
+------------------------------------------------------------------------+
|  ⚠ CRITICAL RATING CHANGE                                              |
+------------------------------------------------------------------------+
|  Instrument: Tech Company (US6666777788)                               |
|  Previous: BBB- (Investment Grade)                                     |
|  Current: BB+ (Below Investment Grade)                                 |
|                                                                        |
|  This downgrade crosses the investment grade threshold.                |
|                                                                        |
|  Actions Required:                                                     |
|  • Notify Portfolio Manager immediately                                |
|  • Review investment policy compliance                                 |
|  • Consider position in portfolio                                      |
|  • Update risk reports and client communications                       |
|                                                                        |
|  [Acknowledge]  [Notify PM]  [View Investment Policy]                  |
+------------------------------------------------------------------------+
```
