/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 1
 * - Target: lib/api/auth.ts
 *
 * Tests for Auth API Functions
 * These functions wrap the API client for authentication endpoints
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { login, getCurrentUser, refreshToken } from '@/lib/api/auth';
import * as apiClient from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  post: vi.fn(),
  get: vi.fn(),
}));

const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockGet = apiClient.get as ReturnType<typeof vi.fn>;

describe('Auth API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls POST /auth/login with credentials', async () => {
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
          permissions: ['view_portfolios'],
          allowedPages: [],
        },
      };

      mockPost.mockResolvedValue(mockAuthResponse);

      const credentials = {
        username: 'jdoe',
        password: 'password123',
      };

      const result = await login(credentials);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockAuthResponse);
    });

    it('throws error for invalid credentials', async () => {
      const mockError = {
        message: 'Invalid username or password',
        statusCode: 401,
      };

      mockPost.mockRejectedValue(mockError);

      const credentials = {
        username: 'wronguser',
        password: 'wrongpass',
      };

      await expect(login(credentials)).rejects.toEqual(mockError);
      expect(mockPost).toHaveBeenCalledWith('/auth/login', credentials);
    });

    it('throws error for deactivated account', async () => {
      const mockError = {
        message:
          'Your account has been deactivated. Please contact your administrator.',
        statusCode: 403,
      };

      mockPost.mockRejectedValue(mockError);

      const credentials = {
        username: 'deactivated_user',
        password: 'password123',
      };

      await expect(login(credentials)).rejects.toEqual(mockError);
    });

    it('throws error for locked account', async () => {
      const mockError = {
        message:
          'Account temporarily locked. Please contact your administrator.',
        statusCode: 403,
      };

      mockPost.mockRejectedValue(mockError);

      const credentials = {
        username: 'locked_user',
        password: 'password123',
      };

      await expect(login(credentials)).rejects.toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('calls GET /auth/me to retrieve current user info', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'jdoe',
        displayName: 'John Doe',
        email: 'jdoe@example.com',
        roles: ['Analyst', 'ApproverL1'],
        permissions: [
          'view_portfolios',
          'create_reports',
          'approve_reports_l1',
        ],
        allowedPages: [],
      };

      mockGet.mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('throws 401 error if not authenticated', async () => {
      const mockError = {
        message: 'Unauthorized: Please log in to continue',
        statusCode: 401,
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getCurrentUser()).rejects.toEqual(mockError);
      expect(mockGet).toHaveBeenCalledWith('/auth/me');
    });

    it('returns user with multiple roles', async () => {
      const mockUser = {
        id: 'user-admin',
        username: 'admin',
        displayName: 'System Administrator',
        email: 'admin@example.com',
        roles: ['Administrator', 'Analyst'],
        permissions: ['*'],
        allowedPages: [],
      };

      mockGet.mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(result.roles).toEqual(['Administrator', 'Analyst']);
      expect(result.permissions).toEqual(['*']);
    });
  });

  describe('refreshToken', () => {
    it('calls POST /auth/refresh with refresh token', async () => {
      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 1800,
        user: {
          id: 'user-1',
          username: 'jdoe',
          displayName: 'John Doe',
          email: 'jdoe@example.com',
          roles: ['Analyst'],
          permissions: ['view_portfolios'],
          allowedPages: [],
        },
      };

      mockPost.mockResolvedValue(mockRefreshResponse);

      const result = await refreshToken('old-refresh-token');

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token',
      });
      expect(result).toEqual(mockRefreshResponse);
    });

    it('throws error for invalid refresh token', async () => {
      const mockError = {
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      };

      mockPost.mockRejectedValue(mockError);

      await expect(refreshToken('invalid-token')).rejects.toEqual(mockError);
    });
  });
});
