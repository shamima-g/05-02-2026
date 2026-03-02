/**
 * Story Metadata:
 * - Epic: 2
 * - Story: 5
 * - Route: N/A (global permission system)
 * - Target File: lib/permissions/batch-access-control.ts
 * - Page Action: create_new
 *
 * Tests for Batch Access Control Utility Module
 *
 * This test suite validates the core permission utilities that determine
 * batch lock state based on workflow status. Lock is absolute - no role overrides.
 */
import { describe, it, expect } from 'vitest';
import {
  isBatchLocked,
  canModifyBatchData,
  getLockMessage,
  getBatchLockState,
  BatchLockState,
} from '@/lib/permissions/batch-access-control';
import { WorkflowStage } from '@/lib/constants/workflow-stages';

describe('Epic 2 Story 5: Batch Access Control - Utility Functions', () => {
  describe('isBatchLocked()', () => {
    it('returns false for DataPreparation status (unlocked)', () => {
      const result = isBatchLocked(WorkflowStage.DataPreparation);
      expect(result).toBe(false);
    });

    it('returns true for Level1Pending status (locked)', () => {
      const result = isBatchLocked(WorkflowStage.Level1Pending);
      expect(result).toBe(true);
    });

    it('returns true for Level2Pending status (locked)', () => {
      const result = isBatchLocked(WorkflowStage.Level2Pending);
      expect(result).toBe(true);
    });

    it('returns true for Level3Pending status (locked)', () => {
      const result = isBatchLocked(WorkflowStage.Level3Pending);
      expect(result).toBe(true);
    });

    it('returns true for Approved status (locked)', () => {
      const result = isBatchLocked(WorkflowStage.Approved);
      expect(result).toBe(true);
    });

    it('returns true for unknown status (fail-safe)', () => {
      const result = isBatchLocked('UnknownStatus');
      expect(result).toBe(true);
    });

    it('returns true for empty string status (fail-safe)', () => {
      const result = isBatchLocked('');
      expect(result).toBe(true);
    });
  });

  describe('canModifyBatchData()', () => {
    it('returns true for DataPreparation status (editable)', () => {
      const result = canModifyBatchData(WorkflowStage.DataPreparation);
      expect(result).toBe(true);
    });

    it('returns false for Level1Pending status (locked)', () => {
      const result = canModifyBatchData(WorkflowStage.Level1Pending);
      expect(result).toBe(false);
    });

    it('returns false for Level2Pending status (locked)', () => {
      const result = canModifyBatchData(WorkflowStage.Level2Pending);
      expect(result).toBe(false);
    });

    it('returns false for Level3Pending status (locked)', () => {
      const result = canModifyBatchData(WorkflowStage.Level3Pending);
      expect(result).toBe(false);
    });

    it('returns false for Approved status (locked)', () => {
      const result = canModifyBatchData(WorkflowStage.Approved);
      expect(result).toBe(false);
    });

    it('returns false for unknown status (fail-safe: default to locked)', () => {
      const result = canModifyBatchData('UnknownStatus');
      expect(result).toBe(false);
    });
  });

  describe('getLockMessage()', () => {
    it('returns editable message for DataPreparation status', () => {
      const message = getLockMessage(WorkflowStage.DataPreparation);
      expect(message).toBe('Batch is editable');
    });

    it('returns approval lock message for Level1Pending status', () => {
      const message = getLockMessage(WorkflowStage.Level1Pending);
      expect(message).toBe('Data locked during approval process');
    });

    it('returns approval lock message for Level2Pending status', () => {
      const message = getLockMessage(WorkflowStage.Level2Pending);
      expect(message).toBe('Data locked during approval process');
    });

    it('returns approval lock message for Level3Pending status', () => {
      const message = getLockMessage(WorkflowStage.Level3Pending);
      expect(message).toBe('Data locked during approval process');
    });

    it('returns archived message for Approved status', () => {
      const message = getLockMessage(WorkflowStage.Approved);
      expect(message).toBe('Batch is locked - already approved and published');
    });

    it('returns generic lock message for unknown status', () => {
      const message = getLockMessage('UnknownStatus');
      expect(message).toBe('Batch is locked');
    });
  });

  describe('getBatchLockState()', () => {
    it('returns Unlocked for DataPreparation status', () => {
      const state = getBatchLockState(WorkflowStage.DataPreparation);
      expect(state).toBe(BatchLockState.Unlocked);
    });

    it('returns Locked for Level1Pending status', () => {
      const state = getBatchLockState(WorkflowStage.Level1Pending);
      expect(state).toBe(BatchLockState.Locked);
    });

    it('returns Locked for Level2Pending status', () => {
      const state = getBatchLockState(WorkflowStage.Level2Pending);
      expect(state).toBe(BatchLockState.Locked);
    });

    it('returns Locked for Level3Pending status', () => {
      const state = getBatchLockState(WorkflowStage.Level3Pending);
      expect(state).toBe(BatchLockState.Locked);
    });

    it('returns Archived for Approved status', () => {
      const state = getBatchLockState(WorkflowStage.Approved);
      expect(state).toBe(BatchLockState.Archived);
    });

    it('returns Locked for unknown status (fail-safe)', () => {
      const state = getBatchLockState('UnknownStatus');
      expect(state).toBe(BatchLockState.Locked);
    });
  });

  describe('Lock Enforcement - Absolute (No Role Override)', () => {
    it('locks Level1Pending batch regardless of user role', () => {
      // Lock is absolute - even if user is Admin or Level1Approver
      const isLocked = isBatchLocked(WorkflowStage.Level1Pending);
      expect(isLocked).toBe(true);

      // No role parameter exists - lock is status-based only
      const canModify = canModifyBatchData(WorkflowStage.Level1Pending);
      expect(canModify).toBe(false);
    });

    it('locks Approved batch with no exceptions', () => {
      // Approved batches are permanently locked
      const isLocked = isBatchLocked(WorkflowStage.Approved);
      expect(isLocked).toBe(true);

      const canModify = canModifyBatchData(WorkflowStage.Approved);
      expect(canModify).toBe(false);
    });

    it('only allows modification in DataPreparation status', () => {
      // Only DataPreparation is editable
      const canModify = canModifyBatchData(WorkflowStage.DataPreparation);
      expect(canModify).toBe(true);

      // All approval stages are locked
      expect(canModifyBatchData(WorkflowStage.Level1Pending)).toBe(false);
      expect(canModifyBatchData(WorkflowStage.Level2Pending)).toBe(false);
      expect(canModifyBatchData(WorkflowStage.Level3Pending)).toBe(false);
      expect(canModifyBatchData(WorkflowStage.Approved)).toBe(false);
    });
  });

  describe('Fail-Safe Behavior', () => {
    it('defaults to locked for null status', () => {
      const isLocked = isBatchLocked(null as unknown as string);
      expect(isLocked).toBe(true);
    });

    it('defaults to locked for undefined status', () => {
      const isLocked = isBatchLocked(undefined as unknown as string);
      expect(isLocked).toBe(true);
    });

    it('prevents modification when status is uncertain', () => {
      const canModify = canModifyBatchData('');
      expect(canModify).toBe(false);
    });

    it('provides generic lock message for uncertain status', () => {
      const message = getLockMessage('');
      expect(message).toBe('Batch is locked');
    });
  });

  describe('Immediate Enforcement', () => {
    it('enforces lock immediately on transition from DataPreparation to Level1Pending', () => {
      // Before confirmation
      const beforeLock = isBatchLocked(WorkflowStage.DataPreparation);
      expect(beforeLock).toBe(false);

      // After confirmation (no grace period)
      const afterLock = isBatchLocked(WorkflowStage.Level1Pending);
      expect(afterLock).toBe(true);
    });

    it('enforces unlock immediately on rejection from Level1Pending to DataPreparation', () => {
      // During approval
      const whileLocked = isBatchLocked(WorkflowStage.Level1Pending);
      expect(whileLocked).toBe(true);

      // After rejection (no delay)
      const afterRejection = isBatchLocked(WorkflowStage.DataPreparation);
      expect(afterRejection).toBe(false);
    });
  });

  describe('Multi-Stage Lock Consistency', () => {
    it('maintains lock through entire approval workflow', () => {
      // All approval stages must be locked
      const stages = [
        WorkflowStage.Level1Pending,
        WorkflowStage.Level2Pending,
        WorkflowStage.Level3Pending,
      ];

      stages.forEach((stage) => {
        expect(isBatchLocked(stage)).toBe(true);
        expect(canModifyBatchData(stage)).toBe(false);
        expect(getBatchLockState(stage)).toBe(BatchLockState.Locked);
      });
    });

    it('only unlocks in DataPreparation stage', () => {
      const unlockedStages = [WorkflowStage.DataPreparation];
      const lockedStages = [
        WorkflowStage.Level1Pending,
        WorkflowStage.Level2Pending,
        WorkflowStage.Level3Pending,
        WorkflowStage.Approved,
      ];

      unlockedStages.forEach((stage) => {
        expect(isBatchLocked(stage)).toBe(false);
      });

      lockedStages.forEach((stage) => {
        expect(isBatchLocked(stage)).toBe(true);
      });
    });
  });
});
