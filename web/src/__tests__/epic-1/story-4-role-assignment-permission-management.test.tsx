/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 4
 * - Route: /admin/roles
 * - Target File: app/admin/roles/page.tsx
 * - Page Action: create_new
 *
 * Tests for Role Assignment & Permission Management
 *
 * Note: Per REALIGN report Epic 1 Story 4:
 * - Impact 4.1 RESOLVED: effectiveDate and reason fields now supported in PUT /users/{id}/roles
 * - Impact 4.2 RESOLVED: Two tabs only (Role Definitions, User Role Assignments) - Approval Authority Config deferred to Story 5
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
import type { AuthUser } from '@/lib/api/auth';
import type { UserDetail, Role } from '@/lib/api/users';
import type { RoleWithPermissions, Permission } from '@/lib/api/roles';

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
  ...overrides,
});

const createMockRole = (overrides: Partial<Role> = {}): Role => ({
  id: 1,
  name: 'OperationsLead',
  description: 'Full data entry, file management, workflow orchestration',
  isSystemRole: true,
  ...overrides,
});

const createMockPermission = (
  overrides: Partial<Permission> = {},
): Permission => ({
  id: 1,
  name: 'create_batches',
  description: 'Create new batches',
  category: 'Batch Management',
  ...overrides,
});

