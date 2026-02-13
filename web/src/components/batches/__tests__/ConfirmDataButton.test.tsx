/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 4
 * - Route: N/A (action on existing batch pages)
 * - Target File: components/batches/ConfirmDataButton.tsx
 * - Page Action: create_new
 *
 * Tests for ConfirmDataButton - Data confirmation and workflow transition
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ConfirmDataButton } from '@/components/batches/ConfirmDataButton';
import * as batchesApi from '@/lib/api/batches';
import type { BatchValidationResult, ReportBatch } from '@/lib/api/batches';

// Create stable mock functions at module level
const mockShowToast = vi.fn();
const mockSwitchBatch = vi.fn();

// Mock batches API
vi.mock('@/lib/api/batches', () => ({
  getBatchValidation: vi.fn(),
  confirmBatch: vi.fn(),
}));

// Mock BatchContext with stable mock function
vi.mock('@/contexts/BatchContext', () => ({
  useBatch: () => ({
    switchBatch: mockSwitchBatch,
  }),
}));

// Mock ToastContext with stable mock function
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Helper type for errors with status codes
interface ApiError extends Error {
  status?: number;
}

const createMockValidation = (
  overrides: Partial<BatchValidationResult> = {},
): BatchValidationResult => ({
  isComplete: true,
  fileCompleteness: {
    expected: 5,
    received: 5,
    valid: 5,
    failed: 0,
  },
  portfolioDataCompleteness: [],
  referenceDataCompleteness: {
    instrumentsMissingRatings: 0,
    instrumentsMissingDurations: 0,
    instrumentsMissingBetas: 0,
    missingIndexPrices: 0,
  },
  ...overrides,
});

