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
 * Login attempt record from UserLoginLog table
 */
export interface LoginAttempt {
  id: number;
  timestamp: string;
  username: string;
  userId: number | null;
  displayName: string | null;
  isSuccessful: boolean;
  status: 'success' | 'failed';
  ipAddress: string;
  location: string | null;
  userAgent: string | null;
  failureReason:
    | 'invalid_password'
    | 'user_not_found'
    | 'account_deactivated'
    | 'account_locked'
    | null;
  consecutiveFailureCount: number | null;
  flags: (
    | 'new_location'
    | 'impossible_travel'
    | 'ip_blocked'
    | 'brute_force_target'
  )[];
  accountLocked: boolean;
  lockExpiresAt: string | null;
}

/**
 * Summary counts for login activity
 */
export interface LoginActivitySummary {
  successfulLogins: number;
  failedAttempts: number;
  lockedAccounts: number;
}

/**
 * Login activity list response with pagination and summary
 */
export interface LoginActivityList {
  data: LoginAttempt[];
  meta: PaginationMeta;
  summary: LoginActivitySummary;
}

/**
 * Security alert from login activity analysis
 */
export interface SecurityAlert {
  id: number;
  type:
    | 'multiple_failed_ip'
    | 'account_locked'
    | 'brute_force'
    | 'new_location'
    | 'impossible_travel';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  ipAddress: string | null;
  username: string | null;
  userId: number | null;
  timestamp: string;
  isActive: boolean;
  resolvedAt: string | null;
}

/**
 * Security alert list response
 */
export interface SecurityAlertList {
  data: SecurityAlert[];
  meta: PaginationMeta;
}

/**
 * Login activity filters
 */
export interface LoginActivityFilters {
  from?: string;
  to?: string;
  status?: 'all' | 'success' | 'failed';
  userId?: number;
  username?: string;
  sortBy?: 'timestamp' | 'username' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Security alert filters
 */
export interface SecurityAlertFilters {
  severity?: 'all' | 'critical' | 'warning' | 'info';
  active?: boolean;
  page?: number;
  pageSize?: number;
}

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

/**
 * Get login attempt history
 * Maps to GET /audit/logins
 *
 * @param filters - Query parameters for filtering and pagination
 * @returns Paginated list of login attempts with summary
 */
export async function getLoginActivity(
  filters?: LoginActivityFilters,
): Promise<LoginActivityList> {
  return get<LoginActivityList>(
    '/audit/logins',
    filters as Record<string, string | number | boolean | undefined>,
  );
}

/**
 * Get failed login attempts
 * Maps to GET /audit/logins/failed
 *
 * @param filters - Query parameters for filtering
 * @returns Paginated list of failed login attempts
 */
export async function getFailedLogins(
  filters?: Omit<LoginActivityFilters, 'status'> & {
    failureReason?:
      | 'invalid_password'
      | 'user_not_found'
      | 'account_deactivated'
      | 'account_locked';
  },
): Promise<LoginActivityList> {
  return get<LoginActivityList>(
    '/audit/logins/failed',
    filters as Record<string, string | number | boolean | undefined>,
  );
}

/**
 * Get login history for specific user
 * Maps to GET /audit/logins/user/{userId}
 *
 * @param userId - User ID
 * @param filters - Query parameters for filtering
 * @returns User-specific login history
 */
export async function getUserLoginHistory(
  userId: number,
  filters?: Omit<LoginActivityFilters, 'userId'>,
): Promise<LoginActivityList> {
  return get<LoginActivityList>(
    `/audit/logins/user/${userId}`,
    filters as Record<string, string | number | boolean | undefined>,
  );
}

/**
 * Get security alerts from login activity
 * Maps to GET /audit/logins/alerts
 *
 * @param filters - Query parameters for filtering alerts
 * @returns Security alerts list
 */
export async function getLoginAlerts(
  filters?: SecurityAlertFilters,
): Promise<SecurityAlertList> {
  return get<SecurityAlertList>(
    '/audit/logins/alerts',
    filters as Record<string, string | number | boolean | undefined>,
  );
}

/**
 * Export login activity report to Excel
 * Maps to GET /audit/logins/export
 *
 * @param filters - Required date range and optional filters
 * @returns Excel file as Blob
 */
export async function exportLoginActivity(filters: {
  from: string;
  to: string;
  status?: 'all' | 'success' | 'failed';
  userId?: number;
}): Promise<Blob> {
  return apiClient<Blob>('/audit/logins/export', {
    method: 'GET',
    params: filters as Record<string, string | number | boolean | undefined>,
    isBinaryResponse: true,
  });
}