const createMockRoleWithPermissions = (
  overrides: Partial<RoleWithPermissions> = {},
): RoleWithPermissions => ({
  id: 1,
  name: 'OperationsLead',
  description: 'Full data entry, file management, workflow orchestration',
  isSystemRole: true,
  permissions: [
    createMockPermission(),
    createMockPermission({
      id: 2,
      name: 'view_batches',
      description: 'View all batches',
      category: 'Batch Management',
    }),
    createMockPermission({
      id: 3,
      name: 'upload_files',
      description: 'Upload files manually',
      category: 'File Operations',
    }),
    createMockPermission({
      id: 4,
      name: 'edit_instruments',
      description:
        'Create, edit, delete instruments (During Data Preparation Phase Only)',
      category: 'Master Data',
    }),
    createMockPermission({
      id: 5,
      name: 'run_calculations',
      description: 'Run calculations',
      category: 'Validation & Calculations',
    }),
    createMockPermission({
      id: 6,
      name: 'confirm_ready',
      description: 'Confirm data ready for approval',
      category: 'Workflow',
    }),
    createMockPermission({
      id: 7,
      name: 'export_reports',
      description: 'Export data to Excel',
      category: 'Reporting',
    }),
  ],
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

// Helper to create all 7 system roles
const createAllSystemRoles = (): RoleWithPermissions[] => [
  createMockRoleWithPermissions({
    id: 1,
    name: 'OperationsLead',
    description: 'Full data entry, file management, workflow orchestration',
  }),
  createMockRoleWithPermissions({
    id: 2,
    name: 'Analyst',
    description: 'Data correction, master data maintenance, commentary',
  }),
  createMockRoleWithPermissions({
    id: 3,
    name: 'ApproverL1',
    description:
      'Approve batches at operations level (file completeness, validation)',
  }),
  createMockRoleWithPermissions({
    id: 4,
    name: 'ApproverL2',
    description:
      'Approve batches at PM level (holdings reasonableness, performance)',
  }),
  createMockRoleWithPermissions({
    id: 5,
    name: 'ApproverL3',
    description: 'Final approval before publication (overall report quality)',
  }),
  createMockRoleWithPermissions({
    id: 6,
    name: 'Administrator',
    description: 'User management, system configuration, audit access',
  }),
  createMockRoleWithPermissions({
    id: 7,
    name: 'ReadOnly',
    description: 'View access only, no modifications',
  }),
];

describe('Role & Permission Management Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Authorization Check', () => {
    it('redirects non-admin users with access denied message', async () => {
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

  describe('Happy Path - View Role Definitions', () => {
    it('displays Role & Permission Management screen with two tabs', async () => {
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
      });

      // Should NOT have Approval Authority Config tab (deferred to Story 5)
      expect(
        screen.queryByRole('tab', { name: /approval authority config/i }),
      ).not.toBeInTheDocument();
    });

    it('displays all 7 system roles on Role Definitions tab', async () => {
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
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
        expect(screen.getByText(/analyst/i)).toBeInTheDocument();
        expect(screen.getByText(/approver.*level 1/i)).toBeInTheDocument();
        expect(screen.getByText(/approver.*level 2/i)).toBeInTheDocument();
        expect(screen.getByText(/approver.*level 3/i)).toBeInTheDocument();
        expect(screen.getByText(/administrator/i)).toBeInTheDocument();
        expect(screen.getByText(/read-only/i)).toBeInTheDocument();
      });
    });

    it('displays role card with name, description, user count, and action buttons', async () => {
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsersWithRole = [
        createMockUserDetail(),
        createMockUserDetail({ id: 2, username: 'jdoe' }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (rolesApi.getUsersWithRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsersWithRole,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
        expect(
          screen.getByText(
            /full data entry, file management, workflow orchestration/i,
          ),
        ).toBeInTheDocument();
        expect(screen.getByText(/2 users/i)).toBeInTheDocument();
      });

      // Should see action buttons
      const viewPermissionsButtons = screen.getAllByRole('button', {
        name: /view permissions/i,
      });
      expect(viewPermissionsButtons.length).toBeGreaterThan(0);

      const viewUsersButtons = screen.getAllByRole('button', {
        name: /view assigned users/i,
      });
      expect(viewUsersButtons.length).toBeGreaterThan(0);
    });
  });

  describe('View Role Permissions Detail', () => {
    it('opens modal showing detailed permissions breakdown when View Permissions is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const roleWithPermissions = createMockRoleWithPermissions();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        rolesApi.getRoleWithPermissions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(roleWithPermissions);

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const viewPermissionsButton = screen.getAllByRole('button', {
        name: /view permissions/i,
      })[0];
      await user.click(viewPermissionsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // Should show role name in modal
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(/operations lead/i),
        ).toBeInTheDocument();
      });
    });

    it('displays permissions grouped by category in modal', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const roleWithPermissions = createMockRoleWithPermissions();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        rolesApi.getRoleWithPermissions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(roleWithPermissions);

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const viewPermissionsButton = screen.getAllByRole('button', {
        name: /view permissions/i,
      })[0];
      await user.click(viewPermissionsButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(/batch management/i),
        ).toBeInTheDocument();
        expect(
          within(dialog).getByText(/file operations/i),
        ).toBeInTheDocument();
        expect(within(dialog).getByText(/master data/i)).toBeInTheDocument();
        expect(
          within(dialog).getByText(/validation & calculations/i),
        ).toBeInTheDocument();
        expect(within(dialog).getByText(/workflow/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/reporting/i)).toBeInTheDocument();
      });
    });

    it('shows state-based access control note in permissions modal', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const roleWithPermissions = createMockRoleWithPermissions();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (
        rolesApi.getRoleWithPermissions as ReturnType<typeof vi.fn>
      ).mockResolvedValue(roleWithPermissions);

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const viewPermissionsButton = screen.getAllByRole('button', {
        name: /view permissions/i,
      })[0];
      await user.click(viewPermissionsButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(/data preparation phase.*full edit access/i),
        ).toBeInTheDocument();
        expect(
          within(dialog).getByText(/during approval.*read-only access/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('View Assigned Users', () => {
    it('opens modal showing users assigned to a role when View Assigned Users is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsersWithRole = [
        createMockUserDetail(),
        createMockUserDetail({
          id: 2,
          username: 'dwilliams',
          firstName: 'David',
          lastName: 'Williams',
          displayName: 'David Williams',
          department: 'Operations',
        }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (rolesApi.getUsersWithRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsersWithRole,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const viewUsersButton = screen.getAllByRole('button', {
        name: /view assigned users/i,
      })[0];
      await user.click(viewUsersButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('John Smith')).toBeInTheDocument();
        expect(within(dialog).getByText('jsmith')).toBeInTheDocument();
        expect(within(dialog).getByText('David Williams')).toBeInTheDocument();
        expect(within(dialog).getByText('dwilliams')).toBeInTheDocument();
      });
    });
  });

  describe('User Role Assignments Tab', () => {
    it('displays searchable list of all users with their currently assigned roles', async () => {
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [
          createMockUserDetail(),
          createMockUserDetail({
            id: 2,
            username: 'sjohnson',
            firstName: 'Sarah',
            lastName: 'Johnson',
            displayName: 'Sarah Johnson',
            roles: [createMockRole({ id: 2, name: 'Analyst' })],
          }),
        ],
        meta: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 },
      };

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      const user = userEvent.setup();
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('jsmith')).toBeInTheDocument();
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('sjohnson')).toBeInTheDocument();
      });
    });

    it('searches users by name, email, or username', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const allUsers = {
        items: [
          createMockUserDetail(),
          createMockUserDetail({ id: 2, firstName: 'Sarah' }),
        ],
        meta: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 },
      };
      const filteredUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allUsers)
        .mockResolvedValueOnce(filteredUsers);

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'john');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(usersApi.listUsers).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'john' }),
        );
      });
    });

    it('filters by role', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const allUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const filteredUsers = {
        items: [
          createMockUserDetail({
            roles: [createMockRole({ id: 4, name: 'ApproverL2' })],
          }),
        ],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allUsers)
        .mockResolvedValueOnce(filteredUsers);

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const roleFilter = screen.getByRole('combobox', {
        name: /filter by role/i,
      });
      await user.click(roleFilter);
      await user.click(
        screen.getByRole('option', { name: /approver level 2/i }),
      );

      await waitFor(() => {
        expect(usersApi.listUsers).toHaveBeenCalledWith(
          expect.objectContaining({ roleId: 4 }),
        );
      });
    });
  });

  describe('Modify User Roles', () => {
    it('opens modal with checkboxes for all available roles when Modify Roles is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByRole('checkbox', { name: /operations lead/i }),
        ).toBeInTheDocument();
        expect(
          within(dialog).getByRole('checkbox', { name: /analyst/i }),
        ).toBeInTheDocument();
        expect(
          within(dialog).getByRole('checkbox', { name: /administrator/i }),
        ).toBeInTheDocument();
      });
    });

    it('assigns new role with effective date and reason', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];
      const updatedRoles = [
        createMockRole(),
        createMockRole({ id: 2, name: 'Analyst' }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );
      (usersApi.updateUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const analystCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(analystCheckbox);

      const effectiveDateInput = screen.getByLabelText(/effective date/i);
      await user.type(effectiveDateInput, '2026-01-06');

      const reasonInput = screen.getByLabelText(/reason for change/i);
      await user.type(reasonInput, 'Promotion to team lead role');

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(usersApi.updateUserRoles).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            roleIds: expect.arrayContaining([1, 2]),
            effectiveDate: '2026-01-06',
            reason: 'Promotion to team lead role',
          }),
          'admin',
        );
      });
    }, 15000);

    it('removes role from user when unchecked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [
          createMockUserDetail({
            roles: [
              createMockRole(),
              createMockRole({ id: 2, name: 'Analyst' }),
            ],
          }),
        ],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [
        createMockRole(),
        createMockRole({ id: 2, name: 'Analyst' }),
      ];
      const updatedRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );
      (usersApi.updateUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const analystCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(analystCheckbox);

      const reasonInput = screen.getByLabelText(/reason for change/i);
      await user.type(reasonInput, 'Role no longer needed');

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(usersApi.updateUserRoles).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            roleIds: [1],
            reason: 'Role no longer needed',
          }),
          'admin',
        );
      });
    }, 15000);

    it('shows current assignments as checked roles', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [
          createMockUserDetail({
            roles: [
              createMockRole(),
              createMockRole({ id: 2, name: 'Analyst' }),
            ],
          }),
        ],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [
        createMockRole(),
        createMockRole({ id: 2, name: 'Analyst' }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        const operationsLeadCheckbox = screen.getByRole('checkbox', {
          name: /operations lead/i,
        }) as HTMLInputElement;
        const analystCheckbox = screen.getByRole('checkbox', {
          name: /analyst/i,
        }) as HTMLInputElement;
        const adminCheckbox = screen.getByRole('checkbox', {
          name: /administrator/i,
        }) as HTMLInputElement;

        expect(operationsLeadCheckbox.checked).toBe(true);
        expect(analystCheckbox.checked).toBe(true);
        expect(adminCheckbox.checked).toBe(false);
      });
    });
  });

  describe('Modify User Roles - Validation', () => {
    it('shows error when no roles are selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const operationsLeadCheckbox = screen.getByRole('checkbox', {
        name: /operations lead/i,
      });
      await user.click(operationsLeadCheckbox);

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/at least one role must be assigned/i),
        ).toBeInTheDocument();
      });

      expect(usersApi.updateUserRoles).not.toHaveBeenCalled();
    });

    it('shows error when reason for change is empty', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const analystCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(analystCheckbox);

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/reason for change is required for audit trail/i),
        ).toBeInTheDocument();
      });

      expect(usersApi.updateUserRoles).not.toHaveBeenCalled();
    });
  });

  describe('Segregation of Duties Warning', () => {
    it('shows warning modal when Operations Lead and Approver Level 1 are both selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const approverL1Checkbox = screen.getByRole('checkbox', {
        name: /approver level 1/i,
      });
      await user.click(approverL1Checkbox);

      const reasonInput = screen.getByLabelText(/reason for change/i);
      await user.type(reasonInput, 'Dual role assignment for flexibility');

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/segregation of duties violation/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/user cannot approve batches they prepared/i),
        ).toBeInTheDocument();
      });
    }, 15000);

    it('displays two options in segregation of duties warning: Allow with System Check and Restrict to Single Role', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const approverL1Checkbox = screen.getByRole('checkbox', {
        name: /approver level 1/i,
      });
      await user.click(approverL1Checkbox);

      const reasonInput = screen.getByLabelText(/reason for change/i);
      await user.type(reasonInput, 'Dual role assignment');

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /allow with system check/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /restrict to single role/i }),
        ).toBeInTheDocument();
      });
    }, 15000);

    it('assigns conflicting roles when Allow with System Check is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];
      const updatedRoles = [
        createMockRole(),
        createMockRole({ id: 3, name: 'ApproverL1' }),
      ];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );
      (usersApi.updateUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const approverL1Checkbox = screen.getByRole('checkbox', {
        name: /approver level 1/i,
      });
      await user.click(approverL1Checkbox);

      const reasonInput = screen.getByLabelText(/reason for change/i);
      await user.type(reasonInput, 'Dual role assignment');

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/segregation of duties violation/i),
        ).toBeInTheDocument();
      });

      const allowButton = screen.getByRole('button', {
        name: /allow with system check/i,
      });
      await user.click(allowButton);

      await waitFor(() => {
        expect(usersApi.updateUserRoles).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            roleIds: expect.arrayContaining([1, 3]),
          }),
          'admin',
        );
      });
    }, 15000);

    it('cancels role assignment when Restrict to Single Role is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const approverL1Checkbox = screen.getByRole('checkbox', {
        name: /approver level 1/i,
      });
      await user.click(approverL1Checkbox);

      const reasonInput = screen.getByLabelText(/reason for change/i);
      await user.type(reasonInput, 'Dual role assignment');

      const saveButton = screen.getByRole('button', {
        name: /save role changes/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/segregation of duties violation/i),
        ).toBeInTheDocument();
      });

      const restrictButton = screen.getByRole('button', {
        name: /restrict to single role/i,
      });
      await user.click(restrictButton);

      await waitFor(() => {
        // Warning modal should close, user should be back to modify roles modal
        expect(
          screen.queryByText(/segregation of duties violation/i),
        ).not.toBeInTheDocument();
        expect(screen.getByLabelText(/reason for change/i)).toBeInTheDocument();
      });

      expect(usersApi.updateUserRoles).not.toHaveBeenCalled();
    }, 15000);
  });

  describe('Permission Conflicts Note', () => {
    it('displays note about most restrictive permission applying when multiple roles selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();
      const mockUsers = {
        items: [createMockUserDetail()],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };
      const currentRoles = [createMockRole()];

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );
      (usersApi.getUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        currentRoles,
      );

      render(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText(/operations lead/i)).toBeInTheDocument();
      });

      const userAssignmentsTab = screen.getByRole('tab', {
        name: /user role assignments/i,
      });
      await user.click(userAssignmentsTab);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const modifyRolesButton = screen.getByRole('button', {
        name: /modify roles/i,
      });
      await user.click(modifyRolesButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(
            /if multiple roles assigned, most restrictive permission applies when conflicts exist/i,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const mockUser = createMockAdminUser();
      const mockRoles = createAllSystemRoles();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (rolesApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockRoles,
      );

      const { container } = render(<RolesPage />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
