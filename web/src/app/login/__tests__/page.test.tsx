/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 1
 * - Route: /login
 * - Target File: app/login/page.tsx
 * - Page Action: create_new
 *
 * Tests for User Authentication with AD/LDAP Integration - Login Page
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import * as authApi from '@/lib/api/auth';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth API functions
vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Happy Path - Login Form Rendering', () => {
    it('renders login form with username and password fields', () => {
      render(<LoginPage />);

      expect(
        screen.getByRole('textbox', { name: /username/i }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it('submits credentials and redirects to dashboard on success', async () => {
      const user = userEvent.setup();
      const mockAuthResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 1800,
        user: {
          id: 'user-1',
          username: 'jdoe',
          displayName: 'John Doe',
          email: 'jdoe@example.com',
          roles: ['Analyst'],
          permissions: ['view_portfolios', 'create_reports'],
        },
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAuthResponse,
      );

      render(<LoginPage />);

      await user.type(
        screen.getByRole('textbox', { name: /username/i }),
        'jdoe',
      );
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          username: 'jdoe',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Failed Authentication', () => {
    it('shows error message for invalid credentials', async () => {
      const user = userEvent.setup();
      (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValue({
        message: 'Invalid username or password',
        statusCode: 401,
      });

      render(<LoginPage />);

      await user.type(
        screen.getByRole('textbox', { name: /username/i }),
        'wronguser',
      );
      await user.type(screen.getByLabelText(/password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Invalid username or password',
        );
      });
    });

    it('shows validation error when username field is empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('shows validation error when password field is empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(
        screen.getByRole('textbox', { name: /username/i }),
        'jdoe',
      );
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('shows account lockout message after 3 failed attempts', async () => {
      const user = userEvent.setup();
      (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValue({
        message:
          'Account temporarily locked. Please contact your administrator.',
        statusCode: 403,
      });

      render(<LoginPage />);

      await user.type(
        screen.getByRole('textbox', { name: /username/i }),
        'jdoe',
      );
      await user.type(screen.getByLabelText(/password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Account temporarily locked. Please contact your administrator.',
        );
      });
    });
  });

  describe('Inactive User Handling', () => {
    it('shows error message for deactivated account', async () => {
      const user = userEvent.setup();
      (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValue({
        message:
          'Your account has been deactivated. Please contact your administrator.',
        statusCode: 403,
      });

      render(<LoginPage />);

      await user.type(
        screen.getByRole('textbox', { name: /username/i }),
        'deactivated_user',
      );
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Your account has been deactivated. Please contact your administrator.',
        );
      });
    });
  });

  describe('Session Management - Already Authenticated', () => {
    it('redirects to dashboard if user is already authenticated', async () => {
      // Mock getCurrentUser to return a user (indicating authentication)
      const mockGetCurrentUser = vi.fn().mockResolvedValue({
        id: 'user-1',
        username: 'jdoe',
        displayName: 'John Doe',
        email: 'jdoe@example.com',
        roles: ['Analyst'],
        permissions: ['view_portfolios'],
      });

      // This will be called in the page component's useEffect
      vi.spyOn(authApi, 'getCurrentUser').mockImplementation(
        mockGetCurrentUser,
      );

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<LoginPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible form labels', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('disables submit button during login', async () => {
      const user = userEvent.setup();
      (authApi.login as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<LoginPage />);

      await user.type(
        screen.getByRole('textbox', { name: /username/i }),
        'jdoe',
      );
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(
        screen.getByRole('button', { name: /signing in/i }),
      ).toBeDisabled();
    });
  });
});
