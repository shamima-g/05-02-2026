/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 2
 * - Route: /
 * - Target File: app/page.tsx
 * - Page Action: modify_existing
 *
 * Tests for Role-Based Dashboard Landing
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import HomePage from '@/app/page';
import * as authApi from '@/lib/api/auth';
import * as dashboardApi from '@/lib/api/dashboard';
import type { AuthUser } from '@/lib/api/auth';
import type {
  PendingAction,
  ActiveBatchesResponse,
  DashboardActivity,
  DataQualitySummary,
} from '@/lib/api/dashboard';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth API functions
vi.mock('@/lib/api/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock dashboard API functions
vi.mock('@/lib/api/dashboard', () => ({
  getPendingActions: vi.fn(),
  getActiveBatches: vi.fn(),
  getDashboardActivity: vi.fn(),
  getDataQualitySummary: vi.fn(),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
};

// Mock user data factory
const createMockUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'user-1',
  username: 'sthomas',
  displayName: 'Sarah Thomas',
  email: 'sthomas@investinsight.com',
  roles: ['Analyst'],
  permissions: [
    'view_batch_list',
    'create_batch',
    'upload_files',
    'view_file_status',
  ],
  allowedPages: [],
  ...overrides,
});

// Mock pending actions factory
const createMockPendingActions = (
  role: string = 'Analyst',
): PendingAction[] => {
  const analystActions: PendingAction[] = [
    {
      id: 'pa-1',
      type: 'file_alert',
      title: '3 files pending for January 2026',
      description: 'Holdings, transactions, and cash files awaiting upload',
      link: '/batches/1/files',
      priority: 'high',
    },
    {
      id: 'pa-2',
      type: 'validation',
      title: '5 instruments missing duration values',
      description: 'Duration data required before batch approval',
      link: '/batches/1/durations?missing=true',
      priority: 'high',
    },
    {
      id: 'pa-3',
      type: 'validation',
      title: '8 instruments missing credit ratings',
      description: 'Credit rating data required for risk calculations',
      link: '/batches/1/ratings?missing=true',
      priority: 'medium',
    },
  ];

  const masterDataActions: PendingAction[] = [
    {
      id: 'pa-4',
      type: 'master_data',
      title: '5 Instruments Missing Duration Values',
      description: 'Duration values need to be added to master data',
      link: '/master-data/durations?missing=true',
      priority: 'high',
    },
    {
      id: 'pa-5',
      type: 'master_data',
      title: '3 Instruments Missing Beta Values',
      description: 'Beta calculations require input data',
      link: '/master-data/betas?missing=true',
      priority: 'medium',
    },
  ];

  const approverL2Actions: PendingAction[] = [
    {
      id: 'pa-6',
      type: 'approval',
      title: 'December 2025 Monthly Report - Pending Level 2 Approval',
      description: 'Batch passed Level 1, ready for your review',
      link: '/approvals/2',
      priority: 'high',
    },
  ];

  const adminActions: PendingAction[] = [
    {
      id: 'pa-7',
      type: 'admin',
      title: 'New user access request: John Smith',
      description: 'Requesting Analyst role access',
      link: '/admin/users/pending',
      priority: 'medium',
    },
    {
      id: 'pa-8',
      type: 'admin',
      title: 'System configuration update required',
      description: 'New benchmark index needs to be configured',
      link: '/admin/config',
      priority: 'low',
    },
  ];

  switch (role) {
    case 'Analyst':
      return analystActions;
    case 'MasterData':
      return masterDataActions;
    case 'ApproverL2':
      return approverL2Actions;
    case 'Administrator':
      return adminActions;
    default:
      return analystActions;
  }
};

// Mock active batches factory — only monthly batches, 1 active + previous completed
const createMockActiveBatches = (): ActiveBatchesResponse => ({
  items: [
    {
      id: 1,
      reportBatchType: 'Monthly',
      reportDate: '2026-01-31',
      workflowInstanceId: 'wf-001',
      status: 'DataPreparation',
    },
    {
      id: 2,
      reportBatchType: 'Monthly',
      reportDate: '2025-12-31',
      workflowInstanceId: 'wf-002',
      status: 'Approved',
    },
  ],
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: 2,
    totalPages: 1,
  },
});

// Mock dashboard activity factory
const createMockDashboardActivity = (): DashboardActivity[] => [
  {
    id: 1,
    action: 'Uploaded holdings file for January 2026',
    user: 'Sarah Thomas',
    timestamp: '2026-02-06T08:30:00Z',
    entityType: 'File',
    entityId: 101,
  },
  {
    id: 2,
    action: 'Approved December 2025 batch at Level 1',
    user: 'Lisa Patel',
    timestamp: '2026-02-06T07:45:00Z',
    entityType: 'Batch',
    entityId: 2,
  },
  {
    id: 3,
    action: 'Updated duration value for Bond XYZ123',
    user: 'Mike Chen',
    timestamp: '2026-02-06T06:20:00Z',
    entityType: 'Instrument',
    entityId: 456,
  },
];

