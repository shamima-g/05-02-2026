/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 3
 * - Route: /batches/[id]/workflow
 * - Target File: app/batches/[id]/workflow/page.tsx
 * - Page Action: create_new
 *
 * Tests for Workflow State Visualization
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WorkflowClient from '@/app/batches/[id]/workflow/WorkflowClient';
import * as batchesApi from '@/lib/api/batches';
import type { ReportBatch, BatchWorkflowStatus } from '@/lib/api/batches';

// Mock batches API
vi.mock('@/lib/api/batches', () => ({
  getReportBatch: vi.fn(),
  getBatchWorkflowStatus: vi.fn(),
}));

// Mock polling hook
vi.mock('@/hooks/usePolling', () => ({
  usePolling: vi.fn((callback) => {
    // Do not automatically call callback - let tests control it
  }),
}));

// Mock toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock batch context (used by ConfirmDataButton in CurrentStagePanel)
vi.mock('@/contexts/BatchContext', () => ({
  useBatch: () => ({
    switchBatch: vi.fn(),
  }),
}));

// Mock date formatting utilities
vi.mock('@/lib/utils/date-formatting', () => ({
  formatReportDate: vi.fn((dateStr: string) => 'January 2026'),
  formatDateTime: vi.fn((dateStr: string) => 'Jan 6, 2026 at 11:30 AM'),
  formatRelativeTime: vi.fn((dateStr: string) => '2 days ago'),
}));

const createMockBatch = (
  overrides: Partial<ReportBatch> = {},
): ReportBatch => ({
  id: 1,
  reportBatchType: 'Monthly',
  reportDate: '2026-01-31',
  workflowInstanceId: 'wf-001',
  status: 'Level2Pending',
  createdAt: '2026-01-15T10:00:00Z',
  createdBy: 'Sarah Thomas',
  lastRejection: null,
  fileSummary: {
    received: 5,
    total: 5,
  },
  validationSummary: {
    errors: 0,
    warnings: 0,
  },
  calculationStatus: 'Complete',
  ...overrides,
});

const createMockWorkflowStatus = (
  overrides: Partial<BatchWorkflowStatus> = {},
): BatchWorkflowStatus => ({
  batchId: 1,
  currentStage: 'Level2Pending',
  isLocked: true,
  canConfirm: false,
  canApprove: true,
  pendingApprovalLevel: 2,
  lastUpdated: '2026-01-06T11:30:00Z',
  ...overrides,
});

