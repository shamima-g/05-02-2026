# Wireframes: InvestInsight Portfolio Reporting & Data Stewardship Platform

## Summary

Complete wireframe set for an enterprise portfolio reporting and data stewardship platform with multi-level approval workflows, state-based access control, and comprehensive master data management.

## Total Screens: 18

## Screen List

| # | Screen | Description | File |
|---|--------|-------------|------|
| 1 | Dashboard (Role-Based Home) | Landing page with pending actions, workflow status, and role-specific alerts | `screen-01-dashboard.md` |
| 2 | Batch Management | Create/view batches, switch between reporting periods, access historical batches | `screen-02-batch-management.md` |
| 3 | File Status Monitor | Track expected vs received files across all sources with real-time status | `screen-03-file-status-monitor.md` |
| 4 | Data Validation Summary | Comprehensive completeness checks with drill-down and business judgment support | `screen-04-data-validation-summary.md` |
| 5 | Approval Review Screens (3 pages) | Read-only approval view per level (/approvals/level-1, /level-2, /level-3) with mandatory rejection reason | `screen-05-approval-review.md` |
| 6 | Workflow State Viewer | Visual workflow progress with complete state transition history | `screen-06-workflow-state-viewer.md` |
| 7 | Instrument Master Management | CRUD operations for instrument definitions with search and audit history | `screen-07-instrument-master-management.md` |
| 8 | Index Prices Management | Maintain index prices by period with bulk upload and history views | `screen-08-index-prices-management.md` |
| 9 | Risk Metrics Management | Manage Duration and YTM for fixed income instruments with outstanding tracking | `screen-09-risk-metrics-management.md` |
| 10 | Volatility Management | Manage instrument beta values for portfolio risk analysis | `screen-10-volatility-management.md` |
| 11 | Credit Ratings Management | Maintain multi-agency ratings with change detection and decision hierarchy | `screen-11-credit-ratings-management.md` |
| 12 | Custom Holdings Management | Manual entry for positions not in automated feeds with full audit trails | `screen-12-custom-holdings-management.md` |
| 13 | Reference Data Management | Centralized maintenance of countries, currencies, portfolios, fee structures | `screen-13-reference-data-management.md` |
| 14 | User Administration | User lifecycle management with role assignments and activity tracking | `screen-14-user-administration.md` |
| 15 | Role & Permission Management | Configure roles, approval authorities, and backup approvers | `screen-15-role-permission-management.md` |
| 16 | Audit Trail Viewer | Complete audit history with filtering by entity type, user, date range | `screen-16-audit-trail-viewer.md` |
| 17 | File Processing Monitor | Detailed file import logs with validation errors and retry capability | `screen-17-file-processing-monitor.md` |
| 18 | Calculation Status Monitor | Track calculation execution with detailed error messages and resolution guidance | `screen-18-calculation-status-monitor.md` |

## Screen Flow

### Core Monthly Workflow

```
Dashboard
    ↓
Batch Management (Create Jan 2026)
    ↓
File Status Monitor (Track file receipt)
    ↓
[If missing data] → Master Data Screens (7-12)
    ↓
Data Validation Summary (Confirm ready)
    ↓
Calculation Status Monitor (Verify calculations)
    ↓
Approval Review - Level 1 (Operations)
    ↓
Approval Review - Level 2 (Portfolio Manager)
    ↓
Approval Review - Level 3 (Executive)
    ↓
Published ✓
```

### Rejection Workflow

```
Approval Review (Any Level)
    ↓
[Reject with mandatory reason]
    ↓
Workflow State Viewer (Shows rejection event)
    ↓
[Calculations automatically cleared]
    ↓
[Data entry unlocked]
    ↓
Dashboard (Shows pending correction action)
    ↓
Master Data Screens (Fix issues)
    ↓
Data Validation Summary (Re-confirm)
    ↓
Calculation Status Monitor (Re-run)
    ↓
Back to Approval Review - Level 1
```

### Master Data Maintenance Flow

```
Data Validation Summary
    ↓
[Outstanding Items Alert]
    ↓
Instrument Master (if instrument missing)
    ↓
Index Prices (if benchmark missing)
    ↓
Risk Metrics (if duration/YTM missing)
    ↓
Volatility (if beta missing)
    ↓
Credit Ratings (if rating missing)
    ↓
Custom Holdings (if special position)
    ↓
Data Validation Summary (Verify completion)
```

### Administration Flow

```
User Administration
    ↓
Role & Permission Management
    ↓
[Configure Approval Authority]
    ↓
Reference Data Management
    ↓
Audit Trail Viewer (Monitor changes)
```

## Design Principles

### 1. State-Based Access Control
All data entry screens include 🔒 Locked indicator when batch is in approval phase. Master data screens (7-12) show locked state prominently and disable edit buttons.

### 2. Mandatory Rejection Reasons
All approval screens (Screen 5) enforce rejection reason entry at ALL approval levels (Operations, Portfolio Manager, Executive) per BRD requirement BR-GOV-001.

### 3. Outstanding Items Tracking
Master data screens (8-12) show outstanding items prominently with counts and direct navigation to fix missing data.

