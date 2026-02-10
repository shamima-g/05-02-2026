/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 6
 * - Route: /admin/audit-trail
 * - Target File: app/admin/audit-trail/page.tsx
 * - Page Action: create_new
 *
 * Tests for User Activity Logging & Audit Trail - Audit Trail Viewer Page
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import AuditTrailPage from '@/app/admin/audit-trail/page';
import * as authApi from '@/lib/api/auth';
import * as auditApi from '@/lib/api/audit';
import type { AuthUser } from '@/lib/api/auth';
import type { AuditTrailEntry, AuditTrailList } from '@/lib/api/audit';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth API functions
vi.mock('@/lib/api/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock audit API functions
vi.mock('@/lib/api/audit', () => ({
  queryAuditTrail: vi.fn(),
  exportAuditTrail: vi.fn(),
  getUserActivity: vi.fn(),
  getUserHistory: vi.fn(),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
};

// Mock data factories
const createMockAdminUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'admin-1',
  username: 'admin',
  displayName: 'Admin User',
  email: 'admin@investinsight.com',
  roles: ['Administrator'],
  permissions: ['manage_users', 'view_users', 'audit.view', 'audit.export'],
  ...overrides,
});

const createMockAnalystUser = (
  overrides: Partial<AuthUser> = {},
): AuthUser => ({
  id: 'analyst-1',
  username: 'analyst',
  displayName: 'Analyst User',
  email: 'analyst@investinsight.com',
  roles: ['Analyst'],
  permissions: ['audit.view'],
  ...overrides,
});

const createMockNonAuditUser = (
  overrides: Partial<AuthUser> = {},
): AuthUser => ({
  id: 'user-1',
  username: 'user',
  displayName: 'Regular User',
  email: 'user@investinsight.com',
  roles: ['Analyst'],
  permissions: ['view_portfolios'],
  ...overrides,
});

const createMockAuditTrailEntry = (
  overrides: Partial<AuditTrailEntry> = {},
): AuditTrailEntry => ({
  entityType: 'User',
  entityId: 1,
  changeType: 'Updated',
  changedBy: 'admin',
  changedAt: '2026-02-09T10:30:00Z',
  changes: [
    {
      field: 'email',
      oldValue: 'old@company.com',
      newValue: 'new@company.com',
    },
  ],
  ...overrides,
});

const createMockAuditTrailList = (
  entries: AuditTrailEntry[] = [],
): AuditTrailList => ({
  items:
    entries.length > 0
      ? entries
      : [
          createMockAuditTrailEntry(),
          createMockAuditTrailEntry({
            entityType: 'Role',
            entityId: 2,
            changeType: 'Created',
            changedBy: 'admin',
            changedAt: '2026-02-09T09:15:00Z',
            changes: [
              {
                field: 'name',
                oldValue: null,
                newValue: 'PortfolioManager',
              },
            ],
          }),
          createMockAuditTrailEntry({
            entityType: 'Instrument',
            entityId: 42,
            changeType: 'Updated',
            changedBy: 'jsmith',
            changedAt: '2026-02-08T14:20:00Z',
            changes: [
              {
                field: 'price',
                oldValue: '100.00',
                newValue: '102.50',
              },
            ],
          }),
        ],
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: entries.length > 0 ? entries.length : 3,
    totalPages: 1,
  },
});

