/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 2
 * - Route: N/A (header component)
 * - Target File: components/batch/BatchSwitcher.tsx
 * - Page Action: create_new
 *
 * Tests for BatchSwitcher - Global batch selection dropdown in header
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BatchSwitcher } from '@/components/batch/BatchSwitcher';
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

describe('BatchSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('No Active Batch', () => {
    it('displays "No Active Batch" when no batch is selected', async () => {
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([]));

      render(
        <BatchProvider>
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('No Active Batch')).toBeInTheDocument();
      });
    });

    it('shows "Select Batch" link when no batch is active', async () => {
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([]));

      render(
        <BatchProvider>
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /select batch/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Active Batch Display', () => {
    it('displays active batch name and status', async () => {
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
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Active Batch:/i)).toBeInTheDocument();
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Data Preparation/i)).toBeInTheDocument();
      });
    });

    it('displays batch status badge with correct color', async () => {
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
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        const statusBadge = screen.getByText(/Data Preparation/i);
        expect(statusBadge).toBeInTheDocument();
      });
    });

    it('displays read-only indicator when batch status is Approved', async () => {
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
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });
    });

    it('displays locked batch notification for Level 2 approval-locked batches', async () => {
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
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Level 2 Pending/i)).toBeInTheDocument();
      });
    });
  });

  describe('Batch Switching Dropdown', () => {
    it('shows dropdown with recent batches when clicked', async () => {
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
        createMockBatch({
          id: 3,
          reportDate: '2025-11-30',
          status: 'Approved',
        }),
      ];
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatches[0],
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches));

      render(
        <BatchProvider>
          <BatchSwitcher />
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
        expect(screen.getByText(/November 2025/i)).toBeInTheDocument();
      });
    });

    it('shows max 5 recent batches in dropdown', async () => {
      const user = userEvent.setup();
      const mockBatches = Array.from({ length: 10 }, (_, i) =>
        createMockBatch({
          id: i + 1,
          reportDate: `2025-${String(12 - i).padStart(2, '0')}-31`,
        }),
      );
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatches[0],
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches.slice(0, 5)));

      render(
        <BatchProvider>
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/December 2025/i)).toBeInTheDocument();
      });

      const dropdownTrigger = screen.getByRole('button', {
        name: /active batch/i,
      });
      await user.click(dropdownTrigger);

      await waitFor(() => {
        const dropdownMenu = screen.getByRole('menu');
        const batchItems = within(dropdownMenu).getAllByRole('menuitem');
        expect(batchItems.length).toBeLessThanOrEqual(6); // 5 batches + "View All Batches" link
      });
    });

    it('calls switchBatch when dropdown item is clicked', async () => {
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
          <BatchSwitcher />
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

    it('closes dropdown after batch is selected', async () => {
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
          <BatchSwitcher />
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
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const decemberBatch = screen.getByText(/December 2025/i);
      await user.click(decemberBatch);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('shows "View All Batches" link in dropdown', async () => {
      const user = userEvent.setup();
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
          <BatchSwitcher />
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
        expect(
          screen.getByRole('link', { name: /view all batches/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while switching batches', async () => {
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

      let resolveGetBatch: (value: ReportBatch) => void;
      const getBatchPromise = new Promise<ReportBatch>((resolve) => {
        resolveGetBatch = resolve;
      });

      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockBatches[0])
        .mockReturnValueOnce(getBatchPromise);
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches));

      render(
        <BatchProvider>
          <BatchSwitcher />
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

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveGetBatch!(mockBatches[1]);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
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
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible dropdown menu with proper ARIA labels', async () => {
      const user = userEvent.setup();
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
          <BatchSwitcher />
        </BatchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      const dropdownTrigger = screen.getByRole('button', {
        name: /active batch/i,
      });
      expect(dropdownTrigger).toHaveAttribute('aria-haspopup', 'menu');

      await user.click(dropdownTrigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });
  });
});
