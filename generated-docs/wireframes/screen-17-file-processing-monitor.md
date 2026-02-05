# Screen: File Processing Monitor

## Purpose
Detailed view of file import operations, validation execution, processing errors, retry capability, and troubleshooting information for efficient error resolution.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|                                                                              |
|  File Processing Monitor                Batch: [January 2026 v]             |
|                                                                              |
|  [🔄 Refresh]  [📊 Export Processing Log]  [⚙ View Configuration]           |
|                                                                              |
|  Filters:                                                                    |
|  Source: [All v]  Status: [All v]  File Type: [All v]  Date: [Today v]     |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  PROCESSING SUMMARY                                                    |  |
|  +------------------------------------------------------------------------+  |
|  |  Total Files: 45  |  ✓ Success: 42  |  ⚙ Processing: 1  |  ✗ Failed: 2|  |
|  |  Last Import: 2026-01-05 14:23:45                                      |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Showing 10 recent file operations                                           |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | File Name               | Source    | Status    | Time      | Actions |  |
|  +------------------------------------------------------------------------+  |
|  | holdings_2026-01.csv    | Manager A | ✓ Success | 14:23:45  | [View]  |  |
|  | Portfolio: Global Equity| Holdings  | Imported  | 2m 15s    | [Log]   |  |
|  | Records: 89 positions processed                                        |  |
|  +------------------------------------------------------------------------+  |
|  | transactions_2026-01.csv| Manager A | ✓ Success | 14:20:30  | [View]  |  |
|  | Portfolio: Global Equity| Trans     | Imported  | 1m 45s    | [Log]   |  |
|  | Records: 145 transactions processed                                    |  |
|  +------------------------------------------------------------------------+  |
|  | custodian_zar_2026-01...| Custodian | ⚙ Process | 14:23:00  | [Cancel]|  |
|  | Holdings Verification   | Holdings  | Running   | 0m 45s    | [Log]   |  |
|  | Progress: 67% complete (reading file...)                               |  |
|  +------------------------------------------------------------------------+  |
|  | bloomberg_static_20260..| Bloomberg | ✗ Failed  | 14:15:20  | [View]  |  |
|  | Instrument Static Data  | Static    | Error     | Failed    | [Retry] |  |
|  | Error: Connection timeout after 30s                                    |  |
|  | [View Full Error Log]  [Edit Configuration]                            |  |
|  +------------------------------------------------------------------------+  |
|  | income_2026-01.csv      | Manager A | ✗ Failed  | 14:10:15  | [View]  |  |
|  | Portfolio: Fixed Income | Income    | Error     | Failed    | [Retry] |  |
|  | Error: Invalid file format - Expected 12 columns, found 11            |  |
|  | [View Full Error Log]  [Download File]  [Upload Corrected]            |  |
|  +------------------------------------------------------------------------+  |
|  | holdings_2026-01.csv    | Manager B | ✓ Success | 14:08:30  | [View]  |  |
|  | Portfolio: Intl Equity  | Holdings  | Imported  | 3m 30s    | [Log]   |  |
|  | Records: 134 positions processed                                       |  |
|  +------------------------------------------------------------------------+  |
|  | prices_2026-01.csv      | Bloomberg | ✓ Success | 07:05:12  | [View]  |  |
|  | Index Prices            | Prices    | Imported  | 0m 45s    | [Log]   |  |
|  | Records: 8 index prices updated                                        |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  [Load More...]                                                              |
|                                                                              |
+------------------------------------------------------------------------------+

