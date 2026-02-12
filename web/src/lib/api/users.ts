/**
 * User Management API Functions
 *
 * API wrappers for user lifecycle management including create, update, deactivate, and reactivate.
 * Uses the base API client for consistent error handling and request formatting.
 */

import { get, post, put, del, apiClient } from '@/lib/api/client';

/**
 * Role information
 */
export interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  allowedPages: string[];
}

/**
 * User detail with roles and audit fields
 */
export interface UserDetail {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string | null;
  department: string | null;
  jobTitle: string | null;
  employeeId: string | null;
  managerId: number | null;
  managerName: string | null;
  isActive: boolean;
  deactivationReason: string | null;
  deactivatedAt: string | null;
  roles: Role[];
  lastLoginAt: string | null;
  createdAt: string;
  lastChangedUser: string;
  validFrom: string;
  validTo: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * User list response with pagination
 */
export interface UserList {
  items: UserDetail[];
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
 * Request to create a new user
 */
export interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  department?: string;
  jobTitle?: string;
  managerId?: number | null;
  employeeId?: string;
  roleIds: number[];
  forcePasswordChange?: boolean;
  sendWelcomeEmail?: boolean;
}

/**
 * Request to update an existing user
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  managerId?: number | null;
  employeeId?: string;
}

/**
 * Request to deactivate a user
 */
export interface DeactivateUserRequest {
  reason: string;
  transferApprovalsTo?: number | null;
}

/**
 * Request to update user roles
 * Per OpenAPI spec and BR-SEC-005: supports optional effective date and required reason for audit trail
 */
export interface UpdateUserRolesRequest {
  roleIds: number[];
  effectiveDate?: string; // ISO date string, e.g., "2026-01-06"
  reason: string; // Required for audit trail per BR-SEC-005
}

/**
 * Request to unlock a user account
 */
export interface UnlockUserAccountRequest {
  reason?: string; // Optional reason for unlocking the account
}

/**
 * Response from unlocking a user account
 */
export interface UnlockUserAccountResponse {
  message: string;
  userId: number;
  unlockedAt: string;
  unlockedBy: string;
}

/**
 * List users with optional filtering
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of users
 */
export async function listUsers(params?: {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  search?: string;
  department?: string;
  roleId?: number;
}): Promise<UserList> {
  return get<UserList>('/users', params);
}

/**
 * Create a new user
 *
 * @param data - User creation data
 * @param lastChangedUser - Username of the admin creating the user (for audit)
 * @returns Created user details
 */
export async function createUser(
  data: CreateUserRequest,
  lastChangedUser: string,
): Promise<UserDetail> {
  return post<UserDetail>('/users', data, lastChangedUser);
}

/**
 * Get user details by ID
 *
 * @param id - User ID
 * @returns User details with roles
 */
export async function getUser(id: number): Promise<UserDetail> {
  return get<UserDetail>(`/users/${id}`);
}

/**
 * Update user information
 *
 * @param id - User ID
 * @param data - Updated user data
 * @param lastChangedUser - Username of the admin updating the user (for audit)
 * @returns Updated user details
 */
export async function updateUser(
  id: number,
  data: UpdateUserRequest,
  lastChangedUser: string,
): Promise<UserDetail> {
  return put<UserDetail>(`/users/${id}`, data, lastChangedUser);
}

/**
 * Deactivate a user account
 *
 * @param id - User ID
 * @param data - Deactivation reason and optional approval transfer
 * @param lastChangedUser - Username of the admin deactivating the user (for audit)
 * @returns Deactivated user details
 */
export async function deactivateUser(
  id: number,
  data: DeactivateUserRequest,
  lastChangedUser: string,
): Promise<UserDetail> {
  return post<UserDetail>(`/users/${id}/deactivate`, data, lastChangedUser);
}

/**
 * Reactivate a deactivated user account
 *
 * @param id - User ID
 * @param lastChangedUser - Username of the admin reactivating the user (for audit)
 * @returns Reactivated user details
 */
export async function reactivateUser(
  id: number,
  lastChangedUser: string,
): Promise<UserDetail> {
  return post<UserDetail>(`/users/${id}/reactivate`, {}, lastChangedUser);
}

/**
 * Permanently delete a user
 *
 * @param id - User ID
 * @param lastChangedUser - Username of the admin deleting the user (for audit)
 * @returns void
 */
export async function deleteUser(
  id: number,
  lastChangedUser: string,
): Promise<void> {
  return del<void>(`/users/${id}`, lastChangedUser);
}

/**
 * Unlock a locked user account
 * Maps to POST /users/{id}/unlock
 *
 * @param id - User ID
 * @param data - Optional unlock request with reason
 * @returns Unlock response
 */
export async function unlockUserAccount(
  id: number,
  data?: UnlockUserAccountRequest,
): Promise<UnlockUserAccountResponse> {
  return post<UnlockUserAccountResponse>(`/users/${id}/unlock`, data || {});
}

/**
 * Get user's assigned roles
 *
 * @param id - User ID
 * @returns Array of roles
 */
export async function getUserRoles(id: number): Promise<Role[]> {
  return get<Role[]>(`/users/${id}/roles`);
}

/**
 * Update user's roles
 * Per REALIGN report Epic 1 Story 4 - Impact 4.1 RESOLVED:
 * Now supports effectiveDate (optional) and reason (required) fields
 *
 * @param id - User ID
 * @param data - New role IDs with optional effective date and required reason
 * @param lastChangedUser - Username of the admin updating roles (for audit)
 * @returns Updated array of roles
 */
export async function updateUserRoles(
  id: number,
  data: UpdateUserRolesRequest,
  lastChangedUser: string,
): Promise<Role[]> {
  return put<Role[]>(`/users/${id}/roles`, data, lastChangedUser);
}

/**
 * Get user activity log
 *
 * @param id - User ID
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of user activities
 */
export async function getUserActivity(
  id: number,
  params?: {
    page?: number;
    pageSize?: number;
    from?: string;
    to?: string;
  },
): Promise<UserActivityList> {
  return get<UserActivityList>(`/users/${id}/activity`, params);
}

/**
 * List all available roles
 *
 * @returns Array of roles
 */
export async function listRoles(): Promise<Role[]> {
  return get<Role[]>('/roles');
}

/**
 * Export user list to Excel
 *
 * @param params - Query parameters for filtering
 * @returns Excel file as Blob
 */
export async function exportUsers(params?: {
  format?: 'xlsx' | 'csv';
  isActive?: boolean;
  search?: string;
  department?: string;
  roleId?: number;
}): Promise<Blob> {
  return apiClient<Blob>('/users/export', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined>,
    isBinaryResponse: true,
  });
}
