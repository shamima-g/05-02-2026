# Screen: Calculation Status Monitor

## Purpose
Track calculation execution, view failures with detailed error messages, verify calculation success before workflow progression, and provide actionable error resolution guidance.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  Calculation Status Monitor             Batch: [January 2026 v]             |
|                                                                              |
|  [▶ Run All Calculations]  [🔄 Refresh Status]  [📊 Export Report]          |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  CALCULATION CHECKPOINT STATUS                               ✓         |  |
|  +------------------------------------------------------------------------+  |
|  |  All calculations completed successfully                               |  |
|  |  Last Run: 2026-01-05 14:30:22 | Duration: 2m 34s                      |  |
|  |  Ready to proceed to approval workflow                                 |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  CALCULATION EXECUTION SUMMARY                                               |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Calculation Category      | Status    | Count  | Duration | Actions  |  |
|  +------------------------------------------------------------------------+  |
|  | Portfolio Valuation       | ✓ Success | 5/5    | 45s      | [View]   |  |
|  | All portfolios valued successfully                                     |  |
|  +------------------------------------------------------------------------+  |
|  | Performance Calculations  | ✓ Success | 5/5    | 38s      | [View]   |  |
|  | Returns, attribution, and benchmark comparisons complete               |  |
|  +------------------------------------------------------------------------+  |
|  | Risk Analysis             | ✓ Success | 5/5    | 42s      | [View]   |  |
|  | Duration, volatility, and risk metrics calculated                      |  |
|  +------------------------------------------------------------------------+  |
|  | Fee Calculations          | ✓ Success | 5/5    | 12s      | [View]   |  |
|  | Management and custody fees calculated                                 |  |
|  +------------------------------------------------------------------------+  |
|  | Credit Quality Analysis   | ✓ Success | 5/5    | 17s      | [View]   |  |
|  | Rating distribution and credit exposure complete                       |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Total: 25 calculations | ✓ 25 successful | ✗ 0 failed | Duration: 2m 34s  |
|                                                                              |
|  CALCULATION HISTORY                                                         |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Run Time           | Status    | Duration | Success | Failed | Details|  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-05 14:30   | ✓ Success | 2m 34s   | 25/25   | 0      | [View] |  |
|  | 2026-01-05 12:15   | ✗ Failed  | 1m 45s   | 22/25   | 3      | [View] |  |
|  | 2026-01-05 10:30   | ✓ Success | 2m 42s   | 25/25   | 0      | [View] |  |
|  | 2026-01-04 16:45   | ✗ Failed  | 0m 30s   | 15/25   | 10     | [View] |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

