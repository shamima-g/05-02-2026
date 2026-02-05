# Story: Role-Based Dashboard Landing

**Epic:** Authentication, Authorization & User Management | **Story:** 2 of 8 | **Wireframe:** Screen 1 (Dashboard)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Target File** | `app/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As a** authenticated user **I want** to land on a role-specific dashboard after login **So that** I immediately see pending actions and information relevant to my responsibilities

## Acceptance Criteria

### Happy Path - Dashboard Display
- [ ] Given I am authenticated, when I navigate to `/`, then I see the dashboard with the welcome message "Welcome, [My Display Name] - [My Roles]"
- [ ] Given I am on the home page (Dashboard), when the page loads, then I see today's date displayed in the header
- [ ] Given I am on the home page (Dashboard), when the page loads, then I see a "Pending Actions" panel showing items requiring my attention
- [ ] Given I am on the home page (Dashboard), when the page loads, then I see an "Active Batches" panel showing batches I have access to
- [ ] Given I am on the home page (Dashboard), when the page loads, then I see a "Recent Activity" panel showing system activity relevant to my role

### Role-Specific Content - Operations Lead
- [ ] Given I have the Operations Lead role, when I view the home page (Dashboard), then my Pending Actions include file status alerts, validation summaries, and workflow progression tasks
- [ ] Given I have the Operations Lead role, when I view the home page (Dashboard), then I see "Data Quality Alerts" panel with validation warning counts
- [ ] Given I have the Operations Lead role, when I view the home page (Dashboard), then I can see all active batches in Data Preparation or Approval states

### Role-Specific Content - Analyst
- [ ] Given I have the Analyst role, when I view the home page (Dashboard), then my Pending Actions focus on outstanding master data items requiring maintenance
- [ ] Given I have the Analyst role, when I view the home page (Dashboard), then I see specific counts of missing data (e.g., "5 Instruments Missing Duration Values")

### Role-Specific Content - Approver (Any Level)
- [ ] Given I have an Approver role (L1, L2, or L3), when I view the home page (Dashboard), then my Pending Actions show only batches awaiting my approval level
- [ ] Given I have the Approver Level 2 role, when I view the home page (Dashboard) and a batch is in Level 1 Approval, then that batch does NOT appear in my Pending Actions
- [ ] Given I have the Approver Level 2 role, when I view the home page (Dashboard) and a batch is in Level 2 Approval, then that batch appears in my Pending Actions with "[Review >]" link

### Role-Specific Content - Administrator
- [ ] Given I have the Administrator role, when I view the home page (Dashboard), then my Pending Actions include user management alerts and system configuration notifications

### Navigation from Dashboard
- [ ] Given I am on the home page (Dashboard), when I click a "[Review >]" link in Pending Actions, then I am navigated to the Approval Review screen for that batch
- [ ] Given I am on the home page (Dashboard), when I click a "[Fix >]" link in Pending Actions, then I am navigated to the appropriate master data screen
- [ ] Given I am on the home page (Dashboard), when I click "[View Details]" on a batch, then I am navigated to the Batch Management screen for that batch
- [ ] Given I am on the home page (Dashboard), when I click "[View Full Log]", then I am navigated to the Audit Trail Viewer

### Workflow Status Visualization
- [ ] Given I am on the home page (Dashboard), when I view the Workflow Status panel, then I see a visual representation showing stages: Data Prep → L1 → L2 → L3 → ✓
- [ ] Given a batch is in Level 2 Approval, when I view the Workflow Status panel, then I see: ✓ ───> ✓ ───> ● ─ ─ ─ ─ (with ● indicating current position)
- [ ] Given a batch is Published, when I view the Workflow Status panel, then I see: ✓ ───> ✓ ───> ✓ ───> ✓ ───> ✓

### Real-Time Updates
- [ ] Given I am on the home page (Dashboard), when another user completes an action that affects my pending items, then my Pending Actions count updates without page refresh
- [ ] Given I am on the home page (Dashboard), when a new activity occurs, then the Recent Activity panel updates showing the latest action at the top

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/dashboard/pending-actions` | Get role-specific pending actions for current user |
| GET | `/v1/batches?status=active` | Get active batches user has access to |
| GET | `/v1/dashboard/activity` | Get recent system activity filtered by user role |
| GET | `/v1/dashboard/data-quality-summary` | Get validation warning counts and outstanding items |

## Implementation Notes

- **Role-Based Filtering**: Backend API filters pending actions and batches based on user's roles
- **Real-Time Updates**: Consider Server-Sent Events (SSE) or polling every 30 seconds for activity feed
- **Template Replacement**: This story replaces the template placeholder content in `app/page.tsx`
- **Wireframe Reference**: Screen 1 - Dashboard (Role-Based Home)
- **BRD Requirements**: BR-SEC-002 (Role-Based Access Control)

## Dependencies
- **Story 1**: User Authentication (requires authenticated session with roles)

## Story Points
**5** - Complex role-based content filtering, multiple API integrations, real-time updates, workflow visualization
