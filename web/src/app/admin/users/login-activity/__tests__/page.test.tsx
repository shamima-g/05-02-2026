/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 8
 * - Route: /admin/users/login-activity
 * - Target File: app/admin/users/login-activity/page.tsx
 * - Page Action: create_new
 *
 * Tests for Login Activity Monitoring
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import LoginActivityPage from '@/app/admin/users/login-activity/page';
import * as authApi from '@/lib/api/auth';
import * as auditApi from '@/lib/api/audit';
import * as usersApi from '@/lib/api/users';
import type { AuthUser } from '@/lib/api/auth';
import type {
  LoginAttempt,
  LoginActivityList,
  LoginActivitySummary,
  SecurityAlert,
  SecurityAlertList,
} from '@/lib/api/audit';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth API
vi.mock('@/lib/api/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock audit API
vi.mock('@/lib/api/audit', () => ({
  getLoginActivity: vi.fn(),
  getFailedLogins: vi.fn(),
  getUserLoginHistory: vi.fn(),
  getLoginAlerts: vi.fn(),
  exportLoginActivity: vi.fn(),
}));

// Mock users API
vi.mock('@/lib/api/users', () => ({
  listUsers: vi.fn(),
  unlockUserAccount: vi.fn(),
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
  permissions: ['manage_users', 'view_audit_logs', 'view_login_activity'],
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

const createMockLoginAttempt = (
  overrides: Partial<LoginAttempt> = {},
): LoginAttempt => ({
  id: 1,
  timestamp: '2026-01-05T14:23:00Z',
  username: 'jsmith',
  userId: 10,
  displayName: 'John Smith',
  isSuccessful: true,
  status: 'success',
  ipAddress: '192.168.1.45',
  location: 'London, UK',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  failureReason: null,
  consecutiveFailureCount: null,
  flags: [],
  accountLocked: false,
  lockExpiresAt: null,
  ...overrides,
});

const createMockSummary = (
  overrides: Partial<LoginActivitySummary> = {},
): LoginActivitySummary => ({
  successfulLogins: 145,
  failedAttempts: 3,
  lockedAccounts: 0,
  ...overrides,
});

const createMockLoginActivityList = (
  attempts: LoginAttempt[] = [],
  summary?: LoginActivitySummary,
): LoginActivityList => ({
  data:
    attempts.length > 0
      ? attempts
      : [
          createMockLoginAttempt(),
          createMockLoginAttempt({
            id: 2,
            timestamp: '2026-01-05T14:20:00Z',
            username: 'mjones',
            displayName: 'Mary Jones',
            ipAddress: '10.0.1.23',
            location: 'Johannesburg, ZA',
          }),
        ],
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: attempts.length > 0 ? attempts.length : 2,
    totalPages: 1,
  },
  summary: summary || createMockSummary(),
});

const createMockSecurityAlert = (
  overrides: Partial<SecurityAlert> = {},
): SecurityAlert => ({
  id: 1,
  type: 'multiple_failed_ip',
  severity: 'warning',
  message: 'Multiple failed login attempts detected from IP 203.45.67.89',
  ipAddress: '203.45.67.89',
  username: null,
  userId: null,
  timestamp: '2026-01-05T14:30:00Z',
  isActive: true,
  resolvedAt: null,
  ...overrides,
});

const createMockSecurityAlertList = (
  alerts: SecurityAlert[] = [],
): SecurityAlertList => ({
  data: alerts,
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: alerts.length,
    totalPages: 1,
  },
});

describe('Login Activity Monitoring Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Authorization Check', () => {
    it('shows access denied message for non-admin users', async () => {
      const mockUser = createMockNonAdminUser();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
        expect(
          screen.getByText(/administrator role required/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Happy Path - View Login Activity', () => {
    it('displays Login Activity Report heading', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /login activity report/i }),
        ).toBeInTheDocument();
      });
    });

    it('displays column headers for login activity table', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('columnheader', { name: /timestamp/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /username/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /status/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /ip address/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /location/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /user agent/i }),
        ).toBeInTheDocument();
      });
    });

    it('displays summary counts for successful logins, failed attempts, and locked accounts', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList(
        [],
        createMockSummary({
          successfulLogins: 145,
          failedAttempts: 3,
          lockedAccounts: 0,
        }),
      );
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/145 successful logins/i)).toBeInTheDocument();
        expect(screen.getByText(/3 failed attempts/i)).toBeInTheDocument();
        expect(screen.getByText(/0 locked accounts/i)).toBeInTheDocument();
      });
    });
  });

  describe('Date Range Filtering', () => {
    it('allows selecting custom date range and applying filter', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allActivity = createMockLoginActivityList();
      const filteredActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          timestamp: '2026-01-03T10:00:00Z',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allActivity)
        .mockResolvedValueOnce(filteredActivity);
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const fromDateInput = screen.getByLabelText(/from date/i);
      const toDateInput = screen.getByLabelText(/to date/i);
      await user.type(fromDateInput, '2026-01-01');
      await user.type(toDateInput, '2026-01-05');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      await waitFor(() => {
        expect(auditApi.getLoginActivity).toHaveBeenCalledWith(
          expect.objectContaining({
            from: expect.stringContaining('2026-01-01'),
            to: expect.stringContaining('2026-01-05'),
          }),
        );
      });
    });

    it('allows selecting preset Last 7 days and filters results', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allActivity = createMockLoginActivityList();
      const filteredActivity = createMockLoginActivityList([
        createMockLoginAttempt(),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allActivity)
        .mockResolvedValueOnce(filteredActivity);
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const presetButton = screen.getByRole('button', {
        name: /last 7 days/i,
      });
      await user.click(presetButton);

      await waitFor(() => {
        expect(auditApi.getLoginActivity).toHaveBeenCalledTimes(2);
      });
    });

    it('allows selecting preset Today and shows only today login attempts', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allActivity = createMockLoginActivityList();
      const todayActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          timestamp: new Date().toISOString(),
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allActivity)
        .mockResolvedValueOnce(todayActivity);
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const todayButton = screen.getByRole('button', { name: /today/i });
      await user.click(todayButton);

      await waitFor(() => {
        expect(auditApi.getLoginActivity).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Status Filtering', () => {
    it('shows all login attempts by default', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({ isSuccessful: true }),
        createMockLoginAttempt({
          id: 2,
          isSuccessful: false,
          status: 'failed',
          failureReason: 'invalid_password',
        }),
      ]);
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(auditApi.getLoginActivity).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'all',
          }),
        );
      });
    });

    it('filters to show only failed login attempts when View Failed Logins Only is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allActivity = createMockLoginActivityList();
      const failedActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          isSuccessful: false,
          status: 'failed',
          failureReason: 'invalid_password',
          consecutiveFailureCount: 1,
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allActivity)
        .mockResolvedValueOnce(failedActivity);
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const failedOnlyButton = screen.getByRole('button', {
        name: /view failed logins only/i,
      });
      await user.click(failedOnlyButton);

      await waitFor(() => {
        expect(auditApi.getLoginActivity).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'failed',
          }),
        );
      });
    });

    it('shows failure reasons for failed login attempts', async () => {
      const mockUser = createMockAdminUser();
      const failedActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          id: 1,
          isSuccessful: false,
          status: 'failed',
          failureReason: 'invalid_password',
          username: 'jsmith',
        }),
        createMockLoginAttempt({
          id: 2,
          isSuccessful: false,
          status: 'failed',
          failureReason: 'user_not_found',
          username: 'unknown',
          userId: null,
        }),
        createMockLoginAttempt({
          id: 3,
          isSuccessful: false,
          status: 'failed',
          failureReason: 'account_deactivated',
          username: 'olduser',
        }),
        createMockLoginAttempt({
          id: 4,
          isSuccessful: false,
          status: 'failed',
          failureReason: 'account_locked',
          username: 'jsmith',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        failedActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
        expect(screen.getByText(/user not found/i)).toBeInTheDocument();
        expect(screen.getByText(/account deactivated/i)).toBeInTheDocument();
        expect(screen.getByText(/account locked/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Filtering', () => {
    it('filters by specific user when selected from dropdown', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const allActivity = createMockLoginActivityList();
      const userActivity = createMockLoginActivityList([
        createMockLoginAttempt({ username: 'jsmith', userId: 10 }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(allActivity)
        .mockResolvedValueOnce(userActivity);
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [
          {
            id: 10,
            username: 'jsmith',
            displayName: 'John Smith',
            email: 'jsmith@company.com',
          },
        ],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      });

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const userFilter = screen.getByRole('combobox', {
        name: /filter by user/i,
      });
      await user.click(userFilter);
      await user.click(
        screen.getByRole('option', { name: /john smith \(jsmith\)/i }),
      );

      await waitFor(() => {
        expect(auditApi.getLoginActivity).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 10,
          }),
        );
      });
    });

    it('searches for users by typing in user filter', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );
      (usersApi.listUsers as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [
          {
            id: 10,
            username: 'jsmith',
            displayName: 'John Smith',
            email: 'jsmith@company.com',
          },
        ],
        meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      });

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', {
        name: /search users/i,
      });
      await user.type(searchInput, 'jsmith');

      await waitFor(() => {
        expect(usersApi.listUsers).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'jsmith',
          }),
        );
      });
    });
  });

  describe('Successful Login Display', () => {
    it('displays successful login with all details in correct format', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          timestamp: '2026-01-05T14:23:00Z',
          username: 'jsmith',
          displayName: 'John Smith',
          status: 'success',
          ipAddress: '192.168.1.45',
          location: 'London, UK',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/jsmith/i)).toBeInTheDocument();
        expect(screen.getAllByText(/success/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/192\.168\.1\.45/)).toBeInTheDocument();
        expect(screen.getByText(/london, uk/i)).toBeInTheDocument();
      });
    });

    it('shows full User Agent details when record is expanded', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const expandButton = screen.getByRole('button', {
        name: /expand details/i,
      });
      await user.click(expandButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Mozilla\/5\.0 \(Windows NT 10\.0/),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Failed Login Display', () => {
    it('displays failed login with username, status, IP, and failure reason', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          username: 'jsmith',
          isSuccessful: false,
          status: 'failed',
          ipAddress: '203.45.67.89',
          failureReason: 'invalid_password',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/jsmith/i)).toBeInTheDocument();
        expect(screen.getAllByText(/failed/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/203\.45\.67\.89/)).toBeInTheDocument();
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
      });
    });

    it('shows consecutive failure count for multiple failed attempts', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          isSuccessful: false,
          status: 'failed',
          failureReason: 'invalid_password',
          consecutiveFailureCount: 3,
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/attempt 3/i)).toBeInTheDocument();
      });
    });

    it('shows blocked IP indicator when IP is flagged', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          isSuccessful: false,
          status: 'failed',
          ipAddress: '203.45.67.89',
          location: 'Unknown',
          flags: ['ip_blocked'],
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/blocked/i)).toBeInTheDocument();
      });
    });
  });

  describe('Security Alerts', () => {
    it('shows alert banner for multiple failed attempts from same IP', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      const mockAlerts = createMockSecurityAlertList([
        createMockSecurityAlert({
          type: 'multiple_failed_ip',
          message:
            'Multiple failed login attempts detected from IP 203.45.67.89',
          ipAddress: '203.45.67.89',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAlerts,
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /multiple failed login attempts detected from ip 203\.45\.67\.89/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows alert for account lockout after failed attempts', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      const mockAlerts = createMockSecurityAlertList([
        createMockSecurityAlert({
          type: 'account_locked',
          message:
            "Account 'jsmith' temporarily locked after 3 failed attempts",
          username: 'jsmith',
          userId: 10,
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAlerts,
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /account 'jsmith' temporarily locked after 3 failed attempts/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows lock status indicator with expiry time for locked accounts', async () => {
      const mockUser = createMockAdminUser();
      const lockExpiry = '2026-01-05T15:00:00Z';
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          username: 'jsmith',
          accountLocked: true,
          lockExpiresAt: lockExpiry,
          isSuccessful: false,
          status: 'failed',
          failureReason: 'account_locked',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/locked until/i)).toBeInTheDocument();
      });
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('shows new location flag next to location', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          location: 'Cape Town, ZA',
          flags: ['new_location'],
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/new location/i)).toBeInTheDocument();
      });
    });

    it('shows impossible travel flag for suspicious login patterns', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          timestamp: '2026-01-05T10:00:00Z',
          location: 'London, UK',
        }),
        createMockLoginAttempt({
          id: 2,
          timestamp: '2026-01-05T10:30:00Z',
          location: 'Johannesburg, ZA',
          flags: ['impossible_travel'],
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/impossible travel/i)).toBeInTheDocument();
      });
    });

    it('shows brute force attack alert for multiple failed logins from different IPs', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      const mockAlerts = createMockSecurityAlertList([
        createMockSecurityAlert({
          type: 'brute_force',
          severity: 'critical',
          message: "Potential brute force attack on user 'jsmith'",
          username: 'jsmith',
          userId: 10,
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAlerts,
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/potential brute force attack on user 'jsmith'/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('triggers download when Export Login Report button is clicked', async () => {
      const user = userEvent.setup();
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );
      (
        auditApi.exportLoginActivity as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockBlob);

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export login report/i,
      });
      await user.click(exportButton);

      await waitFor(() => {
        expect(auditApi.exportLoginActivity).toHaveBeenCalled();
      });
    });
  });

  describe('IP Address Geolocation', () => {
    it('shows corporate location for internal IP addresses', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          ipAddress: '192.168.1.45',
          location: 'London, UK',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/192\.168\.1\.45/)).toBeInTheDocument();
        expect(screen.getByText(/london, uk/i)).toBeInTheDocument();
      });
    });

    it('shows geolocation for external IP addresses', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          ipAddress: '203.45.67.89',
          location: 'Johannesburg, ZA',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/johannesburg, za/i)).toBeInTheDocument();
      });
    });

    it('shows Unknown when geolocation fails', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList([
        createMockLoginAttempt({
          ipAddress: '10.0.0.1',
          location: 'Unknown',
        }),
      ]);

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByText(/unknown/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation from User Administration', () => {
    it('navigates to login activity page when View Login Activity button is clicked', async () => {
      const mockUser = createMockAdminUser();

      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      // Simulate being on User Administration page
      mockRouter.push('/admin/users/login-activity');

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/admin/users/login-activity',
      );
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      const { container } = render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible table with proper headers', async () => {
      const mockUser = createMockAdminUser();
      const mockActivity = createMockLoginActivityList();
      (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );
      (auditApi.getLoginActivity as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockActivity,
      );
      (auditApi.getLoginAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockSecurityAlertList(),
      );

      render(<LoginActivityPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /timestamp/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /username/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('columnheader', { name: /status/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
