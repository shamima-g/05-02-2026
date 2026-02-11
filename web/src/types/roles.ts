/**
 * InvestInsight User Roles
 * Matches BRD BR-SEC-002 and OpenAPI User.roles enum
 *
 * 5 Default Roles:
 * - Analyst: All pages except Approval L1/L2/L3 and User Management
 * - ApproverL1: Approval Level 1 page only
 * - ApproverL2: Approval Level 2 page only
 * - ApproverL3: Approval Level 3 page only
 * - Administrator: Users and Roles pages only
 *
 * Roles are API/database-driven. Administrators can create custom roles
 * and edit existing roles' page access and action permissions.
 */
export enum UserRole {
  Analyst = 'Analyst',
  ApproverL1 = 'ApproverL1',
  ApproverL2 = 'ApproverL2',
  ApproverL3 = 'ApproverL3',
  Administrator = 'Administrator',
}

export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.Analyst]: 'All pages except Approval L1/L2/L3 and User Management',
  [UserRole.ApproverL1]:
    'Operations level approval - data completeness verification',
  [UserRole.ApproverL2]:
    'Portfolio Manager level approval - holdings reasonableness',
  [UserRole.ApproverL3]: 'Executive level approval - final sign-off',
  [UserRole.Administrator]: 'User management, configuration, audit access',
};

export const APPROVER_ROLES = [
  UserRole.ApproverL1,
  UserRole.ApproverL2,
  UserRole.ApproverL3,
];

export function isApproverRole(role: UserRole): boolean {
  return APPROVER_ROLES.includes(role);
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}
