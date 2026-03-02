/**
 * Batch Access Control Utilities
 *
 * Determines batch lock state based on workflow status.
 * Lock is absolute - no role overrides. Only DataPreparation status is editable.
 */

import { WorkflowStage } from '@/lib/constants/workflow-stages';

export enum BatchLockState {
  Unlocked,
  Locked,
  Archived,
}

/**
 * Determine if a batch is locked based on its workflow status.
 * Returns false ONLY for DataPreparation, true for everything else (fail-safe).
 */
export function isBatchLocked(status: string): boolean {
  if (!status) return true; // Fail-safe: default to locked for null/undefined/empty
  return status !== WorkflowStage.DataPreparation;
}

/**
 * Determine if batch data can be modified.
 * Inverse of isBatchLocked - true only for DataPreparation.
 */
export function canModifyBatchData(status: string): boolean {
  return !isBatchLocked(status);
}

/**
 * Get user-friendly lock message based on workflow status.
 */
export function getLockMessage(status: string): string {
  if (!status) return 'Batch is locked';

  if (status === WorkflowStage.DataPreparation) {
    return 'Batch is editable';
  }

  if (status === WorkflowStage.Approved) {
    return 'Batch is locked - already approved and published';
  }

  // All *Pending stages
  if (status.includes('Pending')) {
    return 'Data locked during approval process';
  }

  // Unknown/unexpected status - fail-safe
  return 'Batch is locked';
}

/**
 * Get the lock state enum value based on workflow status.
 */
export function getBatchLockState(status: string): BatchLockState {
  if (!status) return BatchLockState.Locked; // Fail-safe

  if (status === WorkflowStage.DataPreparation) {
    return BatchLockState.Unlocked;
  }

  if (status === WorkflowStage.Approved) {
    return BatchLockState.Archived;
  }

  // All pending stages are locked
  return BatchLockState.Locked;
}
