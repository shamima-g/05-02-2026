# Screen: Index Prices Management

## Purpose
Maintain index prices by reporting period with bulk upload, outstanding items tracking, and price history views for performance comparison.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Master Data: Instruments | [Index Prices v] | Risk Metrics | Volatility |  |
|               Credit Ratings | Custom Holdings | Reference Data              |
+------------------------------------------------------------------------------+
|                                                                              |
|  Index Prices                           Batch: [January 2026 v]             |
|                                                                              |
|  [+ Add Price]  [📥 Bulk Upload]  [📊 Export]  [📈 View History]           |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  PRICE ENTRY STATUS                                          ✓          |  |
|  +------------------------------------------------------------------------+  |
|  |  Required Indexes: 8  |  Entered: 8  |  Missing: 0                      |  |
|  |  All required index prices are available for calculations               |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Reporting Date: 2026-01-31                                                  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Index Name              | Code      | Price      | Change | Actions   |  |
|  +------------------------------------------------------------------------+  |
|  | MSCI World Index        | MXWO      | 3,245.67   | +2.3%  | [Edit]    |  |
|  |                         |           | USD        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 18:00         |  |
|  +------------------------------------------------------------------------+  |
|  | S&P 500 Index           | SPX       | 4,856.23   | +1.8%  | [Edit]    |  |
|  |                         |           | USD        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 16:00         |  |
|  +------------------------------------------------------------------------+  |
|  | FTSE 100 Index          | UKX       | 7,923.45   | +0.5%  | [Edit]    |  |
|  |                         |           | GBP        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 16:30         |  |
|  +------------------------------------------------------------------------+  |
|  | JSE All Share Index     | JALSH     | 78,456.12  | -0.2%  | [Edit]    |  |
|  |                         |           | ZAR        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 17:00         |  |
|  +------------------------------------------------------------------------+  |
|  | Bloomberg Barclays Agg  | LBUSTRUU  | 2,134.89   | -0.1%  | [Edit]    |  |
|  |                         |           | USD        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 18:00         |  |
|  +------------------------------------------------------------------------+  |
|  | MSCI Emerging Markets   | MXEF      | 1,087.56   | +3.1%  | [Edit]    |  |
|  |                         |           | USD        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 18:00         |  |
|  +------------------------------------------------------------------------+  |
|  | Euro Stoxx 50           | SX5E      | 4,567.89   | +1.2%  | [Edit]    |  |
|  |                         |           | EUR        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 17:00         |  |
|  +------------------------------------------------------------------------+  |
|  | Nikkei 225              | NKY       | 39,234.56  | +0.8%  | [Edit]    |  |
|  |                         |           | JPY        |        | [History] |  |
|  |                         |           | Updated: 2026-01-31 06:00         |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

