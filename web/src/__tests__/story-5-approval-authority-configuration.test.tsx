/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 5
 * - Route: /admin/roles (Approval Authority Config tab - third tab)
 * - Target File: app/admin/roles/page.tsx
 * - Page Action: modify_existing
 *
 * Tests for Approval Authority Configuration
 *
 * This story adds a third tab to the existing /admin/roles page for configuring:
 * - Primary approvers at each level (L1, L2, L3)
 * - Backup approver designations
 * - Out-of-office status and routing
 * - Approval rules (any one, specific per batch, consensus)
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import RolesPage from '@/app/admin/roles/page';
import * as authApi from '@/lib/api/auth';
import * as usersApi from '@/lib/api/users';
import * as rolesApi from '@/lib/api/roles';
import * as approvalAuthApi from '@/lib/api/approval-authority';
import type { AuthUser } from '@/lib/api/auth';
import type { UserDetail, Role } from '@/lib/api/users';
import type { RoleWithPermissions } from '@/lib/api/roles';
import type {
  ApprovalAuthorityEntry,
  ApprovalRulesConfig,
} from '@/lib/api/approval-authority';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth API functions
vi.mock('@/lib/api/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock users API functions
vi.mock('@/lib/api/users', () => ({
  listUsers: vi.fn(),
  getUserRoles: vi.fn(),
  updateUserRoles: vi.fn(),
}));

// Mock roles API functions
vi.mock('@/lib/api/roles', () => ({
  listRoles: vi.fn(),
  getRoleWithPermissions: vi.fn(),
  getUsersWithRole: vi.fn(),
}));

// Mock approval authority API functions
vi.mock('@/lib/api/approval-authority', () => ({
  listApprovalAuthorities: vi.fn(),
  assignApprovalAuthority: vi.fn(),
  updateApprovalAuthority: vi.fn(),
  removeApprovalAuthority: vi.fn(),
  configureBackupApprovers: vi.fn(),
  getApprovalRules: vi.fn(),
  updateApprovalRules: vi.fn(),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
};

// Mock data factories
const createMockAdminUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'admin-1',
  username: 'admin',
  displayName: 'Admin User',
  email: 'admin@investinsight.com',
  roles: ['Administrator'],
  permissions: ['manage_users', 'view_users', 'manage_roles'],
  allowedPages: ['/admin/users', '/admin/roles', '/admin/audit-trail'],
  ...overrides,
});

const createMockNonAdminUser = (
  overrides: Partial<AuthUser> = {},
): AuthUser => ({
  id: 'analyst-1',
  username: 'analyst',
  displayName: 'Regular User',
  email: 'analyst@investinsight.com',
  roles: ['Analyst'],
  permissions: ['view_portfolios'],
  allowedPages: ['/dashboard', '/batches'],
  ...overrides,
});

const createMockRole = (overrides: Partial<Role> = {}): Role => ({
  id: 2,
  name: 'Analyst',
  description: 'Data correction, master data maintenance, commentary',
  isSystemRole: true,
  allowedPages: ['/dashboard', '/batches'],
  ...overrides,
});

const createMockRoleWithPermissions = (
  overrides: Partial<RoleWithPermissions> = {},
): RoleWithPermissions => ({
  id: 2,
  name: 'Analyst',
  description: 'Data correction, master data maintenance, commentary',
  isSystemRole: true,
  allowedPages: ['/dashboard', '/batches'],
  permissions: [],
  ...overrides,
});

const createMockUserDetail = (
  overrides: Partial<UserDetail> = {},
): UserDetail => ({
  id: 1,
  username: 'jsmith',
  firstName: 'John',
  lastName: 'Smith',
  displayName: 'John Smith',
  email: 'john.smith@company.com',
  department: 'Operations',
  jobTitle: 'Operations Lead',
  employeeId: 'EMP001',
  managerId: null,
  managerName: null,
  isActive: true,
  deactivationReason: null,
  deactivatedAt: null,
  roles: [createMockRole()],
  lastLoginAt: '2026-02-09T08:30:00Z',
  createdAt: '2026-01-15T10:00:00Z',
  lastChangedUser: 'admin',
  validFrom: '2026-01-15T10:00:00Z',
  validTo: '9999-12-31T23:59:59Z',
  ...overrides,
});

const createMockApprovalAuthority = (
  overrides: Partial<ApprovalAuthorityEntry> = {},
): ApprovalAuthorityEntry => ({
  id: 1,
  userId: 1,
  username: 'jsmith',
  displayName: 'John Smith',
  email: 'john.smith@company.com',
  roleName: 'Approver Level 1',
  approvalLevel: 1,
  isBackup: false,
  isActive: true,
  isOutOfOffice: false,
  outOfOfficeUntil: null,
  backupApprovers: [],
  effectiveFrom: '2026-01-06',
  effectiveTo: null,
  assignedBy: 'admin',
  assignedAt: '2026-01-05T10:00:00Z',
  pendingApprovalCount: 0,
  ...overrides,
});

const createMockApprovalRules = (
  overrides: Partial<ApprovalRulesConfig> = {},
): ApprovalRulesConfig => ({
  level: 1,
  rule: 'any_one',
  consensusRequired: null,
  ...overrides,
});

// Helper to create all 5 system roles
const createAllSystemRoles = (): RoleWithPermissions[] => [
  createMockRoleWithPermissions({
    id: 1,
    name: 'Administrator',
    description: 'User management, system configuration, audit access',
    allowedPages: ['/admin', '/dashboard', '/batches', '/approvals'],
  }),
  createMockRoleWithPermissions({
    id: 2,
    name: 'Analyst',
    description: 'Data correction, master data maintenance, commentary',
    allowedPages: ['/dashboard', '/batches'],
  }),
  createMockRoleWithPermissions({
    id: 3,
    name: 'ApproverL1',
    description:
      'Approve batches at operations level (file completeness, validation)',
    allowedPages: ['/approvals', '/dashboard'],
  }),
  createMockRoleWithPermissions({
    id: 4,
    name: 'ApproverL2',
    description:
      'Approve batches at PM level (holdings reasonableness, performance)',
    allowedPages: ['/approvals', '/dashboard'],
  }),
  createMockRoleWithPermissions({
    id: 5,
    name: 'ApproverL3',
    description: 'Final approval before publication (overall report quality)',
    allowedPages: ['/approvals', '/dashboard'],
  }),
];

describe('Approval Authority Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Happy Path - View Approval Authority', () => {
    it('displays Approval Authority Config tab as third tab on Role & Permission Management screen', async () => {
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('tab', { name: /role definitions/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /user role assignments/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /approval authority config/i }),
        ).toBeInTheDocument();
      });
    });

    it('displays three level sections when Approval Authority Config tab is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/level 2 approval - portfolio manager/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/level 3 approval - executive/i),
        ).toBeInTheDocument();
      });
    });

    it('displays focus description for Level 1 section', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(
            /data completeness, file receipt, validation checks/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('displays list of primary approvers with names, roles, and status', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority({
          id: 1,
          userId: 1,
          displayName: 'John Smith',
          roleName: 'Approver Level 1',
          approvalLevel: 1,
          isActive: true,
        }),
        createMockApprovalAuthority({
          id: 2,
          userId: 2,
          displayName: 'Sarah Johnson',
          roleName: 'Approver Level 1',
          approvalLevel: 1,
          isActive: true,
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText(/approver level 1/i)).toBeInTheDocument();
        expect(screen.getByText(/active/i)).toBeInTheDocument();
      });
    });

    it('displays approval rules options for each level section', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];
      const mockRules = createMockApprovalRules({ level: 1, rule: 'any_one' });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (
        approvalAuthApi.getApprovalRules as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockRules]);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/any one approver can approve/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/specific approver assigned per batch/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/requires consensus from 2\+ approvers/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Add Primary Approver', () => {
    it('opens modal to add approver when Add Approver button is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const addApproverButton = screen.getByRole('button', {
        name: /add approver/i,
      });
      await user.click(addApproverButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(/add approval authority/i),
        ).toBeInTheDocument();
      });
    });

    it('adds user with Approver Level 1 role as Level 1 approver with effective date', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];
      const mockUsersWithRole = [
        createMockUserDetail({
          id: 1,
          displayName: 'John Smith',
          roles: [createMockRole({ id: 3, name: 'ApproverL1' })],
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (rolesApi.getUsersWithRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsersWithRole,
      );
      (
        approvalAuthApi.assignApprovalAuthority as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockApprovalAuthority({
          userId: 1,
          displayName: 'John Smith',
          approvalLevel: 1,
          effectiveFrom: '2026-01-06',
        }),
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const addApproverButton = screen.getByRole('button', {
        name: /add approver/i,
      });
      await user.click(addApproverButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const userSelect = screen.getByRole('combobox', { name: /select user/i });
      await user.click(userSelect);
      await user.click(screen.getByRole('option', { name: /john smith/i }));

      const effectiveFromInput = screen.getByLabelText(/effective from/i);
      await user.type(effectiveFromInput, '2026-01-06');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(approvalAuthApi.assignApprovalAuthority).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 1,
            approvalLevel: 1,
            effectiveFrom: '2026-01-06',
            isBackup: false,
          }),
          'admin',
        );
      });
    }, 15000);

    it('allows designating approver as backup approver via checkbox', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];
      const mockUsersWithRole = [
        createMockUserDetail({
          id: 1,
          displayName: 'John Smith',
          roles: [createMockRole({ id: 3, name: 'ApproverL1' })],
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (rolesApi.getUsersWithRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsersWithRole,
      );
      (
        approvalAuthApi.assignApprovalAuthority as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockApprovalAuthority({
          userId: 1,
          isBackup: true,
        }),
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const addApproverButton = screen.getByRole('button', {
        name: /add approver/i,
      });
      await user.click(addApproverButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const backupCheckbox = screen.getByRole('checkbox', {
        name: /backup approver/i,
      });
      await user.click(backupCheckbox);

      const userSelect = screen.getByRole('combobox', { name: /select user/i });
      await user.click(userSelect);
      await user.click(screen.getByRole('option', { name: /john smith/i }));

      const effectiveFromInput = screen.getByLabelText(/effective from/i);
      await user.type(effectiveFromInput, '2026-01-06');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(approvalAuthApi.assignApprovalAuthority).toHaveBeenCalledWith(
          expect.objectContaining({
            isBackup: true,
          }),
          'admin',
        );
      });
    }, 15000);
  });

  describe('Add Approver - Validation', () => {
    it('shows error when user does not have appropriate approver role', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];
      const mockUsersWithRole = [
        createMockUserDetail({
          id: 1,
          displayName: 'John Smith',
          roles: [createMockRole({ id: 2, name: 'Analyst' })],
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (rolesApi.getUsersWithRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsersWithRole,
      );
      (
        approvalAuthApi.assignApprovalAuthority as ReturnType<typeof vi.fn>
      ).mockRejectedValue(
        new Error(
          'User must have Approver Level 2 role to be designated as Level 2 approver',
        ),
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const addApproverButton = screen.getByRole('button', {
        name: /add approver/i,
      });
      await user.click(addApproverButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const userSelect = screen.getByRole('combobox', { name: /select user/i });
      await user.click(userSelect);
      await user.click(screen.getByRole('option', { name: /john smith/i }));

      const effectiveFromInput = screen.getByLabelText(/effective from/i);
      await user.type(effectiveFromInput, '2026-01-06');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /user must have approver level 2 role to be designated as level 2 approver/i,
          ),
        ).toBeInTheDocument();
      });
    }, 15000);

    it('shows error when effective from date is empty', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const addApproverButton = screen.getByRole('button', {
        name: /add approver/i,
      });
      await user.click(addApproverButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/effective from date is required/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Remove Primary Approver', () => {
    it('shows confirmation dialog when Remove Selected button is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority(),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const approverCheckbox = screen.getByRole('checkbox', {
        name: /john smith/i,
      });
      await user.click(approverCheckbox);

      const removeButton = screen.getByRole('button', {
        name: /remove selected/i,
      });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText(/remove approver\?/i)).toBeInTheDocument();
      });
    });

    it('removes approver and marks as inactive when Confirm is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority({
          id: 1,
          pendingApprovalCount: 0,
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (
        approvalAuthApi.removeApprovalAuthority as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const approverCheckbox = screen.getByRole('checkbox', {
        name: /john smith/i,
      });
      await user.click(approverCheckbox);

      const removeButton = screen.getByRole('button', {
        name: /remove selected/i,
      });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText(/remove approver\?/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(approvalAuthApi.removeApprovalAuthority).toHaveBeenCalledWith(
          1,
          'admin',
        );
      });
    }, 15000);

    it('shows warning when approver has pending approvals', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority({
          id: 1,
          pendingApprovalCount: 2,
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const approverCheckbox = screen.getByRole('checkbox', {
        name: /john smith/i,
      });
      await user.click(approverCheckbox);

      const removeButton = screen.getByRole('button', {
        name: /remove selected/i,
      });
      await user.click(removeButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /this user has 2 batches awaiting their approval.*please reassign before removing/i,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Configure Backup Approvers', () => {
    it('opens Configure Backup Approvers modal when button is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority(),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval - portfolio manager/i),
        ).toBeInTheDocument();
      });

      const configureBackupButton = screen.getByRole('button', {
        name: /configure backup approvers/i,
      });
      await user.click(configureBackupButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(/configure backup approvers/i),
        ).toBeInTheDocument();
      });
    });

    it('displays table with primary approvers mapped to backup approvers', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority({
          id: 1,
          displayName: 'Michael Chen',
          approvalLevel: 2,
          backupApprovers: [
            {
              id: 2,
              userId: 2,
              displayName: 'Jessica Martinez',
              approvalLevel: 2,
            },
          ],
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval - portfolio manager/i),
        ).toBeInTheDocument();
      });

      const configureBackupButton = screen.getByRole('button', {
        name: /configure backup approvers/i,
      });
      await user.click(configureBackupButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Michael Chen')).toBeInTheDocument();
        expect(
          within(dialog).getByText('Jessica Martinez'),
        ).toBeInTheDocument();
      });
    });

    it('allows editing backup approvers for a primary approver', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority({
          id: 1,
          displayName: 'Michael Chen',
          approvalLevel: 2,
          backupApprovers: [],
        }),
      ];
      const availableBackups = [
        createMockUserDetail({
          id: 2,
          displayName: 'Jessica Martinez',
          roles: [createMockRole({ id: 4, name: 'ApproverL2' })],
        }),
        createMockUserDetail({
          id: 3,
          displayName: 'Robert Johnson',
          roles: [createMockRole({ id: 5, name: 'ApproverL3' })],
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: availableBackups,
        meta: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 },
      });
      (
        approvalAuthApi.configureBackupApprovers as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval - portfolio manager/i),
        ).toBeInTheDocument();
      });

      const configureBackupButton = screen.getByRole('button', {
        name: /configure backup approvers/i,
      });
      await user.click(configureBackupButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /select backup approvers/i }),
        ).toBeInTheDocument();
      });

      const backupSelect = screen.getByRole('combobox', {
        name: /select backup approvers/i,
      });
      await user.click(backupSelect);
      await user.click(
        screen.getByRole('option', { name: /jessica martinez/i }),
      );
      await user.click(
        screen.getByRole('option', { name: /robert johnson.*l3/i }),
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(approvalAuthApi.configureBackupApprovers).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            backupUserIds: expect.arrayContaining([2, 3]),
          }),
          'admin',
        );
      });
    }, 15000);
  });

  describe('Configure Backup Approvers - Validation', () => {
    it('shows error when backup approver has lower approval level', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority({
          id: 1,
          approvalLevel: 2,
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (
        approvalAuthApi.configureBackupApprovers as ReturnType<typeof vi.fn>
      ).mockRejectedValue(
        new Error('Backup approver must have same or higher approval level'),
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval - portfolio manager/i),
        ).toBeInTheDocument();
      });

      const configureBackupButton = screen.getByRole('button', {
        name: /configure backup approvers/i,
      });
      await user.click(configureBackupButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /backup approver must have same or higher approval level/i,
          ),
        ).toBeInTheDocument();
      });
    }, 15000);

    it('displays backup rules in Configure Backup Approvers modal', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority(),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval - portfolio manager/i),
        ).toBeInTheDocument();
      });

      const configureBackupButton = screen.getByRole('button', {
        name: /configure backup approvers/i,
      });
      await user.click(configureBackupButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(
            /primary approver must explicitly designate out-of-office status/i,
          ),
        ).toBeInTheDocument();
        expect(
          within(dialog).getByText(
            /batches automatically route to backup when primary is ooo/i,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Out of Office Designation', () => {
    it('displays out-of-office status with return date and backup name', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [
        createMockApprovalAuthority({
          id: 1,
          displayName: 'John Smith',
          isOutOfOffice: true,
          outOfOfficeUntil: '2026-01-15',
          backupApprovers: [
            {
              id: 2,
              userId: 2,
              displayName: 'Michael Chen',
              approvalLevel: 1,
            },
          ],
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/out.*until 2026-01-15.*backup.*michael chen/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Approval Rules Configuration', () => {
    it('selects "Any one approver can approve" rule for Level 1', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];
      const mockRules = [
        createMockApprovalRules({ level: 1, rule: 'any_one' }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (
        approvalAuthApi.getApprovalRules as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockRules);
      (
        approvalAuthApi.updateApprovalRules as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockApprovalRules({ level: 1, rule: 'any_one' }),
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const anyOneRadio = screen.getByRole('radio', {
        name: /any one approver can approve/i,
      });
      await user.click(anyOneRadio);

      await waitFor(() => {
        expect(approvalAuthApi.updateApprovalRules).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 1,
            rule: 'any_one',
          }),
          'admin',
        );
      });
    });

    it('selects "Specific approver assigned per batch" rule for Level 2', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];
      const mockRules = [
        createMockApprovalRules({ level: 2, rule: 'specific' }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (
        approvalAuthApi.getApprovalRules as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockRules);
      (
        approvalAuthApi.updateApprovalRules as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockApprovalRules({ level: 2, rule: 'specific' }),
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval - portfolio manager/i),
        ).toBeInTheDocument();
      });

      const specificRadio = screen.getByRole('radio', {
        name: /specific approver assigned per batch/i,
      });
      await user.click(specificRadio);

      await waitFor(() => {
        expect(approvalAuthApi.updateApprovalRules).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 2,
            rule: 'specific',
          }),
          'admin',
        );
      });
    });

    it('selects "Requires consensus from 2+ approvers" rule for Level 3', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];
      const mockRules = [
        createMockApprovalRules({
          level: 3,
          rule: 'consensus',
          consensusRequired: 2,
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);
      (
        approvalAuthApi.getApprovalRules as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockRules);
      (
        approvalAuthApi.updateApprovalRules as ReturnType<typeof vi.fn>
      ).mockResolvedValue(
        createMockApprovalRules({
          level: 3,
          rule: 'consensus',
          consensusRequired: 2,
        }),
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 3 approval - executive/i),
        ).toBeInTheDocument();
      });

      const consensusRadio = screen.getByRole('radio', {
        name: /requires consensus from 2\+ approvers/i,
      });
      await user.click(consensusRadio);

      await waitFor(() => {
        expect(approvalAuthApi.updateApprovalRules).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 3,
            rule: 'consensus',
          }),
          'admin',
        );
      });
    });
  });

  describe('Save Configuration', () => {
    it('displays success message when Save Approval Authority Configuration is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', {
        name: /save approval authority configuration/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/approval authority configuration updated/i),
        ).toBeInTheDocument();
      });
    });

    it('displays note that changes apply to new batches only', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      render(<RolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/role & permission management/i),
        ).toBeInTheDocument();
      });

      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(
            /changes apply to new batches only.*in-progress batches retain original approver assignments/i,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Authorization Check', () => {
    it('shows access denied error for non-admin users', async () => {
      const mockUser = createMockNonAdminUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
        expect(
          screen.getByText(/administrator role required/i),
        ).toBeInTheDocument();
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations on Approval Authority Config tab', async () => {
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockAuthorities: ApprovalAuthorityEntry[] = [];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        approvalAuthApi.listApprovalAuthorities as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAuthorities);

      const { container } = render(<RolesPage />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const user = userEvent.setup();
      const approvalAuthorityTab = screen.getByRole('tab', {
        name: /approval authority config/i,
      });
      await user.click(approvalAuthorityTab);

      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval - operations/i),
        ).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
