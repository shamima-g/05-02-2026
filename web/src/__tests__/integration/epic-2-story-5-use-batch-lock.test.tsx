/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 5
 * - Route: N/A (custom React hook)
 * - Target File: hooks/useBatchLock.ts
 * - Page Action: create_new
 *
 * Tests for useBatchLock Custom Hook
 *
 * This hook provides lock state checking with fail-safe error handling.
 * Fetches workflow status from API and defaults to locked on error.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBatchLock } from '@/hooks/useBatchLock';
import * as batchesApi from '@/lib/api/batches';
import type { BatchWorkflowStatus } from '@/lib/api/batches';
import { WorkflowStage } from '@/lib/constants/workflow-stages';
import { BatchLockState } from '@/lib/permissions/batch-access-control';

// Mock batches API
vi.mock('@/lib/api/batches', () => ({
  getBatchWorkflowStatus: vi.fn(),
}));

const createMockWorkflowStatus = (
  overrides: Partial<BatchWorkflowStatus> = {},
): BatchWorkflowStatus => ({
  batchId: 1,
  currentStage: WorkflowStage.DataPreparation,
  isLocked: false,
  canConfirm: true,
  canApprove: false,
  pendingApprovalLevel: null,
  lastUpdated: '2026-02-13T10:00:00Z',
  ...overrides,
});