// Mock data quality summary factory
const createMockDataQualitySummary = (): DataQualitySummary => ({
  missingRatings: 8,
  missingDurations: 5,
  missingBetas: 3,
  missingIndexPrices: 2,
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Happy Path - Dashboard Display', () => {
    it('displays welcome message with user display name and roles', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('Analyst'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByText('Welcome, Sarah Thomas - Analyst'),
        ).toBeInTheDocument();
      });
    });

    it("displays today's date in the header", async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        items: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        missingRatings: 0,
        missingDurations: 0,
        missingBetas: 0,
        missingIndexPrices: 0,
      });

      render(<HomePage />);

      await waitFor(() => {
        // Check for today's date in any common format (e.g., "February 6, 2026" or "2026-02-06")
        const dateRegex = /(February|Feb|2026|02|06)/;
        expect(screen.getByText(dateRegex)).toBeInTheDocument();
      });
    });

    it('displays Pending Actions panel with action items', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('Analyst'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /pending actions/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByText('3 files pending for January 2026'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('5 instruments missing duration values'),
        ).toBeInTheDocument();
      });
    });

    it('displays Active Batches panel with current and previous batch', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /active batches/i }),
        ).toBeInTheDocument();
        // Active batch: January 2026
        expect(screen.getAllByText(/January 2026/i)[0]).toBeInTheDocument();
        // Previous completed batch: December 2025
        expect(screen.getAllByText(/December 2025/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/Completed/i)).toBeInTheDocument();
      });
    });

    it('displays Recent Activity panel with activity entries', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        items: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /recent activity/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByText('Uploaded holdings file for January 2026'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('Approved December 2025 batch at Level 1'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Role-Specific Content - Analyst', () => {
    it('shows file alerts and validation summaries in Pending Actions', async () => {
      const mockUser = createMockUser({ roles: ['Analyst'] });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('Analyst'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByText('3 files pending for January 2026'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('5 instruments missing duration values'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('8 instruments missing credit ratings'),
        ).toBeInTheDocument();
      });
    });

    it('displays Data Quality Alerts panel with validation warning counts', async () => {
      const mockUser = createMockUser({ roles: ['Analyst'] });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /data quality alerts/i }),
        ).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument(); // missingRatings
        expect(screen.getByText('5')).toBeInTheDocument(); // missingDurations
        expect(screen.getByText('3')).toBeInTheDocument(); // missingBetas
        expect(screen.getByText('2')).toBeInTheDocument(); // missingIndexPrices
      });
    });

    it('shows active batch status and previous month as completed', async () => {
      const mockUser = createMockUser({ roles: ['Analyst'] });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        // Active batch shows its workflow status
        expect(screen.getByText(/DataPreparation/i)).toBeInTheDocument();
        // Previous month shows as completed
        expect(screen.getByText(/Completed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Specific Content - Master Data', () => {
    it('shows master data maintenance tasks in Pending Actions', async () => {
      const mockUser = createMockUser({
        roles: ['Analyst'],
        displayName: 'Mike Chen',
      });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('MasterData'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByText('5 Instruments Missing Duration Values'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('3 Instruments Missing Beta Values'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Role-Specific Content - Approver L2', () => {
    it('shows only Level 2 pending batches in Pending Actions', async () => {
      const mockUser = createMockUser({
        roles: ['ApproverL2'],
        displayName: 'Lisa Patel',
      });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('ApproverL2'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        // Should show Level 2 pending batch
        expect(
          screen.getByText(
            /December 2025 Monthly Report - Pending Level 2 Approval/i,
          ),
        ).toBeInTheDocument();

        // Should NOT show batches at other approval levels (implicit - they won't be in the pending actions)
        expect(
          screen.queryByText(/Pending Level 1 Approval/i),
        ).not.toBeInTheDocument();
      });
    });

    it('shows Review link for Level 2 pending batch', async () => {
      const mockUser = createMockUser({
        roles: ['ApproverL2'],
        displayName: 'Lisa Patel',
      });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('ApproverL2'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        const reviewLinks = screen.getAllByText(/review/i);
        expect(reviewLinks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Role-Specific Content - Administrator', () => {
    it('shows user management and system config alerts in Pending Actions', async () => {
      const mockUser = createMockUser({
        roles: ['Administrator'],
        displayName: 'Admin User',
      });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('Administrator'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByText('New user access request: John Smith'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('System configuration update required'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Navigation from Dashboard', () => {
    it('navigates to approval review screen when Review link is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ roles: ['ApproverL2'] });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('ApproverL2'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByText(/December 2025 Monthly Report/i),
        ).toBeInTheDocument();
      });

      const reviewLink = screen.getByRole('link', { name: /review/i });
      await user.click(reviewLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/approvals/2');
    });

    it('navigates to master data screen when Fix link is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ roles: ['Analyst'] });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('MasterData'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByText(/5 Instruments Missing Duration Values/i),
        ).toBeInTheDocument();
      });

      const fixLinks = screen.getAllByRole('link', { name: /fix/i });
      await user.click(fixLinks[0]);

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/master-data/durations?missing=true',
      );
    });

    it('navigates to active batch details when View Details is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getAllByText(/January 2026/i)[0]).toBeInTheDocument();
      });

      // First View Details link is for the active batch (id: 1)
      const viewDetailsLinks = screen.getAllByRole('link', {
        name: /view details/i,
      });
      await user.click(viewDetailsLinks[0]);

      expect(mockRouter.push).toHaveBeenCalledWith('/batches/1');
    });

    it('navigates to audit trail when View Full Log is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        items: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByText('Uploaded holdings file for January 2026'),
        ).toBeInTheDocument();
      });

      const viewFullLogLink = screen.getByRole('link', {
        name: /view full log/i,
      });
      await user.click(viewFullLogLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/audit');
    });
  });

  describe('Error Handling', () => {
    it('shows error message when pending actions API fails', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/error loading pending actions/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when active batches API fails', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('API unavailable'));
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/error loading batches/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('Analyst'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      const { container } = render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible headings for all panels', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /pending actions/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /active batches/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /recent activity/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Workflow Status Visualization', () => {
    it('displays workflow stage labels for the active batch', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        // Workflow stage labels appear for the single active batch
        expect(screen.getByText('Data Prep')).toBeInTheDocument();
        expect(screen.getByText('L1')).toBeInTheDocument();
        expect(screen.getByText('L2')).toBeInTheDocument();
        expect(screen.getByText('L3')).toBeInTheDocument();
        expect(screen.getByText('Published')).toBeInTheDocument();
      });
    });

    it('shows current position indicator for a batch in Level2Pending', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        items: [
          {
            id: 2,
            reportBatchType: 'Monthly',
            reportDate: '2025-12-31',
            workflowInstanceId: 'wf-002',
            status: 'Level2Pending',
          },
        ],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      });
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        // For Level2Pending: Data Prep and L1 are completed, L2 is current
        const workflow = screen.getByLabelText('Workflow progress');
        expect(workflow).toBeInTheDocument();

        // Completed stages should have checkmark indicators
        const completedStages = workflow.querySelectorAll(
          '[data-stage-state="completed"]',
        );
        expect(completedStages).toHaveLength(2); // Data Prep, L1

        // Current stage should have current indicator
        const currentStage = workflow.querySelector(
          '[data-stage-state="current"]',
        );
        expect(currentStage).toBeInTheDocument();
        expect(currentStage?.textContent).toContain('L2');

        // Pending stages
        const pendingStages = workflow.querySelectorAll(
          '[data-stage-state="pending"]',
        );
        expect(pendingStages).toHaveLength(2); // L3, Published
      });
    });

    it('shows Approved batch as completed without workflow stepper', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        items: [
          {
            id: 3,
            reportBatchType: 'Monthly',
            reportDate: '2025-11-30',
            workflowInstanceId: 'wf-003',
            status: 'Approved',
          },
        ],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      });
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      await waitFor(() => {
        // Approved batch shows as previous completed — no workflow stepper
        expect(screen.getByText('November 2025')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(
          screen.queryByLabelText('Workflow progress'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-Time Updates', () => {
    it('refreshes pending actions data automatically after 30 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockPendingActions('Analyst'));
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockActiveBatches());
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      // Wait for initial load to complete
      await waitFor(() => {
        expect(
          screen.getByText('3 files pending for January 2026'),
        ).toBeInTheDocument();
      });

      // Clear mock call counts after initial load
      (dashboardApi.getPendingActions as ReturnType<typeof vi.fn>).mockClear();

      // Advance timers by 30 seconds to trigger polling
      await vi.advanceTimersByTimeAsync(30000);

      expect(dashboardApi.getPendingActions).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('updates recent activity with new entries after polling', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        dashboardApi.getPendingActions as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);
      (
        dashboardApi.getActiveBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        items: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDashboardActivity());
      (
        dashboardApi.getDataQualitySummary as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockDataQualitySummary());

      render(<HomePage />);

      // Wait for initial load
      await waitFor(() => {
        expect(
          screen.getByText('Uploaded holdings file for January 2026'),
        ).toBeInTheDocument();
      });

      // Mock updated activity for next poll
      (
        dashboardApi.getDashboardActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        {
          id: 99,
          action: 'New batch created for February 2026',
          user: 'Admin User',
          timestamp: '2026-02-09T10:00:00Z',
          entityType: 'Batch',
          entityId: 5,
        },
        ...createMockDashboardActivity(),
      ]);

      // Advance timers by 30 seconds to trigger polling
      await vi.advanceTimersByTimeAsync(30000);

      await waitFor(() => {
        expect(
          screen.getByText('New batch created for February 2026'),
        ).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });
});
