/**
 * Role Management API Functions
 *
 * API wrappers for role and permission management including viewing role details,
 * permissions, and user assignments.
 * Uses the base API client for consistent error handling and request formatting.
 */

import { get } from '@/lib/api/client';
import type { UserDetail } from '@/lib/api/users';

/**
 * Permission information
 */
export interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string; // e.g., "Batch Management", "File Operations", etc.
}

/**
 * Role with associated permissions
 */
export interface RoleWithPermissions {
  id: number;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissions: Permission[];
}

/**
 * List all roles with their permissions
 *
 * @returns Array of roles with permissions
 */
export async function listRoles(): Promise<RoleWithPermissions[]> {
  return get<RoleWithPermissions[]>('/roles');
}

/**
 * Get role details with permissions
 *
 * @param roleId - Role ID
 * @returns Role with permissions
 */
export async function getRoleWithPermissions(
  roleId: number,
): Promise<RoleWithPermissions> {
  return get<RoleWithPermissions>(`/roles/${roleId}`);
}

/**
 * Get users assigned to a specific role
 *
 * @param roleId - Role ID
 * @returns Array of users with this role
 */
export async function getUsersWithRole(roleId: number): Promise<UserDetail[]> {
  // Use the existing users list endpoint with roleId filter
  const result = await get<{ items: UserDetail[] }>('/users', {
    roleId,
    pageSize: 1000, // Get all users for this role
  });
  return result.items;
}
