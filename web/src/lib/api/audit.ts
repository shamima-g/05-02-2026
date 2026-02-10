/**
 * Audit Trail API Functions
 *
 * API wrappers for audit trail access including viewing, filtering, and exporting audit records.
 * Uses the base API client for consistent error handling and request formatting.
 */

import { get, apiClient } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/api/users';

/**
 * Field change detail in audit trail
 */
export interface AuditFieldChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

/**
 * Audit trail entry from temporal tables
 */
export interface AuditTrailEntry {
  entityType: string;
  entityId: number;
  changeType: 'Created' | 'Updated' | 'Deleted';
  changedBy: string;
  changedAt: string;
  changes: AuditFieldChange[];
}

/**
 * Audit trail list response with pagination
 */
export interface AuditTrailList {
  items: AuditTrailEntry[];
  meta: PaginationMeta;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  id: number;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  ipAddress: string | null;
  timestamp: string;
}

/**
 * User activity list response with pagination
 */
export interface UserActivityList {
  items: UserActivity[];
  meta: PaginationMeta;
}

/**
 * Audit filters for querying
 */
export interface AuditFilters {
  entityType?: string;
  entityId?: number;
  changeType?: string;
  from?: string; // ISO date-time
  to?: string; // ISO date-time
  user?: string;
  page?: number;
  pageSize?: number;
}

/**
 * User activity summary statistics
 */
export interface UserActivitySummary {
  userId: number;
  username: string;
  displayName: string;
  totalActions: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  mostCommonAction: string;
  actionCounts: Record<string, number>;
}

/**
 * Entity types that can be audited
 */
export type AuditableEntityType =
  | 'Instrument'
  | 'Portfolio'
  | 'AssetManager'
  | 'Currency'
  | 'Country'
  | 'Index'
  | 'CreditRating'
  | 'InstrumentDuration'
  | 'InstrumentBeta'
  | 'IndexPrice';

/**
 * Query audit trail with filtering
 * Maps to GET /audit/changes
 *
 * @param filters - Query parameters for filtering and pagination
 * @returns Paginated list of audit trail entries
 */
export async function queryAuditTrail(
  filters: AuditFilters,
): Promise<AuditTrailList> {
  return get<AuditTrailList>(
    '/audit/changes',
    filters as Record<string, string | number | boolean | undefined>,
  );
}

/**
 * Export audit trail to Excel
 * Maps to GET /audit/export
 *
 * @param filters - Query parameters for filtering
 * @returns Excel file as Blob
 */
export async function exportAuditTrail(filters: {
  entityType: string;
  from: string;
  to: string;
}): Promise<Blob> {
  return apiClient<Blob>('/audit/export', {
    method: 'GET',
    params: filters as Record<string, string | number | boolean | undefined>,
    isBinaryResponse: true,
  });
}

/**
 * Get user activity log
 * Maps to GET /users/{id}/activity
 *
 * @param userId - User ID
 * @param filters - Query parameters for filtering and pagination
 * @returns Paginated list of user activities
 */
export async function getUserActivity(
  userId: number,
  filters?: {
    page?: number;
    pageSize?: number;
    from?: string;
    to?: string;
  },
): Promise<UserActivityList> {
  return get<UserActivityList>(
    `/users/${userId}/activity`,
    filters as Record<string, string | number | boolean | undefined>,
  );
}

/**
 * Get user change history from temporal tables
 * Maps to GET /users/{id}/history
 *
 * @param userId - User ID
 * @returns Array of audit trail entries
 */
export async function getUserHistory(
  userId: number,
): Promise<AuditTrailEntry[]> {
  return get<AuditTrailEntry[]>(`/users/${userId}/history`);
}
