# Business Requirements Document
## InvestInsight Portfolio Reporting & Data Stewardship Platform

---

**Document Version:** 3.0
**Date:** February 4, 2026
**Document Owner:** Investment Operations
**Status:** Active

**Document Purpose:** This BRD defines the business requirements for InvestInsight, focusing on business capabilities, processes, rules, and outcomes. Technical implementation details are deliberately excluded to allow flexibility in solution design.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Stakeholders](#3-stakeholders)
4. [Scope](#4-scope)
5. [Business Requirements](#5-business-requirements)
6. [Success Criteria](#6-success-criteria)
7. [Assumptions and Constraints](#7-assumptions-and-constraints)
8. [Glossary](#8-glossary)

---

## 1. Executive Summary

### 1.1 Business Problem

Investment teams face significant challenges in preparing accurate portfolio reports from multiple disparate data sources. Manual processes, lack of data validation, insufficient audit trails, and unclear approval workflows lead to:

- **Data Quality Issues**: Inconsistent or incorrect data in published reports
- **Operational Risk**: Lack of accountability and audit trails for data changes
- **Process Inefficiency**: Manual coordination across multiple data sources
- **Compliance Gaps**: Insufficient approval controls for financial reporting
- **Time-to-Report**: Extended cycles for monthly and weekly reporting processes

### 1.2 Proposed Solution

InvestInsight is a portfolio reporting and data stewardship platform that establishes a controlled data preparation workflow between raw data sources and external reporting systems. The platform ensures all published reports are accurate, validated, and properly authorized through multi-level approval processes with complete audit trails.

### 1.3 Business Value

- **Enhanced Data Quality**: Systematic validation and confirmation processes
- **Risk Mitigation**: Complete audit trails showing who changed what, when, and why
- **Operational Efficiency**: Automated file imports and guided correction workflows
- **Regulatory Compliance**: Multi-level approval processes with rejection workflows
- **Transparency**: Real-time visibility into data status and workflow progress
- **Data Governance**: Centralized control over reference data and master data management

---

## 2. Business Objectives

### 2.1 Primary Objectives

1. **Establish Data Governance Framework**
   - Implement multi-level approval processes for all published reports
   - Maintain complete audit trails for all data changes
   - Enforce role-based access controls throughout the workflow

2. **Ensure Data Accuracy**
   - Validate data completeness from all source systems
   - Enable efficient correction of data quality issues
   - Provide clear visibility into data status and gaps

3. **Streamline Reporting Operations**
   - Automate file imports from asset managers and data vendors
   - Reduce manual coordination efforts across teams
   - Minimize time-to-report for monthly and weekly cycles

4. **Enable Informed Decision-Making**
   - Provide reliable data to external reporting systems
   - Support portfolio managers with accurate performance data
   - Maintain historical data for trend analysis and compliance

### 2.2 Secondary Objectives

- Reduce operational risk through systematic controls
- Improve cross-team collaboration and accountability
- Support scalability for additional portfolios and data sources
- Enable self-service data maintenance for authorized users

---

## 3. Stakeholders

### 3.1 Primary Stakeholders

| Stakeholder Group | Role | Key Interests |
|-------------------|------|---------------|
| **Investment Operations Team** | Process Coordinators | Efficient data preparation, clear error resolution, workflow orchestration |
| **Portfolio Managers** | Data Reviewers | Data accuracy, timely reports, ability to add context and commentary |
| **Analysts** | Data Quality Specialists | Ability to investigate and correct data issues efficiently |
| **Approvers (3 Levels)** | Governance Authorities | Clear approval workflows, rejection capabilities, accountability |
| **Compliance Team** | Auditors | Complete audit trails, data governance enforcement |

### 3.2 Secondary Stakeholders

- **IT Department**: System reliability, integration support
- **External Auditors**: Audit trail access and reporting
- **Asset Managers**: File submission and data quality feedback
- **Data Vendors (Bloomberg, etc.)**: Data integration and validation

---

## 4. Scope

### 4.1 In Scope - Business Capabilities

The InvestInsight platform provides the following business capabilities:

#### 4.1.1 Governance & Control
- Multi-level approval workflow with validation gates
- State-based access control (lock/unlock based on workflow stage)
- Complete audit trails for all data changes and decisions
- Role-based access control and user management
- Approval authority configuration

#### 4.1.2 Data Quality & Validation
- Automated and manual file intake from multiple sources
- Systematic data completeness validation
- Real-time status visibility and error tracking
- Business judgment support for deadline-driven reporting

#### 4.1.3 Data Stewardship
- Instrument master data management
- Index price management
- Risk metric management (duration, yield-to-maturity)
- Volatility metric management (beta)
- Credit rating management with change tracking
- Custom holdings management
- Comprehensive reference data management

#### 4.1.4 Business Process Support
- Batch creation and workflow orchestration
- Process monitoring and visibility
- Calculation execution tracking
- Report commentary capability
- Historical comparison and trend analysis

#### 4.1.5 User Support & Integration
- Role-specific workflow support (Operations, Analyst, Approver, Administrator)
- Integration with external reporting systems
- Excel export for analysis and external sharing

### 4.2 Out of Scope

- **Weekly Cashflow Process**: Separate workflow excluded from this initiative
- **Report Design & Layout**: External reporting tool (Power BI) responsibility
- **Portfolio Performance Calculations**: Performed by external calculation engines
- **Client-Facing Reporting**: Direct client report distribution
- **Investment Decision Support**: Trading, portfolio construction, or investment strategy tools

---

## 5. Business Requirements

**Requirements Organization:** Requirements are organized by business objective to align with stakeholder priorities. Each requirement includes Business Need, Requirement statement, Business Rules, Priority, and Rationale.

---

### 5.1 Governance & Control Requirements

**Purpose:** Ensure appropriate oversight, accountability, and regulatory compliance for all published reports

---

#### 5.1.1 Approval Workflow & Control

**BR-GOV-001: Three-Level Approval Hierarchy**
**Business Need**: Graduated oversight with appropriate accountability at each level

**Requirement**: The solution must enforce a three-level approval process with distinct purposes:

**Level 1 - Operations Approval**: Data completeness verification focusing on file receipt and data validation checks (rejection reason REQUIRED)

**Level 2 - Portfolio Manager Approval**: Portfolio-level confirmation focusing on holdings reasonableness, performance results, and risk metrics (rejection reason REQUIRED)

**Level 3 - Executive Approval**: Final sign-off before publication focusing on overall report quality and material issues (rejection reason REQUIRED)

**Business Rules**:
- Approvals must occur sequentially without bypassing levels
- Each level can approve or reject
- Rejection at any level returns workflow to data preparation (not to previous approval level)
- All approval decisions logged with user, timestamp, and reason
- Rejection at any level requires documented reason
- Rejection triggers automatic calculation clearing to ensure fresh recalculations

**Priority**: CRITICAL
**Rationale**: Multi-level approval ensures appropriate oversight and accountability for published financial reports with clear governance at each stage

---

**BR-GOV-002: Approval Information Transparency**
**Business Need**: Informed decision-making at each approval level

**Requirement**: Approvers must have access to all information necessary for informed approval decisions including current workflow status, data validation results (same information available to operations team), explanatory comments from portfolio managers and analysts, previous approval history for the current batch, and any rejection reasons from prior submission attempts.

**Business Rules**:
- All approval-related information must be read-only (approvers cannot modify data under review)
- Information transparency across all approval levels (Level 3 sees same data as Level 1)
- Information presented must reflect current state as of approval decision
- Approvers must see same data completeness results as operations team

**Priority**: HIGH
**Rationale**: Approvers need complete context to make informed decisions and are accountable for approval quality

---

**BR-GOV-003: Rejection Workflow**
**Business Need**: Clear process for handling rejected batches with data integrity

**Requirement**: When a batch is rejected at any approval level, the workflow must return to data preparation phase with all data entry capabilities unlocked, calculations automatically cleared, rejection reason logged (mandatory), and operations team notified.

**Business Rules**:
- Rejection triggers automatic calculation clearing
- All file and master data maintenance capabilities restored immediately
- Workflow cannot proceed to approvals until data is re-confirmed
- Rejection reason logged with timestamp and username
- All subsequent approvals reset (must be re-obtained after corrections)

**Priority**: CRITICAL
**Rationale**: Ensures data corrections are reflected in fresh calculations, maintains audit trail, and prevents publication of rejected data

---

**BR-GOV-004: Monthly Reporting Workflow**
**Business Need**: Establish a controlled, repeatable process for monthly portfolio reporting with appropriate validation gates and governance controls

**Requirement**: The solution must support a sequential workflow that progresses from data preparation through multi-level approval to final publication, with the following characteristics:

**Data Preparation Phase**: All required data must be collected, validated, and confirmed before progression

**Calculation Validation Gate**: Calculations must complete successfully before reports can be reviewed

**Multi-Level Approval**: Three sequential approval levels (Operations, Portfolio Manager, Executive) with distinct review purposes

**Publication Control**: Only approved data released to external reporting systems

**Batch Closure**: Completed batches archived for historical reference

**Business Rules**:
- Progressive workflow prevents advancement until validation gates are met
- Rejection at any approval level must return workflow to data preparation phase
- Data corrections require recalculation (calculations must clear upon rejection)
- Three-level approval hierarchy cannot be bypassed or reordered
- All workflow state transitions must be auditable with user attribution and timestamps
- Multiple batches can be active simultaneously with distinct reporting dates

**Priority**: CRITICAL
**Rationale**: Structured workflow with validation gates ensures data quality, appropriate oversight, and accountability for published financial reports

---

**BR-GOV-005: State-Based Access Control**
**Business Need**: Prevent unauthorized changes during approval process while maintaining data integrity

**Requirement**: User permissions must adapt based on workflow stage to ensure approved data cannot be modified:

**During Data Preparation**: Full access to data entry, file uploads, and corrections

**During Approval Process**: Read-only access to data; no modifications allowed

**After Rejection**: Full access restored to enable corrections

**Business Rules**:
- Lock must apply to all data entry points (file uploads, master data maintenance)
- Lock applies after first approval is granted
- Unlock applies immediately upon rejection
- Read-only access must remain available for review purposes
- State changes must be immediate and system-enforced (not relying on user discipline)

**Priority**: CRITICAL
**Rationale**: Maintains data integrity and ensures reviewers approve the actual data that will be published; prevents unauthorized changes undermining approval process

---

**BR-GOV-006: Batch Management**
**Business Need**: Support parallel processing of different reporting periods

**Requirement**: The solution must support multiple active batches with distinct reporting dates, ability to work on current month while correcting prior months, clear identification of which batch is current, and historical batch access for reference.

**Business Rules**:
- Each batch has unique identifier and reporting date
- Historical batches accessible in read-only mode
- No limit on number of historical batches retained (subject to data retention policy)
- Batch creation initiates workflow in data preparation state
- Users can switch between active batches without data loss

**Priority**: HIGH
**Rationale**: Operations require flexibility to correct prior periods while progressing current reporting; supports continuous improvement and error correction

---

**BR-GOV-007: Calculation Checkpoint**
**Business Need**: Prevent publication of reports with incorrect calculations

**Requirement**: The solution must validate calculation success before allowing progression to draft publication, with visibility into which calculations failed and why, automatic re-execution after data corrections, and retention of calculation history for audit.

**Business Rules**:
- Failed calculations must block workflow advancement
- Detailed error information must be available (calculation name, error category, full error message)
- Calculations must re-run after any data corrections during rejection workflow
- Calculation history retained for audit and troubleshooting
- Calculation success/failure status visible to operations team and approvers

**Priority**: CRITICAL
**Rationale**: Publishing reports with calculation errors creates significant financial and reputational risk; validation gate is essential control

---

#### 5.1.2 Audit & Compliance

**BR-AUD-001: Complete Audit Trails for Master Data**
**Business Need**: Regulatory compliance and operational accountability

**Requirement**: The solution must maintain complete audit trails for all master data changes capturing user who made change, timestamp, before value, after value, and change reason (where applicable). Both record-level audit trails (complete history for single record) and full table audit trails (all changes across entity type with filtering) must be available.

**Business Rules**:
- Audit trails must be immutable (cannot be deleted or modified)
- Retained per data retention policy (minimum 7 years for financial data)
- Accessible to authorized users, auditors, and compliance team
- Searchable and filterable by date range, user, entity type
- Exportable for compliance reporting

**Priority**: CRITICAL
**Rationale**: Regulatory requirement for financial data systems; essential for accountability and compliance audits

---

**BR-AUD-002: Audit Trail Coverage**
**Business Need**: Comprehensive change tracking across all critical data

**Requirement**: Audit trails must be maintained for all master data entities including instruments, index prices, durations and yield-to-maturity, instrument betas, credit ratings, custom holdings, and all reference data entities.

**Priority**: CRITICAL
**Rationale**: Comprehensive change tracking across all data elements ensures complete accountability and supports regulatory compliance

---

**BR-AUD-003: Workflow Audit Trail**
**Business Need**: Complete visibility into process execution for troubleshooting and compliance

**Requirement**: The solution must track all workflow state transitions capturing stage changes, user who triggered transition, timestamp, and any associated automated actions executed.

**Business Rules**:
- Complete history retained for each batch
- Accessible for audit and troubleshooting
- Immutable once recorded
- Includes rejection events with reasons

**Priority**: CRITICAL
**Rationale**: Supports audit requirements, operational troubleshooting, and demonstrates governance effectiveness

---

**BR-AUD-004: User Activity Tracking**
**Business Need**: Security audits and compliance

**Requirement**: The solution must log user login attempts (successful and failed), user access to sensitive data, user actions and operations, and session information.

**Business Rules**:
- Logs retained per security policy
- Accessible to security and compliance teams
- Protected from tampering
- Includes timestamp, user identifier, action type, affected data

**Priority**: HIGH
**Rationale**: Required for security audits and compliance with financial services regulations

---

**BR-AUD-005: Audit Trail Access**
**Business Need**: Easy access to change history during data review and investigations

**Requirement**: Audit trails must be accessible during normal operations for data review purposes, compliance inquiries, and operational troubleshooting.

**Business Rules**:
- Access controlled by role (not all users need audit access)
- Both detailed (record-level) and summary (table-level) views available
- Export capability for formal audit requests

**Priority**: MEDIUM
**Rationale**: Provides easy access to change history during data review and supports efficient compliance responses

---

#### 5.1.3 User Access & Security

**BR-SEC-001: User Lifecycle Management**
**Business Need**: Control who has access to the system

**Requirement**: Administrators must be able to manage complete user lifecycle including creation, updates to user information, deactivation when users leave or change roles, reactivation when needed, and viewing user activity.

**Business Rules**:
- Users cannot be hard deleted (audit trail requirement)
- User changes must be audited
- Deactivated users lose all access immediately
- User changes take effect in real-time

**Priority**: HIGH
**Rationale**: Fundamental security and access control requirement; ensures only authorized personnel can access financial data

---

**BR-SEC-002: Role-Based Access Control**
**Business Need**: Users should only access functions appropriate to their role

**Requirement**: The solution must support definition of roles with specific permissions, assignment of roles to users, page and function access control by role, and approval authority configuration by role.

**Defined Roles**:
- **Operations Lead**: Full data entry, file management, workflow orchestration
- **Analyst**: Data correction and maintenance, commentary
- **Approver Level 1**: View and approve (operations level)
- **Approver Level 2**: View and approve (portfolio manager level)
- **Approver Level 3**: View and approve (executive level)
- **Administrator**: User management, configuration, audit access
- **Read-Only**: View access for reporting and analysis

**Business Rules**:
- Users can have multiple roles
- Most restrictive permission applies when conflicts exist
- Role changes take effect immediately
- All role assignments audited
- Role permissions defined centrally (not per user)

**Priority**: CRITICAL
**Rationale**: Fundamental security requirement for financial systems; ensures segregation of duties and appropriate access levels

---

**BR-SEC-003: Approval Authority Configuration**
**Business Need**: Delegate approval authority appropriately as organizational structure changes

**Requirement**: Administrators must be able to configure which users can approve at each level, modify approval assignments as organization changes, and view current approval authority configuration.

**Business Rules**:
- Users cannot approve their own work (segregation of duties)
- Approval authority changes audited
- Changes take effect for new batches only (in-progress batches retain original approvers)
- Backup approvers can be designated for continuity

**Priority**: HIGH
**Rationale**: Approval authority must be configurable to reflect organizational structure; supports business continuity

---

**BR-SEC-004: Authentication & Authorization**
**Business Need**: Prevent unauthorized access and ensure accountability

**Requirement**: The solution must authenticate all users, manage sessions securely, perform operation-level authorization checks, and automatically capture user context for all changes (LastChangedUser attribution).

**Business Rules**:
- Strong password policies enforced (minimum length, complexity, expiration)
- Failed login attempts logged
- Session timeouts implemented
- User context automatically captured (no manual entry)

**Priority**: CRITICAL
**Rationale**: Prevents unauthorized access and ensures all actions are attributable to specific users

---

**BR-SEC-005: Administrative Action Audit**
**Business Need**: Track changes to security configuration for compliance

**Requirement**: All state-changing administrative actions including user creation, role assignment, permission changes, and approval authority changes must be fully audited.

**Priority**: HIGH
**Rationale**: Tracks changes to security configuration for compliance and security investigations

---

### 5.2 Data Quality & Validation Requirements

**Purpose:** Ensure accurate, complete, and verified data from all sources

---

#### 5.2.1 Data Acquisition

**BR-DATA-001: Multi-Source File Integration**
**Business Need**: Consolidate data from diverse sources for comprehensive reporting per contractual obligations

**Requirement**: The solution must support automated and manual file intake from three distinct source categories with the following required data:

**Asset Manager Files** (per portfolio, 7 file types):
- Holdings positions
- Buy/sell transactions
- Income received
- Cash positions
- Performance attribution
- Management fees
- Instrument static data

**Bloomberg Files** (shared across portfolios, 4 file types):
- Instrument static data
- Index pricing
- Credit ratings
- Holdings verification

**Custodian Files** (multi-currency, 4 file types):
- Holdings verification (USD/ZAR)
- Transaction verification (USD/ZAR)
- Cash reconciliation
- Custody fees

**Business Rules**:
- All file types within each category are contractually required
- System must track expected file count vs. actual received per source
- Files from different sources must be clearly distinguished
- Multi-currency custodian files must support at minimum USD and ZAR
- File receipt tracked with timestamps for SLA monitoring

**Priority**: CRITICAL
**Rationale**: Complete data from all sources is essential for accurate reporting and required by contractual obligations with data providers

---

**BR-DATA-002: Automated File Import**
**Business Need**: Reduce manual effort and ensure timely data availability

**Requirement**: The solution must support scheduled automatic import from configured locations, manual trigger capability for immediate import, secure file transfer protocols, and status visibility into import operations.

**Business Rules**:
- Failed imports must be flagged immediately with detailed error information
- Users must be able to retry failed imports without re-uploading files
- Import history retained for troubleshooting and audit
- Automated imports run on configured schedule without manual intervention
- Import status visible in real-time

**Priority**: HIGH
**Rationale**: Manual file collection is time-consuming and error-prone; automation reduces operational burden and improves timeliness

---

**BR-DATA-003: File Error Management**
**Business Need**: Rapid identification and resolution of file quality issues

**Requirement**: When files fail validation, users must be able to view detailed error descriptions, understand what validation rule failed, identify specific data quality issues, re-upload corrected files, and cancel and retry file operations.

**Business Rules**:
- Error messages must be actionable (tell user what to fix, not just that it failed)
- Users must be able to export error details for sharing with data providers
- File operation history must be auditable
- Multiple validation errors shown together (not one-at-a-time)
- Error categorization for trend analysis

**Priority**: HIGH
**Rationale**: Efficient error resolution directly impacts time-to-report; clear error messages reduce back-and-forth with data providers

---

**BR-DATA-004: File Status Visibility**
**Business Need**: At-a-glance understanding of data completeness across all portfolios

**Requirement**: Users must be able to quickly identify which files have been received, which files are currently processing, which files have failed, which files are still missing, and view status across all portfolios simultaneously.

**Business Rules**:
- Status must update in real-time as files are processed
- Users must be able to drill down from summary to detail
- Historical file receipt must be trackable
- Visual indicators for status (missing, processing, complete, failed)
- Expected file count vs. actual clearly displayed

**Priority**: CRITICAL
**Rationale**: Operations team must quickly identify data gaps to meet reporting deadlines; at-a-glance visibility essential for efficient coordination

---

#### 5.2.2 Data Validation & Completeness

**BR-VALID-001: Comprehensive Data Completeness Checks**
**Business Need**: Systematic validation before report publication

**Requirement**: The solution must validate data completeness across three dimensions:

**File Completeness**: Track expected vs. actual file receipt for all sources (Asset Manager, Bloomberg, Custodian)

**Portfolio Data Completeness**: Verify presence of all required portfolio data elements (holdings, transactions, income, cash, performance, fees) and independent custodian verification

**Reference Data Completeness**: Validate supporting master data availability including instrument definitions, index prices, credit ratings, and risk metrics (duration, beta) for all holdings

**Business Rules**:
- Incomplete data must be quantified (count of missing items, not just yes/no flags)
- Validation results must update in real-time as corrections are made
- Users may proceed despite incomplete data when business judgment warrants (with documented decision)
- Approvers must see same validation results as operations team (transparency)
- Validation organized by logical categories for efficient review

**Priority**: CRITICAL
**Rationale**: Systematic validation reduces risk of publishing incomplete reports while supporting business judgment for deadline-driven reporting

---

**BR-VALID-002: Real-Time Validation Updates**
**Business Need**: Immediate feedback on correction effectiveness

**Requirement**: When users correct data issues, validation results must update immediately to reflect the corrections without requiring manual refresh actions.

**Business Rules**:
- Updates occur automatically upon data changes
- No manual refresh required
- Changes reflected across all validation views
- Performance must not degrade with frequent updates

**Priority**: HIGH
**Rationale**: Enables efficient iterative correction without frustrating manual refresh cycles; improves user productivity

---

**BR-VALID-003: Business Judgment Support**
**Business Need**: Balance data completeness with reporting deadlines

**Requirement**: The solution must clearly identify incomplete data, allow users to proceed despite incompleteness, document the decision to proceed, and make incomplete areas visible to approvers.

**Business Rules**:
- Incomplete data must not block confirmation action
- Approvers must see same validation results as operations team
- Decision to proceed with gaps must be auditable
- Quantification of incompleteness provided (e.g., "5 instruments missing ratings")
- Historical trend of incompleteness trackable

**Priority**: HIGH
**Rationale**: Real-world reporting often requires balancing perfection with timeliness; system must support informed business decisions

---

**BR-VALID-004: Outstanding Item Tracking**
**Business Need**: Proactive identification of data gaps before report generation

**Requirement**: For data elements commonly requiring manual entry, the solution must clearly identify outstanding items including instruments missing risk metrics (duration), instruments missing volatility metrics (beta), missing index prices, and incomplete credit ratings.

**Business Rules**:
- Outstanding items updated in real-time as data is entered
- Count of outstanding items visible at summary level
- Drill-down to specific items available for correction
- Outstanding items identifiable by portfolio for targeted follow-up
- Export capability for sharing with responsible parties

**Priority**: HIGH
**Rationale**: Proactive gap identification enables efficient data completion; prevents last-minute surprises before approval

---

**BR-VALID-005: Guided Data Checks**
**Business Need**: Focus attention on critical issues during data review

**Requirement**: Data validation must be organized to funnel users to what matters most through high-level summary before detail, critical issues highlighted, clear status indicators (complete/incomplete), and logical categorization.

**Business Rules**:
- Summary view shows overall readiness status
- Critical vs. non-critical issues distinguished
- Drill-down from summary to detail available
- Validation organized by business process (file intake, portfolio data, reference data)

**Priority**: HIGH
**Rationale**: Efficient review requires clear prioritization of issues; prevents users from getting lost in detail

---

### 5.3 Data Stewardship Requirements

**Purpose:** Maintain accurate, consistent master and reference data

---

#### 5.3.1 Master Data Management

**BR-MASTER-001: Instrument Master Data Management**
**Business Need**: Centralized, consistent instrument information across all portfolios

**Requirement**: Users must be able to maintain comprehensive instrument master data including identification (codes, ISIN, names), classification (type, asset class), issuer, geography (country, currency), and maturity information. Full lifecycle management capability required including creation, modification, deactivation, search, export, and complete audit history access.

**Business Rules**:
- All changes fully audited (user, timestamp, before/after values)
- Historical data must be preserved (soft delete only, no hard deletion)
- Modifications only permitted during Data Preparation phase
- Incomplete instruments must be identifiable for correction
- ISIN export capability for sharing with data providers

**Priority**: CRITICAL
**Rationale**: Instrument master data is foundational to all portfolio holdings and must be accurate, complete, and auditable

---

**BR-MASTER-002: Index Price Management**
**Business Need**: Accurate benchmark pricing for performance comparison

**Requirement**: Users must be able to manage index prices including entry for configured indexes, correction of erroneous prices, viewing price history across reporting periods, bulk upload capability, and identification of missing prices. Full lifecycle management capability required.

**Business Rules**:
- Prices tied to specific reporting batch and date
- Price history must be maintained across reporting periods
- Missing prices clearly identified before calculations
- All changes audited
- Modifications only permitted during Data Preparation phase
- Rapid entry capability for multiple indexes

**Priority**: HIGH
**Rationale**: Incorrect benchmark prices produce misleading performance comparisons; accurate pricing essential for investment reporting

---

**BR-MASTER-003: Risk Metric Management**
**Business Need**: Accurate interest rate risk metrics for fixed income portfolios

**Requirement**: Users must be able to manage risk metrics including duration (interest rate sensitivity) and yield-to-maturity, link values to specific instruments and reporting periods, and identify instruments missing risk metrics. Full lifecycle management capability required including creation, modification, deletion, outstanding item visibility, and audit history access.

**Business Rules**:
- Risk metrics tied to specific reporting batch
- Missing metrics clearly identified for correction
- Historical values retained for trend analysis
- All changes audited
- Modifications only during Data Preparation phase

**Priority**: HIGH
**Rationale**: Risk metrics essential for portfolio risk reporting and regulatory compliance; missing metrics prevent complete risk analysis

---

**BR-MASTER-004: Volatility Metric Management**
**Business Need**: Portfolio volatility analysis and risk reporting

**Requirement**: Users must be able to manage instrument beta values (volatility relative to market) with full lifecycle management capability including creation, modification, outstanding item visibility, and audit history access.

**Business Rules**:
- Beta values tied to reporting batch
- Outstanding items clearly identified
- All changes audited
- Modifications only during Data Preparation phase

**Priority**: MEDIUM
**Rationale**: Required for comprehensive portfolio risk analysis and volatility reporting

---

**BR-MASTER-005: Credit Rating Management**
**Business Need**: Critical for compliance and risk reporting

**Requirement**: Users must be able to manage credit ratings including ratings from multiple agencies, both national and international rating scales, rating effective dates, and rating change tracking (upgrades/downgrades). Full lifecycle management required including creation, modification, history views, change reporting, decision flow re-execution, and complete audit trail access.

**Business Rules**:
- Rating changes must be explicitly tracked and reported period-over-period
- Historical ratings retained indefinitely
- Changes only during Data Preparation phase
- All modifications audited
- Rating decision logic can be re-run when rules change
- Both national and international scales supported

**Priority**: HIGH
**Rationale**: Credit ratings are critical for regulatory reporting and investment policy compliance; rating changes have material impact on risk profiles

**Note**: The specific rating source hierarchy (Bloomberg → Fitch → Moody's → S&P → Fund Manager) in BR-RULE-001 should be validated with Compliance and Investment Policy teams to confirm whether it is regulatory requirement or internal policy.

---

**BR-MASTER-006: Custom Holdings Management**
**Business Need**: Accommodate special positions not in standard data feeds

**Requirement**: Users must be able to manually enter and maintain holdings for instruments not available through automated feeds with full lifecycle management capability and complete audit trails.

**Business Rules**:
- Full audit trail required
- Same access controls as other master data (Data Preparation phase only)
- Clear identification as custom holdings to distinguish from automated feeds
- Custom holdings subject to same validation rules as automated data

**Priority**: MEDIUM
**Rationale**: Edge cases and special instruments require manual entry capability; flexibility needed while maintaining data quality standards

---

#### 5.3.2 Reference Data Management

**BR-REF-001: Comprehensive Reference Data Management**
**Business Need**: Centralized control of foundational data that supports calculations and reporting

**Requirement**: Users must be able to manage reference data across all categories with full lifecycle management:

**Geographic**: Countries, Currencies

**Organizational**: Asset Managers, Portfolios

**Financial**: Indexes, Benchmarks, Credit Rating Scales

**Operational**: Data transformation rules, Fee rate structures (management and custody), File processing configurations, Report definitions

**Business Rules**:
- All changes fully audited
- Referential integrity enforced (cannot delete if in use)
- Changes may impact calculations and must be carefully controlled
- Search and filter capabilities required for large data sets
- Soft delete only (historical reference required)

**Priority**: HIGH
**Rationale**: Reference data quality directly impacts calculation accuracy; centralized management ensures consistency and reduces errors

---

**BR-REF-002: Reference Data Validation**
**Business Need**: Prevent downstream calculation errors

**Requirement**: The solution must validate reference data integrity including required fields populated, valid relationships (e.g., portfolio linked to valid asset manager), no duplicates, and proper formatting.

**Business Rules**:
- Invalid reference data must be flagged before use in calculations
- Users must be prevented from creating invalid data
- Validation errors must be clearly explained with correction guidance
- Referential integrity checks occur in real-time

**Priority**: HIGH
**Rationale**: Invalid reference data causes cascading calculation failures; prevention better than correction

---

### 5.4 Business Rules & Calculation Requirements

**Purpose:** Define business logic and calculation requirements

---

**BR-RULE-001: Credit Rating Decision Hierarchy**
**Business Need**: Consistent, auditable credit rating assignment using trusted sources

**Requirement**: The solution must determine final credit ratings using a defined priority hierarchy:

1. For "Unrated" instrument classes: Automatically assign "Unrated"
2. For all other instruments, apply priority order:
   - Bloomberg Composite Rating (highest priority)
   - Fitch Rating
   - Moody's Rating
   - S&P Rating
   - Fund Manager Instrument Rating
   - Fund Manager Issuer Rating (lowest priority/last resort)

**Business Rules**:
- Use highest priority available rating source
- Track whether rating is system-assigned or manually overridden
- Rating changes must be explicitly detected and reported
- Manual overrides must be auditable

**Priority**: CRITICAL
**Rationale**: Consistent rating assignment is essential for regulatory compliance and risk reporting

**Note**: This specific 6-source priority order should be validated with Compliance and Investment Policy teams to confirm whether it is regulatory requirement or internal policy.

---

**BR-RULE-002: Management Fee Calculations**
**Business Need**: Accurate fee calculation for billing and regulatory reporting

**Requirement**: The solution must calculate and track management fees including fee exclusive of VAT, fee inclusive of VAT, and proper currency assignment from portfolio master data.

**Business Rules**:
- Fees calculated per reporting batch and portfolio
- Fee rates sourced from reference data
- Changes to fee rates only apply to future periods (historical fees immutable)
- All fee calculations auditable
- Currency automatically assigned from portfolio definition
- Precision requirements maintained per regulatory standards

**Priority**: CRITICAL
**Rationale**: Accurate fee calculation required for client billing and regulatory reporting; errors have direct financial impact

---

**BR-RULE-003: Portfolio Base Currency Validation**
**Business Need**: Prevent calculation errors from currency issues

**Requirement**: The solution must validate that all holdings have valid base currencies and flag holdings with invalid currencies for correction before calculations execute.

**Business Rules**:
- Holdings with invalid currencies flagged with clear error messages
- Invalid holdings excluded from calculations until corrected
- Clear identification of which currency assignments are invalid
- Users must correct currency assignments before calculations succeed

**Priority**: HIGH
**Rationale**: Currency conversion errors produce materially incorrect valuations; validation prevents cascading calculation failures

---

**BR-RULE-004: Credit Rating Change Detection**
**Business Need**: Rating migrations require immediate attention and reporting

**Requirement**: The solution must automatically detect and report instruments with rating upgrades, instruments with rating downgrades, comparison of current vs. previous ratings, and both national and international rating changes.

**Business Rules**:
- Changes detected by comparing current batch to previous batch
- Changes reported for approver review before publication
- Change history retained for trend analysis
- Both upgrades and downgrades tracked
- Changes tracked by instrument, ISIN, and country

**Priority**: HIGH
**Rationale**: Rating changes have material impact on portfolio risk profiles and may trigger investment policy reviews or client notifications

---

**BR-RULE-005: File Import Dependencies**
**Business Need**: Prevent referential integrity errors during data import

**Requirement**: The solution must enforce import order dependencies where instrument master data must be available before holdings imports, and holdings imports automatically wait for instrument data completion.

**Business Rules**:
- Dependent imports automatically wait for prerequisites
- Users notified of waiting status with clear explanation
- Imports resume automatically when prerequisites satisfied
- No manual intervention required for dependency management
- Timeout handling for stuck dependencies

**Priority**: CRITICAL
**Rationale**: Importing holdings without instrument master data causes referential integrity errors; automated dependency management prevents data corruption

---

**BR-RULE-006: Data Completeness Business Rules**
**Business Need**: Define what constitutes "complete" data for monthly reporting

**Requirement**: For monthly reporting, data is considered complete when:

**Portfolio Manager Data**: All file types received and validated (Holdings, Transactions, Income, Cash, Performance, Management Fees)

**Custodian Data**: All verification files received (Holdings all currencies, Transactions all currencies, Cash reconciliation, Custody fees)

**Bloomberg Data**: Holdings verification complete

**Reference Data**: Required data available for all holdings (Instruments, Prices, Ratings where applicable, Risk metrics where applicable)

**Business Rules**:
- Incomplete data flagged but does not prevent progression (business judgment supported)
- Business judgment supported (users can proceed with documented gaps)
- Approvers see same completeness status as operations team
- Completeness tracked over time for trend analysis
- Quantification of gaps provided (not just yes/no)

**Priority**: HIGH
**Rationale**: Defines quality standards while supporting operational flexibility for deadline-driven reporting; balances perfection with pragmatism

---

### 5.5 Process Support Requirements

**Purpose:** Enable effective business process execution and monitoring

---

#### 5.5.1 Process Monitoring & Visibility

**BR-MON-001: File Processing Visibility**
**Business Need**: Troubleshoot file processing issues efficiently

**Requirement**: The solution must log and provide visibility into file receipt timestamps, validation execution and results, processing errors and faults, and processing completion status.

**Business Rules**:
- Logs accessible to operations team
- Retained for troubleshooting period per policy
- Searchable by portfolio, file type, date, status
- Error categorization for trend analysis
- Export capability for escalation to data providers

**Priority**: HIGH
**Rationale**: Essential for diagnosing and resolving file processing issues; reduces mean-time-to-resolution

---

**BR-MON-002: Workflow Execution Tracking**
**Business Need**: Audit trail and troubleshooting for workflow progression

**Requirement**: The solution must track each workflow stage transition, user who triggered transition, timestamp, and any automated actions executed.

**Business Rules**:
- Complete history retained for each batch
- Accessible for audit and troubleshooting
- Immutable once recorded
- Includes all state changes and associated actions
- Searchable by batch, date, user

**Priority**: HIGH
**Rationale**: Supports audit requirements and operational troubleshooting; demonstrates governance effectiveness

---

**BR-MON-003: Calculation Monitoring**
**Business Need**: Validate calculation accuracy and troubleshoot failures

**Requirement**: The solution must track each calculation execution, success/failure status, execution duration, and detailed error information for failures.

**Business Rules**:
- Failed calculations must provide actionable error messages
- Error categorization for trend analysis
- Calculation history retained for troubleshooting
- Performance metrics tracked for optimization
- Drill-down from summary to detailed error messages

**Priority**: HIGH
**Rationale**: Calculation failures are critical issues requiring rapid resolution; detailed logging enables efficient troubleshooting

---

#### 5.5.2 Commentary & Historical Analysis

**BR-COMM-001: Report Commentary Capability**
**Business Need**: Portfolio managers must provide context for report interpretation

**Requirement**: Users must be able to add explanatory comments to specific reports, modify existing comments, remove obsolete comments, and link comments to specific report types with full audit trail.

**Business Rules**:
- Comments tied to specific reporting batch
- Comments linked to specific report types
- User and timestamp captured automatically
- Comments visible to approvers
- Historical comments retained for reference

**Priority**: MEDIUM
**Rationale**: Context and explanation are essential for report consumers to properly interpret results; supports effective communication

---

**BR-COMM-002: History Comparison Views**
**Business Need**: Trend analysis and change detection across reporting periods

**Requirement**: Users must be able to compare data across reporting periods including credit rating changes over time, price history for indexes, and holdings changes period-over-period.

**Business Rules**:
- Historical data accessible in read-only mode
- Comparison calculations automated (no manual effort)
- Configurable comparison periods (month-over-month, year-over-year)
- Export capability for external analysis

**Priority**: MEDIUM
**Rationale**: Facilitates trend analysis and identifies unusual changes requiring investigation; supports data quality reviews

---

### 5.6 User Role & Integration Requirements

**Purpose:** Support user needs and system integration

---

#### 5.6.1 Role-Based Requirements

**BR-ROLE-001: Operations Lead Requirements**
**Business Need**: Enable efficient coordination of the end-to-end reporting process

**Requirement**: Operations Leads must be able to initiate reporting cycles, monitor data acquisition and validation status, coordinate issue resolution across teams, and transition approved data to publication. The solution must provide comprehensive visibility into process status and clear identification of items requiring attention.

**Key Business Outcomes**:
- Rapid identification of data gaps and quality issues
- Efficient coordination with data quality specialists
- Clear understanding of workflow status and readiness for approval
- Smooth handoff to approval process with complete documentation

**Priority**: HIGH
**Rationale**: Operations Lead orchestrates the entire process and is accountable for data readiness

---

**BR-ROLE-002: Analyst Requirements**
**Business Need**: Enable efficient data quality investigation and correction

**Requirement**: Analysts must be able to investigate data validation issues, correct master data across all categories (instruments, prices, ratings, risk metrics), document explanations for approvers, and verify that corrections resolve identified issues. The solution must provide immediate feedback on correction effectiveness.

**Key Business Outcomes**:
- Clear identification of data requiring correction
- Efficient data correction workflows
- Ability to provide context and commentary for approvers
- Confirmation that corrections resolved validation issues

**Priority**: HIGH
**Rationale**: Analysts are primary data quality specialists responsible for ensuring data accuracy

---

**BR-ROLE-003: Approver Requirements (All Levels)**
**Business Need**: Enable efficient review with complete information for informed decisions

**Requirement**: Approvers must be able to receive notifications when batches are ready, review data validation summary, review report comments and context, review previous approval history (if resubmission), make approve/reject decisions, and document rejection reasons (mandatory at all levels).

**Key Business Outcomes**:
- All information needed for decision in one place
- Clear summary without overwhelming detail
- Simple approve/reject actions
- Documented rejection reasoning for continuous improvement

**Priority**: HIGH
**Rationale**: Streamlined approval process reduces bottlenecks while maintaining governance rigor

---

**BR-ROLE-004: Administrator Requirements**
**Business Need**: Enable efficient system administration and support

**Requirement**: Administrators must be able to manage user accounts (create, modify, deactivate), assign roles and permissions, configure approval authorities, support audit inquiries with log access, and manage reference data configurations.

**Key Business Outcomes**:
- Efficient user and role management
- Clear visibility into current configurations
- Audit trail access for compliance support
- System configuration without code deployment

**Priority**: MEDIUM
**Rationale**: Administrators maintain system security and support users; efficiency reduces operational burden

---

#### 5.6.2 Integration & Publication

**BR-INT-001: External Reporting System Integration**
**Business Need**: Deliver validated data to reporting platform

**Requirement**: Upon final approval, the solution must export validated data to external reporting systems (Power BI) including all validated master data and calculated results.

**Business Rules**:
- Export only occurs after Level 3 approval
- Export history retained for audit
- Failed exports must be logged and flagged
- Export must be complete (no partial data)
- Retry capability for failed exports

**Priority**: CRITICAL
**Rationale**: External reporting system relies on validated data from InvestInsight; integration failure blocks report publication

---

**BR-INT-002: Excel Export Capability**
**Business Need**: Support ad-hoc analysis and external communication

**Requirement**: Users must be able to export to Excel including lists of incomplete instruments (for sending to data providers), holdings data (for external analysis), master data extracts (for sharing with stakeholders), and validation results (for documentation).

**Business Rules**:
- Export must respect user access permissions
- Export must be auditable (who exported what, when)
- Export format must be usable (not raw data dump)
- Large exports must not degrade system performance

**Priority**: MEDIUM
**Rationale**: Excel remains primary tool for ad-hoc analysis and external communication; export capability essential for flexibility

---

---

## 6. Success Criteria

### 6.1 Business Success Metrics

| Metric | Current State | Target | Measurement Method |
|--------|--------------|--------|-------------------|
| **Time-to-Report** | Manual coordination across multiple systems; ~15 business days | 10 business days (30% reduction) | Compare cycle time before/after implementation |
| **Data Quality Incidents** | ~10 per quarter requiring report restatements | <1 per quarter (90% reduction) | Track incidents reported by report consumers |
| **Audit Trail Completeness** | Partial audit trails; gap in master data changes | 100% of data changes logged | Regular audit trail reviews |
| **Approval Compliance** | Informal approval process; email-based sign-off | 100% of reports approved through all three levels | Workflow logs analysis |
| **Manual File Upload** | ~80% manual file collection and upload | <20% manual; 80% automated | File import method tracking |
| **User Adoption** | N/A (new system) | 95% of target users actively using system | User activity logs |
| **Process Efficiency** | ~200 hours per month (operations team) | ~120 hours per month (40% reduction) | Time tracking comparison |
| **Error Resolution Time** | ~4 hours average to resolve data issues | ~2 hours average (50% reduction) | Track time from error detection to resolution |

### 6.2 Acceptance Criteria

The system will be considered successfully delivered when:

#### Functional Acceptance
1. All CRITICAL priority requirements are fully implemented and tested
2. At least 90% of HIGH priority requirements are implemented and tested
3. Complete end-to-end workflow operational from batch creation through final approval
4. Three-level approval process functional with proper rejection workflows
5. Workflow state controls properly lock/unlock data entry capabilities
6. Complete audit trails captured for all master data changes
7. All master data management capabilities operational (instruments, prices, ratings, risk metrics)
8. Data validation comprehensively identifies completeness issues
9. File import provides clear status visibility across all portfolios
10. Rejection workflow successfully clears calculations and returns to Data Preparation

#### Integration Acceptance
11. Automated file imports operational from all configured sources
12. Integration with external reporting system (Power BI) functional
13. Excel export functionality works for documented data sets

#### Data Quality Acceptance
14. File validation accurately identifies and reports errors
15. Outstanding items tracking correctly identifies missing data
16. Calculation checkpoint prevents progression when calculations fail

#### Security & Audit Acceptance
17. Role-based access control enforces appropriate permissions
18. All security requirements pass independent security assessment
19. Audit trails capture user, timestamp, and before/after values for all changes
20. Process logs accurately track workflow progression

#### User Acceptance
21. User acceptance testing completed with 95% satisfaction rating across all user roles
22. All role-based journeys (Operations Lead, Analyst, Approver, Administrator) validated
23. Training materials delivered and key users trained
24. System performance meets defined targets

#### Deployment Acceptance
25. Production cutover completed with zero data loss
26. Historical batch data accessible in read-only mode
27. All reference data loaded and validated

---

## 7. Assumptions and Constraints

### 7.1 Assumptions

1. **Data Source Availability**: Asset managers and data vendors will provide files in agreed-upon formats and schedules
2. **Network Connectivity**: Reliable network connectivity is available for automated file transfers
3. **User Availability**: Key users are available for requirements validation, testing, and training
4. **External Systems**: Power BI or equivalent external reporting system is available and properly configured
5. **Infrastructure**: Adequate server infrastructure and database capacity will be provisioned
6. **Approval Authority**: Business has defined and communicated approval authority hierarchy
7. **Reference Data**: Initial reference data (countries, currencies, portfolios, etc.) is available for system setup
8. **Change Management**: Business users are prepared for process changes and new system adoption
9. **Credit Rating Hierarchy**: The specified 6-source priority order (Bloomberg → Fitch → Moody's → S&P → Fund Manager Instrument → Fund Manager Issuer) reflects regulatory requirements or established investment policy. This should be validated with Compliance team during requirements review.

### 7.2 Constraints

1. **Budget**: Implementation must stay within approved capital expenditure budget
2. **Timeline**: System must be operational before next fiscal year-end reporting cycle
3. **Resources**: Limited to assigned development, testing, and operational support resources
4. **Regulatory**: Must comply with financial services data protection and audit regulations
5. **Integration Standards**: Must adhere to enterprise integration architecture and security standards
6. **Data Retention**: Must comply with enterprise data retention policies (minimum 7 years for financial data)
7. **Technology Decisions**: Technology platform and architecture decisions are outside scope of this BRD

### 7.3 Dependencies

1. **SFTP Access**: Requires secure access credentials from all data providers
2. **Power BI Configuration**: Depends on Power BI environment setup and connectivity
3. **Database Provisioning**: Requires database infrastructure provisioned by IT
4. **User Directory**: Depends on enterprise user directory for authentication
5. **Network Configuration**: Requires firewall rules and network access configured by IT
6. **File Format Specifications**: Depends on receiving standardized file format documentation from data providers
7. **Business Process Definition**: Requires final approval workflow and business rules documented by business stakeholders

### 7.4 Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|-----------|---------------------|
| **Data Provider Delays** | HIGH | MEDIUM | Establish backup manual upload processes; include SLA penalties in provider contracts; maintain existing processes in parallel during transition |
| **Calculation Engine Errors** | CRITICAL | LOW | Implement comprehensive calculation validation; maintain parallel manual validation process initially; extensive testing with historical data |
| **User Adoption Resistance** | HIGH | MEDIUM | Extensive training program; phased rollout with pilot group; continuous user feedback incorporation; demonstrate time savings |
| **Data Migration Errors** | HIGH | MEDIUM | Comprehensive data migration testing; parallel run period; data reconciliation procedures; rollback plan |
| **Performance Issues at Scale** | MEDIUM | LOW | Performance testing with production-scale data; infrastructure scalability planning; phased portfolio onboarding |
| **Audit Trail Storage Growth** | MEDIUM | HIGH | Implement data archival strategy; monitor storage utilization; establish retention policies |
| **Integration Failures** | HIGH | MEDIUM | Robust error handling; integration monitoring; fallback procedures; manual export capability |
| **Approval Bottlenecks** | MEDIUM | MEDIUM | Delegate approval authority; escalation procedures; approval SLA monitoring; backup approvers identified |

---

## 8. Glossary

| Term | Definition |
|------|------------|
| **Asset Manager** | External investment management firm managing portfolio assets on behalf of the organization |
| **Audit Trail** | Complete record of all system activities and data changes including who, what, when, and why for compliance and accountability |
| **Batch** | Collection of portfolio reports for a specific reporting period grouped together for processing in a single workflow cycle |
| **Benchmark** | Standard market index used for performance comparison (e.g., S&P 500, MSCI World) |
| **Beta** | Statistical measure of an instrument's volatility relative to the overall market; used for portfolio risk analysis |
| **Bloomberg** | Financial data vendor providing instrument static data, market prices, credit ratings, and holdings data |
| **Credit Rating** | Assessment of creditworthiness issued by rating agencies (e.g., AAA, BBB+); critical for fixed income risk assessment |
| **CRUD** | Create, Read, Update, Delete - standard data management operations |
| **Custodian** | Financial institution holding portfolio assets for safekeeping and providing independent verification of holdings |
| **Duration** | Measure of interest rate sensitivity for fixed income instruments; represents approximate percentage change in price for 1% interest rate change |
| **Holdings** | List of financial instruments and positions (quantities) within a portfolio at a specific point in time |
| **Instrument** | Financial security or asset including stocks, bonds, funds, derivatives, etc. |
| **ISIN** | International Securities Identification Number; unique 12-character identifier for financial instruments |
| **Level 1/2/3 Approval** | Three-tier approval hierarchy for report sign-off with distinct purposes: Operations (L1), Portfolio Manager (L2), Executive (L3) |
| **Master Data** | Core business data that provides context for transactions; includes instruments, portfolios, asset managers, currencies, etc. |
| **Monthly Process** | Regular monthly workflow for preparing, validating, and approving portfolio reports from data preparation through final publication |
| **Portfolio** | Collection of investments (instruments) managed as a unit for a specific purpose or client |
| **Power BI** | External business intelligence and reporting platform used for publishing final reports to end users |
| **Reference Data** | Foundational data used across multiple processes including countries, currencies, indexes, rating scales, etc. |
| **SFTP** | Secure File Transfer Protocol - secure method for automated file transfers between systems |
| **Soft Delete** | Deactivation of a record rather than physical deletion; maintains data for historical reference and audit purposes |
| **Transactions** | Record of buy/sell/trade activities within a portfolio including purchases, sales, maturities, corporate actions, etc. |
| **Workflow State** | Current stage in the monthly process workflow (e.g., Data Preparation, Level 1 Approval, Complete) |
| **YTM (Yield-to-Maturity)** | Expected total return on a bond if held to maturity; accounts for coupon payments and principal repayment |

---

## Document Control

### Change History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-02-04 | System Analysis | Initial document creation with high-level requirements |
| 2.0 | 2026-02-04 | System Analysis | Comprehensive update incorporating detailed requirements from InvestInsight Product Guide |
| 2.1 | 2026-02-04 | System Analysis | Added Business Rules & Calculations section |
| 3.0 | 2026-02-04 | System Analysis | Major restructure to focus strictly on business requirements; removed all functional/technical specifications including specific screen layouts, UI patterns, API endpoints, and data structures; reorganized by business capability rather than screen; emphasized business needs, rules, and outcomes; reorganized by business objective for improved stakeholder comprehension; simplified prescriptive workflow stages, operation lists, and data field specifications; focused on business outcomes and governance requirements |

### Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Owner | | | |
| Investment Operations Lead | | | |
| Compliance Officer | | | |
| IT Architecture | | | |

---

**End of Document**
