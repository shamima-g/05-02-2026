/**
 * Authorization Helper Functions
 *
 * Permission-based access control utilities for InvestInsight.
 * Uses the BRD role model with 38 granular permissions.
 */

import type { AuthUser } from '@/types/auth';

/**
 * Check if a user has a specific role
 */
export function hasRole(
  user: AuthUser | null | undefined,
  role: string,
): boolean {
  if (!user) return false;
  return (user.roles as string[]).includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(
  user: AuthUser | null | undefined,
  roles: string[],
): boolean {
  if (!user) return false;
  return roles.some((r) => (user.roles as string[]).includes(r));
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: AuthUser | null | undefined,
  permission: string,
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: string[],
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  user: AuthUser | null | undefined,
  permissions: string[],
): boolean {
  if (!user) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Check if a user has access to a specific page path.
 * Uses the allowedPages array from the user's role(s) (cumulative).
 */
export function hasPageAccess(
  user: AuthUser | null | undefined,
  path: string,
): boolean {
  if (!user) return false;
  if (!user.allowedPages || user.allowedPages.length === 0) return false;
  return user.allowedPages.includes(path);
}
