# Screen: Volatility Management (Instrument Beta)

## Purpose
Manage instrument beta values (volatility relative to market) per reporting batch with outstanding items tracking for portfolio risk analysis.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Master Data: Instruments | Index Prices | Risk Metrics | [Volatility v] |  |
|               Credit Ratings | Custom Holdings | Reference Data              |
+------------------------------------------------------------------------------+
|                                                                              |
|  Volatility Metrics (Beta)              Batch: [January 2026 v]             |
|                                                                              |
|  [+ Add Beta]  [📥 Bulk Upload]  [📊 Export]  [⚠ Outstanding Items]        |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  COMPLETENESS STATUS                                         ⚠          |  |
|  +------------------------------------------------------------------------+  |
|  |  Equity Holdings: 177  |  With Beta: 174  |  Missing: 3                 |  |
|  |  3 instruments require beta values for complete volatility analysis     |  |
|  |  [View Outstanding Items]                                               |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Search: [Search by ISIN, instrument name...........................]  [🔍] |
|                                                                              |
|  Filters:                                                                    |
|  Portfolio: [All v]  Country: [All v]  Benchmark: [All v]                   |
|  Show Only: [✓] Missing Beta  [ ] Has Beta  [ ] Updated This Period         |
|                                                                              |
|  Showing 3 instruments with missing beta values                             |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | ISIN         | Instrument Name    | Country | Benchmark | Status     |  |
|  +------------------------------------------------------------------------+  |
|  | US3456789012 | Tech Startup Corp  | USA     | S&P 500   | ⚠ Miss     |  |
|  |              | Portfolio: Equity  |         |           | [Add][View]|  |
|  |              | Missing: Beta                                           |  |
|  +------------------------------------------------------------------------+  |
|  | JP9876543210 | Japanese Retailer  | JPN     | Nikkei225 | ⚠ Miss     |  |
|  |              | Portfolio: Intl Eq |         |           | [Add][View]|  |
|  |              | Missing: Beta                                           |  |
|  +------------------------------------------------------------------------+  |
|  | DE3344556677 | German Industrial  | DEU     | DAX       | ⚠ Miss     |  |
|  |              | Portfolio: Intl Eq |         |           | [Add][View]|  |
|  |              | Missing: Beta                                           |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Clear Filters - Show All 177 Equity Holdings]                             |
|                                                                              |
+------------------------------------------------------------------------------+