### 4. Business Judgment Support
Data Validation Summary (Screen 4) and Calculation Status Monitor (Screen 18) support proceeding with documented gaps when business judgment warrants.

### 5. Real-Time Status Updates
File Status Monitor (Screen 3), Calculation Status Monitor (Screen 18), and Workflow State Viewer (Screen 6) update in real-time without manual refresh.

### 6. Audit Trail Integration
All screens with [History] links connect to Audit Trail Viewer (Screen 16) filtered to relevant entity/user/date.

### 7. Role-Specific Behavior
Dashboard (Screen 1) and navigation adapt based on user roles and their configured page access:
- **Analyst**: All pages except Approval L1/L2/L3 and User Management - data correction, master data maintenance, commentary
- **Approver L1**: Approval Level 1 page only - operations-level review with approve/reject
- **Approver L2**: Approval Level 2 page only - portfolio manager review with approve/reject
- **Approver L3**: Approval Level 3 page only - executive review with approve/reject
- **Administrator**: Users and Roles pages only - user management, role configuration
- **Custom Roles**: Administrators can create additional roles with custom page access and permissions

### 8. Validation Before Progression
- File Status Monitor → Data Validation Summary → Calculation Status Monitor → Approval Review
- Each stage validates prerequisites before allowing progression

### 9. Error Resolution Guidance
File Processing Monitor (Screen 17) and Calculation Status Monitor (Screen 18) provide:
- Detailed error analysis
- Root cause identification
- Step-by-step resolution guidance
- Direct navigation to fix location

### 10. Complete Transparency
Approvers see same validation data as operations team (BR-GOV-002). No hidden information or summary-only views.

## Key Workflow States

### Data Preparation
- **Access**: Full edit access to files and master data
- **Screens Affected**: All master data screens (7-12)
- **Indicators**: No lock icon, all edit buttons enabled
- **User Actions**: Upload files, modify master data, confirm ready

### Level 1 Approval (Operations)
- **Access**: Read-only for all users, approver can approve/reject
- **Screens Affected**: All master data screens locked (🔒 shown)
- **Focus**: File completeness, data validation checks
- **Rejection Impact**: Returns to Data Preparation, clears calculations

### Level 2 Approval (Portfolio Manager)
- **Access**: Read-only for all users, approver can approve/reject
- **Focus**: Holdings reasonableness, performance results, risk metrics
- **Rejection Impact**: Returns to Data Preparation (not to Level 1), clears calculations

### Level 3 Approval (Executive)
- **Access**: Read-only for all users, approver can approve/reject
- **Focus**: Overall report quality, material issues, final sign-off
- **Rejection Impact**: Returns to Data Preparation, clears calculations

### Published/Closed
- **Access**: Read-only for all users
- **Indicators**: Status badge shows "Closed ✓"
- **Export**: Report export capability enabled
- **History**: Full audit trail accessible

## Critical Business Rules Reflected in Wireframes

1. **BR-GOV-001**: Three-level approval with mandatory rejection reasons at ALL levels (Screen 5)
2. **BR-GOV-002**: Approval information transparency - approvers see same data as operations (Screen 5)
3. **BR-GOV-003**: Rejection workflow returns to Data Preparation and clears calculations (Screens 5, 6)
4. **BR-GOV-004**: Sequential workflow with validation gates (Screens 2-6)
5. **BR-GOV-005**: State-based access control locks data during approval (Screens 7-12)
6. **BR-GOV-007**: Calculation checkpoint blocks progression if calculations fail (Screen 18)
7. **BR-DATA-001**: Multi-source file integration tracking (Screen 3)
8. **BR-DATA-004**: File status visibility across all portfolios (Screen 3)
9. **BR-VALID-001**: Comprehensive data completeness checks (Screen 4)
10. **BR-VALID-003**: Business judgment support for proceeding with gaps (Screens 4, 18)
11. **BR-MASTER-001 to 006**: Full CRUD for all master data entities (Screens 7-12)
12. **BR-RULE-001**: Credit rating decision hierarchy with 6-source priority (Screen 11)
13. **BR-AUD-001**: Complete audit trails with before/after values (Screen 16)
14. **BR-SEC-002**: Role-based access control with 5 default roles + custom role creation (Screens 14-15)

## File Organization

All wireframes saved to: `generated-docs/wireframes/`

- `_overview.md` - This file (screen index and workflow documentation)
- `screen-01-dashboard.md` through `screen-18-calculation-status-monitor.md` - Individual wireframes

Each wireframe file includes:
- **Purpose**: Screen objective and use cases
- **Wireframe**: ASCII-art layout showing structure and key elements
- **Elements**: Table describing all UI components
- **User Actions**: List of possible user interactions
- **Business Rules**: Relevant rules from BRD
- **Navigation**: Where users come from and where they can go
- **State Dependencies**: How screen behavior changes based on workflow state

## Next Steps

These wireframes are ready for:

1. **Feature Planning**: Use as input for feature breakdown and story creation
2. **Technical Design**: Convert to component architecture and API requirements
3. **User Validation**: Review with stakeholders for approval
4. **Development**: Reference during implementation

The wireframes capture all critical workflows, state-based behavior, role-specific views, and business rules from the BRD v2.
