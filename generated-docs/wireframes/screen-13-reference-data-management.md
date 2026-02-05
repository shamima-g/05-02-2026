# Screen: Reference Data Management

## Purpose
Centralized maintenance of foundational data (countries, currencies, portfolios, asset managers, indexes, fee structures, configurations) with referential integrity enforcement.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Master Data: Instruments | Index Prices | Risk Metrics | Volatility |      |
|               Credit Ratings | Custom Holdings | [Reference Data v]         |
+------------------------------------------------------------------------------+
|                                                                              |
|  Reference Data Management                                                   |
|                                                                              |
|  Select Category:                                                            |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  GEOGRAPHIC                                                            |  |
|  +------------------------------------------------------------------------+  |
|  |  [Countries]         132 active  |  [Currencies]        28 active      |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  ORGANIZATIONAL                                                        |  |
|  +------------------------------------------------------------------------+  |
|  |  [Asset Managers]     12 active  |  [Portfolios]        5 active       |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  FINANCIAL                                                             |  |
|  +------------------------------------------------------------------------+  |
|  |  [Indexes]            24 active  |  [Benchmarks]        8 active       |  |
|  |  [Rating Scales]       4 active  |  [Rating Agencies]   6 active       |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  OPERATIONAL                                                           |  |
|  +------------------------------------------------------------------------+  |
|  |  [Fee Rate Structures]       Management & Custody Fee Rates            |  |
|  |  [File Processing Config]    SFTP locations and validation rules       |  |
|  |  [Data Transformation Rules] Mapping and conversion rules              |  |
|  |  [Report Definitions]        Report templates and configurations       |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

EXAMPLE: PORTFOLIOS VIEW
+------------------------------------------------------------------------------+
|  Reference Data > Portfolios                                    [< Back]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  [+ Add Portfolio]  [📊 Export]                                             |
|                                                                              |
|  Showing 5 active portfolios                                                 |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Portfolio Name         | Code    | Manager      | Currency | Actions  |  |
|  +------------------------------------------------------------------------+  |
|  | Global Equity Fund     | GEF     | Manager A    | USD      | [Edit]   |  |
|  | Base: USD | Inception: 2020-01-15              | Status: ✓ Active     |  |
|  | Benchmark: MSCI World                                      | [View]   |  |
|  |                                                            | [History]|  |
|  +------------------------------------------------------------------------+  |
|  | Fixed Income Fund      | FIF     | Manager A    | USD      | [Edit]   |  |
|  | Base: USD | Inception: 2019-06-01              | Status: ✓ Active     |  |
|  | Benchmark: Bloomberg Barclays Agg                          | [View]   |  |
|  |                                                            | [History]|  |
|  +------------------------------------------------------------------------+  |
|  | International Equity   | IEF     | Manager B    | USD      | [Edit]   |  |
|  | Base: USD | Inception: 2021-03-01              | Status: ✓ Active     |  |
|  | Benchmark: MSCI EAFE                                       | [View]   |  |
|  |                                                            | [History]|  |
|  +------------------------------------------------------------------------+  |
|  | Emerging Markets Fund  | EMF     | Manager C    | USD      | [Edit]   |  |
|  | Base: USD | Inception: 2020-09-15              | Status: ✓ Active     |  |
|  | Benchmark: MSCI EM                                         | [View]   |  |
|  |                                                            | [History]|  |
|  +------------------------------------------------------------------------+  |
|  | Alternative Assets     | ALT     | Manager D    | USD      | [Edit]   |  |
|  | Base: USD | Inception: 2022-01-01              | Status: ✓ Active     |  |
|  | Benchmark: Custom Blend                                    | [View]   |  |
|  |                                                            | [History]|  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

