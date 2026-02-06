/**
 * Integration Test: Auth Helpers & Permission-Based Access Control
 *
 * Tests our authorization helper functions that use the BRD
 * role/permission model (7 roles, 38 permissions).
 */

import { describe, it, expect } from 'vitest';
import {
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/auth/auth-helpers';
import { UserRole, isValidRole } from '@/types/roles';
import type { AuthUser } from '@/types/auth';

function createMockUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 'user-1',
    username: 'testuser',
    displayName: 'Test User',
    email: 'test@example.com',
    roles: [UserRole.Analyst],
    permissions: ['view_portfolios', 'edit_master_data', 'create_reports'],
    ...overrides,
  };
}

describe('Role Utilities', () => {
  it('should validate role strings correctly', () => {
    expect(isValidRole('Administrator')).toBe(true);
    expect(isValidRole('OperationsLead')).toBe(true);
    expect(isValidRole('Analyst')).toBe(true);
    expect(isValidRole('ApproverL1')).toBe(true);
    expect(isValidRole('invalid')).toBe(false);
    expect(isValidRole('admin')).toBe(false);
  });

  it('should have all 7 BRD roles defined', () => {
    expect(Object.values(UserRole)).toHaveLength(7);
    expect(UserRole.OperationsLead).toBe('OperationsLead');
    expect(UserRole.Analyst).toBe('Analyst');
    expect(UserRole.ApproverL1).toBe('ApproverL1');
    expect(UserRole.ApproverL2).toBe('ApproverL2');
    expect(UserRole.ApproverL3).toBe('ApproverL3');
    expect(UserRole.Administrator).toBe('Administrator');
    expect(UserRole.ReadOnly).toBe('ReadOnly');
  });
});

describe('hasRole', () => {
  it('should return true when user has the specified role', () => {
    const user = createMockUser({ roles: [UserRole.Administrator] });
    expect(hasRole(user, UserRole.Administrator)).toBe(true);
  });

  it('should return false when user does not have the specified role', () => {
    const user = createMockUser({ roles: [UserRole.Analyst] });
    expect(hasRole(user, UserRole.Administrator)).toBe(false);
  });

  it('should handle users with multiple roles', () => {
    const user = createMockUser({
      roles: [UserRole.OperationsLead, UserRole.ApproverL1],
    });
    expect(hasRole(user, UserRole.OperationsLead)).toBe(true);
    expect(hasRole(user, UserRole.ApproverL1)).toBe(true);
    expect(hasRole(user, UserRole.ApproverL2)).toBe(false);
  });

  it('should return false for null or undefined user', () => {
    expect(hasRole(null, UserRole.Administrator)).toBe(false);
    expect(hasRole(undefined, UserRole.Administrator)).toBe(false);
  });
});

describe('hasAnyRole', () => {
  it('should return true when user has any of the specified roles', () => {
    const user = createMockUser({ roles: [UserRole.Analyst] });
    expect(hasAnyRole(user, [UserRole.Administrator, UserRole.Analyst])).toBe(
      true,
    );
  });

  it('should return false when user has none of the specified roles', () => {
    const user = createMockUser({ roles: [UserRole.ReadOnly] });
    expect(
      hasAnyRole(user, [UserRole.Administrator, UserRole.OperationsLead]),
    ).toBe(false);
  });

  it('should return false for null or undefined user', () => {
    expect(hasAnyRole(null, [UserRole.Administrator])).toBe(false);
    expect(hasAnyRole(undefined, [UserRole.Administrator])).toBe(false);
  });
});

describe('hasPermission', () => {
  it('should return true when user has the specified permission', () => {
    const user = createMockUser({
      permissions: ['view_portfolios', 'edit_master_data'],
    });
    expect(hasPermission(user, 'view_portfolios')).toBe(true);
  });

  it('should return false when user lacks the specified permission', () => {
    const user = createMockUser({ permissions: ['view_portfolios'] });
    expect(hasPermission(user, 'manage_users')).toBe(false);
  });

  it('should return false for null or undefined user', () => {
    expect(hasPermission(null, 'view_portfolios')).toBe(false);
    expect(hasPermission(undefined, 'view_portfolios')).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('should return true when user has any of the specified permissions', () => {
    const user = createMockUser({ permissions: ['view_portfolios'] });
    expect(hasAnyPermission(user, ['view_portfolios', 'manage_users'])).toBe(
      true,
    );
  });

  it('should return false when user has none of the specified permissions', () => {
    const user = createMockUser({ permissions: ['view_portfolios'] });
    expect(hasAnyPermission(user, ['manage_users', 'configure_system'])).toBe(
      false,
    );
  });

  it('should return false for null user', () => {
    expect(hasAnyPermission(null, ['view_portfolios'])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('should return true when user has all specified permissions', () => {
    const user = createMockUser({
      permissions: ['view_portfolios', 'edit_master_data', 'create_reports'],
    });
    expect(
      hasAllPermissions(user, ['view_portfolios', 'edit_master_data']),
    ).toBe(true);
  });

  it('should return false when user lacks any of the specified permissions', () => {
    const user = createMockUser({
      permissions: ['view_portfolios'],
    });
    expect(hasAllPermissions(user, ['view_portfolios', 'manage_users'])).toBe(
      false,
    );
  });

  it('should return false for null user', () => {
    expect(hasAllPermissions(null, ['view_portfolios'])).toBe(false);
  });
});
