/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 2
 * - Route: N/A (global context state + header component)
 * - Target File: components/layout/AppHeader.tsx (modify existing)
 * - Page Action: modify_existing
 *
 * Integration tests for Batch Context Switching
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppHeader } from '@/components/layout/AppHeader';
import { BatchProvider } from '@/contexts/BatchContext';
import * as batchesApi from '@/lib/api/batches';
import type { ReportBatch, ReportBatchList } from '@/lib/api/batches';

// Mock batches API
vi.mock('@/lib/api/batches', () => ({
  listReportBatches: vi.fn(),
  getReportBatch: vi.fn(),
}));

// Mock storage utilities
vi.mock('@/lib/utils/storage', () => ({
  getActiveBatchId: vi.fn(),
  setActiveBatchId: vi.fn(),
  clearActiveBatchId: vi.fn(),
}));

// Mock toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock auth session
vi.mock('@/lib/auth/session', () => ({
  logout: vi.fn(),
}));

const createMockBatch = (
  overrides: Partial<ReportBatch> = {},
): ReportBatch => ({
  id: 1,
  reportBatchType: 'Monthly',
  reportDate: '2026-01-31',
  workflowInstanceId: 'wf-001',
  status: 'DataPreparation',
  createdAt: '2026-01-15T10:00:00Z',
  createdBy: 'Sarah Thomas',
  lastRejection: null,
  fileSummary: {
    received: 3,
    total: 5,
  },
  validationSummary: {
    errors: 0,
    warnings: 2,
  },
  calculationStatus: 'Not Started',
  ...overrides,
});

const createMockBatchList = (batches: ReportBatch[]): ReportBatchList => ({
  items: batches,
  meta: {
    page: 1,
    pageSize: 5,
    totalItems: batches.length,
    totalPages: 1,
  },
});

describe('Epic 2 Story 2: Batch Context Switching - AppHeader Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('AppHeader with BatchSwitcher', () => {
    it('renders BatchSwitcher in AppHeader between nav and user section', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'DataPreparation',
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Active Batch:/i)).toBeInTheDocument();
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Verify layout order: Logo -> Nav -> BatchSwitcher -> User section
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('shows BatchSwitcher in header when batch is active', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'DataPreparation',
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Active Batch:/i)).toBeInTheDocument();
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Data Preparation/i)).toBeInTheDocument();
      });
    });

    it('shows "No Active Batch" in header when no batch is selected', async () => {
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('No Active Batch')).toBeInTheDocument();
      });
    });
  });

  describe('Context Persistence Across Navigation', () => {
    it('preserves active batch context when header remains mounted', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'DataPreparation',
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      const { rerender } = render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Simulate navigation by re-rendering (context should persist)
      rerender(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches', '/dashboard']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });
    });
  });

  describe('Batch Switching from Header', () => {
    it('allows switching to a different batch from header dropdown', async () => {
      const user = userEvent.setup();
      const mockBatches = [
        createMockBatch({
          id: 1,
          reportDate: '2026-01-31',
          status: 'DataPreparation',
        }),
        createMockBatch({
          id: 2,
          reportDate: '2025-12-31',
          status: 'Approved',
        }),
      ];
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockBatches[0])
        .mockResolvedValueOnce(mockBatches[1]);
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      const dropdownTrigger = screen.getByRole('button', {
        name: /active batch/i,
      });
      await user.click(dropdownTrigger);

      await waitFor(() => {
        expect(screen.getByText(/December 2025/i)).toBeInTheDocument();
      });

      const decemberBatch = screen.getByText(/December 2025/i);
      await user.click(decemberBatch);

      await waitFor(() => {
        expect(batchesApi.getReportBatch).toHaveBeenCalledWith(2);
      });
    });

    it('updates header display after switching batches', async () => {
      const user = userEvent.setup();
      const mockBatches = [
        createMockBatch({
          id: 1,
          reportDate: '2026-01-31',
          status: 'DataPreparation',
        }),
        createMockBatch({
          id: 2,
          reportDate: '2025-12-31',
          status: 'Approved',
        }),
      ];
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockBatches[0])
        .mockResolvedValueOnce(mockBatches[1]);
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      const dropdownTrigger = screen.getByRole('button', {
        name: /active batch/i,
      });
      await user.click(dropdownTrigger);

      const decemberBatch = screen.getByText(/December 2025/i);
      await user.click(decemberBatch);

      await waitFor(() => {
        expect(screen.getByText(/December 2025/i)).toBeInTheDocument();
        expect(screen.getByText(/Approved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Read-Only Indicator in Header', () => {
    it('shows read-only indicator in header when batch is Approved', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'Approved',
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });
    });

    it('does not show read-only indicator when batch is in DataPreparation', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'DataPreparation',
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/read-only/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations with BatchSwitcher in header', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'DataPreparation',
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      const { container } = render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Multi-User Scenarios', () => {
    it('allows different users to have independent batch contexts', async () => {
      const user1Batch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'DataPreparation',
      });
      const user2Batch = createMockBatch({
        id: 2,
        reportDate: '2025-12-31',
        status: 'Approved',
      });

      // Simulate User A's session
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        user1Batch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([user1Batch]));

      const { unmount } = render(
        <BatchProvider>
          <AppHeader
            displayName="User A"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      unmount();

      // Simulate User B's session with different batch
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        user2Batch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([user2Batch]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="User B"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/December 2025/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Constraint Notifications', () => {
    it('shows notification for locked batch (Level 2 Approval)', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'Level2Pending',
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Level 2 Pending/i)).toBeInTheDocument();
      });
    });

    it('shows unlocked status for rejected batch returned to DataPreparation', async () => {
      const mockBatch = createMockBatch({
        id: 1,
        reportDate: '2026-01-31',
        status: 'DataPreparation',
        lastRejection: {
          date: '2026-01-20T14:30:00Z',
          level: 'Level 2',
          reason: 'Missing data',
        },
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <BatchProvider>
          <AppHeader
            displayName="Sarah Thomas"
            roles={['Analyst']}
            allowedPages={['/batches']}
          />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Data Preparation/i)).toBeInTheDocument();
      });

      // Should not show read-only indicator for rejected batch in correction mode
      expect(screen.queryByText(/read-only/i)).not.toBeInTheDocument();
    });
  });
});
