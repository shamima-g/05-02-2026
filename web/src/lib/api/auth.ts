/**
 * Authentication API Functions
 *
 * API wrappers for authentication endpoints including login, user info, and token refresh.
 * Uses the base API client for consistent error handling and request formatting.
 */

import { get, post } from '@/lib/api/client';

/**
 * User authentication credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  roles: string[];
  permissions: string[];
  allowedPages: string[];
}

/**
 * Authentication response including tokens and user data
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

/**
 * Activity log data for audit trail
 */
export interface ActivityLogData {
  action: string;
  timestamp: number;
}

/**
 * Login with username and password
 *
 * @param credentials - Username and password
 * @returns Authentication response with tokens and user data
 * @throws APIError on authentication failure (401) or account issues (403)
 */
export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login', credentials);
}

/**
 * Get current authenticated user information
 *
 * @returns User data including roles and permissions
 * @throws APIError if not authenticated (401)
 */
export async function getCurrentUser(): Promise<AuthUser> {
  return get<AuthUser>('/auth/me');
}

/**
 * Refresh authentication token
 *
 * @param token - Current refresh token
 * @returns New authentication response with refreshed tokens
 * @throws APIError if refresh token is invalid or expired (401)
 */
export async function refreshToken(token: string): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/refresh', { refreshToken: token });
}

/**
 * Log user activity for audit trail
 *
 * @param data - Activity data including action and timestamp
 */
export async function logActivity(data: ActivityLogData): Promise<void> {
  await post('/auth/activity', data);
}
