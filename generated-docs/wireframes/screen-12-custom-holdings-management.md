# Screen: Custom Holdings Management

## Purpose
Manually enter and maintain holdings for instruments not available through automated feeds with full audit trails and same validation rules as automated data.

## Wireframe
```
+------------------------------------------------------------------------------+
|  InvestInsight                [Search...]              [Profile] [Logout]   |
+------------------------------------------------------------------------------+
|  Dashboard  |  Batches  |  Files  |  Validation  |  Master Data  |  Admin  |
+------------------------------------------------------------------------------+
|  Master Data: Instruments | Index Prices | Risk Metrics | Volatility |      |
|               Credit Ratings | [Custom Holdings v] | Reference Data         |
+------------------------------------------------------------------------------+
|                                                                              |
|  Custom Holdings                        Batch: [January 2026 v] 🔒 Locked   |
|                                                                              |
|  [+ Add Custom Holding]  [📊 Export]  [📋 View Validation Status]           |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  CUSTOM HOLDINGS SUMMARY                                               |  |
|  +------------------------------------------------------------------------+  |
|  |  Total Custom Holdings: 8  |  Complete: 6  |  Incomplete: 2            |  |
|  |  Custom holdings are manually entered positions not in automated feeds |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  Search: [Search by ISIN, instrument name...........................]  [🔍] |
|                                                                              |
|  Filters:                                                                    |
|  Portfolio: [All v]  Asset Class: [All v]  Status: [All v]                  |
|  Show Only: [ ] Incomplete  [ ] Complete  [✓] All                           |
|                                                                              |
|  Showing 8 custom holdings                                                   |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  | ISIN         | Instrument        | Portfolio  | Position | Status    |  |
|  +------------------------------------------------------------------------+  |
|  | XX0001111222 | Private Equity    | Alt Assets | 500,000  | ✓ Complete|  |
|  |              | Fund ABC LP       |            | USD      | [View]    |  |
|  |              | Added: 2025-11-15 by Sarah Johnson        | [Edit]    |  |
|  |              |                                           | [Delete]  |  |
|  +------------------------------------------------------------------------+  |
|  | XX0002222333 | Real Estate       | Alt Assets | 1,250.0  | ✓ Complete|  |
|  |              | Property Trust    |            | shares   | [View]    |  |
|  |              | Added: 2025-10-20 by John Smith           | [Edit]    |  |
|  |              |                                           | [Delete]  |  |
|  +------------------------------------------------------------------------+  |
|  | XX0003333444 | Unlisted Security | Special    | 10,000   | ⚠ Incompl |  |
|  |              | Startup XYZ       | Situations | shares   | [View]    |  |
|  |              | Added: 2026-01-05 by Sarah Johnson        | [Edit]    |  |
|  |              | Missing: Price, Risk Metrics              | [Delete]  |  |
|  +------------------------------------------------------------------------+  |
|  | XX0004444555 | Derivative OTC    | Fixed Inc  | 1,000,000| ⚠ Incompl |  |
|  |              | Interest Rate Swap|            | notional | [View]    |  |
|  |              | Added: 2025-12-10 by John Smith           | [Edit]    |  |
|  |              | Missing: Valuation, Counterparty Rating   | [Delete]  |  |
|  +------------------------------------------------------------------------+  |
|  | XX0005555666 | Structured Note   | Fixed Inc  | 500,000  | ✓ Complete|  |
|  |              | Linked to Index   |            | USD      | [View]    |  |
|  |              | Added: 2025-09-15 by Sarah Johnson        | [Edit]    |  |
|  |              |                                           | [Delete]  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+

ADD/EDIT CUSTOM HOLDING MODAL:
+------------------------------------------------------------------------------+
|  Add Custom Holding                                             [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  ⚠ CUSTOM HOLDING - This position will be flagged as manually entered       |
|                                                                              |
|  Tab: [Basic Info] | Position Details | Valuation | Related Data            |
|                                                                              |
|  BASIC INFORMATION                                                           |
|                                                                              |
|  ISIN/Identifier:        [XX0006666777............................]          |
|                          (Use "XX" prefix for non-standard instruments)      |
|                                                                              |
|  Instrument Name:        [Private Debt Fund DEF....................]        |
|                          (Full name as it should appear in reports)          |
|                                                                              |
|  Short Name:             [PD Fund DEF.............................]          |
|                                                                              |
|  Asset Class:            [Alternative v]                                     |
|                          (Equity, Fixed Income, Alternative, Derivative)     |
|                                                                              |
|  Instrument Type:        [Private Debt v]                                    |
|                          (Specific type within asset class)                  |
|                                                                              |
|  Portfolio:              [Alternative Assets v]                              |
|                          (Select portfolio for this holding)                 |
|                                                                              |
|  CLASSIFICATION                                                              |
|                                                                              |
|  Issuer:                 [ABC Capital Management...................]        |
|  Country:                [United States v]                                   |
|  Currency:               [USD v]                                             |
|  Sector:                 [Financial Services v]                              |
|                                                                              |
|  POSITION DETAILS (Tab)                                                      |
|                                                                              |
|  Position Size:          [250000........]  Unit: [USD v] (USD, shares, etc.)|
|  Acquisition Date:       [2025-11-15]  [📅]                                  |
|  Acquisition Cost:       [250000........]  Currency: [USD v]                 |
|  Current Market Value:   [265000........]  Currency: [USD v]                 |
|  Valuation Date:         [2026-01-31]  [📅]                                  |
|                                                                              |
|  Valuation Method:       [Manager Valuation v]                              |
|                          (Market Price, Manager Valuation, Model, Fair Value)|
|                                                                              |
|  VALUATION (Tab)                                                             |
|                                                                              |
|  Valuation Source:       [Fund Administrator v]                              |
|  Valuation Frequency:    [Quarterly v] (Daily, Monthly, Quarterly, Annual)   |
|  Last Valuation Date:    [2026-01-31]  [📅]                                  |
|  Next Expected:          [2026-04-30]  [📅]                                  |
|                                                                              |
|  Price per Unit:         [1.06........]                                      |
|  Total Market Value:     [265000........]  (Auto-calculated)                 |
|                                                                              |
|  Unrealized Gain/Loss:   [+15000........]  (+6.0%) (Auto-calculated)        |
|                                                                              |
|  RELATED DATA (Tab)                                                          |
|                                                                              |
|  [ ] Risk Metrics Required   (Duration, YTM for fixed income)               |
|  [ ] Volatility Metric       (Beta for equities)                            |
|  [ ] Credit Rating Required  (For rated instruments)                        |
|                                                                              |
|  Counterparty (if applicable):  [XYZ Bank...................]                |
|  Counterparty Rating:           [A+.......]                                  |
|                                                                              |
|  DOCUMENTATION                                                               |
|                                                                              |
|  Reason for Manual Entry:  [Not available in standard data feeds........]   |
|                           [................................................]   |
|                           (Required - explain why this is manual entry)     |
|                                                                              |
|  Supporting Documents:     [📎 Fund_Statement_Jan2026.pdf]  [Upload]        |
|                           [📎 Valuation_Report.xlsx]        [Upload]        |
|                                                                              |
|  Notes:                   [Additional notes about this holding..........]    |
|                          [................................................]    |
|                                                                              |
|  +----------------------------------------------------------------------+    |
|  | VALIDATION STATUS                                             ⚠      |    |
|  +----------------------------------------------------------------------+    |
|  | ✓ Basic information complete                                         |    |
|  | ✓ Position details complete                                          |    |
|  | ✓ Valuation information complete                                     |    |
|  | ⚠ Missing: Risk metrics (if required for asset class)                |    |
|  | ✓ Documentation provided                                             |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
|  [Save Custom Holding]  [Save and Add New]  [Cancel]                        |
|                                                                              |
+------------------------------------------------------------------------------+

DELETE CONFIRMATION MODAL:
+------------------------------------------------------------------------------+
|  Delete Custom Holding                                          [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Are you sure you want to delete this custom holding?                        |
|                                                                              |
|  Instrument: Private Equity Fund ABC LP (XX0001111222)                       |
|  Portfolio: Alternative Assets                                               |
|  Position: 500,000 USD                                                       |
|                                                                              |
|  ⚠ THIS ACTION WILL:                                                         |
|  • Remove this holding from the current batch                                |
|  • Affect portfolio calculations and valuations                              |
|  • Require recalculation of portfolio totals                                 |
|  • Be logged in audit trail                                                  |
|                                                                              |
|  This is a soft delete - the holding record will be retained for audit       |
|  purposes but marked as inactive.                                            |
|                                                                              |
|  Reason for deletion:  [Holding was sold/redeemed...................]       |
|                       [................................................]       |
|                       (Required for audit trail)                            |
|                                                                              |
|  [Confirm Delete]  [Cancel]                                                  |
|                                                                              |
+------------------------------------------------------------------------------+

VALIDATION STATUS VIEW:
+------------------------------------------------------------------------------+
|  Custom Holdings Validation Status                              [Close ✕]   |
+------------------------------------------------------------------------------+
|                                                                              |
|  Batch: January 2026 (2026-01-31)                                            |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |  VALIDATION SUMMARY                                          ⚠        |  |
|  +------------------------------------------------------------------------+  |
|  |  Total Custom Holdings: 8                                              |  |
|  |  Complete: 6 (75%)                                                     |  |
|  |  Incomplete: 2 (25%)                                                   |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  INCOMPLETE HOLDINGS                                                         |
|                                                                              |
|  1. XX0003333444 - Unlisted Security Startup XYZ                             |
|     Portfolio: Special Situations                                            |
|     Missing:                                                                 |
|     • Current market valuation                                               |
|     • Risk metrics (if required)                                             |
|     Action: [Complete Data Entry]                                            |
|                                                                              |
|  2. XX0004444555 - Derivative OTC Interest Rate Swap                         |
|     Portfolio: Fixed Income Fund                                             |
|     Missing:                                                                 |
|     • Current mark-to-market valuation                                       |
|     • Counterparty credit rating                                             |
|     Action: [Complete Data Entry]                                            |
|                                                                              |
|  Impact on Reporting:                                                        |
|  • Portfolio valuations incomplete                                           |
|  • Risk calculations may exclude these positions                             |
|  • Approvers will see incomplete data status                                 |
|                                                                              |
|  [Export Incomplete List]  [Close]                                           |
|                                                                              |
+------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| [+ Add Custom Holding] | Button | Create new manually entered holding |
| [📊 Export] | Button | Download custom holdings list to Excel |
| [📋 View Validation Status] | Button | See completeness summary for all custom holdings |
| Custom Holdings Summary | Info Panel | Shows total, complete, and incomplete counts |
| Holdings Table | Data Table | Shows custom holdings with completion status |
| Status Badge | Visual Indicator | ✓ Complete or ⚠ Incomplete with specific missing items |
| [View] | Link | View holding details in read-only mode |
| [Edit] | Link | Modify custom holding (only during Data Preparation) |
| [Delete] | Link | Soft delete custom holding with reason |
| Add/Edit Modal - Tabbed | Multi-Tab Form | Basic info, position details, valuation, related data |
| ISIN/Identifier Field | Text Input | Use "XX" prefix for non-standard instruments |
| Valuation Method Selector | Dropdown | Market price, manager valuation, model, fair value |
| Supporting Documents | File Upload | Attach supporting documentation |
| Reason for Manual Entry | Required Text Area | Document why this is manually entered |
| Validation Status Panel | Status Display | Shows completeness of required fields |
| [Save and Add New] | Button | Save current and open blank form for next entry |

## User Actions

- **Add Custom Holding**: Create manually entered position with full details
- **Edit Holding**: Modify existing custom holding (only during Data Preparation)
- **Delete Holding**: Soft delete with required reason (audit trail preserved)
- **View Validation Status**: See completeness summary for all custom holdings
- **Upload Documents**: Attach supporting documentation (fund statements, valuations)
- **Export List**: Download custom holdings to Excel
- **Complete Data Entry**: Navigate from validation view to edit incomplete holdings

## Business Rules

- Custom holdings clearly identified to distinguish from automated feeds
- Same validation rules apply as automated data (completeness checks)
- Full audit trail required (creation, modification, deletion)
- Soft delete only (records retained for historical reference)
- Access controls same as other master data (Data Preparation phase only)
- Supporting documentation strongly recommended
- Reason for manual entry required for audit trail
- ISIN/identifier must be unique (validation on save)
- Valuation method and source must be documented
- Custom holdings subject to same approval workflow as other data

## Navigation
- **From:** Data validation summary, dashboard alerts, portfolio holdings view
- **To:** Instrument master (if instrument doesn't exist), data validation summary

## State Dependencies
- **Data Preparation Phase**: Full CRUD access, all buttons enabled
- **During Approval**: Read-only access, [Add], [Edit], [Delete] disabled, 🔒 shown
- **After Rejection**: Edit access restored immediately
- **Closed Batch**: Read-only historical view

## Custom Holding Alert

Banner at top of screen:
```
+------------------------------------------------------------------------+
|  ℹ CUSTOM HOLDINGS INFORMATION                                         |
+------------------------------------------------------------------------+
|  Custom holdings are manually entered positions not available through  |
|  automated data feeds. These positions:                                |
|  • Are clearly flagged in all reports                                  |
|  • Require full documentation and supporting evidence                  |
|  • Are subject to same validation and approval as automated data       |
|  • Must have documented reason for manual entry                        |
|                                                                        |
|  Use custom holdings only when instruments are unavailable through     |
|  standard feeds (private equity, OTC derivatives, unlisted securities).|
+------------------------------------------------------------------------+
```

## Valuation Warning

When valuation date is old:
```
+------------------------------------------------------------------------+
|  ⚠ VALUATION DATE WARNING                                              |
+------------------------------------------------------------------------+
|  Last valuation date: 2025-10-31 (3 months old)                        |
|                                                                        |
|  This valuation may be stale for current reporting period (2026-01-31).|
|  Consider:                                                             |
|  • Requesting updated valuation from fund administrator                |
|  • Documenting reason if using outdated valuation                      |
|  • Noting valuation staleness for approvers                            |
|                                                                        |
|  [Update Valuation]  [Document Reason]  [Proceed Anyway]               |
+------------------------------------------------------------------------+
```