FILE PROCESSING DETAIL VIEW (SUCCESS):
+------------------------------------------------------------------------------+
|  File Processing Details - holdings_2026-01.csv                 [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  FILE INFORMATION                                                            |
|                                                                              |
|  File Name:              holdings_2026-01.csv                                |
|  Source:                 Asset Manager A                                     |
|  File Type:              Holdings (Portfolio Positions)                      |
|  Portfolio:              Global Equity Fund                                  |
|  Batch:                  January 2026 (2026-01-31)                           |
|                                                                              |
|  Import Method:          Automated (SFTP)                                    |
|  SFTP Location:          /asset_manager_a/holdings/                          |
|  File Size:              245 KB                                              |
|  Received:               2026-01-05 14:21:30                                 |
|  Processing Started:     2026-01-05 14:23:45                                 |
|  Processing Completed:   2026-01-05 14:25:60                                 |
|  Duration:               2m 15s                                              |
|                                                                              |
|  PROCESSING STAGES                                                           |
|                                                                              |
|  ✓ File Receipt           (14:21:30) 0s    - File downloaded from SFTP      |
|  ✓ Format Validation      (14:23:45) 2s    - CSV format validated           |
|  ✓ Schema Validation      (14:23:47) 3s    - Column headers verified        |
|  ✓ Data Type Validation   (14:23:50) 15s   - Data types checked             |
|  ✓ Business Rule Validation (14:24:05) 45s - Business rules applied         |
|  ✓ Referential Integrity  (14:24:50) 30s   - Foreign keys verified          |
|  ✓ Data Import            (14:25:20) 40s   - Records inserted to database   |
|  ✓ Post-Import Validation (14:26:00) 0s    - Import verification complete   |
|                                                                              |
|  PROCESSING RESULTS                                                          |
|                                                                              |
|  Total Rows in File:     89                                                  |
|  Header Rows Skipped:    1                                                   |
|  Data Rows Processed:    89                                                  |
|  Records Imported:       89 (100%)                                           |
|  Records Skipped:        0                                                   |
|  Errors:                 0                                                   |
|  Warnings:               2                                                   |
|                                                                              |
|  WARNINGS (Non-Blocking)                                                     |
|                                                                              |
|  Row 45: Position value unusually large (>10% of portfolio)                  |
|          ISIN: US0378331005, Value: $2,345,000                               |
|          Action: Imported but flagged for review                             |
|                                                                              |
|  Row 67: Instrument not in benchmark index                                   |
|          ISIN: US3456789012, Index: MSCI World                               |
|          Action: Imported, may affect performance attribution                |
|                                                                              |
|  VALIDATION RULES APPLIED                                                    |
|                                                                              |
|  ✓ All ISINs valid format (12 characters)                                    |
|  ✓ All instruments exist in instrument master                                |
|  ✓ Position quantities are numeric and positive                              |
|  ✓ All currencies valid and match instrument definitions                     |
|  ✓ Total portfolio value within expected range                               |
|  ✓ No duplicate positions (same ISIN)                                        |
|                                                                              |
|  IMPORTED DATA SAMPLE (First 5 Rows)                                         |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | ISIN         | Name         | Quantity | Price    | Value      |       |
|  +----------------------------------------------------------------------+    |
|  | US0378331005 | Apple Inc    | 5,000    | 178.50   | 892,500    |       |
|  | US5949181045 | Microsoft    | 3,200    | 385.25   | 1,232,800  |       |
|  | US02079K1079 | Alphabet C   | 1,500    | 142.30   | 213,450    |       |
|  | US0231351067 | Amazon.com   | 800      | 168.75   | 135,000    |       |
|  | US88160R1014 | Tesla Inc    | 2,100    | 245.60   | 515,760    |       |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  [Download Processed File]  [View Warnings Detail]  [Close]                  |
|                                                                              |
+------------------------------------------------------------------------------+

FILE PROCESSING DETAIL VIEW (FAILED):
+------------------------------------------------------------------------------+
|  File Processing Details - income_2026-01.csv                   [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  FILE INFORMATION                                                            |
|                                                                              |
|  File Name:              income_2026-01.csv                                  |
|  Source:                 Asset Manager A                                     |
|  File Type:              Income (Dividend/Interest Received)                 |
|  Portfolio:              Fixed Income Fund                                   |
|  Batch:                  January 2026 (2026-01-31)                           |
|                                                                              |
|  Import Method:          Automated (SFTP)                                    |
|  SFTP Location:          /asset_manager_a/income/                            |
|  File Size:              87 KB                                               |
|  Received:               2026-01-05 14:08:00                                 |
|  Processing Started:     2026-01-05 14:10:15                                 |
|  Processing Failed:      2026-01-05 14:10:17                                 |
|  Duration:               2s (failed at schema validation)                    |
|                                                                              |
|  PROCESSING STAGES                                                           |
|                                                                              |
|  ✓ File Receipt           (14:08:00) 0s    - File downloaded from SFTP      |
|  ✓ Format Validation      (14:10:15) 1s    - CSV format validated           |
|  ✗ Schema Validation      (14:10:16) 1s    - FAILED                         |
|  ⚠ Subsequent stages skipped due to schema validation failure                |
|                                                                              |
|  ERROR DETAILS                                                               |
|                                                                              |
|  Error Category:         Schema Validation Error                             |
|  Error Code:             SCHEMA_ERR_001                                      |
|  Severity:               CRITICAL (blocks import)                            |
|                                                                              |
|  Primary Error:                                                              |
|  Invalid file format - Expected 12 columns, found 11                         |
|                                                                              |
|  Detailed Analysis:                                                          |
|  The file header contains only 11 columns, but the validation schema         |
|  requires 12 columns for income files.                                       |
|                                                                              |
|  Expected Columns (12):                                                      |
|  1. ISIN                    7. Tax Withheld                                  |
|  2. Instrument Name         8. Net Amount                                    |
|  3. Income Type             9. Currency                                      |
|  4. Payment Date            10. Exchange Rate                                |
|  5. Ex-Date                 11. Base Currency Value                          |
|  6. Gross Amount            12. Notes                                        |
|                                                                              |
|  Actual Columns Found (11):                                                  |
|  1. ISIN, 2. Instrument Name, 3. Income Type, 4. Payment Date,               |
|  5. Ex-Date, 6. Gross Amount, 7. Tax Withheld, 8. Net Amount,                |
|  9. Currency, 10. Exchange Rate, 11. Notes                                   |
|                                                                              |
|  Missing Column: "Base Currency Value" (column 11)                           |
|                                                                              |
|  RESOLUTION STEPS                                                            |
|                                                                              |
|  Option 1: Correct the source file (RECOMMENDED)                             |
|  • Contact Asset Manager A to provide corrected file                         |
|  • Request file with all 12 required columns                                 |
|  • [Download Error Report to Send to Provider]                               |
|                                                                              |
|  Option 2: Upload corrected file manually                                    |
|  • Download the failed file                                                  |
|  • Add missing "Base Currency Value" column                                  |
|  • Upload corrected file                                                     |
|  • [Download Failed File]  [Upload Corrected File]                           |
|                                                                              |
|  Option 3: Update validation schema (ADMIN ONLY)                             |
|  • Modify schema to accept 11 columns                                        |
|  • Calculate "Base Currency Value" from other fields                         |
|  • Requires administrator approval                                           |
|  • [Request Schema Update]                                                   |
|                                                                              |
|  RETRY HISTORY                                                               |
|                                                                              |
|  Attempt 1: 2026-01-05 14:10:15 - Schema validation failed                   |
|  Attempt 2: 2026-01-05 14:15:30 - Schema validation failed (same error)      |
|  Attempt 3: Not yet attempted                                                |
|                                                                              |
|  [Retry Import]  [Cancel and Skip]  [Close]                                  |
|                                                                              |
+------------------------------------------------------------------------------+

PROCESSING LOG VIEW:
+------------------------------------------------------------------------------+
|  Processing Log - holdings_2026-01.csv                          [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  File: holdings_2026-01.csv | Source: Asset Manager A | Status: ✓ Success   |
|                                                                              |
|  DETAILED PROCESSING LOG                                                     |
|                                                                              |
|  2026-01-05 14:21:30.123 [INFO] File receipt initiated                       |
|  2026-01-05 14:21:30.456 [INFO] Connecting to SFTP: manager-a.sftp.com      |
|  2026-01-05 14:21:30.789 [INFO] SFTP connection established                  |
|  2026-01-05 14:21:31.012 [INFO] Downloading file from /holdings/             |
|  2026-01-05 14:21:31.234 [INFO] File downloaded successfully (245 KB)        |
|  2026-01-05 14:21:31.456 [INFO] File saved to staging: /tmp/stage_12345.csv  |
|                                                                              |
|  2026-01-05 14:23:45.123 [INFO] Processing queued file (queue position: 3)   |
|  2026-01-05 14:23:45.234 [INFO] Beginning format validation                  |
|  2026-01-05 14:23:47.456 [INFO] CSV format valid, 90 rows detected           |
|  2026-01-05 14:23:47.567 [INFO] Beginning schema validation                  |
|  2026-01-05 14:23:50.789 [INFO] Schema valid, 12 columns matched             |
|                                                                              |
|  2026-01-05 14:23:50.890 [INFO] Beginning data type validation               |
|  2026-01-05 14:23:52.123 [INFO] Row 1-25: All data types valid               |
|  2026-01-05 14:23:54.456 [INFO] Row 26-50: All data types valid              |
|  2026-01-05 14:23:56.789 [WARN] Row 45: Position value >10% portfolio        |
|  2026-01-05 14:23:58.012 [INFO] Row 51-75: All data types valid              |
|  2026-01-05 14:24:00.234 [WARN] Row 67: Instrument not in benchmark          |
|  2026-01-05 14:24:05.456 [INFO] Row 76-89: All data types valid              |
|                                                                              |
|  2026-01-05 14:24:05.567 [INFO] Beginning business rule validation           |
|  2026-01-05 14:24:10.123 [INFO] Rule: ISIN format - 89/89 passed             |
|  2026-01-05 14:24:15.456 [INFO] Rule: Instrument exists - 89/89 passed       |
|  2026-01-05 14:24:20.789 [INFO] Rule: Positive quantities - 89/89 passed     |
|  2026-01-05 14:24:25.012 [INFO] Rule: Valid currencies - 89/89 passed        |
|  2026-01-05 14:24:30.234 [INFO] Rule: No duplicates - 89/89 passed           |
|  2026-01-05 14:24:35.456 [INFO] Rule: Portfolio value range - PASSED         |
|                                                                              |
|  2026-01-05 14:24:50.123 [INFO] Beginning referential integrity checks       |
|  2026-01-05 14:24:55.456 [INFO] Checking instrument foreign keys...          |
|  2026-01-05 14:25:00.789 [INFO] All instruments exist in master data         |
|  2026-01-05 14:25:05.012 [INFO] Checking portfolio foreign key...            |
|  2026-01-05 14:25:10.234 [INFO] Portfolio 'Global Equity Fund' exists        |
|                                                                              |
|  2026-01-05 14:25:20.123 [INFO] Beginning database import                    |
|  2026-01-05 14:25:25.456 [INFO] Transaction started                          |
|  2026-01-05 14:25:30.789 [INFO] Inserted 89 holdings records                 |
|  2026-01-05 14:25:35.012 [INFO] Transaction committed                        |
|  2026-01-05 14:25:40.234 [INFO] Post-import validation: Record count match   |
|                                                                              |
|  2026-01-05 14:26:00.123 [INFO] Processing completed successfully            |
|  2026-01-05 14:26:00.456 [INFO] Cleanup: Removing staging file               |
|  2026-01-05 14:26:00.789 [INFO] Final status: SUCCESS                        |
|                                                                              |
|  [Export Log]  [Close]                                                       |
|                                                                              |
+------------------------------------------------------------------------------+

CONFIGURATION VIEW:
+------------------------------------------------------------------------------+
|  File Processing Configuration                                  [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Configuration for: Asset Manager A - Holdings Files                         |
|                                                                              |
|  SFTP CONNECTION                                                             |
|  Host:                   manager-a.sftp.com                                  |
|  Port:                   22                                                  |
|  Username:               investinsight_user                                  |
|  Authentication:         SSH Key (managed by IT)                             |
|  Remote Path:            /asset_manager_a/holdings/                          |
|                                                                              |
|  FILE PATTERN                                                                |
|  Filename Pattern:       holdings_YYYY-MM.csv                                |
|  Expected Frequency:     Monthly (by 5th business day)                       |
|  Retention:              Keep last 12 files                                  |
|                                                                              |
|  VALIDATION SCHEMA                                                           |
|  Schema Name:            Holdings_v2.3                                       |
|  Last Updated:           2025-11-15                                          |
|  Required Columns:       12 (ISIN, Name, Quantity, Price, ...)              |
|  Business Rules:         15 validation rules                                 |
|                                                                              |
|  PROCESSING SCHEDULE                                                         |
|  Automated Check:        Every 4 hours (00:00, 04:00, 08:00, ...)           |
|  Processing Priority:    Medium                                              |
|  Timeout:                10 minutes                                          |
|  Retry on Failure:       3 attempts with 5 min delay                         |
|                                                                              |
|  [Test Connection]  [Edit Configuration]  [View Full Schema]                 |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [🔄 Refresh] | Button | Refresh file processing status in real-time |
| [📊 Export Processing Log] | Button | Download complete processing log for batch |
| [⚙ View Configuration] | Button | See SFTP and validation configuration for all sources |
| Processing Summary | Stats Panel | At-a-glance counts by status (success, processing, failed) |
| File Operations Table | Data Table | Shows recent file operations with status and timing |
| Status Icons | Visual Indicator | ✓ Success, ⚙ Processing, ✗ Failed |
| [View] | Link | See detailed processing information and results |
| [Log] | Link | View complete processing log with all messages |
| [Retry] | Button | Re-attempt failed import without re-uploading file |
| [Cancel] | Button | Cancel currently processing file operation |
| Detail View Modal | Overlay | Complete processing information with stages and results |
| Error Detail Panel | Alert Section | Detailed error analysis with resolution steps |
| Retry History | Timeline | Shows all retry attempts with outcomes |
| Processing Log | Text Display | Complete chronological log of all processing steps |
| Configuration View | Info Display | SFTP settings, validation schema, processing schedule |

## User Actions

- **View Processing Details**: See complete import information for specific file
- **View Processing Log**: See detailed chronological log of processing steps
- **Retry Failed Import**: Re-attempt import without re-uploading file
- **Cancel Processing**: Stop currently running file operation
- **Download Failed File**: Download file that failed validation for correction
- **Upload Corrected File**: Manually upload corrected version of failed file
- **Download Error Report**: Export error details to share with data provider
- **Test SFTP Connection**: Verify connectivity to remote file source
- **Export Processing Log**: Download complete log for troubleshooting

## Business Rules

- File receipt tracked with timestamps for SLA monitoring
- Failed imports flagged immediately with detailed error information
- Users can retry failed imports without re-uploading files
- Import history retained for troubleshooting and audit (30 days detailed, 7 years summary)
- Automated imports run on configured schedule without manual intervention
- Import status visible in real-time (no manual refresh required)
- Processing stages clearly identified for troubleshooting
- Validation rules applied systematically and logged
- Business rules and data type validation separate stages
- Referential integrity checked before database import

## Navigation
- **From:** File status monitor, dashboard alerts, data validation summary
- **To:** Reference data management (to fix schema issues), file status monitor

## Error Categories

### Schema Validation Errors
- Missing required columns
- Extra unexpected columns
- Column name mismatches
- Column order issues

### Data Type Errors
- Invalid data types (text where number expected)
- Invalid date formats
- Out-of-range values
- NULL values in required fields

### Business Rule Errors
- Invalid ISIN format
- Duplicate records
- Referential integrity violations (instrument doesn't exist)
- Portfolio value outside expected range

### Technical Errors
- SFTP connection timeout
- File read errors
- Database connection errors
- Processing timeout

## Resolution Guidance

For each error, system provides:
- Error category and severity
- Detailed error message
- Specific location of error (row number, column)
- Expected vs actual values
- Recommended resolution steps
- Contact information for data provider
- Option to download error report for external sharing

## Processing Stages

All file imports go through systematic stages:

1. **File Receipt**: Download from SFTP or manual upload
2. **Format Validation**: Verify file format (CSV, Excel, etc.)
3. **Schema Validation**: Check column headers and structure
4. **Data Type Validation**: Verify data types for all fields
5. **Business Rule Validation**: Apply domain-specific validation rules
6. **Referential Integrity**: Verify foreign keys exist
7. **Data Import**: Insert records to database in transaction
8. **Post-Import Validation**: Verify import success

Any stage failure stops processing and provides specific error details.
