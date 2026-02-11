/**
 * Integration Test: RoleGate Component
 *
 * Tests for the RoleGate server component that conditionally renders
 * UI elements based on user role and permission authorization.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserRole } from '@/types/roles';
import type { AuthUser } from '@/types/auth';

// Mock auth-server before imports
vi.mock('@/lib/auth/auth-server', () => ({
  getSession: vi.fn(),
}));

import { getSession } from '@/lib/auth/auth-server';
import { RoleGate } from '@/components/RoleGate';

const mockGetSession = getSession as ReturnType<typeof vi.fn>;

function createMockUser(
  roles: UserRole[],
  permissions: string[] = [],
): AuthUser {
  return {
    id: 'user-1',
    username: 'testuser',
    displayName: 'Test User',
    email: 'test@example.com',
    roles,
    permissions,
    allowedPages: [],
  };
}

describe('RoleGate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renders children when authorized', () => {
    it('should render when user has exact required role', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.Administrator]),
      );

      const result = await RoleGate({
        allowedRoles: [UserRole.Administrator],
        children: <div>Admin Panel</div>,
      });

      expect(result).toEqual(<div>Admin Panel</div>);
    });

    it('should render when user role is in allowedRoles list', async () => {
      mockGetSession.mockResolvedValue(createMockUser([UserRole.Analyst]));

      const result = await RoleGate({
        allowedRoles: [UserRole.Administrator, UserRole.Analyst],
        children: <div>Management Tools</div>,
      });

      expect(result).toEqual(<div>Management Tools</div>);
    });

    it('should render when user has required permission', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser(
          [UserRole.Analyst],
          ['view_portfolios', 'edit_master_data'],
        ),
      );

      const result = await RoleGate({
        requiredPermission: 'view_portfolios',
        children: <div>Portfolio View</div>,
      });

      expect(result).toEqual(<div>Portfolio View</div>);
    });

    it('should render for any authenticated user with requireAuth', async () => {
      mockGetSession.mockResolvedValue(createMockUser([UserRole.ApproverL1]));

      const result = await RoleGate({
        requireAuth: true,
        children: <div>Authenticated Content</div>,
      });

      expect(result).toEqual(<div>Authenticated Content</div>);
    });

    it('should render when no role requirements specified', async () => {
      mockGetSession.mockResolvedValue(createMockUser([UserRole.Analyst]));

      const result = await RoleGate({
        children: <div>Default Content</div>,
      });

      expect(result).toEqual(<div>Default Content</div>);
    });
  });

  describe('hides children when unauthorized', () => {
    it('should return null when user lacks required role', async () => {
      mockGetSession.mockResolvedValue(createMockUser([UserRole.ApproverL1]));

      const result = await RoleGate({
        allowedRoles: [UserRole.Administrator],
        children: <div>Admin Panel</div>,
      });

      expect(result).toBeNull();
    });

    it('should return null when user lacks required permission', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.ApproverL1], ['view_portfolios']),
      );

      const result = await RoleGate({
        requiredPermission: 'manage_users',
        children: <div>User Management</div>,
      });

      expect(result).toBeNull();
    });

    it('should return null for unauthenticated user', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await RoleGate({
        allowedRoles: [UserRole.Analyst],
        children: <div>User Content</div>,
      });

      expect(result).toBeNull();
    });
  });

  describe('fallback content', () => {
    it('should show fallback when user lacks required role', async () => {
      mockGetSession.mockResolvedValue(createMockUser([UserRole.ApproverL1]));
      const fallback = <div>Access Denied</div>;

      const result = await RoleGate({
        allowedRoles: [UserRole.Administrator],
        children: <div>Admin Panel</div>,
        fallback,
      });

      expect(result).toEqual(fallback);
    });

    it('should show fallback for unauthenticated user', async () => {
      mockGetSession.mockResolvedValue(null);
      const fallback = <p>Please log in</p>;

      const result = await RoleGate({
        requireAuth: true,
        children: <div>Dashboard</div>,
        fallback,
      });

      expect(result).toEqual(fallback);
    });

    it('should render children (not fallback) when authorized', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.Administrator]),
      );
      const children = <div>Admin Panel</div>;
      const fallback = <div>Access Denied</div>;

      const result = await RoleGate({
        allowedRoles: [UserRole.Administrator],
        children,
        fallback,
      });

      expect(result).toEqual(children);
    });
  });
});