describe('Epic 2 Story 5: useBatchLock Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path - DataPreparation (Unlocked)', () => {
    it('returns unlocked state for DataPreparation batch', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.DataPreparation,
        isLocked: false,
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(false);
      expect(result.current.lockState).toBe(BatchLockState.Unlocked);
      expect(result.current.lockMessage).toBe('Batch is editable');
      expect(result.current.error).toBeNull();
    });

    it('fetches workflow status from API', async () => {
      const mockStatus = createMockWorkflowStatus();
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(batchesApi.getBatchWorkflowStatus).toHaveBeenCalledWith(1);
      });
    });

    it('starts with loading state true', () => {
      const mockStatus = createMockWorkflowStatus();
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Happy Path - Level1Pending (Locked)', () => {
    it('returns locked state for Level1Pending batch', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.Level1Pending,
        isLocked: true,
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockState).toBe(BatchLockState.Locked);
      expect(result.current.lockMessage).toBe(
        'Data locked during approval process',
      );
      expect(result.current.error).toBeNull();
    });
  });

  describe('Happy Path - Level2Pending (Locked)', () => {
    it('returns locked state for Level2Pending batch', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.Level2Pending,
        isLocked: true,
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockState).toBe(BatchLockState.Locked);
      expect(result.current.lockMessage).toBe(
        'Data locked during approval process',
      );
    });
  });

  describe('Happy Path - Level3Pending (Locked)', () => {
    it('returns locked state for Level3Pending batch', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.Level3Pending,
        isLocked: true,
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockState).toBe(BatchLockState.Locked);
    });
  });

  describe('Happy Path - Approved (Archived)', () => {
    it('returns archived state for Approved batch', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.Approved,
        isLocked: true,
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockState).toBe(BatchLockState.Archived);
      expect(result.current.lockMessage).toBe(
        'Batch is locked - already approved and published',
      );
    });
  });

  describe('Error Handling - Fail-Safe to Locked', () => {
    it('defaults to locked state when API fails', async () => {
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockState).toBe(BatchLockState.Locked);
      expect(result.current.lockMessage).toBe(
        'Unable to verify batch lock status. Data entry blocked as precaution.',
      );
      expect(result.current.error).toBe('Network error');
    });

    it('shows fail-safe message when API returns 404', async () => {
      const error = new Error('Batch not found');
      (error as Error & { status?: number }).status = 404;
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockMessage).toContain('Unable to verify');
      expect(result.current.error).toBe('Batch not found');
    });

    it('shows fail-safe message when API returns 500', async () => {
      const error = new Error('Internal server error');
      (error as Error & { status?: number }).status = 500;
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockState).toBe(BatchLockState.Locked);
      expect(result.current.error).toBe('Internal server error');
    });

    it('defaults to locked on network timeout', async () => {
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Request timeout'));

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.error).toBe('Request timeout');
    });

    it('handles unknown error types gracefully', async () => {
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.error).toBe('Failed to check lock status');
    });
  });

  describe('Null Batch ID', () => {
    it('returns locked state when batchId is null', () => {
      const { result } = renderHook(() => useBatchLock(null));

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockState).toBe(BatchLockState.Locked);
      expect(result.current.lockMessage).toBe('No active batch');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('does not call API when batchId is null', () => {
      renderHook(() => useBatchLock(null));

      expect(batchesApi.getBatchWorkflowStatus).not.toHaveBeenCalled();
    });
  });

  describe('Batch ID Changes (Re-Fetching)', () => {
    it('refetches lock state when batch ID changes', async () => {
      const mockStatus1 = createMockWorkflowStatus({
        batchId: 1,
        currentStage: WorkflowStage.DataPreparation,
      });
      const mockStatus2 = createMockWorkflowStatus({
        batchId: 2,
        currentStage: WorkflowStage.Level1Pending,
      });

      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockStatus1);

      const { result, rerender } = renderHook(({ id }) => useBatchLock(id), {
        initialProps: { id: 1 },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocked).toBe(false);
      expect(batchesApi.getBatchWorkflowStatus).toHaveBeenCalledWith(1);

      // Switch to different batch
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockStatus2);

      rerender({ id: 2 });

      await waitFor(() => {
        expect(result.current.isLocked).toBe(true);
      });

      expect(batchesApi.getBatchWorkflowStatus).toHaveBeenCalledWith(2);
    });

    it('updates lock state when batch transitions from unlocked to locked', async () => {
      const mockStatusUnlocked = createMockWorkflowStatus({
        currentStage: WorkflowStage.DataPreparation,
        isLocked: false,
      });
      const mockStatusLocked = createMockWorkflowStatus({
        currentStage: WorkflowStage.Level1Pending,
        isLocked: true,
      });

      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockStatusUnlocked);

      const { result, unmount } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLocked).toBe(false);
      });

      unmount();

      // Simulate batch confirmation (transition to Level1Pending)
      // Re-mount picks up new status (e.g., after navigation or page refresh)
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockStatusLocked);

      const { result: result2 } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result2.current.isLocked).toBe(true);
      });
    });
  });

  describe('Immediate Enforcement (No Grace Period)', () => {
    it('enforces lock immediately after status changes to Level1Pending', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.Level1Pending,
        isLocked: true,
        lastUpdated: new Date().toISOString(), // Just now
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Lock enforced immediately - no grace period
      expect(result.current.isLocked).toBe(true);
    });

    it('enforces unlock immediately after rejection to DataPreparation', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.DataPreparation,
        isLocked: false,
        lastUpdated: new Date().toISOString(), // Just now
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Unlock applied immediately - no delay
      expect(result.current.isLocked).toBe(false);
    });
  });

  describe('Loading State Management', () => {
    it('sets isLoading to false after successful fetch', async () => {
      const mockStatus = createMockWorkflowStatus();
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('sets isLoading to false after error', async () => {
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useBatchLock(1));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Lock Consistency with BatchContext', () => {
    it('returns same lock state as BatchContext isReadOnly for DataPreparation', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.DataPreparation,
        isLocked: false,
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should match BatchContext logic: DataPreparation = not locked
      expect(result.current.isLocked).toBe(false);
    });

    it('returns same lock state as BatchContext isReadOnly for Level1Pending', async () => {
      const mockStatus = createMockWorkflowStatus({
        currentStage: WorkflowStage.Level1Pending,
        isLocked: true,
      });
      (
        batchesApi.getBatchWorkflowStatus as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useBatchLock(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should match BatchContext logic: non-DataPreparation = locked
      expect(result.current.isLocked).toBe(true);
    });
  });
});