describe('Workflow State Visualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path - Current Stage Display', () => {
    it('displays Current Workflow Stage panel showing Level 2 Approval', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Current Workflow Stage')).toBeInTheDocument();
        expect(screen.getByText('Level 2 Approval')).toBeInTheDocument();
      });
    });

    it('displays workflow progress bar with completed, current, and pending indicators', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        const workflow = screen.getByLabelText(/workflow progress/i);
        expect(workflow).toBeInTheDocument();

        // Should show all stage labels
        expect(screen.getByText('Data Prep')).toBeInTheDocument();
        expect(screen.getByText('L1')).toBeInTheDocument();
        expect(screen.getByText('L2')).toBeInTheDocument();
        expect(screen.getByText('L3')).toBeInTheDocument();
        expect(screen.getByText('Published')).toBeInTheDocument();

        // Check stage states
        const completedStages = container.querySelectorAll(
          // test-quality-ignore
          '[data-stage-state="complete"]',
        );
        expect(completedStages.length).toBeGreaterThanOrEqual(2); // Data Prep, L1

        const currentStage = container.querySelector(
          // test-quality-ignore
          '[data-stage-state="current"]',
        );
        expect(currentStage).toBeInTheDocument();
        expect(currentStage?.textContent).toContain('L2');

        const pendingStages = container.querySelectorAll(
          // test-quality-ignore
          '[data-stage-state="pending"]',
        );
        expect(pendingStages.length).toBeGreaterThanOrEqual(2); // L3, Published
      });
    });

    it('displays status message with timestamp and next stage indicator', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({
          currentStage: 'Level2Pending',
          lastUpdated: '2026-01-06T11:30:00Z',
        }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Awaiting PM approval since Jan 6, 2026 at 11:30 AM/i,
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Next: Level 3 Approval \(Executive\)/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Workflow Stage Icons', () => {
    it('shows completed icons for Data Prep and L1 when at Level 2', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        const dataPrep = container.querySelector(
          // test-quality-ignore
          '[data-stage="DataPreparation"]',
        );
        const level1 = container.querySelector('[data-stage="Level1Pending"]'); // test-quality-ignore

        expect(dataPrep).toHaveAttribute('data-stage-state', 'complete');
        expect(level1).toHaveAttribute('data-stage-state', 'complete');
      });
    });

    it('shows current icon for Level 2 when batch is at Level 2', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        const level2 = container.querySelector('[data-stage="Level2Pending"]'); // test-quality-ignore
        expect(level2).toHaveAttribute('data-stage-state', 'current');
      });
    });

    it('shows pending icons for L3 and Published when at Level 2', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        const level3 = container.querySelector('[data-stage="Level3Pending"]'); // test-quality-ignore
        const approved = container.querySelector('[data-stage="Approved"]'); // test-quality-ignore

        expect(level3).toHaveAttribute('data-stage-state', 'pending');
        expect(approved).toHaveAttribute('data-stage-state', 'pending');
      });
    });

    it('shows rejection warning when batch was rejected and returned to Data Prep', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({
          status: 'DataPreparation',
          lastRejection: {
            date: '2026-01-20T14:30:00Z',
            level: 'Level 1',
            reason: 'Missing data',
          },
        }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'DataPreparation' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        const level1 = container.querySelector('[data-stage="Level1Pending"]'); // test-quality-ignore
        expect(level1).toHaveAttribute('data-rejected', 'true');
      });
    });
  });

  describe('Stage Descriptions', () => {
    it('displays Data Preparation description when batch is in Data Preparation', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'DataPreparation' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'DataPreparation' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /All required data must be collected, validated, and confirmed/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('displays Level 1 Pending description when batch is in Level 1 Pending', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level1Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level1Pending' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Operations approval focusing on file receipt/i),
        ).toBeInTheDocument();
      });
    });

    it('displays Level 2 Pending description when batch is in Level 2 Pending', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Portfolio Manager approval focusing on holdings/i),
        ).toBeInTheDocument();
      });
    });

    it('displays Level 3 Pending description when batch is in Level 3 Pending', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level3Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level3Pending' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Executive approval for final sign-off/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Status Timestamps', () => {
    it('shows status with formatted timestamp', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({
          currentStage: 'Level2Pending',
          lastUpdated: '2026-01-06T11:30:00Z',
        }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Awaiting PM approval since Jan 6, 2026 at 11:30 AM/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows status with relative time for Data Preparation', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'DataPreparation' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({
          currentStage: 'DataPreparation',
          lastUpdated: '2026-01-05T09:00:00Z',
        }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByText(/In preparation for 2 days/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Actions', () => {
    it('shows View Batch Details button that links to batch details page', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ id: 1, status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        const button = screen.getByRole('link', {
          name: /View Batch Details/i,
        });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('href', '/batches/1');
      });
    });

    it('provides stage descriptions via accessible title attributes', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(screen.getByText('L1')).toBeInTheDocument();
      });

      const level1Stage = container.querySelector(
        // test-quality-ignore
        '[data-stage="Level1Pending"]',
      );
      expect(level1Stage).toHaveAttribute(
        'title',
        expect.stringContaining('Operations approval'),
      );
    });

    it('shows Confirm Data Ready button when batch is in Data Preparation', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'DataPreparation' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({
          currentStage: 'DataPreparation',
          canConfirm: true,
        }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Confirm Data Ready/i }),
        ).toBeInTheDocument();
      });
    });

    it('does not show Confirm Data Ready button when canConfirm is false', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({
          currentStage: 'Level2Pending',
          canConfirm: false,
        }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Level 2 Approval')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /Confirm Data Ready/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows error message when batch is not found', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Batch not found'),
      );

      render(<WorkflowClient batchId={999} />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Batch not found/i)).toBeInTheDocument();
      });
    });

    it('shows link to return to batch management on error', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Batch not found'),
      );

      render(<WorkflowClient batchId={999} />);

      await waitFor(() => {
        const link = screen.getByRole('link', {
          name: /Return to Batch Management/i,
        });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/batches');
      });
    });

    it('shows error message when workflow status API fails', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'));

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/Failed to load workflow status/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Rejection State Indicators', () => {
    it('shows rejection alert in CurrentStagePanel when batch was rejected', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({
          status: 'DataPreparation',
          lastRejection: {
            date: '2026-01-20T14:30:00Z',
            level: 'Level 1',
            reason: 'Data validation failed',
          },
        }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'DataPreparation' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/Returned to Data Preparation/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Data validation failed/i)).toBeInTheDocument();
      });
    });

    it('shows red warning icon on rejected stage in progress bar', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({
          status: 'DataPreparation',
          lastRejection: {
            date: '2026-01-20T14:30:00Z',
            level: 'Level 2',
            reason: 'Missing credit ratings',
          },
        }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'DataPreparation' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        const level2 = container.querySelector('[data-stage="Level2Pending"]'); // test-quality-ignore
        expect(level2).toHaveAttribute('data-rejected', 'true');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}), // Never resolves
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockReturnValue(new Promise(() => {}));

      render(<WorkflowClient batchId={1} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('hides loading spinner after data loads', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Page Title', () => {
    it('displays page title with batch report date', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ reportDate: '2026-01-31' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: /Workflow State - Batch: January 2026/i,
          }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      (batchesApi.getReportBatch as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockBatch({ status: 'Level2Pending' }),
      );
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockWorkflowStatus({ currentStage: 'Level2Pending' }),
      );

      const { container } = render(<WorkflowClient batchId={1} />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
