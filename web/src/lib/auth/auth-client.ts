'use client';

import { login as apiLogin, getCurrentUser } from '@/lib/api/auth';
import { resetSessionTimeout } from '@/lib/auth/session';
import type { AuthUser } from '@/types/auth';

export async function signIn(
  username: string,
  password: string,
): Promise<{ error?: string; ok: boolean }> {
  try {
    const response = await apiLogin({ username, password });
    document.cookie = `accessToken=${response.accessToken}; path=/; max-age=${response.expiresIn}`;
    document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=${response.expiresIn * 2}`;
    resetSessionTimeout();
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Invalid credentials';
    return { error: message, ok: false };
  }
}

export async function signOut(): Promise<void> {
  document.cookie =
    'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie =
    'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  localStorage.removeItem('lastActivityTime');
  window.location.href = '/login';
}

export async function getUser(): Promise<AuthUser | null> {
  try {
    const user = await getCurrentUser();
    return user as AuthUser;
  } catch {
    return null;
  }
}
