/**
 * InvestInsight User Roles
 * Matches BRD BR-SEC-002 and OpenAPI User.roles enum
 */
export enum UserRole {
  OperationsLead = 'OperationsLead',
  Analyst = 'Analyst',
  ApproverL1 = 'ApproverL1',
  ApproverL2 = 'ApproverL2',
  ApproverL3 = 'ApproverL3',
  Administrator = 'Administrator',
  ReadOnly = 'ReadOnly',
}

export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.OperationsLead]:
    'Full data entry, file management, workflow orchestration',
  [UserRole.Analyst]: 'Data correction and maintenance, commentary',
  [UserRole.ApproverL1]:
    'Operations level approval - data completeness verification',
  [UserRole.ApproverL2]:
    'Portfolio Manager level approval - holdings reasonableness',
  [UserRole.ApproverL3]: 'Executive level approval - final sign-off',
  [UserRole.Administrator]: 'User management, configuration, audit access',
  [UserRole.ReadOnly]: 'View access for reporting and analysis',
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
