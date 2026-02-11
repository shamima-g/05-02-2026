/**
 * Epic 1, Story 7: Session Management & Authorization Checks
 * Test Suite: Role-Based Page Access Control
 *
 * Validates:
 * - Admin pages restricted to admin role
 * - Approvals page restricted to approvers
 * - Batches page restricted to operations lead
 * - Redirects to /auth/forbidden when unauthorized
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {} from '@testing-library/react';
import { getSession } from '@/lib/auth/auth-server';
import { redirect } from 'next/navigation';
import type { AuthUser } from '@/types/auth';
import { UserRole } from '@/types/roles';

// Mock dependencies
vi.mock('@/lib/auth/auth-server');
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/api/users', () => ({
  getUsers: vi.fn().mockResolvedValue([]),
}));

// Import pages after mocks
import AdminUsersPage from '@/app/admin/users/page';
import ApprovalsPage from '@/app/approvals/page';
import BatchesPage from '@/app/batches/page';

const mockGetSession = getSession as unknown as ReturnType<typeof vi.fn>;
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

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
  };
}

describe('Role-Based Page Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
  });

  describe('Admin Pages', () => {
    it('allows admin to access admin users page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.Administrator], ['users:read']),
      );

      await expect(AdminUsersPage()).resolves.toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects non-admin to forbidden page when accessing admin users', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.OperationsLead], ['batches:read']),
      );

      await expect(AdminUsersPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/auth/forbidden');
    });

    it('redirects user with no admin role to forbidden page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.ApproverL1], ['approvals:create']),
      );

      await expect(AdminUsersPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/auth/forbidden');
    });
  });

  describe('Approvals Page', () => {
    it('allows approver_level_1 to access approvals page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.ApproverL1], ['approvals:read']),
      );

      await expect(ApprovalsPage()).resolves.toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows approver_level_2 to access approvals page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.ApproverL2], ['approvals:read']),
      );

      await expect(ApprovalsPage()).resolves.toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows approver_level_3 to access approvals page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.ApproverL3], ['approvals:read']),
      );

      await expect(ApprovalsPage()).resolves.toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects non-approver to forbidden page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.OperationsLead], ['batches:read']),
      );

      await expect(ApprovalsPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/auth/forbidden');
    });
  });

  describe('Batches Page', () => {
    it('allows operations_lead to access batches page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.OperationsLead], ['batches:read']),
      );

      await expect(BatchesPage()).resolves.toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects non-operations lead to forbidden page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.ApproverL1], ['approvals:read']),
      );

      await expect(BatchesPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/auth/forbidden');
    });

    it('redirects admin without operations_lead role to forbidden page', async () => {
      mockGetSession.mockResolvedValue(
        createMockUser([UserRole.Administrator], ['users:read']),
      );

      await expect(BatchesPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/auth/forbidden');
    });
  });
});
