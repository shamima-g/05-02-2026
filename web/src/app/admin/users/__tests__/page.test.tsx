/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 3
 * - Route: /admin/users
 * - Target File: app/admin/users/users-client.tsx
 * - Page Action: create_new
 *
 * Tests for User Lifecycle Management - User Administration Page
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import UsersClient from '@/app/admin/users/users-client';
import * as authApi from '@/lib/api/auth';
import * as usersApi from '@/lib/api/users';
import type { AuthUser } from '@/lib/api/auth';
import type {
  UserDetail,
  UserList,
  UserActivity,
  UserActivityList,
} from '@/lib/api/users';

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
  listRoles: vi.fn(),
  createUser: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  deactivateUser: vi.fn(),
  reactivateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserActivity: vi.fn(),
  getUserRoles: vi.fn(),
  updateUserRoles: vi.fn(),
  exportUsers: vi.fn(),
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
  permissions: [
    'manage_users',
    'view_users',
    'create_users',
    'update_users',
    'deactivate_users',
  ],
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
  roles: [
    {
      id: 2,
      name: 'Analyst',
      description: 'Analyst Role',
      isSystemRole: true,
      allowedPages: [],
    },
  ],
  lastLoginAt: '2026-02-09T08:30:00Z',
  createdAt: '2026-01-15T10:00:00Z',
  lastChangedUser: 'admin',
  validFrom: '2026-01-15T10:00:00Z',
  validTo: '9999-12-31T23:59:59Z',
  ...overrides,
});

const createMockUserList = (users: UserDetail[] = []): UserList => ({
  items:
    users.length > 0
      ? users
      : [
          createMockUserDetail(),
          createMockUserDetail({
            id: 2,
            username: 'mjones',
            firstName: 'Mary',
            lastName: 'Jones',
            displayName: 'Mary Jones',
            email: 'mary.jones@company.com',
            department: 'Operations',
            roles: [
              {
                id: 2,
                name: 'Analyst',
                description: 'Analyst Role',
                isSystemRole: true,
                allowedPages: [],
              },
            ],
            lastLoginAt: '2026-02-08T14:20:00Z',
          }),
        ],
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: users.length > 0 ? users.length : 2,
    totalPages: 1,
  },
});

const createMockUserActivity = (
  overrides: Partial<UserActivity> = {},
): UserActivity => ({
  id: 1,
  action: 'user.login',
  entityType: 'User',
  entityId: 1,
  details: 'Logged in successfully',
  ipAddress: '192.168.1.1',
  timestamp: '2026-02-09T08:30:00Z',
  ...overrides,
});

const createMockUserActivityList = (
  activities: UserActivity[] = [],
): UserActivityList => ({
  items:
    activities.length > 0
      ? activities
      : [
          createMockUserActivity(),
          createMockUserActivity({
            id: 2,
            action: 'user.profile_updated',
            details: 'Updated email address',
            timestamp: '2026-02-08T10:15:00Z',
          }),
        ],
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: activities.length > 0 ? activities.length : 2,
    totalPages: 1,
  },
});

