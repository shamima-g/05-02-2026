# Screen: Risk Metrics Management (Duration & YTM)

## Purpose
Manage risk metrics (Duration and Yield-to-Maturity) for fixed income instruments per reporting batch with outstanding items tracking.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Master Data: Instruments | Index Prices | [Risk Metrics v] | Volatility |  |
|               Credit Ratings | Custom Holdings | Reference Data              |
+------------------------------------------------------------------------------+
|                                                                              |
|  Risk Metrics (Duration & YTM)          Batch: [January 2026 v]             |
|                                                                              |
|  [+ Add Metrics]  [📥 Bulk Upload]  [📊 Export]  [⚠ Outstanding Items]     |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  COMPLETENESS STATUS                                         ⚠          |  |
|  +------------------------------------------------------------------------+  |
|  |  Fixed Income Holdings: 68  |  With Metrics: 64  |  Missing: 4          |  |
|  |  4 instruments require risk metrics before calculations can complete    |  |
|  |  [View Outstanding Items]                                               |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Search: [Search by ISIN, instrument name...........................]  [🔍] |
|                                                                              |
|  Filters:                                                                    |
|  Portfolio: [All v]  Country: [All v]  Status: [All v]                      |
|  Show Only: [✓] Missing Metrics  [ ] Has Metrics  [ ] Updated This Period   |
|                                                                              |
|  Showing 4 instruments with missing risk metrics                            |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | ISIN         | Instrument Name        | Maturity   | Status | Actions |  |
|  +------------------------------------------------------------------------+  |
|  | ZA1234567890 | SA Govt Bond 8.75%     | 2030-01-15 | ⚠ Miss | [Add]   |  |
|  |              | Portfolio: Fixed Income|            |        | [View]  |  |
|  |              | Missing: Duration, YTM                                  |  |
|  +------------------------------------------------------------------------+  |
|  | US2345678901 | Corporate Bond 5.5%    | 2028-06-30 | ⚠ Miss | [Add]   |  |
|  |              | Portfolio: Fixed Income|            |        | [View]  |  |
|  |              | Missing: Duration, YTM                                  |  |
|  +------------------------------------------------------------------------+  |
|  | GB2233445566 | UK Gilt 4.25%          | 2032-12-31 | ⚠ Miss | [Add]   |  |
|  |              | Portfolio: Global Bond |            |        | [View]  |  |
|  |              | Missing: Duration, YTM                                  |  |
|  +------------------------------------------------------------------------+  |
|  | AU9988776655 | Australia Bond 3.75%   | 2029-04-21 | ⚠ Miss | [Add]   |  |
|  |              | Portfolio: Global Bond |            |        | [View]  |  |
|  |              | Missing: Duration, YTM                                  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Clear Filters - Show All 68 Fixed Income Holdings]                        |
|                                                                              |
+------------------------------------------------------------------------------+