ADD/EDIT BETA MODAL:
+------------------------------------------------------------------------------+
|  Add Beta Value - Tech Startup Corp (US3456789012)              [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  INSTRUMENT DETAILS                                                          |
|  ISIN:                   US3456789012                                        |
|  Instrument:             Tech Startup Corp                                   |
|  Portfolio:              Global Equity Fund                                  |
|  Asset Class:            Equity                                              |
|  Sector:                 Technology                                          |
|                                                                              |
|  VOLATILITY METRIC                                                           |
|                                                                              |
|  Beta:                   [1.25.......]                                       |
|                          (Volatility relative to benchmark)                  |
|                                                                              |
|  Benchmark Index:        [S&P 500 v]                                         |
|                          (MSCI World, S&P 500, FTSE 100, Nikkei 225, etc.)   |
|                                                                              |
|  Measurement Period:     [12 months v]  (3 months, 6 months, 12 months,     |
|                                          24 months, 36 months)               |
|                                                                              |
|  Source:                 [Bloomberg v]  (Bloomberg, Asset Manager, Manual)   |
|  Verification:           [ ] Beta verified against independent source        |
|                                                                              |
|  R-Squared (optional):   [0.85.......]  (Statistical fit: 0 to 1)           |
|                                                                              |
|  Notes:                  [Optional notes about this beta value.......]      |
|                         [................................................]      |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | PREVIOUS PERIOD (December 2025)                                      |    |
|  +----------------------------------------------------------------------+    |
|  | Beta: 1.18 | R²: 0.82 | Change: +0.07 (increased volatility)        |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | VALIDATION & INTERPRETATION                                   ✓      |    |
|  +----------------------------------------------------------------------+    |
|  | ✓ Beta is within reasonable range (-2.0 to 3.0)                      |    |
|  | ✓ Benchmark matches instrument geography/market                      |    |
|  |                                                                      |    |
|  | Interpretation:                                                      |    |
|  | • Beta 1.25 means this stock is 25% more volatile than S&P 500      |    |
|  | • When market moves 1%, this stock typically moves 1.25%             |    |
|  | • Higher beta = higher risk and potential return                     |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  [Save Beta]  [Save and Add Next]  [Cancel]                                 |
|                                                                              |
+------------------------------------------------------------------------------+

ALL HOLDINGS VIEW (when filters cleared):
+------------------------------------------------------------------------------+
|                                                                              |
|  Showing 177 equity holdings                                                 |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | ISIN         | Instrument Name    | Beta  | Benchmark | Actions      |  |
|  +------------------------------------------------------------------------+  |
|  | US0378331005 | Apple Inc          | 1.18  | S&P 500   | [Edit][View] |  |
|  |              | Portfolio: Equity  |       |           | [History]    |  |
|  |              | ✓ Complete | Updated: 2026-01-05                         |  |
|  +------------------------------------------------------------------------+  |
|  | US5949181045 | Microsoft Corp     | 1.12  | S&P 500   | [Edit][View] |  |
|  |              | Portfolio: Equity  |       |           | [History]    |  |
|  |              | ✓ Complete | Updated: 2026-01-05                         |  |
|  +------------------------------------------------------------------------+  |
|  | GB0002374006 | Diageo PLC         | 0.78  | FTSE 100  | [Edit][View] |  |
|  |              | Portfolio: Intl Eq |       |           | [History]    |  |
|  |              | ✓ Complete | Updated: 2026-01-04                         |  |
|  +------------------------------------------------------------------------+  |
|  | US3456789012 | Tech Startup Corp  | —     | S&P 500   | [Add][View]  |  |
|  |              | Portfolio: Equity  |       |           | [History]    |  |
|  |              | ⚠ Missing Beta                                          |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [1] [2] [3] ... [18]                                  Rows per page: 10    |
|                                                                              |
+------------------------------------------------------------------------------+

OUTSTANDING ITEMS VIEW:
+------------------------------------------------------------------------------+
|  Outstanding Volatility Metrics                                 [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  3 equity instruments missing beta values                              |  |
|  +------------------------------------------------------------------------+  |
|  |                                                                        |  |
|  |  Portfolio: Global Equity Fund (1 instrument)                          |  |
|  |  • US3456789012 - Tech Startup Corp (USA)                             |  |
|  |    Suggested Benchmark: S&P 500                                        |  |
|  |                                                                        |  |
|  |  Portfolio: International Equity Fund (2 instruments)                  |  |
|  |  • JP9876543210 - Japanese Retailer (JPN)                             |  |
|  |    Suggested Benchmark: Nikkei 225                                     |  |
|  |  • DE3344556677 - German Industrial (DEU)                             |  |
|  |    Suggested Benchmark: DAX                                            |  |
|  |                                                                        |  |
|  |  [Export Outstanding ISINs to Excel]                                   |  |
|  |  [Bulk Upload Beta Values]                                             |  |
|  |                                                                        |  |
|  |  Impact on Analysis:                                                   |  |
|  |  • Portfolio volatility calculation incomplete                         |  |
|  |  • Beta-adjusted performance analysis will exclude these instruments   |  |
|  |  • Systematic risk reporting will show data gaps                       |  |
|  |                                                                        |  |
|  |  Missing instruments represent 1.8% of total equity value.             |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Close]                                                                     |
|                                                                              |
+------------------------------------------------------------------------------+

BETA HISTORY VIEW:
+------------------------------------------------------------------------------+
|  Beta History - Apple Inc (US0378331005)                        [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Benchmark: S&P 500 | Measurement Period: 12 months                          |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Reporting Date | Beta  | R²   | Change vs Prior | Updated By          |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-31     | 1.18  | 0.89 | +0.03 (+2.6%)   | System Import       |  |
|  | 2025-12-31     | 1.15  | 0.87 | -0.02 (-1.7%)   | System Import       |  |
|  | 2025-11-30     | 1.17  | 0.88 | +0.05 (+4.5%)   | System Import       |  |
|  | 2025-10-31     | 1.12  | 0.86 | -0.08 (-6.7%)   | Sarah Johnson       |  |
|  | 2025-09-30     | 1.20  | 0.90 | +0.02 (+1.7%)   | System Import       |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Trend: Relatively stable beta around 1.15-1.20 (moderately volatile)       |
|                                                                              |
|  📈 [View Chart]  [Export to Excel]                                          |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Add Beta] | Button | Add beta value for single instrument |
| [📥 Bulk Upload] | Button | Upload Excel file with multiple beta values |
| [📊 Export] | Button | Download current beta values to Excel |
| [⚠ Outstanding Items] | Button | View detailed list of instruments missing beta |
| Completeness Status | Alert Panel | Shows completion count and identifies gaps |
| Filter Controls | Checkbox + Dropdown | Filter to show missing, complete, or recently updated |
| Instrument Table | Data Table | Shows instruments with missing beta prominently |
| Status Badge | Visual Indicator | ⚠ Missing, ✓ Complete |
| [Add] | Link | Open form to enter beta value for instrument |
| [View] | Link | View existing beta (read-only) |
| [History] | Link | View beta history across reporting periods |
| Add/Edit Modal | Overlay Form | Enter beta with benchmark selection and validation |
| Benchmark Selector | Dropdown | Choose appropriate market index for beta calculation |
| Measurement Period | Dropdown | Select time period for beta calculation |
| R-Squared Field | Optional Input | Statistical fit measure for beta reliability |
| Interpretation Panel | Info Display | Explains what beta value means for risk assessment |
| Previous Period Panel | Reference Display | Shows prior period values for comparison |
| [Save and Add Next] | Button | Save current and auto-open next missing instrument |

## User Actions

- **Add Beta**: Enter beta value for single instrument
- **Bulk Upload**: Upload Excel file with multiple beta values for rapid entry
- **View Outstanding Items**: See detailed list of instruments requiring beta
- **Export Outstanding**: Download list of ISINs needing beta for sharing
- **Filter Missing**: Show only instruments without beta values
- **Save and Add Next**: Workflow optimization for entering multiple betas sequentially
- **View History**: See beta trends over time for specific instrument
- **Verify Beta**: Mark beta as verified against independent source

## Business Rules

- Beta values tied to specific reporting batch (time-dependent)
- Only applicable to equity instruments (fixed income excluded)
- Missing beta identified before calculations run
- Historical values retained for trend analysis
- All changes audited with user and timestamp
- Modifications only during Data Preparation phase
- Validation checks ensure reasonable values (typically -2.0 to 3.0)
- Beta measured against appropriate benchmark (market-specific)
- R-squared optional but recommended for statistical confidence

## Navigation
- **From:** Data validation summary outstanding items, dashboard alerts, instrument master
- **To:** Data validation summary (to verify completion), calculation status

## State Dependencies
- **Data Preparation Phase**: Full edit access, all buttons enabled
- **During Approval**: Read-only access, [Add], [Edit], [Bulk Upload] disabled
- **After Rejection**: Edit access restored immediately
- **Closed Batch**: Read-only historical view

## Beta Interpretation Guide

Common beta ranges and interpretations:
```
+------------------------------------------------------------------------+
|  BETA INTERPRETATION GUIDE                                             |
+------------------------------------------------------------------------+
|  Beta < 0      | Negative correlation with market (rare for stocks)    |
|  Beta = 0      | No correlation with market movements                  |
|  Beta = 0.5    | Half as volatile as market (defensive stock)          |
|  Beta = 1.0    | Moves in line with market (average volatility)        |
|  Beta = 1.5    | 50% more volatile than market (aggressive stock)      |
|  Beta > 2.0    | Very high volatility (often small cap or tech)        |
+------------------------------------------------------------------------+
```

## Validation Errors

When entering unreasonable beta:
```
+------------------------------------------------------------------------+
|  ⚠ VALIDATION WARNING                                                  |
+------------------------------------------------------------------------+
|  Beta value "5.8" is unusually high.                                   |
|                                                                        |
|  Typical equity beta ranges from -1.0 to 3.0.                          |
|  Values above 3.0 may indicate:                                        |
|  • Data entry error                                                    |
|  • Extremely volatile small-cap stock                                  |
|  • Short measurement period with unusual market conditions             |
|                                                                        |
|  Please verify this value is correct before saving.                    |
|                                                                        |
|  [Review and Correct]  [Save Anyway]                                   |
+------------------------------------------------------------------------+
```