EDIT PORTFOLIO MODAL:
+------------------------------------------------------------------------------+
|  Edit Portfolio - Global Equity Fund                            [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  BASIC INFORMATION                                                           |
|                                                                              |
|  Portfolio Name:         [Global Equity Fund........................]      |
|  Portfolio Code:         [GEF........]  (Unique identifier)                 |
|  Short Name:             [GEF........]                                       |
|                                                                              |
|  Asset Manager:          [Manager A v]  (Select from active asset managers) |
|  Inception Date:         [2020-01-15]  [📅]                                  |
|                                                                              |
|  CURRENCY & VALUATION                                                        |
|                                                                              |
|  Base Currency:          [USD v]  (Primary reporting currency)              |
|  Alternative Currencies: [EUR] [GBP] [JPY]  [+ Add]                         |
|                          (For multi-currency reporting)                      |
|                                                                              |
|  Valuation Frequency:    [Daily v]  (Daily, Monthly, Quarterly)             |
|                                                                              |
|  BENCHMARK                                                                   |
|                                                                              |
|  Primary Benchmark:      [MSCI World Index v]                               |
|  Secondary Benchmark:    [S&P 500 v]  (Optional)                            |
|                                                                              |
|  FEES                                                                        |
|                                                                              |
|  Management Fee Rate:    [0.75....]  % per annum                            |
|  Management Fee Type:    [Assets Under Management v]                        |
|                                                                              |
|  Custody Fee Rate:       [0.05....]  % per annum                            |
|                                                                              |
|  VAT Rate:               [15.....]  %                                        |
|  VAT Treatment:          [Inclusive v]  (Inclusive, Exclusive, Exempt)      |
|                                                                              |
|  REPORTING                                                                   |
|                                                                              |
|  Report Types:           [✓] Monthly Performance                            |
|                          [✓] Quarterly Risk Report                          |
|                          [✓] Annual Summary                                 |
|                          [ ] Weekly Cashflow                                |
|                                                                              |
|  Investment Policy:      [📎 Investment_Policy_GEF.pdf]  [Upload]           |
|  Mandate Document:       [📎 Mandate_GEF_v2.pdf]  [Upload]                  |
|                                                                              |
|  STATUS                                                                      |
|                                                                              |
|  Status:                 (•) Active  ( ) Inactive                            |
|  Inactive Date:          [...........]  (If inactive)                        |
|  Inactive Reason:        [................................]                  |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | REFERENTIAL INTEGRITY CHECK                                   ✓      |    |
|  +----------------------------------------------------------------------+    |
|  | ✓ Asset Manager exists and is active                                 |    |
|  | ✓ Base currency exists in currency reference data                    |    |
|  | ✓ Primary benchmark exists in index reference data                   |    |
|  | ⚠ This portfolio is used in 145 holdings across 12 batches          |    |
|  |   Cannot be deleted (can only be deactivated)                        |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  [Save Changes]  [Cancel]  [Deactivate Portfolio]                           |
|                                                                              |
+------------------------------------------------------------------------------+

EXAMPLE: FEE RATE STRUCTURES
+------------------------------------------------------------------------------+
|  Reference Data > Fee Rate Structures                           [< Back]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  [+ Add Fee Structure]  [📊 Export]                                         |
|                                                                              |
|  MANAGEMENT FEES                                                             |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Portfolio         | Fee Rate | Basis      | Effective Date | Actions |  |
|  +------------------------------------------------------------------------+  |
|  | Global Equity     | 0.75%    | AUM        | 2020-01-15     | [Edit]  |  |
|  | Fixed Income      | 0.50%    | AUM        | 2019-06-01     | [Edit]  |  |
|  | International Eq  | 0.85%    | AUM        | 2021-03-01     | [Edit]  |  |
|  | Emerging Markets  | 1.25%    | AUM        | 2020-09-15     | [Edit]  |  |
|  | Alternative Assets| 1.50%    | AUM        | 2022-01-01     | [Edit]  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  CUSTODY FEES                                                                |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Portfolio         | Fee Rate | Basis      | Effective Date | Actions |  |
|  +------------------------------------------------------------------------+  |
|  | All Portfolios    | 0.05%    | Assets     | 2020-01-01     | [Edit]  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Fee Rate History Tracked: Changes apply to future periods only              |
|  Historical fees immutable for past reporting periods                        |
|                                                                              |
+------------------------------------------------------------------------------+

EXAMPLE: FILE PROCESSING CONFIG
+------------------------------------------------------------------------------+
|  Reference Data > File Processing Configuration                 [< Back]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  [+ Add File Configuration]  [Test Connection]                              |
|                                                                              |
|  ASSET MANAGER FILE IMPORTS                                                  |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Source       | File Type    | SFTP Location        | Schedule       |  |
|  +------------------------------------------------------------------------+  |
|  | Manager A    | Holdings     | /manager_a/holdings  | Daily 06:00    |  |
|  | Status: ✓ Connected | Format: CSV | Validation: Holdings_v1         |  |
|  | [Edit Config] [Test Import] [View Validation Rules]                  |  |
|  +------------------------------------------------------------------------+  |
|  | Manager A    | Transactions | /manager_a/trans     | Daily 06:00    |  |
|  | Status: ✓ Connected | Format: CSV | Validation: Trans_v1            |  |
|  | [Edit Config] [Test Import] [View Validation Rules]                  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  BLOOMBERG FILE IMPORTS                                                      |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Source       | File Type    | SFTP Location        | Schedule       |  |
|  +------------------------------------------------------------------------+  |
|  | Bloomberg    | Static Data  | /bloomberg/static    | Daily 07:00    |  |
|  | Status: ✓ Connected | Format: Fixed Width | Validation: BB_Static_v2|  |
|  | [Edit Config] [Test Import] [View Validation Rules]                  |  |
|  +------------------------------------------------------------------------+  |
|  | Bloomberg    | Prices       | /bloomberg/prices    | Daily 18:00    |  |
|  | Status: ⚠ Last failed: 2026-01-04 | Format: CSV                       |  |
|  | Error: Connection timeout                                             |  |
|  | [Edit Config] [Test Import] [View Error Log]                          |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  CUSTODIAN FILE IMPORTS                                                      |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | Source       | File Type    | SFTP Location        | Schedule       |  |
|  +------------------------------------------------------------------------+  |
|  | Custodian    | Holdings USD | /custodian/usd       | Daily 14:00    |  |
|  | Status: ✓ Connected | Format: Excel | Validation: Cust_Holdings_v1  |  |
|  | [Edit Config] [Test Import] [View Validation Rules]                  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

REFERENTIAL INTEGRITY WARNING:
+------------------------------------------------------------------------------+
|  Cannot Delete Reference Data                                   [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  You cannot delete: Currency "USD"                                           |
|                                                                              |
|  This currency is currently in use by:                                       |
|  • 4 portfolios (base currency)                                              |
|  • 198 instruments                                                           |
|  • 1,456 historical holdings across 24 batches                               |
|                                                                              |
|  ⚠ Deleting this currency would break referential integrity and cause        |
|  calculation errors.                                                         |
|                                                                              |
|  Options:                                                                    |
|  • Deactivate currency (prevents new usage, preserves historical data)       |
|  • Keep currency active                                                      |
|                                                                              |
|  [Deactivate Currency]  [Keep Active]  [Cancel]                             |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Category Selection Panel | Card Grid | Groups reference data by category (Geographic, Organizational, Financial, Operational) |
| Category Card | Clickable Panel | Shows category name and count of active records |
| Reference Data Table | Data Table | Shows records within selected category |
| [+ Add] Button | Primary Button | Create new reference data record |
| [Edit] | Link | Modify existing reference data |
| [View] | Link | View reference data in read-only mode |
| [History] | Link | View audit trail for specific record |
| Edit Modal | Overlay Form | Edit reference data with validation |
| Referential Integrity Check | Status Panel | Shows where reference data is used, prevents invalid deletions |
| [Test Connection] | Button | Test SFTP connection for file processing configurations |
| [Test Import] | Button | Manually trigger test import for configured file source |
| Status Indicator | Badge | ✓ Connected, ⚠ Failed with error details |

## User Actions

- **Select Category**: Navigate to specific reference data type
- **Add New Record**: Create new reference data entry
- **Edit Record**: Modify existing reference data
- **View Record**: See complete details in read-only mode
- **View History**: See audit trail of changes
- **Deactivate**: Soft delete reference data (prevents new usage, preserves historical)
- **Test Connection**: Verify SFTP connectivity for file imports
- **Test Import**: Manually trigger file import for testing
- **Export**: Download reference data to Excel

## Business Rules

- All changes fully audited with user, timestamp, before/after values
- Referential integrity enforced (cannot delete if in use)
- Soft delete only (deactivation instead of deletion)
- Changes may impact calculations (careful control required)
- Search and filter capabilities for large data sets
- Fee rate changes apply to future periods only (historical rates immutable)
- File processing configurations validated before saving
- Invalid reference data flagged before use in calculations

## Navigation
- **From:** Admin section, master data screens (for related references)
- **To:** Specific category views, edit modals, audit trail viewer

## State Dependencies
- Reference data generally not batch-specific (system-wide configuration)
- Some reference data (portfolios, asset managers) affects all batches
- Administrative permissions required for modifications
- Critical reference data (currencies, countries) may have restricted edit access

## Reference Data Categories

### Geographic
- **Countries**: Country codes, names, regions
- **Currencies**: Currency codes, names, exchange rate sources

### Organizational
- **Asset Managers**: External managers, contact info, SFTP credentials
- **Portfolios**: Portfolio definitions, benchmarks, fee structures

### Financial
- **Indexes**: Index definitions, data sources, currencies
- **Benchmarks**: Benchmark mappings to portfolios
- **Rating Scales**: Credit rating scale definitions (international, national)
- **Rating Agencies**: Agency names, priority hierarchy

### Operational
- **Fee Rate Structures**: Management and custody fee rates by portfolio
- **File Processing Config**: SFTP locations, validation rules, schedules
- **Data Transformation Rules**: Mapping rules, conversion logic
- **Report Definitions**: Report templates, calculations, outputs

## File Processing Configuration Details

Each file source includes:
- SFTP host, port, credentials
- Remote file path and naming pattern
- File format (CSV, Excel, Fixed Width)
- Validation rule set reference
- Import schedule (cron expression)
- Connection status and last success/failure
- Error log access
- Test import capability

## Validation Prevention

When attempting invalid operation:
```
+------------------------------------------------------------------------+
|  ⚠ VALIDATION ERROR                                                    |
+------------------------------------------------------------------------+
|  Cannot save portfolio: Invalid benchmark selected                     |
|                                                                        |
|  Benchmark "Custom Index XYZ" does not exist in index reference data.  |
|                                                                        |
|  Please:                                                               |
|  • Select an existing benchmark from the list, or                      |
|  • Add "Custom Index XYZ" to index reference data first                |
|                                                                        |
|  [Select Different Benchmark]  [Add New Index]  [Cancel]               |
+------------------------------------------------------------------------+
```
