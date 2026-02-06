import type { Permission, RoleWithPermissions } from '../../types/index.js';

export const permissions: Permission[] = [
  // Batch Management
  { id: 1, name: 'batch.create', description: 'Create new report batches', category: 'Batch' },
  { id: 2, name: 'batch.view', description: 'View report batches', category: 'Batch' },
  { id: 3, name: 'batch.confirm', description: 'Confirm data preparation complete', category: 'Batch' },

  // File Management
  { id: 4, name: 'file.upload', description: 'Upload files manually', category: 'File' },
  { id: 5, name: 'file.view', description: 'View file status', category: 'File' },
  { id: 6, name: 'file.retry', description: 'Retry failed file imports', category: 'File' },

  // Master Data
  { id: 7, name: 'instrument.create', description: 'Create instruments', category: 'MasterData' },
  { id: 8, name: 'instrument.update', description: 'Update instruments', category: 'MasterData' },
  { id: 9, name: 'instrument.view', description: 'View instruments', category: 'MasterData' },
  { id: 10, name: 'portfolio.create', description: 'Create portfolios', category: 'MasterData' },
  { id: 11, name: 'portfolio.update', description: 'Update portfolios', category: 'MasterData' },
  { id: 12, name: 'portfolio.view', description: 'View portfolios', category: 'MasterData' },
  { id: 13, name: 'indexPrice.create', description: 'Create/update index prices', category: 'MasterData' },
  { id: 14, name: 'indexPrice.view', description: 'View index prices', category: 'MasterData' },
  { id: 15, name: 'duration.create', description: 'Create/update instrument durations', category: 'MasterData' },
  { id: 16, name: 'duration.view', description: 'View instrument durations', category: 'MasterData' },
  { id: 17, name: 'beta.create', description: 'Create/update instrument betas', category: 'MasterData' },
  { id: 18, name: 'beta.view', description: 'View instrument betas', category: 'MasterData' },
  { id: 19, name: 'creditRating.update', description: 'Update credit ratings', category: 'MasterData' },
  { id: 20, name: 'creditRating.view', description: 'View credit ratings', category: 'MasterData' },
  { id: 21, name: 'customHolding.create', description: 'Create custom holdings', category: 'MasterData' },
  { id: 22, name: 'customHolding.view', description: 'View holdings', category: 'MasterData' },

  // Reference Data
  { id: 23, name: 'referenceData.manage', description: 'Manage reference data', category: 'ReferenceData' },
  { id: 24, name: 'referenceData.view', description: 'View reference data', category: 'ReferenceData' },

  // Approvals
  { id: 25, name: 'approval.level1', description: 'Approve/reject at Level 1', category: 'Approval' },
  { id: 26, name: 'approval.level2', description: 'Approve/reject at Level 2', category: 'Approval' },
  { id: 27, name: 'approval.level3', description: 'Approve/reject at Level 3', category: 'Approval' },
  { id: 28, name: 'approval.view', description: 'View approval status and history', category: 'Approval' },

  // Comments
  { id: 29, name: 'comment.create', description: 'Add report comments', category: 'Comment' },
  { id: 30, name: 'comment.view', description: 'View report comments', category: 'Comment' },

  // Administration
  { id: 31, name: 'user.manage', description: 'Create, update, deactivate users', category: 'Admin' },
  { id: 32, name: 'user.view', description: 'View user list', category: 'Admin' },
  { id: 33, name: 'role.manage', description: 'Manage role assignments', category: 'Admin' },
  { id: 34, name: 'approvalAuthority.manage', description: 'Configure approval authorities', category: 'Admin' },

  // Audit
  { id: 35, name: 'audit.view', description: 'View audit trails', category: 'Audit' },
  { id: 36, name: 'audit.export', description: 'Export audit data', category: 'Audit' },
];

function getPermissionsByNames(names: string[]): Permission[] {
  return permissions.filter(p => names.includes(p.name));
}

