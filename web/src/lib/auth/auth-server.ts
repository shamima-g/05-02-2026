/**
 * Server-Side Authentication Helpers
 *
 * Uses JWT tokens stored in cookies for authentication.
 * The actual JWT verification happens at the API layer.
 * Server components decode the token payload for rendering purposes.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { AuthUser } from '@/types/auth';

/**
 * Decode JWT payload without signature verification.
 * The API layer handles actual token validation.
 */
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return {
      id: payload.sub,
      username: payload.username,
      displayName: payload.displayName,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
      allowedPages: payload.allowedPages || [],
    };
  } catch {
    return null;
  }
}

/**
 * Requires authentication. Redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<AuthUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = decodeJwtPayload(token);
  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Requires the user to have a specific permission.
 */
export async function requirePermission(permission: string): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.permissions.includes(permission)) {
    redirect(`/auth/forbidden?required=${permission}`);
  }
  return user;
}

/**
 * Requires the user to have any of the specified roles.
 */
export async function requireAnyRole(roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.some((r) => (user.roles as string[]).includes(r))) {
    redirect(`/auth/forbidden?required=${roles.join(',')}`);
  }
  return user;
}

/**
 * Gets the current user without requiring authentication.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  return decodeJwtPayload(token);
}
