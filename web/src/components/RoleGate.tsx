/**
 * RoleGate Component
 *
 * A server component for conditional rendering based on user role or permissions.
 * Use this component to show/hide UI elements based on the user's authorization level.
 *
 * IMPORTANT: This component performs server-side authorization checks.
 * The role check happens on the server, not the client, ensuring secure access control.
 *
 * @example
 * ```tsx
 * // Basic usage - single role
 * <RoleGate allowedRoles={[UserRole.Administrator]}>
 *   <AdminPanel />
 * </RoleGate>
 *
 * // Multiple allowed roles
 * <RoleGate allowedRoles={[UserRole.Administrator, UserRole.OperationsLead]}>
 *   <ManagementTools />
 * </RoleGate>
 *
 * // With fallback content
 * <RoleGate
 *   allowedRoles={[UserRole.Administrator]}
 *   fallback={<p>You don't have permission to view this content.</p>}
 * >
 *   <AdminPanel />
 * </RoleGate>
 *
 * // Permission-based
 * <RoleGate requiredPermission="users.create">
 *   <CreateUserButton />
 * </RoleGate>
 *
 * // Any authenticated user
 * <RoleGate requireAuth>
 *   <UserDashboard />
 * </RoleGate>
 * ```
 */

import { getSession } from '@/lib/auth/auth-server';
import { hasAnyRole, hasPermission } from '@/lib/auth/auth-helpers';
import { UserRole } from '@/types/roles';

export type RoleGateProps = {
  /**
   * Content to render when user is authorized
   */
  children: React.ReactNode;

  /**
   * Array of roles that are allowed to view the content.
   * User must have at least one of these roles.
   */
  allowedRoles?: UserRole[];

  /**
   * Required permission (e.g., "users.create").
   * Takes precedence over allowedRoles if both are provided.
   */
  requiredPermission?: string;

  /**
   * If true, only requires authentication (no specific role).
   * Takes precedence over allowedRoles and requiredPermission.
   */
  requireAuth?: boolean;

  /**
   * Content to render when user is not authorized.
   * If not provided, renders nothing (null).
   */
  fallback?: React.ReactNode;
};

/**
 * Server component that conditionally renders children based on user role or permissions.
 *
 * Authorization checks are performed server-side using the JWT token.
 * This ensures that role-based UI visibility cannot be bypassed client-side.
 *
 * @param props - RoleGate configuration
 * @returns Children if authorized, fallback otherwise
 */
export async function RoleGate({
  children,
  allowedRoles,
  requiredPermission,
  requireAuth = false,
  fallback = null,
}: RoleGateProps): Promise<React.ReactNode> {
  const user = await getSession();

  // Check if user is authenticated
  if (!user) {
    return fallback;
  }

  // If only authentication is required (no specific role/permission)
  if (requireAuth && !allowedRoles && !requiredPermission) {
    return children;
  }

  // Check permission requirement (takes precedence)
  if (requiredPermission) {
    if (hasPermission(user, requiredPermission)) {
      return children;
    }
    return fallback;
  }

  // Check allowed roles (any match)
  if (allowedRoles && allowedRoles.length > 0) {
    if (
      hasAnyRole(
        user,
        allowedRoles.map((r) => r.toString()),
      )
    ) {
      return children;
    }
    return fallback;
  }

  // No role requirements specified, but user is authenticated
  return children;
}

export default RoleGate;
