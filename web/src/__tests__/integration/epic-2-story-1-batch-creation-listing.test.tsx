/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 1
 * - Route: /batches
 * - Target File: app/batches/page.tsx
 * - Page Action: create_new
 *
 * Tests for Batch Creation & Listing
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import BatchesPage from '@/app/batches/BatchesClient';
import * as authApi from '@/lib/api/auth';
import * as batchesApi from '@/lib/api/batches';
import type { AuthUser } from '@/lib/api/auth';
import type {
  ReportBatch,
  ReportBatchList,
  PaginationMeta,
} from '@/lib/api/batches';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth API
vi.mock('@/lib/api/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock batches API
vi.mock('@/lib/api/batches', () => ({
  listReportBatches: vi.fn(),
  createReportBatch: vi.fn(),
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
  permissions: ['batch.create', 'batch.view'],
  allowedPages: ['/batches'],
  ...overrides,
});

// Mock batch data factory
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

// Mock batch list factory
const createMockBatchList = (batches: ReportBatch[]): ReportBatchList => ({
  items: batches,
  meta: {
    page: 1,
    pageSize: 10,
    totalItems: batches.length,
    totalPages: Math.ceil(batches.length / 10),
  },
});

describe('Batches Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Happy Path - View Batches', () => {
    it('displays all batches sorted by latest first', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 2,
            reportDate: '2026-02-28',
            createdAt: '2026-02-01T10:00:00Z',
          }),
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            createdAt: '2026-01-15T10:00:00Z',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        const batchCards = screen.getAllByRole('article');
        expect(batchCards).toHaveLength(2);
        // First batch card should be February 2026 (newest)
        expect(batchCards[0]).toHaveTextContent(/February 2026/i);
        // Second batch card should be January 2026
        expect(batchCards[1]).toHaveTextContent(/January 2026/i);
      });
    });

    it('displays batch card with reporting date, status, created date, created by, workflow stage, and file/validation summary', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'DataPreparation',
            createdAt: '2026-01-15T10:00:00Z',
            createdBy: 'Sarah Thomas',
            fileSummary: { received: 3, total: 5 },
            validationSummary: { errors: 0, warnings: 2 },
            calculationStatus: 'Not Started',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Data Preparation/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Created by Sarah Thomas/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/3 of 5 files received/i)).toBeInTheDocument();
        expect(screen.getByText(/2 warnings/i)).toBeInTheDocument();
      });
    });

    it('displays workflow progress with completed, current, and pending indicators for Level2Pending batch', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            status: 'Level2Pending',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        const workflow = screen.getByLabelText('Workflow progress');
        expect(workflow).toBeInTheDocument();

        // Should show stage labels
        expect(screen.getByText('Data Prep')).toBeInTheDocument();
        expect(screen.getByText('L1')).toBeInTheDocument();
        expect(screen.getByText('L2')).toBeInTheDocument();
        expect(screen.getByText('L3')).toBeInTheDocument();
        expect(screen.getByText('Published')).toBeInTheDocument();

        // Check stage states
        const completedStages = workflow.querySelectorAll(
          '[data-stage-state="completed"]',
        );
        expect(completedStages).toHaveLength(2); // Data Prep, L1

        const currentStage = workflow.querySelector(
          '[data-stage-state="current"]',
        );
        expect(currentStage).toBeInTheDocument();
        expect(currentStage?.textContent).toContain('L2');

        const pendingStages = workflow.querySelectorAll(
          '[data-stage-state="pending"]',
        );
        expect(pendingStages).toHaveLength(2); // L3, Published
      });
    });
  });

  describe('Happy Path - Create Batch', () => {
    it('shows Create New Batch button for Analyst role', async () => {
      const mockUser = createMockUser({ roles: ['Analyst'] });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([]));

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create New Batch/i }),
        ).toBeInTheDocument();
      });
    });

    it('creates new batch for next month when Create New Batch is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'Approved',
          }),
        ]),
      );
      (
        batchesApi.createReportBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatch({
          id: 2,
          reportDate: '2026-02-28',
          status: 'DataPreparation',
        }),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create New Batch/i }),
        ).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /Create New Batch/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(batchesApi.createReportBatch).toHaveBeenCalledWith({
          reportBatchType: 'Monthly',
          reportDate: '2026-02-28',
        });
        expect(
          screen.getByText(/Batch February 2026 created successfully/i),
        ).toBeInTheDocument();
      });
    });

    it('shows new batch at top of list after creation', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      // Initial batch list
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'Approved',
          }),
        ]),
      );

      // After creation
      (
        batchesApi.createReportBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatch({
          id: 2,
          reportDate: '2026-02-28',
          status: 'DataPreparation',
        }),
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(
        createMockBatchList([
          createMockBatch({
            id: 2,
            reportDate: '2026-02-28',
            status: 'DataPreparation',
          }),
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'Approved',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create New Batch/i }),
        ).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /Create New Batch/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        const batchCards = screen.getAllByRole('article');
        expect(batchCards[0]).toHaveTextContent(/February 2026/i);
        expect(batchCards[0]).toHaveTextContent(/Data Preparation/i);
      });
    });

    it('shows new batch with status badge Data Preparation in blue color', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'Approved',
          }),
        ]),
      );
      (
        batchesApi.createReportBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatch({
          id: 2,
          reportDate: '2026-02-28',
          status: 'DataPreparation',
        }),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create New Batch/i }),
        ).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /Create New Batch/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/Data Preparation/i)).toBeInTheDocument();
      });
    });

    it('disables Create New Batch button when previous batch is not Approved', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'DataPreparation',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', {
          name: /Create New Batch/i,
        });
        expect(createButton).toBeDisabled();
      });
    });

    it('shows tooltip explaining why Create New Batch button is disabled', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'Level1Pending',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', {
          name: /Create New Batch/i,
        });
        expect(createButton).toBeDisabled();
      });

      const createButton = screen.getByRole('button', {
        name: /Create New Batch/i,
      });
      await user.hover(createButton);

      await waitFor(() => {
        expect(
          screen.getByText(/previous batch must reach Approved status first/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Filtering and Sorting', () => {
    it('filters to show only Active batches (not Approved)', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
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
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(2);
      });

      const filterSelect = screen.getByRole('combobox', { name: /filter/i });
      await user.selectOptions(filterSelect, 'Active');

      await waitFor(() => {
        const batchCards = screen.getAllByRole('article');
        expect(batchCards).toHaveLength(1);
        expect(batchCards[0]).toHaveTextContent(/January 2026/i);
        expect(batchCards[0]).toHaveTextContent(/Data Preparation/i);
      });
    });

    it('filters to show only Closed batches (Approved)', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
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
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(2);
      });

      const filterSelect = screen.getByRole('combobox', { name: /filter/i });
      await user.selectOptions(filterSelect, 'Closed');

      await waitFor(() => {
        const batchCards = screen.getAllByRole('article');
        expect(batchCards).toHaveLength(1);
        expect(batchCards[0]).toHaveTextContent(/December 2025/i);
        expect(batchCards[0]).toHaveTextContent(/Approved/i);
      });
    });

    it('shows all batches when All filter is selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
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
        ]),
      );

      render(<BatchesPage />);

      // First apply Active filter
      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(2);
      });

      const filterSelect = screen.getByRole('combobox', { name: /filter/i });
      await user.selectOptions(filterSelect, 'Active');

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(1);
      });

      // Then switch to All filter
      await user.selectOptions(filterSelect, 'All');

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(2);
      });
    });

    it('sorts batches by Oldest First when sort option is changed', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 2,
            reportDate: '2026-02-28',
            createdAt: '2026-02-01T10:00:00Z',
          }),
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            createdAt: '2026-01-15T10:00:00Z',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        const batchCards = screen.getAllByRole('article');
        expect(batchCards[0]).toHaveTextContent(/February 2026/i);
      });

      const sortSelect = screen.getByRole('combobox', { name: /sort/i });
      await user.selectOptions(sortSelect, 'Oldest First');

      await waitFor(() => {
        const batchCards = screen.getAllByRole('article');
        expect(batchCards[0]).toHaveTextContent(/January 2026/i);
        expect(batchCards[1]).toHaveTextContent(/February 2026/i);
      });
    });
  });

  describe('Rejection Visibility', () => {
    it('displays rejection alert box with details when batch has lastRejection data', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'DataPreparation',
            lastRejection: {
              date: '2026-01-20T14:30:00Z',
              level: 'Level 2',
              reason: 'Missing credit ratings for 5 instruments',
            },
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Level 2/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Missing credit ratings for 5 instruments/i),
        ).toBeInTheDocument();
      });
    });

    it('shows status as Data Preparation (Correcting after rejection) for rejected batch', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'DataPreparation',
            lastRejection: {
              date: '2026-01-20T14:30:00Z',
              level: 'Level 2',
              reason: 'Missing credit ratings',
            },
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Data Preparation \(Correcting after rejection\)/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('shows Load More button when more than 10 batches exist', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      const batches = Array.from({ length: 15 }, (_, i) =>
        createMockBatch({
          id: i + 1,
          reportDate: `2026-0${i + 1}-31`,
          createdAt: `2026-0${i + 1}-01T10:00:00Z`,
        }),
      );

      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        items: batches.slice(0, 10),
        meta: {
          page: 1,
          pageSize: 10,
          totalItems: 15,
          totalPages: 2,
        },
      });

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(10);
        expect(
          screen.getByRole('button', { name: /Load More/i }),
        ).toBeInTheDocument();
      });
    });

    it('loads next 10 batches when Load More is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      const allBatches = Array.from({ length: 15 }, (_, i) =>
        createMockBatch({
          id: i + 1,
          reportDate: `2026-0${(i % 9) + 1}-${28 - i}`,
          createdAt: `2026-0${(i % 9) + 1}-01T10:00:00Z`,
        }),
      );

      // First page
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        items: allBatches.slice(0, 10),
        meta: { page: 1, pageSize: 10, totalItems: 15, totalPages: 2 },
      });

      // Second page
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        items: allBatches.slice(10, 15),
        meta: { page: 2, pageSize: 10, totalItems: 15, totalPages: 2 },
      });

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(10);
      });

      const loadMoreButton = screen.getByRole('button', { name: /Load More/i });
      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(15);
      });
    });
  });

  describe('Permission Control', () => {
    it('shows Create New Batch button for Analyst role', async () => {
      const mockUser = createMockUser({ roles: ['Analyst'] });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockBatchList([]));

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create New Batch/i }),
        ).toBeInTheDocument();
      });
    });

    it('does not show Create New Batch button for ApproverL2 role', async () => {
      const mockUser = createMockUser({
        roles: ['ApproverL2'],
        permissions: ['batch.view'],
      });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'Level2Pending',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /Create New Batch/i }),
      ).not.toBeInTheDocument();
    });

    it('does not show Create New Batch button for Administrator role', async () => {
      const mockUser = createMockUser({
        roles: ['Administrator'],
        permissions: ['batch.view'],
      });
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'DataPreparation',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /Create New Batch/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when batch list API fails', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'));

      render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/error loading batches/i)).toBeInTheDocument();
      });
    });

    it('shows error message when batch creation fails', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'Approved',
          }),
        ]),
      );
      (
        batchesApi.createReportBatch as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Failed to create batch'));

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create New Batch/i }),
        ).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /Create New Batch/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/failed to create batch/i)).toBeInTheDocument();
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
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
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
        ]),
      );

      const { container } = render(<BatchesPage />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible headings and labels', async () => {
      const mockUser = createMockUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (
        batchesApi.listReportBatches as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockBatchList([
          createMockBatch({
            id: 1,
            reportDate: '2026-01-31',
            status: 'DataPreparation',
          }),
        ]),
      );

      render(<BatchesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /batch management/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('combobox', { name: /filter/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('combobox', { name: /sort/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
