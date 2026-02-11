# Story: Dashboard Pending Actions

**Epic:** Batch Management & Workflow State Control | **Story:** 7 of 8 | **Wireframe:** Screen 1 (Dashboard - Updated with batch workflow context)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` (home page/dashboard) |
| **Target File** | `app/page.tsx` (modify existing) |
| **Page Action** | `modify_existing` |

## User Story
**As a** user with workflow responsibilities **I want** to see role-specific pending actions and batch alerts on my dashboard **So that** I can immediately identify what needs my attention and navigate to the relevant tasks

## Acceptance Criteria

### Happy Path - Analyst Pending Actions
- [ ] Given I am an Analyst and January 2026 batch has 5 missing instrument durations, when I view the dashboard, then I see pending action "[ ! ] 5 Instruments Missing Duration Values [Fix >]" with priority indicator
- [ ] Given I am an Analyst and a batch is ready for confirmation, when I view the dashboard, then I see pending action "[ ! ] Batch Jan 2026 - Ready for Data Confirmation [Confirm >]"
- [ ] Given I click "[Fix >]" on a pending action, when the link is clicked, then I navigate to the Risk Metrics management page filtered to show missing duration values

### Happy Path - Approver Pending Actions
- [ ] Given I am a Level 1 Approver and January 2026 batch is in "Level1Pending" status, when I view the dashboard, then I see pending action "[ ! ] Batch Jan 2026 - Awaiting Level 1 Approval [Review >]" with high priority (red indicator)
- [ ] Given I am a Level 2 Approver (Portfolio Manager) and January 2026 batch is in "Level2Pending", when I view the dashboard, then I see pending action "[ ! ] Batch Jan 2026 - Awaiting Level 2 Approval [Review >]"
- [ ] Given I am a Level 3 Approver and no batches are awaiting Level 3 approval, when I view the dashboard, then I do NOT see any approval pending actions
- [ ] Given I click "[Review >]" on an approval pending action, when the link is clicked, then I navigate to the Approval Review page for that batch

### Happy Path - Analyst Pending Actions
- [ ] Given I am an Analyst and there are 12 outstanding credit ratings to update, when I view the dashboard, then I see pending action "[i] 12 Credit Ratings Need Review [Update >]"
- [ ] Given I am an Analyst and a batch was rejected with data quality issues, when I view the dashboard, then I see pending action "[ ! ] Batch Dec 2025 - Rejected (Data Quality Issues) [Fix >]" with rejection reason summary

### Active Batches Widget
- [ ] Given I have access to 3 active batches, when I view the dashboard, then I see "Active Batches" widget showing January 2026 (Status: Level 1 Approved), December 2025 (Status: Data Preparation), and November 2025 (Closed) with "[View Details]" links
- [ ] Given I click "[View Details]" on a batch, when the link is clicked, then I navigate to the Batch Management page with that batch pre-selected

### Workflow Status Widget
- [ ] Given I view the dashboard, when the page loads, then I see "Workflow Status" widget showing visual progress bars for up to 3 most recent active batches
- [ ] Given January 2026 batch is in Level 2 Approval, when I view the workflow status widget, then I see "Jan 2026: ✓ ───> ● ─ ─ ─ ─" with completed (✓) and current (●) indicators
- [ ] Given December 2025 batch is in Data Preparation, when I view the workflow status widget, then I see "Dec 2025: ●" showing only Data Prep stage active

### Data Quality Alerts Widget
- [ ] Given the active batch has 3 validation warnings, when I view the dashboard, then I see "Data Quality Alerts" widget showing "[ ⚠ ] 3 validation warnings [View All Alerts]"
- [ ] Given the active batch has 12 outstanding items (missing data), when I view the dashboard, then I see "[ ⚠ ] 12 outstanding items" in the alerts widget
- [ ] Given I click "[View All Alerts]", when the link is clicked, then I navigate to the Data Validation Summary page

### Recent Activity Widget
- [ ] Given workflow events occurred recently, when I view the dashboard, then I see "Recent Activity" widget showing "3 min ago: User A updated 5 credit ratings", "15 min ago: Bloomberg file imported successfully", "1 hour ago: Batch January 2026 created by John Smith"
- [ ] Given I click "[View Full Log]" in Recent Activity, when the link is clicked, then I navigate to the Audit Trail Viewer

### Priority Indicators
- [ ] Given a pending action requires immediate attention (batch awaiting approval), when I view the pending actions panel, then I see a red "[ ! ]" priority indicator
- [ ] Given a pending action is informational (files pending import), when I view the pending actions panel, then I see a blue "[i]" info indicator
- [ ] Given a pending action is a warning (validation warnings), when I view the pending actions panel, then I see a yellow "[ ⚠ ]" warning indicator

### Role-Based Filtering
- [ ] Given I am a user whose role has no batch or approval permissions, when I view the dashboard, then I see "Active Batches" and "Workflow Status" widgets but NO "Pending Actions" panel (no actions available)
- [ ] Given I am an Administrator, when I view the dashboard, then I see pending actions related to user management and system configuration (not workflow approvals)

### Real-Time Updates
- [ ] Given I am viewing the dashboard, when a batch workflow state changes (e.g., approved at L1), then the pending actions panel updates within 30 seconds to reflect the new state
- [ ] Given a new pending action appears, when the dashboard updates, then I see a brief notification "New pending action: Batch Jan 2026 ready for approval"

### Empty States
- [ ] Given I have no pending actions, when I view the dashboard, then I see "Pending Actions (0)" panel with message "No pending actions. Great job!"
- [ ] Given there are no active batches, when I view the dashboard, then I see "Active Batches" widget with message "No active batches. Create a new batch to get started." and "[Create Batch]" button (Analyst only)

### Count Badges
- [ ] Given I have 3 pending actions, when I view the dashboard, then I see "PENDING ACTIONS (3)" header with count badge
- [ ] Given pending actions count changes from 3 to 4, when the dashboard updates, then the count badge updates to "(4)"

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/report-batches?status=Level1Pending,Level2Pending,Level3Pending` | Get batches awaiting approval for pending actions |
| GET | `/v1/report-batches` | Get active batches for Active Batches widget |
| GET | `/v1/report-batches/{id}/status` | Get batch status for workflow widget |
| GET | `/v1/report-batches/{id}/validation` | Get validation summary for data quality alerts |
| GET | `/v1/audit/changes?limit=5` | Get recent activity for Recent Activity widget |