export const roles: RoleWithPermissions[] = [
  {
    id: 1,
    name: 'OperationsLead',
    description: 'Full data entry, file management, workflow orchestration',
    isSystemRole: true,
    permissions: getPermissionsByNames([
      'batch.create', 'batch.view', 'batch.confirm',
      'file.upload', 'file.view', 'file.retry',
      'instrument.create', 'instrument.update', 'instrument.view',
      'portfolio.create', 'portfolio.update', 'portfolio.view',
      'indexPrice.create', 'indexPrice.view',
      'duration.create', 'duration.view',
      'beta.create', 'beta.view',
      'creditRating.update', 'creditRating.view',
      'customHolding.create', 'customHolding.view',
      'referenceData.view',
      'approval.view',
      'comment.create', 'comment.view',
      'audit.view',
    ]),
  },
  {
    id: 2,
    name: 'Analyst',
    description: 'Data correction and maintenance, commentary',
    isSystemRole: true,
    permissions: getPermissionsByNames([
      'batch.view',
      'file.view',
      'instrument.update', 'instrument.view',
      'portfolio.view',
      'indexPrice.create', 'indexPrice.view',
      'duration.create', 'duration.view',
      'beta.create', 'beta.view',
      'creditRating.update', 'creditRating.view',
      'customHolding.create', 'customHolding.view',
      'referenceData.view',
      'approval.view',
      'comment.create', 'comment.view',
      'audit.view',
    ]),
  },
  {
    id: 3,
    name: 'ApproverL1',
    description: 'Operations level approval - data completeness verification',
    isSystemRole: true,
    permissions: getPermissionsByNames([
      'batch.view', 'file.view',
      'instrument.view', 'portfolio.view',
      'indexPrice.view', 'duration.view', 'beta.view',
      'creditRating.view', 'customHolding.view',
      'referenceData.view',
      'approval.level1', 'approval.view',
      'comment.view', 'audit.view',
    ]),
  },
  {
    id: 4,
    name: 'ApproverL2',
    description: 'Portfolio Manager level approval - holdings reasonableness',
    isSystemRole: true,
    permissions: getPermissionsByNames([
      'batch.view', 'file.view',
      'instrument.view', 'portfolio.view',
      'indexPrice.view', 'duration.view', 'beta.view',
      'creditRating.view', 'customHolding.view',
      'referenceData.view',
      'approval.level2', 'approval.view',
      'comment.view', 'audit.view',
    ]),
  },
  {
    id: 5,
    name: 'ApproverL3',
    description: 'Executive level approval - final sign-off',
    isSystemRole: true,
    permissions: getPermissionsByNames([
      'batch.view', 'file.view',
      'instrument.view', 'portfolio.view',
      'indexPrice.view', 'duration.view', 'beta.view',
      'creditRating.view', 'customHolding.view',
      'referenceData.view',
      'approval.level3', 'approval.view',
      'comment.view', 'audit.view',
    ]),
  },
  {
    id: 6,
    name: 'Administrator',
    description: 'User management, configuration, audit access',
    isSystemRole: true,
    permissions: getPermissionsByNames([
      'batch.view', 'file.view',
      'instrument.view', 'portfolio.view',
      'indexPrice.view', 'duration.view', 'beta.view',
      'creditRating.view', 'customHolding.view',
      'referenceData.manage', 'referenceData.view',
      'approval.view', 'comment.view',
      'user.manage', 'user.view',
      'role.manage', 'approvalAuthority.manage',
      'audit.view', 'audit.export',
    ]),
  },
  {
    id: 7,
    name: 'ReadOnly',
    description: 'View access for reporting and analysis',
    isSystemRole: true,
    permissions: getPermissionsByNames([
      'batch.view', 'file.view',
      'instrument.view', 'portfolio.view',
      'indexPrice.view', 'duration.view', 'beta.view',
      'creditRating.view', 'customHolding.view',
      'referenceData.view',
      'approval.view', 'comment.view',
    ]),
  },
];

export function getRoleByName(name: string): RoleWithPermissions | undefined {
  return roles.find(r => r.name === name);
}

export function getPermissionsForRoles(roleNames: string[]): string[] {
  const permSet = new Set<string>();
  for (const name of roleNames) {
    const role = getRoleByName(name);
    if (role) {
      for (const perm of role.permissions) {
        permSet.add(perm.name);
      }
    }
  }
  return Array.from(permSet);
}
