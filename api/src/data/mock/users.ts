import bcrypt from 'bcryptjs';
import type { UserWithPassword } from '../../types/index.js';
import { roles, getPermissionsForRoles } from './roles.js';

const SALT_ROUNDS = 10;

function hashSync(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function makeUser(
  id: number,
  username: string,
  displayName: string,
  email: string,
  roleName: string,
  password: string,
): UserWithPassword {
  const role = roles.find(r => r.name === roleName);
  if (!role) throw new Error(`Unknown role: ${roleName}`);
  return {
    id,
    username,
    displayName,
    email,
    isActive: true,
    roles: [{ id: role.id, name: role.name, description: role.description, isSystemRole: role.isSystemRole }],
    passwordHash: hashSync(password),
    lastChangedUser: 'system',
    validFrom: '2026-01-01T00:00:00.000Z',
    validTo: '9999-12-31T23:59:59.999Z',
  };
}

export const mockUsers: UserWithPassword[] = [
  makeUser(1, 'sthomas', 'Sarah Thomas', 'sthomas@investinsight.com', 'OperationsLead', 'OpsLead123!'),
  makeUser(2, 'mjones', 'Mark Jones', 'mjones@investinsight.com', 'Analyst', 'Analyst123!'),
  makeUser(3, 'lpatel', 'Lisa Patel', 'lpatel@investinsight.com', 'ApproverL1', 'Approver1!'),
  makeUser(4, 'rkim', 'Robert Kim', 'rkim@investinsight.com', 'ApproverL2', 'Approver2!'),
  makeUser(5, 'cnakamura', 'Chiyo Nakamura', 'cnakamura@investinsight.com', 'ApproverL3', 'Approver3!'),
  makeUser(6, 'admin', 'System Administrator', 'admin@investinsight.com', 'Administrator', 'Admin123!'),
  makeUser(7, 'viewer', 'Report Viewer', 'viewer@investinsight.com', 'ReadOnly', 'Viewer123!'),
];

// Add a deactivated user for testing
mockUsers.push({
  ...makeUser(8, 'inactive', 'Inactive User', 'inactive@investinsight.com', 'ReadOnly', 'Inactive123!'),
  isActive: false,
});

export function findUserByUsername(username: string): UserWithPassword | undefined {
  return mockUsers.find(u => u.username === username);
}

export function findUserById(id: number): UserWithPassword | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getUserAuthInfo(user: UserWithPassword) {
  const roleNames = user.roles.map(r => r.name);
  return {
    id: String(user.id),
    username: user.username,
    displayName: user.displayName,
    email: user.email ?? '',
    roles: roleNames,
    permissions: getPermissionsForRoles(roleNames),
  };
}
