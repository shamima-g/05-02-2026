/**
 * Dashboard API Functions
 *
 * API wrappers for dashboard endpoints including pending actions, active batches,
 * recent activity, and data quality summaries.
 */

import { get } from '@/lib/api/client';

/**
 * Priority level for pending actions
 */
export type PendingActionPriority = 'high' | 'medium' | 'low';

/**
 * Type of pending action based on user role
 */
export type PendingActionType =
  | 'file_alert'
  | 'validation'
  | 'approval'
  | 'master_data'
  | 'admin';

/**
 * Pending action requiring user attention
 */
export interface PendingAction {
  id: string;
  type: PendingActionType;
  title: string;
  description: string;
  link: string;
  priority: PendingActionPriority;
}

/**
 * Report batch in the workflow
 */
export interface ReportBatch {
  id: number;
  reportBatchType: string;
  reportDate: string;
  workflowInstanceId: string;
  status: string;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Response for active batches list
 */
export interface ActiveBatchesResponse {
  items: ReportBatch[];
  meta: PaginationMeta;
}

/**
 * Recent system activity entry
 */
export interface DashboardActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  entityType: string;
  entityId: number;
}

/**
 * Data quality summary showing counts of missing/invalid data
 */
export interface DataQualitySummary {
  missingRatings: number;
  missingDurations: number;
  missingBetas: number;
  missingIndexPrices: number;
}

/**
 * Get pending actions for the current user based on their roles
 *
 * @returns List of pending actions requiring user attention
 * @throws APIError if not authenticated (401)
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  return get<PendingAction[]>('/dashboard/pending-actions');
}

/**
 * Get active batches the user has access to
 *
 * @param status - Optional status filter (default: active batches)
 * @returns Paginated list of active report batches
 * @throws APIError if not authenticated (401)
 */
export async function getActiveBatches(
  status?: string,
): Promise<ActiveBatchesResponse> {
  const queryParams = status ? `?status=${status}` : '';
  return get<ActiveBatchesResponse>(`/batches${queryParams}`);
}

/**
 * Get recent system activity filtered by user role
 *
 * @param limit - Optional limit on number of activity entries (default: 10)
 * @returns List of recent dashboard activity entries
 * @throws APIError if not authenticated (401)
 */
export async function getDashboardActivity(
  limit?: number,
): Promise<DashboardActivity[]> {
  const queryParams = limit ? `?limit=${limit}` : '';
  return get<DashboardActivity[]>(`/dashboard/activity${queryParams}`);
}

/**
 * Get data quality summary showing validation warnings and missing data counts
 *
 * @returns Summary of data quality issues requiring attention
 * @throws APIError if not authenticated (401)
 */
export async function getDataQualitySummary(): Promise<DataQualitySummary> {
  return get<DataQualitySummary>('/dashboard/data-quality-summary');
}