## Implementation Notes

- **Route**: `/` (home page) - modifies existing dashboard from Epic 1 Story 2
- **Component Structure**:
  - `app/page.tsx` - Main dashboard page (server component)
  - `components/dashboard/PendingActionsPanel.tsx` - Client component for pending actions
  - `components/dashboard/ActiveBatchesWidget.tsx` - Shows active batches
  - `components/dashboard/WorkflowStatusWidget.tsx` - Mini workflow progress bars
  - `components/dashboard/DataQualityAlertsWidget.tsx` - Validation warnings and outstanding items
  - `components/dashboard/RecentActivityWidget.tsx` - Recent audit trail events
- **Pending Actions Logic**: Backend aggregates pending actions based on user role and batch states
- **Role-Based Rendering**: Use role context from Epic 1 to show/hide widgets and actions
- **Real-Time Updates**: Poll batch status and validation endpoints every 30 seconds
- **Navigation**: Each pending action has a direct link to the relevant page with appropriate filters
- **Wireframe Reference**: Screen 1 - Dashboard (updated with batch workflow context)
- **BRD Requirements**:
  - BR-GOV-004 (Monthly Reporting Workflow - visibility and process monitoring)
  - BR-SEC-002 (Role-Based Access Control - role-specific dashboards)
- **Shadcn Components**: Card (widgets), Badge (count badges, priority indicators), Alert (pending actions), Button (action links)
- **Performance**: Server-side data fetching for initial load; client-side polling for updates
- **API Client**: Add to `lib/api/batches.ts`: `getPendingActions(userId, userRoles)`
- **Testing Focus**: User sees correct pending actions based on role, widgets show accurate data, links navigate to correct pages

## Dependencies
- Story 1 (Batch Creation & Listing) - requires batches to display
- Story 3 (Workflow State Visualization) - uses workflow state data
- Story 4 (Data Confirmation) - generates "ready for confirmation" pending actions
- Epic 1 Story 2 (Role-Based Dashboard) - modifies existing dashboard
- Epic 1 Story 4 (Role Assignment) - uses role-based filtering

## Story Points
**8** - Involves modifying existing dashboard, creating multiple widgets, role-based action aggregation, real-time polling, and navigation integration