describe('ConfirmDataButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('displays "Confirm Data Ready" button when rendered', () => {
      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      expect(
        screen.getByRole('button', { name: /confirm data ready/i }),
      ).toBeInTheDocument();
    });

    it('fetches validation summary when button is clicked', async () => {
      const user = userEvent.setup();
      (
        batchesApi.getBatchValidation as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockValidation());

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      const button = screen.getByRole('button', {
        name: /confirm data ready/i,
      });
      await user.click(button);

      expect(batchesApi.getBatchValidation).toHaveBeenCalledWith(1);
    });

    it('opens confirmation dialog when validation passes', async () => {
      const user = userEvent.setup();
      (
        batchesApi.getBatchValidation as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockValidation());

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole('alertdialog', {
            name: /confirm data ready for january 2026/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it('shows confirmation message in dialog', async () => {
      const user = userEvent.setup();
      (
        batchesApi.getBatchValidation as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockValidation());

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /this will lock all data entry and initiate calculations/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('calls confirmBatch API when Confirm button is clicked', async () => {
      const user = userEvent.setup();
      (
        batchesApi.getBatchValidation as ReturnType<typeof vi.fn>
      ).mockResolvedValue(createMockValidation());
      (batchesApi.confirmBatch as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        status: 'Level1Pending',
      });

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^confirm$/i });
      await user.click(confirmButton);

      expect(batchesApi.confirmBatch).toHaveBeenCalledWith(1);
    });

    it('shows success toast after confirmation', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockResolvedValue({
        id: 1,
        status: 'Level1Pending',
      } as ReportBatch);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Data confirmed',
            variant: 'success',
          }),
        );
      });
    });

    it('closes dialog after successful confirmation', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockResolvedValue({
        id: 1,
        status: 'Level1Pending',
      } as ReportBatch);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('refreshes batch context via switchBatch after confirmation', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockResolvedValue({
        id: 1,
        status: 'Level1Pending',
      } as ReportBatch);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockSwitchBatch).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Validation Checks', () => {
    it('shows warning when files are missing (non-blocking)', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          fileCompleteness: {
            expected: 5,
            received: 2,
            valid: 2,
            failed: 0,
          },
        }),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(/3 required files are missing/i),
        ).toBeInTheDocument();
      });
    });

    it('dialog still opens when files are missing (user can proceed)', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          fileCompleteness: {
            expected: 5,
            received: 2,
            valid: 2,
            failed: 0,
          },
        }),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('shows warning when validation errors exist (failed > 0)', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          fileCompleteness: {
            expected: 5,
            received: 5,
            valid: 3,
            failed: 2,
          },
        }),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(/2 validation errors exist/i),
        ).toBeInTheDocument();
      });
    });

    it('warning dialog shows Review Issues button when files are missing', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          fileCompleteness: {
            expected: 5,
            received: 2,
            valid: 2,
            failed: 0,
          },
        }),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /review issues/i }),
        ).toBeInTheDocument();
      });
    });

    it('warning dialog shows Proceed Anyway button', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          fileCompleteness: {
            expected: 5,
            received: 2,
            valid: 2,
            failed: 0,
          },
        }),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /proceed anyway/i }),
        ).toBeInTheDocument();
      });
    });

    it('Review Issues button closes dialog without confirming', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          fileCompleteness: {
            expected: 5,
            received: 2,
            valid: 2,
            failed: 0,
          },
        }),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /review issues/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });

      expect(batchesApi.confirmBatch).not.toHaveBeenCalled();
    });

    it('Proceed Anyway button proceeds with confirmation despite issues', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          fileCompleteness: {
            expected: 5,
            received: 2,
            valid: 2,
            failed: 0,
          },
        }),
      );
      vi.mocked(batchesApi.confirmBatch).mockResolvedValue({
        id: 1,
        status: 'Level1Pending',
      } as ReportBatch);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /proceed anyway/i }));

      expect(batchesApi.confirmBatch).toHaveBeenCalledWith(1);
    });

    it('shows info message when validation warnings exist (non-blocking)', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation({
          referenceDataCompleteness: {
            instrumentsMissingRatings: 3,
            instrumentsMissingDurations: 2,
            instrumentsMissingBetas: 1,
            missingIndexPrices: 0,
          },
        }),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(/validation warnings exist/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows "Checking..." text while fetching validation', async () => {
      const user = userEvent.setup();
      let resolveValidation: (value: BatchValidationResult) => void;
      const validationPromise = new Promise<BatchValidationResult>(
        (resolve) => {
          resolveValidation = resolve;
        },
      );
      vi.mocked(batchesApi.getBatchValidation).mockReturnValue(
        validationPromise,
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      const button = screen.getByRole('button', {
        name: /confirm data ready/i,
      });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /checking/i }),
        ).toBeInTheDocument();
      });

      resolveValidation!(createMockValidation());
    });

    it('button is disabled during validation fetch', async () => {
      const user = userEvent.setup();
      let resolveValidation: (value: BatchValidationResult) => void;
      const validationPromise = new Promise<BatchValidationResult>(
        (resolve) => {
          resolveValidation = resolve;
        },
      );
      vi.mocked(batchesApi.getBatchValidation).mockReturnValue(
        validationPromise,
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      const button = screen.getByRole('button', {
        name: /confirm data ready/i,
      });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /checking/i }),
        ).toBeDisabled();
      });

      resolveValidation!(createMockValidation());
    });

    it('shows "Confirming..." text while API call is in progress', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );

      let resolveConfirm: (value: ReportBatch) => void;
      const confirmPromise = new Promise<ReportBatch>((resolve) => {
        resolveConfirm = resolve;
      });
      vi.mocked(batchesApi.confirmBatch).mockReturnValue(confirmPromise);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^confirm$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /confirming/i }),
        ).toBeInTheDocument();
      });

      resolveConfirm!({ id: 1, status: 'Level1Pending' } as ReportBatch);
    });

    it('dialog Confirm button is disabled during API call', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );

      let resolveConfirm: (value: ReportBatch) => void;
      const confirmPromise = new Promise<ReportBatch>((resolve) => {
        resolveConfirm = resolve;
      });
      vi.mocked(batchesApi.confirmBatch).mockReturnValue(confirmPromise);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        const confirmingButton = screen.getByRole('button', {
          name: /confirming/i,
        });
        expect(confirmingButton).toBeDisabled();
      });

      resolveConfirm!({ id: 1, status: 'Level1Pending' } as ReportBatch);
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when validation fetch fails', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockRejectedValue(
        new Error('Network error'),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to check validation status',
            variant: 'error',
          }),
        );
      });
    });

    it('does NOT open dialog when validation fetch fails', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockRejectedValue(
        new Error('Network error'),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('shows error toast when confirmBatch fails', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockRejectedValue(
        new Error('Server error'),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to confirm batch',
            variant: 'error',
          }),
        );
      });
    });

    it('keeps dialog open when confirmation fails', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockRejectedValue(
        new Error('Server error'),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('shows specific error message for 403 Forbidden', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );

      const forbiddenError: ApiError = new Error('Forbidden');
      forbiddenError.status = 403;
      vi.mocked(batchesApi.confirmBatch).mockRejectedValue(forbiddenError);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('permission'),
          }),
        );
      });
    });

    it('shows specific error message for 409 Conflict', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );

      const conflictError: ApiError = new Error('Conflict');
      conflictError.status = 409;
      vi.mocked(batchesApi.confirmBatch).mockRejectedValue(conflictError);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('already been confirmed'),
          }),
        );
      });
    });
  });

  describe('Callback Execution', () => {
    it('calls onConfirmSuccess callback after successful confirmation', async () => {
      const user = userEvent.setup();
      const mockCallback = vi.fn();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockResolvedValue({
        id: 1,
        status: 'Level1Pending',
      } as ReportBatch);

      render(
        <ConfirmDataButton
          batchId={1}
          batchName="January 2026"
          onConfirmSuccess={mockCallback}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled();
      });
    });

    it('does NOT call callback when confirmation fails', async () => {
      const user = userEvent.setup();
      const mockCallback = vi.fn();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockRejectedValue(
        new Error('Server error'),
      );

      render(
        <ConfirmDataButton
          batchId={1}
          batchName="January 2026"
          onConfirmSuccess={mockCallback}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockCallback).not.toHaveBeenCalled();
      });
    });
  });

  describe('Dialog Behavior', () => {
    it('cancel button closes dialog without confirming', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });

      expect(batchesApi.confirmBatch).not.toHaveBeenCalled();
    });

    it('confirm button triggers API call', async () => {
      const user = userEvent.setup();
      vi.mocked(batchesApi.getBatchValidation).mockResolvedValue(
        createMockValidation(),
      );
      vi.mocked(batchesApi.confirmBatch).mockResolvedValue({
        id: 1,
        status: 'Level1Pending',
      } as ReportBatch);

      render(<ConfirmDataButton batchId={1} batchName="January 2026" />);

      await user.click(
        screen.getByRole('button', { name: /confirm data ready/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^confirm$/i }));

      expect(batchesApi.confirmBatch).toHaveBeenCalledWith(1);
    });
  });
});