EDIT PRICE MODAL:
+------------------------------------------------------------------------------+
|  Edit Index Price - MSCI World Index                            [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Index: MSCI World Index (MXWO)                                              |
|  Reporting Date: 2026-01-31                                                  |
|                                                                              |
|  Price:          [3245.67.........]  Currency: [USD v]                       |
|                                                                              |
|  Source:         [Bloomberg v]                                               |
|  Verification:   [ ] Price verified against independent source               |
|                                                                              |
|  Notes:          [Optional notes about this price entry...........]         |
|                 [...................................................]         |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | PREVIOUS PRICE (December 2025)                                       |    |
|  +----------------------------------------------------------------------+    |
|  | Price: 3,172.45 USD | Change: +73.22 (+2.31%)                        |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  [Save]  [Cancel]                                                            |
|                                                                              |
+------------------------------------------------------------------------------+

BULK UPLOAD MODAL:
+------------------------------------------------------------------------------+
|  Bulk Upload Index Prices                                       [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Upload index prices for batch: January 2026 (2026-01-31)                   |
|                                                                              |
|  [📥 Download Template Excel]                                                |
|                                                                              |
|  Template includes:                                                          |
|  • Index Code (required)                                                     |
|  • Price (required)                                                          |
|  • Currency (required)                                                       |
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
|  • Index code must match configured indexes                                  |
|  • Price must be numeric and positive                                        |
|  • Currency must be valid ISO code                                           |
|  • Duplicate entries will overwrite existing prices                          |
|                                                                              |
|  [Upload and Validate]  [Cancel]                                             |
|                                                                              |
+------------------------------------------------------------------------------+

PRICE HISTORY VIEW:
+------------------------------------------------------------------------------+
|  Price History - MSCI World Index (MXWO)                        [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  View: (•) Last 12 Months  ( ) Last 24 Months  ( ) All History              |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Reporting Date | Price (USD) | Change vs Prior | Updated By          |  |
|  +------------------------------------------------------------------------+  |
|  | 2026-01-31     | 3,245.67    | +73.22 (+2.31%) | System Import       |  |
|  | 2025-12-31     | 3,172.45    | +45.67 (+1.46%) | Sarah Johnson       |  |
|  | 2025-11-30     | 3,126.78    | -23.45 (-0.74%) | System Import       |  |
|  | 2025-10-31     | 3,150.23    | +102.34 (+3.36%)| System Import       |  |
|  | 2025-09-30     | 3,047.89    | +78.90 (+2.66%) | System Import       |  |
|  | 2025-08-31     | 2,968.99    | -56.78 (-1.88%) | System Import       |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  📈 [View Chart]  [Export to Excel]                                          |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Add Price] | Button | Add price for single index (opens entry form) |
| [📥 Bulk Upload] | Button | Upload Excel file with multiple index prices |
| [📊 Export] | Button | Download current prices to Excel |
| [📈 View History] | Button | View price trends across reporting periods |
| Price Entry Status | Summary Panel | Shows completion: required vs entered vs missing |
| Index Price Table | Data Table | Shows current prices with change vs previous period |
| Change % | Calculated Field | Auto-calculated from previous period price |
| [Edit] | Link | Modify existing price entry |
| [History] | Link | View price history for specific index |
| Edit Price Modal | Overlay Form | Edit single index price with previous period reference |
| Bulk Upload Modal | File Upload Dialog | Template download and validation rules |
| Price History View | Modal Table | Historical prices with period-over-period changes |

## User Actions

- **Add Price**: Enter price for single index manually
- **Edit Price**: Modify existing price entry (only during Data Preparation)
- **Bulk Upload**: Upload Excel file with multiple prices for rapid entry
- **Download Template**: Get Excel template with correct format and index codes
- **View History**: See price trends for specific index across reporting periods
- **Export Prices**: Download current period prices to Excel
- **Verify Price**: Mark price as verified against independent source

## Business Rules

- Prices tied to specific reporting batch and date
- Price history maintained across all reporting periods
- Missing prices identified before calculations run
- All changes audited with user and timestamp
- Modifications only permitted during Data Preparation phase
- Change % calculated automatically from previous period
- Bulk upload validates index codes against configured indexes
- Currency must match index definition

## Navigation
- **From:** Data validation summary outstanding items, dashboard alerts
- **To:** Data validation summary (to verify completion), calculation status

## State Dependencies
- **Data Preparation Phase**: Full edit access, all buttons enabled
- **During Approval**: Read-only access, [Add], [Edit], [Bulk Upload] disabled
- **After Rejection**: Edit access restored immediately
- **Closed Batch**: Read-only historical view

## Outstanding Items Alert

When prices are missing:
```
+------------------------------------------------------------------------+
|  ⚠ MISSING INDEX PRICES                                                |
+------------------------------------------------------------------------+
|  Required Indexes: 8  |  Entered: 6  |  Missing: 2                      |
|                                                                        |
|  Missing prices for:                                                   |
|  • Euro Stoxx 50 (SX5E)                                                |
|  • Nikkei 225 (NKY)                                                    |
|                                                                        |
|  Performance calculations cannot complete without these prices.        |
|                                                                        |
|  [Add Missing Prices]  [Export Missing List]                           |
+------------------------------------------------------------------------+
```

## Bulk Upload Validation Results

After uploading Excel file:
```
+------------------------------------------------------------------------+
|  BULK UPLOAD VALIDATION RESULTS                                        |
+------------------------------------------------------------------------+
|  ✓ 6 prices validated successfully                                     |
|  ✗ 2 errors found:                                                     |
|                                                                        |
|  Row 3: Index code "XYZ123" not found in system                        |
|          Valid codes: MXWO, SPX, UKX, JALSH, LBUSTRUU, MXEF, SX5E, NKY|
|                                                                        |
|  Row 7: Price "-123.45" invalid - must be positive number              |
|                                                                        |
|  Fix errors in Excel file and re-upload, or continue with valid rows.  |
|                                                                        |
|  [Import Valid Rows]  [Cancel and Fix All]                             |
+------------------------------------------------------------------------+
```
