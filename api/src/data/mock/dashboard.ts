import type { PendingAction, DashboardActivity, DataQualitySummary, ReportBatch } from '../../types/index.js';

/**
 * Mock report batches in various workflow states
 */
export const mockBatches: ReportBatch[] = [
  {
    id: 1,
    reportBatchType: 'Monthly',
    reportDate: '2026-01-31',
    workflowInstanceId: 'wf-001',
    status: 'DataPreparation',
  },
  {
    id: 2,
    reportBatchType: 'Monthly',
    reportDate: '2025-12-31',
    workflowInstanceId: 'wf-002',
    status: 'Level2Pending',
  },
  {
    id: 3,
    reportBatchType: 'Monthly',
    reportDate: '2025-11-30',
    workflowInstanceId: 'wf-003',
    status: 'Approved',
  },
  {
    id: 4,
    reportBatchType: 'Weekly',
    reportDate: '2026-01-24',
    workflowInstanceId: 'wf-004',
    status: 'Level1Pending',
  },
];

/**
 * Mock activity log entries
 */
export const mockActivity: DashboardActivity[] = [
  { id: 1, action: 'Uploaded holdings file for January 2026', user: 'Sarah Thomas', timestamp: '2026-02-06T08:30:00Z', entityType: 'File', entityId: 101 },
  { id: 2, action: 'Approved December 2025 batch at Level 1', user: 'Lisa Patel', timestamp: '2026-02-06T07:45:00Z', entityType: 'ReportBatch', entityId: 2 },
  { id: 3, action: 'Updated credit rating for ISIN ZAG000106284', user: 'Mark Jones', timestamp: '2026-02-05T16:20:00Z', entityType: 'CreditRating', entityId: 42 },
  { id: 4, action: 'Created January 2026 monthly batch', user: 'Sarah Thomas', timestamp: '2026-02-05T09:00:00Z', entityType: 'ReportBatch', entityId: 1 },
  { id: 5, action: 'Exported audit trail for Q4 2025', user: 'System Administrator', timestamp: '2026-02-04T14:30:00Z', entityType: 'Audit', entityId: 0 },
  { id: 6, action: 'Added missing duration for 3 instruments', user: 'Mark Jones', timestamp: '2026-02-04T11:15:00Z', entityType: 'InstrumentDuration', entityId: 0 },
  { id: 7, action: 'Rejected November 2025 batch - missing index prices', user: 'Robert Kim', timestamp: '2026-02-03T15:00:00Z', entityType: 'ReportBatch', entityId: 3 },
  { id: 8, action: 'User viewer@investinsight.com created', user: 'System Administrator', timestamp: '2026-02-03T10:00:00Z', entityType: 'User', entityId: 7 },
];

/**
 * Mock data quality summary
 */
export const mockDataQuality: DataQualitySummary = {
  missingRatings: 8,
  missingDurations: 5,
  missingBetas: 3,
  missingIndexPrices: 2,
};

/**
 * Build role-specific pending actions
 */
export function getPendingActionsForRoles(roles: string[]): PendingAction[] {
  const actions: PendingAction[] = [];

  if (roles.includes('OperationsLead')) {
    actions.push(
      {
        id: 'pa-1',
        type: 'file_alert',
        title: '3 files pending for January 2026',
        description: 'Holdings, transactions, and income files not yet received from Asset Manager Alpha',
        link: '/batches/1/files',
        priority: 'high',
      },
      {
        id: 'pa-2',
        type: 'validation',
        title: '5 instruments missing duration values',
        description: 'Duration data required before batch can be confirmed',
        link: '/batches/1/durations?missing=true',
        priority: 'high',
      },
      {
        id: 'pa-3',
        type: 'validation',
        title: '8 instruments missing credit ratings',
        description: 'FM ratings need to be assigned',
        link: '/batches/1/ratings?missing=true',
        priority: 'medium',
      },
    );
  }

  if (roles.includes('Analyst')) {
    actions.push(
      {
        id: 'pa-4',
        type: 'master_data',
        title: '5 Instruments Missing Duration Values',
        description: 'Modified duration and YTM required for fixed income instruments',
        link: '/batches/1/durations?missing=true',
        priority: 'high',
      },
      {
        id: 'pa-5',
        type: 'master_data',
        title: '3 Instruments Missing Beta Values',
        description: 'Beta values required for equity instruments',
        link: '/batches/1/betas?missing=true',
        priority: 'medium',
      },
      {
        id: 'pa-6',
        type: 'master_data',
        title: '8 Credit Ratings Require FM Assignment',
        description: 'Internal FM ratings not yet assigned',
        link: '/batches/1/ratings?missing=true',
        priority: 'medium',
      },
    );
  }

  if (roles.includes('ApproverL1')) {
    // L1 sees batches in Level1Pending
    const l1Batches = mockBatches.filter(b => b.status === 'Level1Pending');
    for (const batch of l1Batches) {
      actions.push({
        id: `pa-l1-${batch.id}`,
        type: 'approval',
        title: `Review batch: ${batch.reportBatchType} ${batch.reportDate}`,
        description: 'Data completeness verification required at Level 1',
        link: `/batches/${batch.id}/review`,
        priority: 'high',
      });
    }
  }

  if (roles.includes('ApproverL2')) {
    // L2 sees batches in Level2Pending
    const l2Batches = mockBatches.filter(b => b.status === 'Level2Pending');
    for (const batch of l2Batches) {
      actions.push({
        id: `pa-l2-${batch.id}`,
        type: 'approval',
        title: `Review batch: ${batch.reportBatchType} ${batch.reportDate}`,
        description: 'Holdings reasonableness check required at Level 2',
        link: `/batches/${batch.id}/review`,
        priority: 'high',
      });
    }
  }

  if (roles.includes('ApproverL3')) {
    // L3 sees batches in Level3Pending
    const l3Batches = mockBatches.filter(b => b.status === 'Level3Pending');
    for (const batch of l3Batches) {
      actions.push({
        id: `pa-l3-${batch.id}`,
        type: 'approval',
        title: `Review batch: ${batch.reportBatchType} ${batch.reportDate}`,
        description: 'Executive sign-off required at Level 3',
        link: `/batches/${batch.id}/review`,
        priority: 'high',
      });
    }
  }

  if (roles.includes('Administrator')) {
    actions.push(
      {
        id: 'pa-admin-1',
        type: 'admin',
        title: '1 new user account pending setup',
        description: 'New team member requires role assignment',
        link: '/admin/users',
        priority: 'medium',
      },
      {
        id: 'pa-admin-2',
        type: 'admin',
        title: 'Approval authority expiring in 7 days',
        description: 'L2 backup approver authority expires on 2026-02-13',
        link: '/admin/approval-authorities',
        priority: 'low',
      },
    );
  }

  // ReadOnly gets no pending actions (view-only)

  return actions;
}
