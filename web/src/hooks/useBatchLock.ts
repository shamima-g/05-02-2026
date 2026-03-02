/**
 * useBatchLock Hook
 *
 * Fetches and returns batch lock state with fail-safe error handling.
 * Defaults to locked on error to prevent accidental data modification.
 */

import { useState, useEffect } from 'react';
import { getBatchWorkflowStatus } from '@/lib/api/batches';
import {
  isBatchLocked,
  getLockMessage,
  getBatchLockState,
  BatchLockState,
} from '@/lib/permissions/batch-access-control';

export interface BatchLockInfo {
  isLocked: boolean;
  lockState: BatchLockState;
  lockMessage: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to check lock status of a batch.
 * Returns locked state immediately for null batchId.
 * Fetches workflow status from API for valid batchId.
 * Defaults to locked on error (fail-safe).
 */
export function useBatchLock(batchId: number | null): BatchLockInfo {
  // Initialize state based on whether we have a batchId
  const [lockInfo, setLockInfo] = useState<BatchLockInfo>(() => {
    if (batchId === null) {
      return {
        isLocked: true,
        lockState: BatchLockState.Locked,
        lockMessage: 'No active batch',
        isLoading: false,
        error: null,
      };
    }
    return {
      isLocked: true,
      lockState: BatchLockState.Locked,
      lockMessage: 'Checking batch status...',
      isLoading: true,
      error: null,
    };
  });

  useEffect(() => {
    // If no batch ID, don't fetch (initial state is already set correctly)
    if (batchId === null) {
      return;
    }

    // Fetch workflow status
    const fetchLockStatus = async () => {
      try {
        const status = await getBatchWorkflowStatus(batchId);
        const currentStage = status.currentStage;

        setLockInfo({
          isLocked: isBatchLocked(currentStage),
          lockState: getBatchLockState(currentStage),
          lockMessage: getLockMessage(currentStage),
          isLoading: false,
          error: null,
        });
      } catch (err) {
        // Fail-safe: default to locked on error
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to check lock status';

        setLockInfo({
          isLocked: true,
          lockState: BatchLockState.Locked,
          lockMessage:
            'Unable to verify batch lock status. Data entry blocked as precaution.',
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    fetchLockStatus();
  }, [batchId]);

  return lockInfo;
}