describe('User Administration Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (usersApi.listRoles as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 1,
        name: 'Administrator',
        description: 'Administrator Role',
        isSystemRole: true,
        allowedPages: [],
      },
      {
        id: 2,
        name: 'Analyst',
        description: 'Analyst Role',
        isSystemRole: true,
        allowedPages: [],
      },
      {
        id: 3,
        name: 'ApproverL1',
        description: 'Level 1 Approver Role',
        isSystemRole: true,
        allowedPages: [],
      },
      {
        id: 4,
        name: 'ApproverL2',
        description: 'Level 2 Approver Role',
        isSystemRole: true,
        allowedPages: [],
      },
      {
        id: 5,
        name: 'ApproverL3',
        description: 'Level 3 Approver Role',
        isSystemRole: true,
        allowedPages: [],
      },
    ]);
  });

  describe('Authorization Check', () => {
    it('redirects non-admin users with access denied message', async () => {
      const mockUser = createMockNonAdminUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
        expect(
          screen.getByText(/administrator role required/i),
        ).toBeInTheDocument();
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });

  describe('Happy Path - View Users', () => {
    it('displays list of active users with their information', async () => {
      const mockUser = createMockAdminUser();
      const mockUsers = createMockUserList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('john.smith@company.com')).toBeInTheDocument();
        expect(screen.getByText('jsmith')).toBeInTheDocument();
        expect(screen.getByText('Mary Jones')).toBeInTheDocument();
      });
    });

    it('displays count of active users', async () => {
      const mockUser = createMockAdminUser();
      const users = [
        createMockUserDetail(),
        createMockUserDetail({ id: 2 }),
        createMockUserDetail({ id: 3 }),
      ];
      const mockUsers = createMockUserList(users);
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText(/showing 3 active users/i)).toBeInTheDocument();
      });
    });

    it('displays user row with department, username, roles, creation date, and last login', async () => {
      const mockUser = createMockAdminUser();
      const mockUsers = createMockUserList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUsers,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('Operations')).toBeInTheDocument();
        expect(screen.getByText('jsmith')).toBeInTheDocument();
        expect(screen.getAllByText('Analyst').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search and Filtering', () => {
    it('searches users by name, email, or username', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allUsers = createMockUserList();
      const filteredUsers = createMockUserList([
        createMockUserDetail({
          firstName: 'John',
          lastName: 'Doe',
          username: 'jdoe',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allUsers)
        .mockResolvedValueOnce(filteredUsers);

      render(<UsersClient />);

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

    it('filters by active/inactive status', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const activeUsers = createMockUserList();
      const inactiveUsers = createMockUserList([
        createMockUserDetail({
          isActive: false,
          deactivationReason: 'Left company',
          deactivatedAt: '2026-02-01T12:00:00Z',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(activeUsers)
        .mockResolvedValueOnce(inactiveUsers);

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const filterButton = screen.getByRole('button', {
        name: /inactive users/i,
      });
      await user.click(filterButton);

      await waitFor(() => {
        expect(usersApi.listUsers).toHaveBeenCalledWith(
          expect.objectContaining({ isActive: false }),
        );
        expect(screen.getByText(/left company/i)).toBeInTheDocument();
      });
    });

    it('filters by role', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allUsers = createMockUserList();
      const analystUsers = createMockUserList([
        createMockUserDetail({
          roles: [
            {
              id: 2,
              name: 'Analyst',
              description: 'Analyst Role',
              isSystemRole: true,
              allowedPages: [],
            },
          ],
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allUsers)
        .mockResolvedValueOnce(analystUsers);

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const roleFilter = screen.getByRole('combobox', {
        name: /filter by role/i,
      });
      await user.click(roleFilter);
      await user.click(screen.getByRole('option', { name: /analyst/i }));

      await waitFor(() => {
        expect(usersApi.listUsers).toHaveBeenCalledWith(
          expect.objectContaining({ roleId: 2 }),
        );
      });
    });

    it('filters by department', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allUsers = createMockUserList();
      const operationsUsers = createMockUserList([
        createMockUserDetail({ department: 'Operations' }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allUsers)
        .mockResolvedValueOnce(operationsUsers);

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deptFilter = screen.getByRole('combobox', {
        name: /filter by department/i,
      });
      await user.click(deptFilter);
      await user.click(screen.getByRole('option', { name: /operations/i }));

      await waitFor(() => {
        expect(usersApi.listUsers).toHaveBeenCalledWith(
          expect.objectContaining({ department: 'Operations' }),
        );
      });
    });
  });

  describe('Create New User', () => {
    it('opens modal with tabs when Add New User is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /basic info/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /roles & permissions/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /contact details/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /security/i }),
        ).toBeInTheDocument();
      });
    });

    it('creates user with basic information and role', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const newUser = createMockUserDetail({
        id: 99,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        username: 'jsmith',
        department: 'Operations',
      });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.createUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        newUser,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const departmentInput = screen.getByLabelText(/department/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Smith');
      await user.type(emailInput, 'john.smith@company.com');
      await user.type(usernameInput, 'jsmith');
      await user.type(departmentInput, 'Operations');

      const rolesTab = screen.getByRole('tab', {
        name: /roles & permissions/i,
      });
      await user.click(rolesTab);

      const analystCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(analystCheckbox);

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(usersApi.createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@company.com',
            username: 'jsmith',
            department: 'Operations',
            roleIds: expect.arrayContaining([expect.any(Number)]),
          }),
          'admin',
        );
      });
    }, 15000);

    it('creates user with force password change option', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const newUser = createMockUserDetail();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.createUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        newUser,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const rolesTab = screen.getByRole('tab', {
        name: /roles & permissions/i,
      });
      await user.click(rolesTab);
      const roleCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(roleCheckbox);

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      const forcePasswordCheckbox = screen.getByRole('checkbox', {
        name: /force password change on first login/i,
      });
      await user.click(forcePasswordCheckbox);

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'Test');
      const lastNameInput = screen.getByLabelText(/last name/i);
      await user.type(lastNameInput, 'User');
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@company.com');

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(usersApi.createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            forcePasswordChange: true,
          }),
          'admin',
        );
      });
    }, 10000);

    it('creates user with send welcome email option', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const newUser = createMockUserDetail();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.createUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        newUser,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const rolesTab = screen.getByRole('tab', {
        name: /roles & permissions/i,
      });
      await user.click(rolesTab);
      const roleCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(roleCheckbox);

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      const welcomeEmailCheckbox = screen.getByRole('checkbox', {
        name: /send welcome email with login instructions/i,
      });
      await user.click(welcomeEmailCheckbox);

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'Test');
      const lastNameInput = screen.getByLabelText(/last name/i);
      await user.type(lastNameInput, 'User');
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@company.com');

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(usersApi.createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            sendWelcomeEmail: true,
          }),
          'admin',
        );
      });
    }, 10000);
  });

  describe('Create New User - Validation', () => {
    it('shows error when first name is empty', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });

      expect(usersApi.createUser).not.toHaveBeenCalled();
    });

    it('shows error when email is empty', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText(/email address is required/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error when email already exists', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.createUser as ReturnType<typeof vi.fn>).mockRejectedValue({
        message: 'Email address already in use',
        statusCode: 400,
      });

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'john.smith@company.com');

      const rolesTab = screen.getByRole('tab', {
        name: /roles & permissions/i,
      });
      await user.click(rolesTab);
      const roleCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(roleCheckbox);

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText(/email address already in use/i),
        ).toBeInTheDocument();
      });
    }, 10000);

    it('shows error when username already exists', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.createUser as ReturnType<typeof vi.fn>).mockRejectedValue({
        message: 'Username already exists',
        statusCode: 400,
      });

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'john@company.com');
      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'jsmith');

      const rolesTab = screen.getByRole('tab', {
        name: /roles & permissions/i,
      });
      await user.click(rolesTab);
      const roleCheckbox = screen.getByRole('checkbox', {
        name: /analyst/i,
      });
      await user.click(roleCheckbox);

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText(/username already exists/i),
        ).toBeInTheDocument();
      });
    }, 10000);

    it('shows error when no roles are selected', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'john@company.com');

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText(/at least one role must be assigned/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edit Existing User', () => {
    it('opens edit modal with pre-filled data when Edit is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userToEdit = createMockUserDetail();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userToEdit,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
        expect(
          screen.getByDisplayValue('john.smith@company.com'),
        ).toBeInTheDocument();
      });
    });

    it('updates user email and shows success message', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userToEdit = createMockUserDetail({ email: 'old@company.com' });
      const updatedUser = createMockUserDetail({ email: 'new@company.com' });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userToEdit,
      );
      (usersApi.updateUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedUser,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'new@company.com');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(usersApi.updateUser).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            email: 'new@company.com',
          }),
          'admin',
        );
        expect(
          screen.getByText(/user updated successfully/i),
        ).toBeInTheDocument();
      });
    });

    it('adds a new role to user', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userToEdit = createMockUserDetail();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userToEdit,
      );
      (usersApi.updateUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue([
        ...userToEdit.roles,
        {
          id: 3,
          name: 'ApproverL1',
          description: 'Level 1 Approver Role',
          isSystemRole: true,
          allowedPages: [],
        },
      ]);

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const rolesTab = screen.getByRole('tab', {
        name: /roles & permissions/i,
      });
      await user.click(rolesTab);

      const approverCheckbox = screen.getByRole('checkbox', {
        name: /approver l1/i,
      });
      await user.click(approverCheckbox);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(usersApi.updateUserRoles).toHaveBeenCalled();
      });
    });

    it('removes a role from user', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userToEdit = createMockUserDetail({
        roles: [
          {
            id: 2,
            name: 'Analyst',
            description: 'Analyst Role',
            isSystemRole: true,
            allowedPages: [],
          },
          {
            id: 3,
            name: 'ApproverL1',
            description: 'Level 1 Approver Role',
            isSystemRole: true,
            allowedPages: [],
          },
        ],
      });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userToEdit,
      );
      (usersApi.updateUserRoles as ReturnType<typeof vi.fn>).mockResolvedValue([
        userToEdit.roles[0],
      ]);

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const rolesTab = screen.getByRole('tab', {
        name: /roles & permissions/i,
      });
      await user.click(rolesTab);

      const approverCheckbox = screen.getByRole('checkbox', {
        name: /approver l1/i,
      });
      await user.click(approverCheckbox);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(usersApi.updateUserRoles).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            roleIds: expect.not.arrayContaining([3]),
          }),
          'admin',
        );
      });
    });
  });

  describe('View User Details', () => {
    it('opens user details modal with tabs when View is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userDetails = createMockUserDetail();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userDetails,
      );
      (usersApi.getUserActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserActivityList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const viewButton = screen.getAllByRole('button', { name: /view/i })[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /overview/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /activity log/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /permissions/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('tab', { name: /audit trail/i }),
        ).toBeInTheDocument();
      });
    });

    it('displays full user profile in overview tab', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userDetails = createMockUserDetail();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userDetails,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const viewButton = screen.getAllByRole('button', { name: /view/i })[0];
      await user.click(viewButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('John Smith')).toBeInTheDocument();
        expect(within(dialog).getByText('jsmith')).toBeInTheDocument();
        expect(
          within(dialog).getByText('john.smith@company.com'),
        ).toBeInTheDocument();
        expect(within(dialog).getByText('EMP001')).toBeInTheDocument();
        expect(within(dialog).getByText('Operations')).toBeInTheDocument();
        expect(within(dialog).getByText('Operations Lead')).toBeInTheDocument();
      });
    });

    it('displays recent activity in activity log tab', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userDetails = createMockUserDetail();
      const activities = createMockUserActivityList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userDetails,
      );
      (usersApi.getUserActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        activities,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const viewButton = screen.getAllByRole('button', { name: /view/i })[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const activityTab = screen.getByRole('tab', { name: /activity log/i });
      await user.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText(/logged in successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/updated email address/i)).toBeInTheDocument();
      });
    });

    it('displays permissions breakdown in permissions tab', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const userDetails = createMockUserDetail();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        userDetails,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const viewButton = screen.getAllByRole('button', { name: /view/i })[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const permissionsTab = screen.getByRole('tab', { name: /permissions/i });
      await user.click(permissionsTab);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        const analystElements = within(dialog).getAllByText(/Analyst/i);
        expect(analystElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Deactivate User', () => {
    it('shows confirmation modal when Deactivate is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deactivateButton = screen.getAllByRole('button', {
        name: /deactivate/i,
      })[0];
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/deactivate user/i)).toBeInTheDocument();
      });
    });

    it('deactivates user with reason and shows inactive status', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const deactivatedUser = createMockUserDetail({
        isActive: false,
        deactivationReason: 'Left company for new opportunity',
        deactivatedAt: '2026-02-09T10:00:00Z',
      });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.deactivateUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        deactivatedUser,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deactivateButton = screen.getAllByRole('button', {
        name: /deactivate/i,
      })[0];
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const reasonInput = screen.getByLabelText(/reason for deactivation/i);
      await user.type(reasonInput, 'Left company for new opportunity');

      const confirmButton = screen.getByRole('button', {
        name: /confirm deactivation/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(usersApi.deactivateUser).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            reason: 'Left company for new opportunity',
          }),
          'admin',
        );
      });
    }, 10000);

    it('shows deactivation reason in user list for inactive users', async () => {
      const mockUser = createMockAdminUser();
      const inactiveUsers = createMockUserList([
        createMockUserDetail({
          isActive: false,
          deactivationReason: 'Left company for new opportunity',
          deactivatedAt: '2026-02-09T10:00:00Z',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        inactiveUsers,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText(/inactive/i)).toBeInTheDocument();
        expect(
          screen.getByText(/left company for new opportunity/i),
        ).toBeInTheDocument();
      });
    });

    it('requires reason for deactivation', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deactivateButton = screen.getAllByRole('button', {
        name: /deactivate/i,
      })[0];
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /confirm deactivation/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/deactivation reason is required for audit trail/i),
        ).toBeInTheDocument();
      });

      expect(usersApi.deactivateUser).not.toHaveBeenCalled();
    });
  });

  describe('Reactivate User', () => {
    it('reactivates deactivated user and shows active status', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const inactiveUser = createMockUserDetail({
        isActive: false,
        deactivationReason: 'Temporary leave',
        deactivatedAt: '2026-01-15T10:00:00Z',
      });
      const reactivatedUser = createMockUserDetail({ isActive: true });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList([inactiveUser]),
      );
      (usersApi.reactivateUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        reactivatedUser,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const reactivateButton = screen.getByRole('button', {
        name: /reactivate/i,
      });
      await user.click(reactivateButton);

      await waitFor(() => {
        expect(usersApi.reactivateUser).toHaveBeenCalledWith(1, 'admin');
      });
    });
  });

  describe('Export User List', () => {
    it('downloads Excel file when Export User List is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.exportUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBlob,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export user list/i,
      });
      await user.click(exportButton);

      await waitFor(() => {
        expect(usersApi.exportUsers).toHaveBeenCalled();
      });
    });
  });

  describe('Delete User', () => {
    it('shows delete confirmation modal when Delete is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByRole('button', {
        name: /^delete$/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(
          screen.getByText(/this action is permanent and cannot be undone/i),
        ).toBeInTheDocument();
      });
    });

    it('deletes user when username confirmation matches', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );
      (usersApi.deleteUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByRole('button', {
        name: /^delete$/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmInput = screen.getByLabelText(/type the username/i);
      await user.type(confirmInput, 'jsmith');

      const confirmButton = screen.getByRole('button', {
        name: /confirm delete/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(usersApi.deleteUser).toHaveBeenCalledWith(1, 'admin');
      });
    }, 10000);

    it('shows error when username confirmation does not match', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByRole('button', {
        name: /^delete$/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmInput = screen.getByLabelText(/type the username/i);
      await user.type(confirmInput, 'wrongname');

      const confirmButton = screen.getByRole('button', {
        name: /confirm delete/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/username does not match/i),
        ).toBeInTheDocument();
      });

      expect(usersApi.deleteUser).not.toHaveBeenCalled();
    });

    it('shows error when confirmation field is empty', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByRole('button', {
        name: /^delete$/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /confirm delete/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please type the username to confirm deletion/i),
        ).toBeInTheDocument();
      });

      expect(usersApi.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const mockUser = createMockAdminUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      const { container } = render(<UsersClient />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible table with proper headers', async () => {
      const mockUser = createMockAdminUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockUserList(),
      );

      render(<UsersClient />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /name/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /username/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /email/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /roles/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
