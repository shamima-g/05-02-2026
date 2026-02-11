/**
 * Mock API Route Handler (Development Only)
 *
 * Catch-all route that simulates the backend API for local development/testing.
 * Handles auth, users, roles, dashboard, approvals, audit, and batch endpoints.
 *
 * Test Users (all passwords: "password"):
 *   admin      - Administrator
 *   opsleader  - Operations Lead
 *   analyst    - Analyst
 *   approver1  - Approver Level 1
 *   approver2  - Approver Level 2
 *   approver3  - Approver Level 3
 *   readonly   - Read Only
 */

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }),
  );
  const sig = base64url('mock-signature');
  return `${header}.${body}.${sig}`;
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function pathSegments(request: NextRequest): string[] {
  const url = new URL(request.url);
  // pathname = /api/v1/auth/login -> segments after /api/v1/ = ["auth","login"]
  const parts = url.pathname.replace(/^\/api\/v1\//, '').split('/');
  return parts.filter(Boolean);
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface MockUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  department: string;
  jobTitle: string;
  employeeId: string;
  roles: {
    id: number;
    name: string;
    description: string;
    isSystemRole: boolean;
  }[];
  permissions: string[];
  isActive: boolean;
  deactivationReason: string | null;
  deactivatedAt: string | null;
  managerId: number | null;
  managerName: string | null;
  lastLoginAt: string;
  createdAt: string;
  lastChangedUser: string;
  validFrom: string;
  validTo: string;
}

const ROLES = [
  {
    id: 1,
    name: 'Administrator',
    description: 'User management, configuration, audit access',
    isSystemRole: true,
  },
  {
    id: 2,
    name: 'OperationsLead',
    description: 'Full data entry, file management, workflow orchestration',
    isSystemRole: false,
  },
  {
    id: 3,
    name: 'Analyst',
    description: 'Data correction and maintenance, commentary',
    isSystemRole: false,
  },
  {
    id: 4,
    name: 'ApproverL1',
    description: 'Operations level approval - data completeness verification',
    isSystemRole: false,
  },
  {
    id: 5,
    name: 'ApproverL2',
    description: 'Portfolio Manager level approval - holdings reasonableness',
    isSystemRole: false,
  },
  {
    id: 6,
    name: 'ApproverL3',
    description: 'Executive level approval - final sign-off',
    isSystemRole: false,
  },
  {
    id: 7,
    name: 'ReadOnly',
    description: 'View access for reporting and analysis',
    isSystemRole: false,
  },
];

const PERMISSIONS: Record<string, string[]> = {
  Administrator: [
    'users.create',
    'users.read',
    'users.update',
    'users.deactivate',
    'roles.manage',
    'audit.view',
    'audit.export',
    'config.manage',
  ],
  OperationsLead: [
    'batch.create',
    'batch.view',
    'batch.confirm',
    'instrument.create',
    'instrument.update',
    'instrument.view',
    'instrument.delete',
    'portfolio.view',
    'file.upload',
    'file.download',
  ],
  Analyst: [
    'batch.view',
    'instrument.view',
    'instrument.update',
    'portfolio.view',
    'commentary.create',
    'commentary.update',
  ],
  ApproverL1: [
    'batch.view',
    'batch.approve',
    'instrument.view',
    'portfolio.view',
    'approval.level1',
  ],
  ApproverL2: [
    'batch.view',
    'batch.approve',
    'instrument.view',
    'portfolio.view',
    'approval.level2',
  ],
  ApproverL3: [
    'batch.view',
    'batch.approve',
    'instrument.view',
    'portfolio.view',
    'approval.level3',
  ],
  ReadOnly: ['batch.view', 'instrument.view', 'portfolio.view', 'report.view'],
};

const ROLE_PERMISSIONS: Record<
  number,
  { id: number; name: string; description: string; category: string }[]
> = {
  1: PERMISSIONS.Administrator.map((p, i) => ({
    id: 100 + i,
    name: p,
    description: `Permission: ${p}`,
    category: 'Administration',
  })),
  2: PERMISSIONS.OperationsLead.map((p, i) => ({
    id: 200 + i,
    name: p,
    description: `Permission: ${p}`,
    category: 'Operations',
  })),
  3: PERMISSIONS.Analyst.map((p, i) => ({
    id: 300 + i,
    name: p,
    description: `Permission: ${p}`,
    category: 'Analysis',
  })),
  4: PERMISSIONS.ApproverL1.map((p, i) => ({
    id: 400 + i,
    name: p,
    description: `Permission: ${p}`,
    category: 'Approvals',
  })),
  5: PERMISSIONS.ApproverL2.map((p, i) => ({
    id: 500 + i,
    name: p,
    description: `Permission: ${p}`,
    category: 'Approvals',
  })),
  6: PERMISSIONS.ApproverL3.map((p, i) => ({
    id: 600 + i,
    name: p,
    description: `Permission: ${p}`,
    category: 'Approvals',
  })),
  7: PERMISSIONS.ReadOnly.map((p, i) => ({
    id: 700 + i,
    name: p,
    description: `Permission: ${p}`,
    category: 'Viewing',
  })),
};

function makeUser(
  id: number,
  username: string,
  first: string,
  last: string,
  dept: string,
  job: string,
  roleIds: number[],
  active = true,
): MockUser {
  const userRoles = roleIds.map((rid) => ROLES.find((r) => r.id === rid)!);
  const perms = userRoles.flatMap((r) => PERMISSIONS[r.name] || []);
  return {
    id,
    username,
    firstName: first,
    lastName: last,
    displayName: `${first} ${last}`,
    email: `${username}@investinsight.com`,
    department: dept,
    jobTitle: job,
    employeeId: `EMP-${String(id).padStart(4, '0')}`,
    roles: userRoles,
    permissions: [...new Set(perms)],
    isActive: active,
    deactivationReason: active ? null : 'Account deactivated for testing',
    deactivatedAt: active ? null : '2026-02-01T10:00:00Z',
    managerId: null,
    managerName: null,
    lastLoginAt: '2026-02-11T08:00:00Z',
    createdAt: '2026-01-01T10:00:00Z',
    lastChangedUser: 'system',
    validFrom: '2026-01-01T10:00:00Z',
    validTo: '9999-12-31T23:59:59Z',
  };
}

const MOCK_USERS: MockUser[] = [
  makeUser(1, 'admin', 'Sarah', 'Chen', 'IT', 'System Administrator', [1]),
  makeUser(
    2,
    'opsleader',
    'Michael',
    'Rodriguez',
    'Operations',
    'Operations Lead',
    [2],
  ),
  makeUser(
    3,
    'analyst',
    'Emily',
    'Johnson',
    'Operations',
    'Investment Analyst',
    [3],
  ),
  makeUser(4, 'approver1', 'David', 'Kim', 'Operations', 'Senior Analyst', [4]),
  makeUser(5, 'approver2', 'Lisa', 'Wang', 'Finance', 'Portfolio Manager', [5]),
  makeUser(
    6,
    'approver3',
    'James',
    'Thompson',
    'Finance',
    'Chief Investment Officer',
    [6],
  ),
  makeUser(
    7,
    'readonly',
    'Anna',
    'Mueller',
    'Compliance',
    'Compliance Officer',
    [7],
  ),
  makeUser(
    8,
    'multiuser',
    'Robert',
    'Brown',
    'Operations',
    'Senior Operations Lead',
    [2, 4],
  ),
  makeUser(9, 'inactive', 'Tom', 'Wilson', 'IT', 'Former Analyst', [3], false),
];

const TEST_PASSWORDS: Record<string, string> = {
  admin: 'password',
  opsleader: 'password',
  analyst: 'password',
  approver1: 'password',
  approver2: 'password',
  approver3: 'password',
  readonly: 'password',
  multiuser: 'password',
  inactive: 'password',
};

const MOCK_APPROVAL_AUTHORITIES = [
  {
    id: 1,
    userId: 4,
    username: 'approver1',
    displayName: 'David Kim',
    email: 'approver1@investinsight.com',
    roleName: 'ApproverL1',
    approvalLevel: 1 as const,
    isBackup: false,
    isActive: true,
    isOutOfOffice: false,
    outOfOfficeUntil: null,
    backupApprovers: [],
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    assignedBy: 'admin',
    assignedAt: '2026-01-01T10:00:00Z',
    pendingApprovalCount: 3,
  },
  {
    id: 2,
    userId: 5,
    username: 'approver2',
    displayName: 'Lisa Wang',
    email: 'approver2@investinsight.com',
    roleName: 'ApproverL2',
    approvalLevel: 2 as const,
    isBackup: false,
    isActive: true,
    isOutOfOffice: false,
    outOfOfficeUntil: null,
    backupApprovers: [],
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    assignedBy: 'admin',
    assignedAt: '2026-01-01T10:00:00Z',
    pendingApprovalCount: 2,
  },
  {
    id: 3,
    userId: 6,
    username: 'approver3',
    displayName: 'James Thompson',
    email: 'approver3@investinsight.com',
    roleName: 'ApproverL3',
    approvalLevel: 3 as const,
    isBackup: false,
    isActive: true,
    isOutOfOffice: false,
    outOfOfficeUntil: null,
    backupApprovers: [],
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    assignedBy: 'admin',
    assignedAt: '2026-01-01T10:00:00Z',
    pendingApprovalCount: 1,
  },
];

const MOCK_APPROVAL_RULES = [
  { level: 1, rule: 'any_one', consensusRequired: null },
  { level: 2, rule: 'specific', consensusRequired: null },
  { level: 3, rule: 'specific', consensusRequired: null },
];

function getUserFromToken(request: NextRequest): MockUser | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return MOCK_USERS.find((u) => u.username === payload.username) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route Handlers
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const seg = pathSegments(request);
  const path = seg.join('/');

  // GET /auth/me
  if (path === 'auth/me') {
    const user = getUserFromToken(request);
    if (!user) return json({ message: 'Unauthorized' }, 401);
    return json({
      id: String(user.id),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      roles: user.roles.map((r) => r.name),
      permissions: user.permissions,
    });
  }

  // GET /users
  if (path === 'users') {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const isActive = url.searchParams.get('isActive');
    const roleId = url.searchParams.get('roleId');
    const department = url.searchParams.get('department');

    let filtered = MOCK_USERS;
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.displayName.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search),
      );
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filtered = filtered.filter((u) => u.isActive === (isActive === 'true'));
    }
    if (roleId) {
      const rid = Number(roleId);
      filtered = filtered.filter((u) => u.roles.some((r) => r.id === rid));
    }
    if (department) {
      filtered = filtered.filter((u) => u.department === department);
    }

    return json({
      items: filtered,
      meta: {
        page: 1,
        pageSize: 25,
        totalItems: filtered.length,
        totalPages: 1,
      },
    });
  }

  // GET /users/export
  if (path === 'users/export') {
    return new NextResponse('mock-excel-data', {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
  }

  // GET /users/:id
  if (seg[0] === 'users' && seg.length === 2 && !isNaN(Number(seg[1]))) {
    const user = MOCK_USERS.find((u) => u.id === Number(seg[1]));
    if (!user) return json({ message: 'User not found' }, 404);
    return json(user);
  }

  // GET /users/:id/roles
  if (seg[0] === 'users' && seg.length === 3 && seg[2] === 'roles') {
    const user = MOCK_USERS.find((u) => u.id === Number(seg[1]));
    if (!user) return json({ message: 'User not found' }, 404);
    return json(user.roles);
  }

  // GET /users/:id/activity
  if (seg[0] === 'users' && seg.length === 3 && seg[2] === 'activity') {
    return json({
      items: [
        {
          id: 1,
          action: 'Login',
          entityType: null,
          entityId: null,
          details: 'User logged in from 192.168.1.100',
          ipAddress: '192.168.1.100',
          timestamp: '2026-02-11T08:00:00Z',
        },
        {
          id: 2,
          action: 'ViewDashboard',
          entityType: null,
          entityId: null,
          details: 'Viewed main dashboard',
          ipAddress: '192.168.1.100',
          timestamp: '2026-02-11T08:01:00Z',
        },
        {
          id: 3,
          action: 'ViewBatch',
          entityType: 'ReportBatch',
          entityId: 1,
          details: 'Viewed batch Monthly Jan 2026',
          ipAddress: '192.168.1.100',
          timestamp: '2026-02-11T08:05:00Z',
        },
      ],
      meta: { page: 1, pageSize: 25, totalItems: 3, totalPages: 1 },
    });
  }

  // GET /users/:id/history
  if (seg[0] === 'users' && seg.length === 3 && seg[2] === 'history') {
    return json([
      {
        entityType: 'User',
        entityId: Number(seg[1]),
        changeType: 'Created',
        changedBy: 'admin',
        changedAt: '2026-01-01T10:00:00Z',
        changes: [{ field: 'username', oldValue: null, newValue: 'user' }],
      },
    ]);
  }

  // GET /roles
  if (path === 'roles') {
    return json(
      ROLES.map((r) => ({
        ...r,
        permissions: ROLE_PERMISSIONS[r.id] || [],
      })),
    );
  }

  // GET /roles/:id
  if (seg[0] === 'roles' && seg.length === 2) {
    const role = ROLES.find((r) => r.id === Number(seg[1]));
    if (!role) return json({ message: 'Role not found' }, 404);
    return json({ ...role, permissions: ROLE_PERMISSIONS[role.id] || [] });
  }

  // GET /dashboard/pending-actions
  if (path === 'dashboard/pending-actions') {
    return json([
      {
        id: '1',
        type: 'approval',
        title: 'Pending Level 1 Approval',
        description: 'Monthly Report - January 2026 awaiting L1 approval',
        link: '/approvals',
        priority: 'high',
      },
      {
        id: '2',
        type: 'validation',
        title: 'Data Validation Warnings',
        description: '3 instruments missing credit ratings',
        link: '/batches/1',
        priority: 'medium',
      },
      {
        id: '3',
        type: 'file_alert',
        title: 'New File Uploaded',
        description: 'Bloomberg data file uploaded by Operations',
        link: '/batches/1',
        priority: 'low',
      },
    ]);
  }

  // GET /report-batches
  if (seg[0] === 'report-batches') {
    return json({
      items: [
        {
          id: 1,
          reportBatchType: 'Monthly',
          reportDate: '2026-01-31',
          workflowInstanceId: 'wf-001',
          status: 'DataPreparation',
        },
        {
          id: 2,
          reportBatchType: 'Monthly',
          reportDate: '2025-12-31',
          workflowInstanceId: 'wf-002',
          status: 'PendingLevel1Approval',
        },
        {
          id: 3,
          reportBatchType: 'Weekly',
          reportDate: '2026-02-07',
          workflowInstanceId: 'wf-003',
          status: 'Complete',
        },
      ],
      meta: { page: 1, pageSize: 25, totalItems: 3, totalPages: 1 },
    });
  }

  // GET /dashboard/activity
  if (path === 'dashboard/activity') {
    return json([
      {
        id: 1,
        action: 'Uploaded Bloomberg data file',
        user: 'Michael Rodriguez',
        timestamp: '2026-02-11T07:45:00Z',
        entityType: 'File',
        entityId: 101,
      },
      {
        id: 2,
        action: 'Updated instrument AAPL bond duration',
        user: 'Emily Johnson',
        timestamp: '2026-02-11T07:30:00Z',
        entityType: 'Instrument',
        entityId: 42,
      },
      {
        id: 3,
        action: 'Approved Level 1 for Dec 2025 batch',
        user: 'David Kim',
        timestamp: '2026-02-10T16:00:00Z',
        entityType: 'ReportBatch',
        entityId: 2,
      },
      {
        id: 4,
        action: 'Created new user: Anna Mueller',
        user: 'Sarah Chen',
        timestamp: '2026-02-10T14:00:00Z',
        entityType: 'User',
        entityId: 7,
      },
    ]);
  }

  // GET /dashboard/data-quality-summary
  if (path === 'dashboard/data-quality-summary') {
    return json({
      missingRatings: 12,
      missingDurations: 5,
      missingBetas: 3,
      missingIndexPrices: 8,
    });
  }

  // GET /approval-authorities
  if (seg[0] === 'approval-authorities' && seg.length === 1) {
    return json(MOCK_APPROVAL_AUTHORITIES);
  }

  // GET /approval-authorities/rules
  if (path === 'approval-authorities/rules') {
    return json(MOCK_APPROVAL_RULES);
  }

  // GET /audit/changes
  if (path === 'audit/changes') {
    return json({
      items: [
        {
          entityType: 'User',
          entityId: 3,
          changeType: 'Updated',
          changedBy: 'admin',
          changedAt: '2026-02-11T08:00:00Z',
          changes: [
            {
              field: 'email',
              oldValue: 'old@test.com',
              newValue: 'analyst@investinsight.com',
            },
          ],
        },
        {
          entityType: 'Instrument',
          entityId: 42,
          changeType: 'Updated',
          changedBy: 'analyst',
          changedAt: '2026-02-11T07:30:00Z',
          changes: [{ field: 'duration', oldValue: '5.2', newValue: '5.5' }],
        },
        {
          entityType: 'User',
          entityId: 7,
          changeType: 'Created',
          changedBy: 'admin',
          changedAt: '2026-02-10T14:00:00Z',
          changes: [
            { field: 'username', oldValue: null, newValue: 'readonly' },
          ],
        },
      ],
      meta: { page: 1, pageSize: 25, totalItems: 3, totalPages: 1 },
    });
  }

  // GET /audit/export
  if (path === 'audit/export') {
    return new NextResponse('mock-audit-export', {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
  }

  return json({ message: `Mock API: GET /${path} not implemented` }, 404);
}

export async function POST(request: NextRequest) {
  const seg = pathSegments(request);
  const path = seg.join('/');

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // No body
  }

  // POST /auth/login
  if (path === 'auth/login') {
    const { username, password } = body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      return json({ message: 'Username and password are required' }, 400);
    }

    const user = MOCK_USERS.find((u) => u.username === username);
    if (!user || TEST_PASSWORDS[username] !== password) {
      return json({ message: 'Invalid username or password' }, 401);
    }

    if (!user.isActive) {
      return json(
        {
          message:
            'Your account has been deactivated. Please contact your administrator.',
        },
        403,
      );
    }

    const tokenPayload = {
      sub: String(user.id),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      roles: user.roles.map((r) => r.name),
      permissions: user.permissions,
      exp: Math.floor(Date.now() / 1000) + 1800, // 30 min
    };

    const accessToken = makeJwt(tokenPayload);
    const refreshToken = makeJwt({
      ...tokenPayload,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    return json({
      accessToken,
      refreshToken,
      expiresIn: 1800,
      user: {
        id: String(user.id),
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        roles: user.roles.map((r) => r.name),
        permissions: user.permissions,
      },
    });
  }

  // POST /auth/refresh
  if (path === 'auth/refresh') {
    const user = getUserFromToken(request);
    if (!user) {
      // Try from body refreshToken
      const mockUser = MOCK_USERS[0];
      const tokenPayload = {
        sub: String(mockUser.id),
        username: mockUser.username,
        displayName: mockUser.displayName,
        email: mockUser.email,
        roles: mockUser.roles.map((r) => r.name),
        permissions: mockUser.permissions,
        exp: Math.floor(Date.now() / 1000) + 1800,
      };
      return json({
        accessToken: makeJwt(tokenPayload),
        refreshToken: makeJwt({ ...tokenPayload, type: 'refresh' }),
        expiresIn: 1800,
      });
    }

    const tokenPayload = {
      sub: String(user.id),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      roles: user.roles.map((r) => r.name),
      permissions: user.permissions,
      exp: Math.floor(Date.now() / 1000) + 1800,
    };

    return json({
      accessToken: makeJwt(tokenPayload),
      refreshToken: makeJwt({ ...tokenPayload, type: 'refresh' }),
      expiresIn: 1800,
    });
  }

  // POST /auth/activity
  if (path === 'auth/activity') {
    return new NextResponse(null, { status: 204 });
  }

  // POST /users
  if (path === 'users') {
    const newId = MOCK_USERS.length + 1;
    const roleIds = (body.roleIds as number[]) || [];
    const userRoles = roleIds
      .map((rid) => ROLES.find((r) => r.id === rid)!)
      .filter(Boolean);
    const perms = userRoles.flatMap((r) => PERMISSIONS[r.name] || []);

    const newUser = {
      id: newId,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      displayName: body.displayName || `${body.firstName} ${body.lastName}`,
      email: body.email,
      department: body.department || null,
      jobTitle: body.jobTitle || null,
      employeeId: body.employeeId || `EMP-${String(newId).padStart(4, '0')}`,
      roles: userRoles,
      permissions: [...new Set(perms)],
      isActive: true,
      deactivationReason: null,
      deactivatedAt: null,
      managerId: null,
      managerName: null,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      lastChangedUser: request.headers.get('LastChangedUser') || 'system',
      validFrom: new Date().toISOString(),
      validTo: '9999-12-31T23:59:59Z',
    };

    return json(newUser, 201);
  }

  // POST /users/:id/deactivate
  if (seg[0] === 'users' && seg.length === 3 && seg[2] === 'deactivate') {
    const user = MOCK_USERS.find((u) => u.id === Number(seg[1]));
    if (!user) return json({ message: 'User not found' }, 404);
    return json({
      ...user,
      isActive: false,
      deactivationReason: (body.reason as string) || 'Deactivated',
      deactivatedAt: new Date().toISOString(),
    });
  }

  // POST /users/:id/reactivate
  if (seg[0] === 'users' && seg.length === 3 && seg[2] === 'reactivate') {
    const user = MOCK_USERS.find((u) => u.id === Number(seg[1]));
    if (!user) return json({ message: 'User not found' }, 404);
    return json({
      ...user,
      isActive: true,
      deactivationReason: null,
      deactivatedAt: null,
    });
  }

  // POST /approval-authorities
  if (path === 'approval-authorities') {
    return json(
      {
        id: MOCK_APPROVAL_AUTHORITIES.length + 1,
        ...body,
        isBackup: body.isBackup || false,
        isActive: true,
        isOutOfOffice: false,
        outOfOfficeUntil: null,
        backupApprovers: [],
        assignedBy: 'admin',
        assignedAt: new Date().toISOString(),
        pendingApprovalCount: 0,
      },
      201,
    );
  }

  // POST /approval-authorities/:id/backup
  if (
    seg[0] === 'approval-authorities' &&
    seg.length === 3 &&
    seg[2] === 'backup'
  ) {
    return new NextResponse(null, { status: 204 });
  }

  // POST /v1/batches (for Story 7 operation permissions)
  if (path === 'v1/batches') {
    return json({ id: `batch-${Date.now()}`, status: 'Draft', ...body }, 201);
  }

  return json({ message: `Mock API: POST /${path} not implemented` }, 404);
}

export async function PUT(request: NextRequest) {
  const seg = pathSegments(request);
  const path = seg.join('/');

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // No body
  }

  // PUT /users/:id
  if (seg[0] === 'users' && seg.length === 2 && !isNaN(Number(seg[1]))) {
    const user = MOCK_USERS.find((u) => u.id === Number(seg[1]));
    if (!user) return json({ message: 'User not found' }, 404);
    return json({ ...user, ...body });
  }

  // PUT /users/:id/roles
  if (seg[0] === 'users' && seg.length === 3 && seg[2] === 'roles') {
    const roleIds = (body.roleIds as number[]) || [];
    const userRoles = roleIds
      .map((rid) => ROLES.find((r) => r.id === rid)!)
      .filter(Boolean);
    return json(userRoles);
  }

  // PUT /approval-authorities/:id
  if (seg[0] === 'approval-authorities' && seg.length === 2) {
    const entry = MOCK_APPROVAL_AUTHORITIES.find(
      (a) => a.id === Number(seg[1]),
    );
    if (!entry) return json({ message: 'Not found' }, 404);
    return json({ ...entry, ...body });
  }

  // PUT /approval-authorities/rules
  if (path === 'approval-authorities/rules') {
    return json(body);
  }

  // PUT /v1/instruments/:id (for Story 7 operation permissions)
  if (seg[0] === 'v1' && seg[1] === 'instruments' && seg.length === 3) {
    return json({ id: seg[2], type: 'Bond', ...body });
  }

  return json({ message: `Mock API: PUT /${path} not implemented` }, 404);
}

export async function DELETE(request: NextRequest) {
  const seg = pathSegments(request);
  const path = seg.join('/');

  // DELETE /approval-authorities/:id
  if (seg[0] === 'approval-authorities' && seg.length === 2) {
    return new NextResponse(null, { status: 204 });
  }

  return json({ message: `Mock API: DELETE /${path} not implemented` }, 404);
}