ADD/EDIT METRICS MODAL:
+------------------------------------------------------------------------------+
|  Add Risk Metrics - SA Govt Bond 8.75% (ZA1234567890)          [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  INSTRUMENT DETAILS                                                          |
|  ISIN:                   ZA1234567890                                        |
|  Instrument:             SA Govt Bond 8.75% 2030                             |
|  Portfolio:              Fixed Income Fund                                   |
|  Maturity Date:          2030-01-15                                          |
|  Coupon Rate:            8.75%                                               |
|                                                                              |
|  RISK METRICS (as of 2026-01-31)                                             |
|                                                                              |
|  Modified Duration:      [3.45.......]  years                                |
|  Yield to Maturity:      [9.23.......]  %                                    |
|                                                                              |
|  Source:                 [Bloomberg v]  (Bloomberg, Asset Manager, Manual)   |
|  Verification:           [ ] Metrics verified against independent source     |
|                                                                              |
|  Calculation Method:     [Standard v]  (Standard, Custom)                    |
|  If Custom:              [Description of calculation method..........]      |
|                                                                              |
|  Notes:                  [Optional notes about these metrics..........]     |
|                         [................................................]     |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | PREVIOUS PERIOD (December 2025)                                      |    |
|  +----------------------------------------------------------------------+    |
|  | Duration: 3.52 years | YTM: 9.10% | Change: -0.07 yrs / +0.13%      |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | VALIDATION                                                    ✓      |    |
|  +----------------------------------------------------------------------+    |
|  | ✓ Duration is within expected range (0-30 years)                     |    |
|  | ✓ YTM is reasonable for instrument type                              |    |
|  | ✓ Values consistent with maturity date and coupon rate               |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  [Save Metrics]  [Save and Add Next]  [Cancel]                              |
|                                                                              |
+------------------------------------------------------------------------------+

BULK UPLOAD MODAL:
+------------------------------------------------------------------------------+
|  Bulk Upload Risk Metrics                                       [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Upload risk metrics for batch: January 2026 (2026-01-31)                   |
|                                                                              |
|  [📥 Download Template Excel]                                                |
|  [📥 Download Outstanding Items (Pre-filled ISINs)]                          |
|                                                                              |
|  Template includes:                                                          |
|  • ISIN (required)                                                           |
|  • Modified Duration (required, numeric)                                     |
|  • Yield to Maturity (required, numeric)                                     |
|  • Source (optional)                                                         |
|  • Notes (optional)                                                          |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  |  Drag and drop Excel file here, or click to browse                   |    |
|  |                                                                      |    |
|  |                      [Browse Files...]                               |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  Validation Rules:                                                           |
|  • ISIN must exist in instrument master and be fixed income type             |
|  • Duration must be between 0 and 30 years                                   |
|  • YTM must be between -5% and 50%                                           |
|  • Duplicate ISINs will overwrite existing metrics                           |
|                                                                              |
|  [Upload and Validate]  [Cancel]                                             |
|                                                                              |
+------------------------------------------------------------------------------+

OUTSTANDING ITEMS VIEW:
+------------------------------------------------------------------------------+
|  Outstanding Risk Metrics                                       [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  4 fixed income instruments missing risk metrics                       |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  Portfolio: Fixed Income Fund (2 instruments)                          |  |
|  |  • ZA1234567890 - SA Govt Bond 8.75% 2030                             |  |
|  |  • US2345678901 - Corporate Bond 5.5% 2028                            |  |
|  |                                                                        |  |
|  |  Portfolio: Global Bond Fund (2 instruments)                           |  |
|  |  • GB2233445566 - UK Gilt 4.25% 2032                                  |  |
|  |  • AU9988776655 - Australia Bond 3.75% 2029                           |  |
|  |                                                                        |  |
|  |  [Export Outstanding ISINs to Excel]                                   |  |
|  |  [Bulk Upload Metrics]                                                 |  |
|  |                                                                        |  |
|  |  Impact on Calculations:                                               |  |
|  |  • Portfolio risk analysis incomplete                                  |  |
|  |  • Duration contribution calculations will exclude these instruments   |  |
|  |  • Risk reports will show data gaps                                    |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Close]                                                                     |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Add Metrics] | Button | Add metrics for single instrument |
| [📥 Bulk Upload] | Button | Upload Excel file with multiple risk metrics |
| [📊 Export] | Button | Download current metrics to Excel |
| [⚠ Outstanding Items] | Button | View detailed list of instruments missing metrics |
| Completeness Status | Alert Panel | Shows completion count and identifies gaps |
| Filter Controls | Checkbox + Dropdown | Filter to show missing, complete, or recently updated |
| Instrument Table | Data Table | Shows instruments with missing metrics prominently |
| Status Badge | Visual Indicator | ⚠ Missing, ✓ Complete, ⏱ Updated |
| [Add] | Link | Open form to enter risk metrics for instrument |
| [View] | Link | View existing metrics (read-only) |
| Add/Edit Modal | Overlay Form | Enter duration and YTM with validation |
| Previous Period Panel | Reference Display | Shows prior period values for comparison |
| Validation Panel | Status Display | Validates metrics against expected ranges |
| [Save and Add Next] | Button | Save current and auto-open next missing instrument |

## User Actions

- **Add Metrics**: Enter duration and YTM for single instrument
- **Bulk Upload**: Upload Excel file with multiple metrics for rapid entry
- **View Outstanding Items**: See detailed list of instruments requiring metrics
- **Export Outstanding**: Download list of ISINs needing metrics for sharing
- **Filter Missing**: Show only instruments without metrics
- **Save and Add Next**: Workflow optimization for entering multiple metrics sequentially
- **Verify Metrics**: Mark metrics as verified against independent source

## Business Rules

- Risk metrics tied to specific reporting batch (time-dependent)
- Only applicable to fixed income instruments (equity excluded)
- Missing metrics identified before calculations run
- Historical values retained for trend analysis
- All changes audited with user and timestamp
- Modifications only during Data Preparation phase
- Validation checks ensure reasonable values (duration 0-30 years, YTM -5% to 50%)
- Metrics can be imported from multiple sources (Bloomberg, Asset Manager, Manual)

## Navigation
- **From:** Data validation summary outstanding items, dashboard alerts, instrument master
- **To:** Data validation summary (to verify completion), calculation status

## State Dependencies
- **Data Preparation Phase**: Full edit access, all buttons enabled
- **During Approval**: Read-only access, [Add], [Edit], [Bulk Upload] disabled
- **After Rejection**: Edit access restored immediately
- **Closed Batch**: Read-only historical view

## Calculation Impact Warning

When proceeding with missing metrics:
```
+------------------------------------------------------------------------+
|  ⚠ IMPACT ON CALCULATIONS                                              |
+------------------------------------------------------------------------+
|  4 instruments are missing risk metrics.                               |
|                                                                        |
|  This will affect:                                                     |
|  • Portfolio duration calculation (incomplete)                         |
|  • Interest rate sensitivity analysis (gaps in data)                   |
|  • Risk attribution reporting (excluded instruments)                   |
|                                                                        |
|  Missing instruments represent 2.3% of total fixed income value.       |
|                                                                        |
|  You can proceed with gaps if business judgment warrants, but this     |
|  will be visible to approvers.                                         |
+------------------------------------------------------------------------+
```

## Validation Errors

When entering invalid metrics:
```
+------------------------------------------------------------------------+
|  ⚠ VALIDATION ERRORS                                                   |
+------------------------------------------------------------------------+
|  Please correct the following before saving:                           |
|                                                                        |
|  • Duration: Value "45.6" exceeds maximum of 30 years                  |
|    For this maturity date (2030-01-15), expected range is 3-5 years   |
|                                                                        |
|  • YTM: Value "75.5%" is unusually high                                |
|    Expected range for government bonds: 0-15%                          |
|                                                                        |
|  [Review and Correct]                                                  |
+------------------------------------------------------------------------+
```
