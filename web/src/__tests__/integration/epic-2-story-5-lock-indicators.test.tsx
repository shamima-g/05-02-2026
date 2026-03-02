/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 5
 * - Route: /batches (batch listing page) and global header
 * - Target File: app/batches/BatchesClient.tsx, components/batch/BatchSwitcher.tsx
 * - Page Action: modify_existing
 *
 * Tests for Lock State Visual Indicators
 *
 * This test suite validates visual lock/unlock icons on:
 * - Batch cards in the listing page
 * - BatchSwitcher in the global header
 * - Tooltips explaining lock state
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BatchesClient } from '@/app/batches/BatchesClient';
import { BatchSwitcher } from '@/components/batch/BatchSwitcher';
import { BatchProvider } from '@/contexts/BatchContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import * as batchesApi from '@/lib/api/batches';
import * as authApi from '@/lib/api/auth';
import type { ReportBatch, ReportBatchList } from '@/lib/api/batches';
import type { AuthUser } from '@/lib/api/auth';
import { WorkflowStage } from '@/lib/constants/workflow-stages';

// Mock batches API
vi.mock('@/lib/api/batches', () => ({
  listReportBatches: vi.fn(),
  getReportBatch: vi.fn(),
}));

// Mock auth API
vi.mock('@/lib/api/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock storage utilities
vi.mock('@/lib/utils/storage', () => ({
  getActiveBatchId: vi.fn(() => null),
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
}));

const createMockUser = (): AuthUser => ({
  id: 'user-123',
  username: 'test.user',
  displayName: 'Test User',
  email: 'test.user@example.com',
  roles: ['DataEntry'],
  permissions: ['batch.view', 'batch.create'],
  allowedPages: ['/batches', '/dashboard'],
});

const createMockBatch = (
  overrides: Partial<ReportBatch> = {},
): ReportBatch => ({
  id: 1,
  reportBatchType: 'Monthly',
  reportDate: '2026-01-31',
  workflowInstanceId: 'wf-001',
  status: WorkflowStage.DataPreparation,
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

describe('Epic 2 Story 5: Lock State Visual Indicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockUser(),
    );
  });

  describe('Batch Card Lock Icons', () => {
    it('shows unlock icon for DataPreparation batch', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.DataPreparation,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Unlock icon should be present
      const unlockIcon = screen.getByLabelText('Unlocked');
      expect(unlockIcon).toBeInTheDocument();
    });

    it('shows lock icon for Level1Pending batch', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level1Pending,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Lock icon should be present
      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toBeInTheDocument();
    });

    it('shows lock icon for Level2Pending batch', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level2Pending,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toBeInTheDocument();
    });

    it('shows lock icon for Level3Pending batch', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level3Pending,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toBeInTheDocument();
    });

    it('shows lock icon for Approved batch', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Approved,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toBeInTheDocument();
    });

    it('shows tooltip with lock message when hovering lock icon', async () => {
      const user = userEvent.setup();
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level1Pending,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });

      const lockIcon = screen.getByLabelText('Locked');
      await user.hover(lockIcon);

      await waitFor(() => {
        const matches = screen.getAllByText(
          /Data locked during approval process/i,
        );
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows tooltip with editable message when hovering unlock icon', async () => {
      const user = userEvent.setup();
      const mockBatch = createMockBatch({
        status: WorkflowStage.DataPreparation,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByLabelText('Unlocked')).toBeInTheDocument();
      });

      const unlockIcon = screen.getByLabelText('Unlocked');
      await user.hover(unlockIcon);

      await waitFor(() => {
        const matches = screen.getAllByText(/Batch is editable/i);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows archived message tooltip for Approved batch', async () => {
      const user = userEvent.setup();
      const mockBatch = createMockBatch({
        status: WorkflowStage.Approved,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });

      const lockIcon = screen.getByLabelText('Locked');
      await user.hover(lockIcon);

      await waitFor(() => {
        const matches = screen.getAllByText(/already approved and published/i);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // Multi-Batch Scenarios: Not applicable.
  // Previous batch must be Approved before a new batch can be created.
  // Multiple non-complete batches cannot exist simultaneously.

  describe('BatchSwitcher Lock Indicator in Header', () => {
    it('shows lock icon in header when active batch is locked', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level1Pending,
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <TooltipProvider>
          <BatchProvider>
            <BatchSwitcher />
          </BatchProvider>
        </TooltipProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Lock icon should be in header
      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toBeInTheDocument();
    });

    it('does not show lock icon in header when batch is unlocked', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.DataPreparation,
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <TooltipProvider>
          <BatchProvider>
            <BatchSwitcher />
          </BatchProvider>
        </TooltipProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // No lock icon for DataPreparation
      expect(screen.queryByLabelText('Locked')).not.toBeInTheDocument();
    });

    it('shows lock tooltip in header when hovering lock icon', async () => {
      const user = userEvent.setup();
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level2Pending,
      });
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBatch,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(
        <TooltipProvider>
          <BatchProvider>
            <BatchSwitcher />
          </BatchProvider>
        </TooltipProvider>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });

      const lockIcon = screen.getByLabelText('Locked');
      await user.hover(lockIcon);

      await waitFor(() => {
        const matches = screen.getAllByText(/Data locked for approval/i);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('updates lock icon when switching from unlocked active batch to Approved historical batch', async () => {
      const user = userEvent.setup();
      const mockBatches = [
        createMockBatch({
          id: 1,
          reportDate: '2026-01-31',
          status: WorkflowStage.DataPreparation,
        }),
        createMockBatch({
          id: 2,
          reportDate: '2025-12-31',
          status: WorkflowStage.Approved,
        }),
      ];

      (
        batchesApi.getReportBatch as ReturnType<typeof vi.fn>
      ).mockImplementation(async (id: number) =>
        mockBatches.find((b) => b.id === id),
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches));

      render(
        <TooltipProvider>
          <BatchProvider>
            <BatchSwitcher />
          </BatchProvider>
        </TooltipProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Initially no lock icon (DataPreparation)
      expect(screen.queryByLabelText('Locked')).not.toBeInTheDocument();

      // Switch to Approved (historical) batch
      const dropdownTrigger = screen.getByRole('button', {
        name: /active batch/i,
      });
      await user.click(dropdownTrigger);

      const decemberBatch = screen.getByText(/December 2025/i);
      await user.click(decemberBatch);

      await waitFor(() => {
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });
    });

    it('updates lock icon when switching from Approved historical batch to unlocked active batch', async () => {
      const user = userEvent.setup();
      const mockBatches = [
        createMockBatch({
          id: 1,
          reportDate: '2026-01-31',
          status: WorkflowStage.Approved,
        }),
        createMockBatch({
          id: 2,
          reportDate: '2025-12-31',
          status: WorkflowStage.DataPreparation,
        }),
      ];

      (
        batchesApi.getReportBatch as ReturnType<typeof vi.fn>
      ).mockImplementation(async (id: number) =>
        mockBatches.find((b) => b.id === id),
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches));

      render(
        <TooltipProvider>
          <BatchProvider>
            <BatchSwitcher />
          </BatchProvider>
        </TooltipProvider>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });

      // Switch to active (DataPreparation) batch
      const dropdownTrigger = screen.getByRole('button', {
        name: /active batch/i,
      });
      await user.click(dropdownTrigger);

      const decemberBatch = screen.getByText(/December 2025/i);
      await user.click(decemberBatch);

      await waitFor(() => {
        expect(screen.queryByLabelText('Locked')).not.toBeInTheDocument();
      });
    });
  });

  describe('Lock Icon After Batch State Transitions', () => {
    it('shows unlock icon when batch is rejected and returns to DataPreparation', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.DataPreparation,
        lastRejection: {
          date: '2026-01-20T14:30:00Z',
          level: 'Level 1',
          reason: 'Missing data',
        },
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Should show unlock icon even if batch was previously locked
      const unlockIcon = screen.getByLabelText('Unlocked');
      expect(unlockIcon).toBeInTheDocument();
    });

    it('shows lock icon immediately after batch confirmation', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level1Pending,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Lock enforced immediately (no grace period)
      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('lock icon has proper aria-label for screen readers', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level1Pending,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        const lockIcon = screen.getByLabelText('Locked');
        expect(lockIcon).toBeInTheDocument();
      });
    });

    it('unlock icon has proper aria-label for screen readers', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.DataPreparation,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        const unlockIcon = screen.getByLabelText('Unlocked');
        expect(unlockIcon).toBeInTheDocument();
      });
    });

    it('has no accessibility violations with lock icons', async () => {
      const mockBatches = [
        createMockBatch({
          id: 1,
          status: WorkflowStage.DataPreparation,
        }),
        createMockBatch({
          id: 2,
          reportDate: '2025-12-31',
          status: WorkflowStage.Approved,
        }),
      ];
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList(mockBatches));

      const { container } = render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('lock icon tooltip is keyboard accessible', async () => {
      const mockBatch = createMockBatch({
        status: WorkflowStage.Level1Pending,
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
      });

      // Lock icon trigger should be keyboard focusable (tabIndex=0)
      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toHaveAttribute('tabindex', '0');

      // Verify the element can receive focus
      lockIcon.focus();
      expect(document.activeElement).toBe(lockIcon);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty batch list without errors', async () => {
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/No batches found/i)).toBeInTheDocument();
      });

      // No lock icons should be present
      expect(screen.queryByLabelText('Locked')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Unlocked')).not.toBeInTheDocument();
    });

    it('shows lock icon for batch with unknown status (fail-safe)', async () => {
      const mockBatch = createMockBatch({
        status: 'UnknownStatus',
      });
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([mockBatch]));

      render(<BatchesClient />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      // Fail-safe: unknown status should show lock icon
      const lockIcon = screen.getByLabelText('Locked');
      expect(lockIcon).toBeInTheDocument();
    });
  });
});
