# Feature: InvestInsight Portfolio Reporting & Data Stewardship Platform

## Summary

Enterprise portfolio reporting platform with multi-level approval workflows, state-based access control, comprehensive master data management, and complete audit trails. The platform establishes controlled data preparation workflows between raw data sources and external reporting systems, ensuring all published reports are accurate, validated, and properly authorized.

**Tech Stack:** Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Shadcn UI

**Backend API:** Defined in `documentation/openapi.yaml`. Connects to live REST API at `http://localhost:5000/api/v1` (development) backed by SQL Server database with temporal tables for audit history.

## Epics

### 1. **Epic 1: Authentication, Authorization & User Management**
Foundation for all user access, roles, and permissions. Establishes who can do what in the system.

**Status:** Pending | **Directory:** `epic-1-authentication-authorization-user-management/`

**Key Capabilities:**
- External authentication (AD/LDAP integration per Section 7.3)
- User lifecycle management (create, update, deactivate)
- Role-based access control (7 defined roles per BR-SEC-002)
- Approval authority configuration (per BR-SEC-003)
- User activity logging (per BR-AUD-004)

**Screens:** Dashboard (role-specific), User Administration (14), Role & Permission Management (15)

**Dependencies:** None - foundational

---

### 2. **Epic 2: Batch Management & Workflow State Control**
Enables creation and tracking of reporting batches with state-based workflow progression.

**Status:** Pending | **Directory:** `epic-2-batch-management-workflow-state-control/`

**Key Capabilities:**
- Batch creation and management (per BR-GOV-006)
- Workflow state machine (Data Preparation → L1 Approval → L2 Approval → L3 Approval → Published)
- State-based access control (lock/unlock data entry per BR-GOV-005)
- Workflow history and audit trails (per BR-AUD-003)
- Dashboard alerts and pending actions

**Screens:** Batch Management (2), Workflow State Viewer (6), Dashboard updates

**Dependencies:** Epic 1 (requires users and roles)

---

### 3. **Epic 3: Master Data Management & Reference Data**
Core data stewardship capabilities for instruments, reference data, and supporting entities.

**Status:** Pending | **Directory:** `epic-3-master-data-management-reference-data/`

**Key Capabilities:**
- Instrument master data (per BR-MASTER-001)
- Reference data management (currencies, countries, portfolios, asset managers per BR-REF-001)
- Complete audit trails with temporal versioning (per BR-AUD-001)
- State-aware CRUD operations (locked during approval)
- Search, filter, and export capabilities

**Screens:** Instrument Master Management (7), Reference Data Management (13), Audit Trail Viewer (16)

**Dependencies:** Epic 2 (requires batch context and state control)

---

### 4. **Epic 4: File Processing & Data Acquisition**
Automated and manual file intake from multiple sources with validation and error handling.

**Status:** Pending | **Directory:** `epic-4-file-processing-data-acquisition/`

**Key Capabilities:**
- Multi-source file integration (asset managers, Bloomberg, custodian per BR-DATA-001)
- Automated file import with scheduling (per BR-DATA-002)
- File status visibility and tracking (per BR-DATA-004)
- File error management and retry (per BR-DATA-003)
- Import dependency management (per BR-RULE-005)
- File processing logs and monitoring (per BR-MON-001)

**Screens:** File Status Monitor (3), File Processing Monitor (17)

**Dependencies:** Epic 3 (requires instrument master for referential integrity)

---

### 5. **Epic 5: Portfolio Analytics & Risk Metrics**
Financial data management for performance reporting and risk analysis.

**Status:** Pending | **Directory:** `epic-5-portfolio-analytics-risk-metrics/`

**Key Capabilities:**
- Index price management (per BR-MASTER-002)
- Risk metrics (duration, yield-to-maturity per BR-MASTER-003)
- Volatility metrics (beta per BR-MASTER-004)
- Credit rating management with change detection (per BR-MASTER-005, BR-RULE-004)
- Custom holdings management (per BR-MASTER-006)
- Data validation and completeness checks (per BR-VALID-001)
- Outstanding items tracking (per BR-VALID-004)
- Calculation monitoring (per BR-MON-003)

**Screens:** Index Prices (8), Risk Metrics (9), Volatility (10), Credit Ratings (11), Custom Holdings (12), Data Validation Summary (4), Calculation Status Monitor (18)

**Dependencies:** Epic 4 (requires holdings data from file imports)

---

### 6. **Epic 6: Multi-Level Approval Workflow & Publication**
Three-level approval process with rejection workflow and data publication.

**Status:** Pending | **Directory:** `epic-6-multi-level-approval-workflow-publication/`

**Key Capabilities:**
- Three-level sequential approval (Operations, Portfolio Manager, Executive per BR-GOV-001)
- Approval information transparency (per BR-GOV-002)
- Rejection workflow with mandatory reasons at ALL levels (per BR-GOV-003)
- Calculation checkpoint validation (per BR-GOV-007)
- Automatic calculation clearing on rejection
- State transitions (approval → locks data, rejection → unlocks data)
- Integration with external reporting system (Power BI per BR-INT-001)
- Excel export capabilities (per BR-INT-002)
- Report commentary (per BR-COMM-001)

**Screens:** Approval Review (5), Calculation Status Monitor (18), Dashboard updates

**Dependencies:** Epic 5 (requires complete data validation before approvals)

---

## Epic Ordering Rationale

This sequence follows **dependency-driven incremental delivery**:

1. **Epic 1 (Auth/Users)**: Foundation - no user access = no system
2. **Epic 2 (Batch/Workflow)**: Establishes workflow container and state machine
3. **Epic 3 (Master Data)**: Core reference data needed for file processing
4. **Epic 4 (File Processing)**: Brings in portfolio holdings and transaction data
5. **Epic 5 (Analytics/Metrics)**: Enriches holdings with risk/performance data
6. **Epic 6 (Approvals)**: Governance controls over validated, complete data

Each epic delivers independently testable value while building toward the complete monthly reporting workflow.