describe('Audit Trail Viewer Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Authorization Check', () => {
    it('shows access denied message when user does not have audit.view permission', async () => {
      const mockUser = createMockNonAuditUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
        expect(
          screen.getByText(/audit view permission required/i),
        ).toBeInTheDocument();
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });

    it('allows Administrator to view audit trail', async () => {
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByText(/audit trail viewer/i)).toBeInTheDocument();
      });
    });

    it('allows Analyst with audit.view permission to view audit trail', async () => {
      const mockUser = createMockAnalystUser();
      const mockAuditTrail = createMockAuditTrailList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByText(/audit trail viewer/i)).toBeInTheDocument();
      });
    });
  });

  describe('Happy Path - View Audit Trail', () => {
    it('displays list of audit records sorted by timestamp most recent first', async () => {
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getAllByText('admin').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('jsmith')).toBeInTheDocument();
      });
    });

    it('displays audit record with columns: Timestamp, User, Action, Entity Type, Entity ID, Details', async () => {
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('columnheader', { name: /timestamp/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /user/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /action/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /entity type/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /entity id/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /details/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Filter by Date Range', () => {
    it('filters audit records by date range when dates are selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allRecords = createMockAuditTrailList();
      const filteredRecords = createMockAuditTrailList([
        createMockAuditTrailEntry({
          changedAt: '2026-01-03T10:00:00Z',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allRecords)
        .mockResolvedValueOnce(filteredRecords);

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const fromDateInput = screen.getByLabelText(/from date/i);
      const toDateInput = screen.getByLabelText(/to date/i);

      await user.type(fromDateInput, '2026-01-01');
      await user.type(toDateInput, '2026-01-05');

      const applyButton = screen.getByRole('button', {
        name: /apply filters/i,
      });
      await user.click(applyButton);

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            from: expect.stringContaining('2026-01-01'),
            to: expect.stringContaining('2026-01-05'),
          }),
        );
      });
    });

    it('filters by preset Last 7 days', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allRecords = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        allRecords,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const presetDropdown = screen.getByRole('combobox', {
        name: /date range preset/i,
      });
      await user.click(presetDropdown);
      await user.click(screen.getByRole('option', { name: /last 7 days/i }));

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            from: expect.any(String),
            to: expect.any(String),
          }),
        );
      });
    });

    it('clears date range filter when clear is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', {
        name: /clear filters/i,
      });
      await user.click(clearButton);

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.not.objectContaining({
            from: expect.any(String),
            to: expect.any(String),
          }),
        );
      });
    });
  });

  describe('Filter by User', () => {
    it('filters by user when username is selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allRecords = createMockAuditTrailList();
      const filteredRecords = createMockAuditTrailList([
        createMockAuditTrailEntry({ changedBy: 'jsmith' }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allRecords)
        .mockResolvedValueOnce(filteredRecords);

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const userFilter = screen.getByRole('combobox', {
        name: /filter by user/i,
      });
      await user.click(userFilter);
      await user.click(screen.getByRole('option', { name: /jsmith/i }));

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            user: 'jsmith',
          }),
        );
      });
    });

    it('searches for username in user filter', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const userFilter = screen.getByRole('combobox', {
        name: /filter by user/i,
      });
      await user.click(userFilter);

      const searchInput = screen.getByPlaceholderText(/search users/i);
      await user.type(searchInput, 'jsmith');

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: /jsmith/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Filter by Entity Type', () => {
    it('filters by entity type when selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allRecords = createMockAuditTrailList();
      const filteredRecords = createMockAuditTrailList([
        createMockAuditTrailEntry({ entityType: 'Instrument' }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allRecords)
        .mockResolvedValueOnce(filteredRecords);

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const entityTypeFilter = screen.getByRole('combobox', {
        name: /filter by entity type/i,
      });
      await user.click(entityTypeFilter);
      await user.click(screen.getByRole('option', { name: /instrument/i }));

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            entityType: 'Instrument',
          }),
        );
      });
    });

    it('shows all entity type options in dropdown', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const entityTypeFilter = screen.getByRole('combobox', {
        name: /filter by entity type/i,
      });
      await user.click(entityTypeFilter);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: /user/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /role/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /instrument/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /portfolio/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Filter by Action', () => {
    it('filters by change type when selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allRecords = createMockAuditTrailList();
      const filteredRecords = createMockAuditTrailList([
        createMockAuditTrailEntry({ changeType: 'Created' }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allRecords)
        .mockResolvedValueOnce(filteredRecords);

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const actionFilter = screen.getByRole('combobox', {
        name: /filter by action/i,
      });
      await user.click(actionFilter);
      await user.click(screen.getByRole('option', { name: /created/i }));

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            changeType: 'Created',
          }),
        );
      });
    });

    it('shows action options: Created, Updated, Deleted', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const actionFilter = screen.getByRole('combobox', {
        name: /filter by action/i,
      });
      await user.click(actionFilter);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: /created/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /updated/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /deleted/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('View Audit Record Details', () => {
    it('opens detail modal when audit record is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const firstRecordRow = screen.getAllByRole('row')[1];
      await user.click(firstRecordRow);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/audit record details/i)).toBeInTheDocument();
      });
    });

    it('shows before and after values in detail view for updated records', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList([
        createMockAuditTrailEntry({
          changeType: 'Updated',
          changes: [
            {
              field: 'email',
              oldValue: 'old@company.com',
              newValue: 'new@company.com',
            },
          ],
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const firstRecordRow = screen.getAllByRole('row')[1];
      await user.click(firstRecordRow);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText(/email/i)).toBeInTheDocument();
        expect(
          within(dialog).getByText(/old@company.com/i),
        ).toBeInTheDocument();
        expect(
          within(dialog).getByText(/new@company.com/i),
        ).toBeInTheDocument();
      });
    });

    it('shows who made the change and when in detail view', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList([
        createMockAuditTrailEntry({
          changedBy: 'jsmith',
          changedAt: '2026-02-09T10:30:00Z',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByText('jsmith')).toBeInTheDocument();
      });

      const firstRecordRow = screen.getAllByRole('row')[1];
      await user.click(firstRecordRow);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText(/jsmith/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/2026-02-09/i)).toBeInTheDocument();
      });
    });
  });

  describe('Entity-Specific Audit Trail', () => {
    it('filters by entity ID and entity type to show change history for specific entity', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allRecords = createMockAuditTrailList();
      const filteredRecords = createMockAuditTrailList([
        createMockAuditTrailEntry({
          entityType: 'Instrument',
          entityId: 42,
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allRecords)
        .mockResolvedValueOnce(filteredRecords);

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const entityTypeFilter = screen.getByRole('combobox', {
        name: /filter by entity type/i,
      });
      await user.click(entityTypeFilter);
      await user.click(screen.getByRole('option', { name: /instrument/i }));

      const entityIdInput = screen.getByLabelText(/entity id/i);
      await user.type(entityIdInput, '42');

      const applyButton = screen.getByRole('button', {
        name: /apply filters/i,
      });
      await user.click(applyButton);

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            entityType: 'Instrument',
            entityId: 42,
          }),
        );
      });
    });
  });

  describe('User Activity Summary', () => {
    it('shows summary panel when filtered by user', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList([
        createMockAuditTrailEntry({ changedBy: 'jsmith' }),
        createMockAuditTrailEntry({
          changedBy: 'jsmith',
          changeType: 'Created',
        }),
        createMockAuditTrailEntry({
          changedBy: 'jsmith',
          changeType: 'Updated',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const userFilter = screen.getByRole('combobox', {
        name: /filter by user/i,
      });
      await user.click(userFilter);
      await user.click(screen.getByRole('option', { name: /jsmith/i }));

      await waitFor(() => {
        expect(screen.getByText(/total actions/i)).toBeInTheDocument();
        expect(screen.getByText(/most common action/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Audit Trail', () => {
    it('downloads Excel file when export button is clicked (Administrator)', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );
      (auditApi.exportAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBlob,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export audit trail/i,
      });
      await user.click(exportButton);

      await waitFor(() => {
        expect(auditApi.exportAuditTrail).toHaveBeenCalled();
      });
    });

    it('hides export button for Analyst with audit.view but without export permission', async () => {
      const mockUser = createMockAnalystUser();
      const mockAuditTrail = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /export audit trail/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('loads next page when pagination is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const page1 = createMockAuditTrailList();
      page1.meta.totalPages = 2;
      const page2 = createMockAuditTrailList([
        createMockAuditTrailEntry({
          entityId: 99,
          changedAt: '2026-02-07T10:00:00Z',
        }),
      ]);
      page2.meta.page = 2;
      page2.meta.totalPages = 2;

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(auditApi.queryAuditTrail).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          }),
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when audit trail fails to load', async () => {
      const mockUser = createMockAdminUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to load audit trail'),
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/failed to load audit trail/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when export fails', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );
      (auditApi.exportAuditTrail as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Export failed'),
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export audit trail/i,
      });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/failed to export audit trail/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      const { container } = render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible table with proper headers', async () => {
      const mockUser = createMockAdminUser();
      const mockAuditTrail = createMockAuditTrailList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.queryAuditTrail as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuditTrail,
      );

      render(<AuditTrailPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /timestamp/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /user/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /action/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