CALCULATION DETAIL VIEW (SUCCESS):
+------------------------------------------------------------------------------+
|  Calculation Details - Portfolio Valuation                      [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  CALCULATION INFORMATION                                                     |
|                                                                              |
|  Category:               Portfolio Valuation                                 |
|  Batch:                  January 2026 (2026-01-31)                           |
|  Execution Time:         2026-01-05 14:30:22                                 |
|  Duration:               45 seconds                                          |
|  Status:                 ✓ Success                                           |
|                                                                              |
|  CALCULATIONS EXECUTED                                                       |
|                                                                              |
|  1. Global Equity Fund Valuation                    ✓ Success (8s)          |
|     • Holdings valuation: 245 positions                                      |
|     • Total market value: $125,456,789                                       |
|     • Cash positions: $2,345,678                                             |
|     • Total NAV: $127,802,467                                                |
|                                                                              |
|  2. Fixed Income Fund Valuation                     ✓ Success (9s)          |
|     • Holdings valuation: 68 positions                                       |
|     • Total market value: $87,654,321                                        |
|     • Accrued interest: $456,789                                             |
|     • Cash positions: $1,234,567                                             |
|     • Total NAV: $89,345,677                                                 |
|                                                                              |
|  3. International Equity Fund Valuation             ✓ Success (10s)         |
|     • Holdings valuation: 134 positions                                      |
|     • Total market value: $98,765,432                                        |
|     • Currency adjustments: -$345,678                                        |
|     • Cash positions: $1,876,543                                             |
|     • Total NAV: $100,296,297                                                |
|                                                                              |
|  4. Emerging Markets Fund Valuation                 ✓ Success (9s)          |
|     • Holdings valuation: 89 positions                                       |
|     • Total market value: $45,678,901                                        |
|     • Currency adjustments: +$234,567                                        |
|     • Cash positions: $987,654                                               |
|     • Total NAV: $46,901,122                                                 |
|                                                                              |
|  5. Alternative Assets Fund Valuation               ✓ Success (9s)          |
|     • Holdings valuation: 12 positions                                       |
|     • Total market value: $23,456,789                                        |
|     • Estimated valuations: 8 positions                                      |
|     • Cash positions: $567,890                                               |
|     • Total NAV: $24,024,679                                                 |
|                                                                              |
|  VALIDATION CHECKS                                                           |
|                                                                              |
|  ✓ All holdings have valid prices                                            |
|  ✓ All currency conversions successful                                       |
|  ✓ Cash balances reconcile with custodian                                    |
|  ✓ Total portfolio values within expected range                              |
|  ✓ NAV per share calculations correct                                        |
|                                                                              |
|  [View Detailed Results]  [Export to Excel]  [Close]                         |
|                                                                              |
+------------------------------------------------------------------------------+

FAILED CALCULATION VIEW:
+------------------------------------------------------------------------------+
|  Calculation Status Monitor             Batch: [December 2025 v]            |
|                                                                              |
|  [▶ Run All Calculations]  [🔄 Refresh Status]  [📊 Export Report]          |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  CALCULATION CHECKPOINT STATUS                               ✗         |  |
|  +------------------------------------------------------------------------+  |
|  |  ⚠ 3 calculations failed - workflow progression blocked                |  |
|  |  Last Run: 2026-01-05 12:15:45 | Duration: 1m 45s (terminated early)   |  |
|  |  Calculations must complete successfully before approval can proceed   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  CALCULATION EXECUTION SUMMARY                                               |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Calculation Category      | Status    | Count  | Duration | Actions  |  |
|  +------------------------------------------------------------------------+  |
|  | Portfolio Valuation       | ✗ Failed  | 4/5    | 30s      | [View]   |  |
|  | 1 portfolio failed: Global Equity Fund                                 |  |
|  | Error: Missing benchmark price for MSCI World                          |  |
|  | [Fix Issue] [View Error Details]                                       |  |
|  +------------------------------------------------------------------------+  |
|  | Performance Calculations  | ✗ Failed  | 3/5    | 25s      | [View]   |  |
|  | 2 portfolios failed: Global Equity, International Equity               |  |
|  | Error: Cannot calculate performance without benchmark prices           |  |
|  | [Fix Issue] [View Error Details]                                       |  |
|  +------------------------------------------------------------------------+  |
|  | Risk Analysis             | ✗ Failed  | 1/5    | 18s      | [View]   |  |
|  | 4 instruments missing duration values                                  |  |
|  | Error: Portfolio duration calculation incomplete                       |  |
|  | [Fix Issue] [View Error Details]                                       |  |
|  +------------------------------------------------------------------------+  |
|  | Fee Calculations          | ✓ Success | 5/5    | 12s      | [View]   |  |
|  | All fee calculations completed successfully                            |  |
|  +------------------------------------------------------------------------+  |
|  | Credit Quality Analysis   | ✓ Success | 5/5    | 20s      | [View]   |  |
|  | Credit analysis completed with 5 unrated instruments                   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Total: 25 calculations | ✓ 22 successful | ✗ 3 failed | Duration: 1m 45s  |
|                                                                              |
|  ⚠ FAILED CALCULATIONS - RESOLUTION REQUIRED                                 |
|                                                                              |
|  [Fix All Issues and Re-run]  [View Error Summary]                          |
|                                                                              |
+------------------------------------------------------------------------------+

CALCULATION ERROR DETAIL VIEW:
+------------------------------------------------------------------------------+
|  Calculation Error Details - Portfolio Valuation                [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  ERROR INFORMATION                                                           |
|                                                                              |
|  Calculation:            Portfolio Valuation - Global Equity Fund            |
|  Batch:                  December 2025 (2025-12-31)                          |
|  Execution Time:         2026-01-05 12:15:45                                 |
|  Status:                 ✗ Failed                                            |
|  Error Category:         Missing Reference Data                              |
|  Severity:               CRITICAL (blocks workflow progression)              |
|                                                                              |
|  PRIMARY ERROR                                                               |
|                                                                              |
|  Error Code:             CALC_ERR_003                                        |
|  Error Message:          Missing benchmark price for MSCI World              |
|                                                                              |
|  DETAILED ANALYSIS                                                           |
|                                                                              |
|  The performance calculation for Global Equity Fund requires the MSCI World  |
|  index price for the reporting date (2025-12-31), but this price is not      |
|  available in the system.                                                    |
|                                                                              |
|  Impact:                                                                     |
|  • Portfolio valuation cannot complete                                       |
|  • Performance attribution cannot be calculated                              |
|  • Benchmark comparison reports will be incomplete                           |
|  • Approval workflow is blocked until resolved                               |
|                                                                              |
|  ROOT CAUSE                                                                  |
|                                                                              |
|  The index price for MSCI World (Index Code: MXWO) for date 2025-12-31      |
|  is missing from the Index Prices master data.                               |
|                                                                              |
|  Expected Data:                                                              |
|  • Index: MSCI World (MXWO)                                                  |
|  • Required Date: 2025-12-31                                                 |
|  • Status: Not found in database                                             |
|                                                                              |
|  Last Available Price:                                                       |
|  • Date: 2025-11-30                                                          |
|  • Price: 3,172.45 USD                                                       |
|  • Source: Bloomberg                                                         |
|                                                                              |
|  RESOLUTION STEPS                                                            |
|                                                                              |
|  Step 1: Add Missing Index Price (RECOMMENDED)                               |
|  Navigate to Master Data > Index Prices and enter the MSCI World price      |
|  for 2025-12-31.                                                             |
|                                                                              |
|  [Go to Index Prices Management]                                             |
|                                                                              |
|  Expected Resolution Time: 2-5 minutes                                       |
|  After adding price, calculations will automatically re-run.                 |
|                                                                              |
|  Step 2: Verify Price Source                                                 |
|  If price is not available from Bloomberg feed, verify:                      |
|  • Was Bloomberg file received for this date?                                |
|  • Did file import fail validation?                                          |
|  • Is manual entry required?                                                 |
|                                                                              |
|  [Check File Status Monitor]                                                 |
|                                                                              |
|  RELATED ERRORS                                                              |
|                                                                              |
|  The following calculations also failed due to this missing price:           |
|  • Performance Calculation - Global Equity Fund                              |
|  • Performance Attribution - Global Equity Fund                              |
|                                                                              |
|  Resolving this error will fix 3 failed calculations.                        |
|                                                                              |
|  RETRY HISTORY                                                               |
|                                                                              |
|  Attempt 1: 2026-01-05 10:30:15 - Failed (missing price)                     |
|  Attempt 2: 2026-01-05 12:15:45 - Failed (same error)                        |
|                                                                              |
|  [Fix Issue and Re-run]  [Export Error Report]  [Close]                      |
|                                                                              |
+------------------------------------------------------------------------------+

CALCULATION ERROR DETAIL VIEW (MULTIPLE INSTRUMENTS):
+------------------------------------------------------------------------------+
|  Calculation Error Details - Risk Analysis                      [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  ERROR INFORMATION                                                           |
|                                                                              |
|  Calculation:            Risk Analysis - Fixed Income Fund                   |
|  Batch:                  December 2025 (2025-12-31)                          |
|  Execution Time:         2026-01-05 12:16:03                                 |
|  Status:                 ✗ Failed                                            |
|  Error Category:         Incomplete Master Data                              |
|  Severity:               HIGH (blocks complete risk reporting)               |
|                                                                              |
|  PRIMARY ERROR                                                               |
|                                                                              |
|  Error Code:             CALC_ERR_007                                        |
|  Error Message:          4 instruments missing duration values               |
|                                                                              |
|  DETAILED ANALYSIS                                                           |
|                                                                              |
|  The portfolio duration calculation for Fixed Income Fund cannot complete    |
|  because 4 fixed income instruments are missing duration (interest rate      |
|  sensitivity) values.                                                        |
|                                                                              |
|  Missing Duration for:                                                       |
|                                                                              |
|  1. ZA1234567890 - SA Govt Bond 8.75% 2030                                   |
|     • Maturity: 2030-01-15                                                   |
|     • Position Value: $1,234,567                                             |
|     • % of Portfolio: 1.4%                                                   |
|                                                                              |
|  2. US2345678901 - Corporate Bond 5.5% 2028                                  |
|     • Maturity: 2028-06-30                                                   |
|     • Position Value: $987,654                                               |
|     • % of Portfolio: 1.1%                                                   |
|                                                                              |
|  3. GB2233445566 - UK Gilt 4.25% 2032                                        |
|     • Maturity: 2032-12-31                                                   |
|     • Position Value: $2,345,678                                             |
|     • % of Portfolio: 2.7%                                                   |
|                                                                              |
|  4. AU9988776655 - Australia Bond 3.75% 2029                                 |
|     • Maturity: 2029-04-21                                                   |
|     • Position Value: $1,567,890                                             |
|     • % of Portfolio: 1.8%                                                   |
|                                                                              |
|  Total Missing: $6,135,789 (7.0% of portfolio)                               |
|                                                                              |
|  Impact:                                                                     |
|  • Portfolio duration calculation incomplete                                 |
|  • Interest rate sensitivity analysis inaccurate                             |
|  • Risk reports will show incomplete data                                    |
|  • Regulatory reporting may require explanation                              |
|                                                                              |
|  RESOLUTION STEPS                                                            |
|                                                                              |
|  Option 1: Add Missing Duration Values (RECOMMENDED)                         |
|  Navigate to Master Data > Risk Metrics and enter duration values for        |
|  these 4 instruments.                                                        |
|                                                                              |
|  [Go to Risk Metrics Management]                                             |
|  [Export Missing ISINs to Excel]                                             |
|                                                                              |
|  Expected Resolution Time: 5-10 minutes for manual entry                     |
|  Note: You can proceed with incomplete data if business judgment warrants,   |
|  but this will be visible to approvers.                                      |
|                                                                              |
|  Option 2: Proceed with Incomplete Data                                      |
|  The calculation will complete but exclude these 4 instruments from          |
|  duration analysis. This gap will be reported to approvers.                  |
|                                                                              |
|  [Mark as Acceptable and Re-run]                                             |
|                                                                              |
|  BUSINESS JUDGMENT SUPPORT                                                   |
|                                                                              |
|  Missing instruments represent 7.0% of portfolio value.                      |
|                                                                              |
|  Consider:                                                                   |
|  • Is this acceptable for timely reporting?                                  |
|  • Will approvers accept incomplete risk data?                               |
|  • Can duration values be obtained quickly?                                  |
|                                                                              |
|  [Document Decision and Proceed]  [Fix Issue First]                          |
|                                                                              |
+------------------------------------------------------------------------------+

CALCULATION EXECUTION LOG:
+------------------------------------------------------------------------------+
|  Calculation Execution Log - 2026-01-05 14:30:22                [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|  Execution Started: 2026-01-05 14:30:22                                      |
|  Execution Completed: 2026-01-05 14:32:56                                    |
|  Total Duration: 2m 34s                                                      |
|  Status: ✓ All Calculations Successful                                       |
|                                                                              |
|  DETAILED EXECUTION LOG                                                      |
|                                                                              |
|  14:30:22 [INFO] Calculation execution initiated by user: John Smith        |
|  14:30:22 [INFO] Batch: January 2026 (ID: BATCH-2026-01)                    |
|  14:30:22 [INFO] Validating prerequisites...                                |
|  14:30:23 [INFO] Data preparation phase complete: ✓                         |
|  14:30:23 [INFO] All required files imported: ✓                             |
|  14:30:23 [INFO] Master data completeness check: ✓                          |
|  14:30:24 [INFO] Beginning calculation execution...                         |
|                                                                              |
|  14:30:24 [INFO] === Portfolio Valuation ===                                |
|  14:30:24 [INFO] Calculating Global Equity Fund...                          |
|  14:30:32 [INFO] Global Equity Fund complete: $127,802,467 (8s)             |
|  14:30:32 [INFO] Calculating Fixed Income Fund...                           |
|  14:30:41 [INFO] Fixed Income Fund complete: $89,345,677 (9s)               |
|  14:30:41 [INFO] Calculating International Equity Fund...                   |
|  14:30:51 [INFO] International Equity complete: $100,296,297 (10s)          |
|  14:30:51 [INFO] Calculating Emerging Markets Fund...                       |
|  14:31:00 [INFO] Emerging Markets complete: $46,901,122 (9s)                |
|  14:31:00 [INFO] Calculating Alternative Assets Fund...                     |
|  14:31:09 [INFO] Alternative Assets complete: $24,024,679 (9s)              |
|  14:31:09 [INFO] Portfolio Valuation: ✓ 5/5 successful (45s)                |
|                                                                              |
|  14:31:09 [INFO] === Performance Calculations ===                           |
|  14:31:09 [INFO] Calculating returns for all portfolios...                  |
|  14:31:47 [INFO] Performance Calculations: ✓ 5/5 successful (38s)           |
|                                                                              |
|  14:31:47 [INFO] === Risk Analysis ===                                      |
|  14:31:47 [INFO] Calculating risk metrics for all portfolios...             |
|  14:32:29 [INFO] Risk Analysis: ✓ 5/5 successful (42s)                      |
|                                                                              |
|  14:32:29 [INFO] === Fee Calculations ===                                   |
|  14:32:29 [INFO] Calculating management and custody fees...                 |
|  14:32:41 [INFO] Fee Calculations: ✓ 5/5 successful (12s)                   |
|                                                                              |
|  14:32:41 [INFO] === Credit Quality Analysis ===                            |
|  14:32:41 [INFO] Analyzing credit ratings and exposures...                  |
|  14:32:58 [INFO] Credit Quality Analysis: ✓ 5/5 successful (17s)            |
|                                                                              |
|  14:32:58 [INFO] All calculations completed successfully                    |
|  14:32:58 [INFO] Total: 25 calculations, 25 successful, 0 failed            |
|  14:32:58 [INFO] Duration: 2m 34s                                           |
|  14:32:58 [INFO] Calculation checkpoint: PASSED                             |
|  14:32:58 [INFO] Workflow can proceed to approval                           |
|                                                                              |
|  [Export Log]  [Close]                                                       |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [▶ Run All Calculations] | Button | Execute all calculations for current batch |
| [🔄 Refresh Status] | Button | Update calculation status in real-time |
| [📊 Export Report] | Button | Download calculation results and status report |
| Calculation Checkpoint Panel | Status Banner | Shows overall pass/fail status for workflow progression |
| Calculation Summary Table | Data Table | Shows calculation categories with success/failure counts |
| [View] | Link | View detailed results for specific calculation category |
| [Fix Issue] | Link | Navigate to screen where data gap can be corrected |
| Calculation History | Timeline Table | Shows historical calculation runs with outcomes |
| Detail View Modal | Overlay | Complete calculation results or error details |
| Error Detail Panel | Alert Section | Detailed error analysis with resolution guidance |
| Missing Data List | Item List | Shows specific instruments or data elements missing |
| Resolution Steps | Guided Actions | Step-by-step guidance to fix calculation errors |
| [Go to Index Prices] | Action Link | Direct navigation to fix missing reference data |
| [Export Missing ISINs] | Button | Download list of incomplete instruments |
| Business Judgment Panel | Decision Support | Guidance for proceeding with incomplete data |
| Execution Log | Text Display | Complete chronological log of calculation execution |

## User Actions

- **Run All Calculations**: Execute all calculations for batch
- **Refresh Status**: Update status in real-time (auto-refresh available)
- **View Calculation Results**: See detailed results for specific calculation
- **View Error Details**: See comprehensive error analysis with resolution steps
- **Fix Issue**: Navigate directly to screen where data can be corrected
- **Export Missing ISINs**: Download list for sharing with data providers
- **Document Decision**: Document business judgment to proceed with gaps
- **View Execution Log**: See detailed chronological log of execution
- **Export Report**: Download complete calculation results for documentation

## Business Rules

- Failed calculations must block workflow advancement (critical control)
- Detailed error information provided with correction guidance
- Calculation history retained for troubleshooting and audit
- Performance must not degrade with large data volumes
- Calculations re-run automatically after data corrections
- Users may proceed despite incomplete data with documented decision
- Approvers see same calculation status as operations team
- Calculation success required before Level 1 Approval can proceed

## Navigation
- **From:** Data validation summary, dashboard, workflow state viewer
- **To:** Master data screens (to fix missing data), data validation summary

## Calculation Categories

### Portfolio Valuation
- Holdings valuation at market prices
- Cash position aggregation
- Currency conversion
- Net Asset Value (NAV) calculation

### Performance Calculations
- Period returns (MTD, QTD, YTD)
- Benchmark comparison
- Performance attribution
- Contribution analysis

### Risk Analysis
- Portfolio duration
- Interest rate sensitivity
- Volatility metrics
- Value at Risk (VaR)

### Fee Calculations
- Management fees (exclusive and inclusive of VAT)
- Custody fees
- Currency assignment from portfolio master

### Credit Quality Analysis
- Rating distribution
- Investment grade vs non-investment grade
- Credit exposure concentration
- Rating migration tracking

## Error Resolution

For each error, system provides:
- Error code and category
- Detailed error message
- Root cause analysis
- Impact assessment
- Step-by-step resolution guidance
- Direct navigation to fix location
- Expected resolution time
- Related calculations affected

## Business Judgment Support

When data is incomplete:
- Quantify missing data (count and % of portfolio)
- Assess materiality (value and impact)
- Provide context for approvers
- Allow documented decision to proceed
- Flag gaps prominently in validation summary

## Calculation Checkpoint

Critical workflow gate:
- Calculations MUST succeed before approval workflow
- Failed calculations block progression
- Detailed error information guides rapid resolution
- Users can document business decision to proceed with gaps
- Approvers see calculation status and any documented decisions
