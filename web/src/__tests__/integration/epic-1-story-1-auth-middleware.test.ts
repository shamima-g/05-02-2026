/**
 * Story Metadata:
 * - Epic: 1
 * - Story: 1
 * - Target: middleware.ts
 *
 * Tests for Authentication Middleware
 * Ensures unauthenticated users are redirected to /login
 * Uses cookie-based JWT authentication
 */
import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';

/**
 * Helper to create a NextRequest with optional accessToken cookie
 */
function createRequest(path: string, accessToken?: string): NextRequest {
  const url = new URL(`http://localhost:3000${path}`);
  const headers = new Headers();
  if (accessToken) {
    headers.set('cookie', `accessToken=${accessToken}`);
  }
  return new NextRequest(url, { headers });
}

describe('Authentication Middleware', () => {
  describe('Unauthenticated Access', () => {
    it('redirects to /login when accessing root without authentication', async () => {
      const request = createRequest('/');

      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/login');
    });

    it('redirects to /login when accessing dashboard without authentication', async () => {
      const request = createRequest('/dashboard');

      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.headers.get('location')).toContain('/login');
    });

    it('redirects to /login when accessing protected routes without authentication', async () => {
      const protectedRoutes = [
        '/portfolios',
        '/reports',
        '/admin',
        '/approvals',
      ];

      for (const route of protectedRoutes) {
        const request = createRequest(route);
        const response = await middleware(request);

        expect(response?.headers.get('location')).toContain('/login');
      }
    });

    it('allows access to /login without authentication', async () => {
      const request = createRequest('/login');

      const response = await middleware(request);

      expect(response).toBeUndefined();
    });

    it('allows access to public assets without authentication', async () => {
      const publicPaths = [
        '/_next/static/chunk.js',
        '/favicon.ico',
        '/images/logo.png',
      ];

      for (const path of publicPaths) {
        const request = createRequest(path);
        const response = await middleware(request);

        expect(response).toBeUndefined();
      }
    });
  });

  describe('Authenticated Access', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEifQ.mock';

    it('allows authenticated users to access root', async () => {
      const request = createRequest('/', mockToken);

      const response = await middleware(request);

      expect(response).toBeUndefined();
    });

    it('allows authenticated users to access dashboard', async () => {
      const request = createRequest('/dashboard', mockToken);

      const response = await middleware(request);

      expect(response).toBeUndefined();
    });

    it('redirects authenticated users away from /login to /', async () => {
      const request = createRequest('/login', mockToken);

      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      const location = response?.headers.get('location') ?? '';
      const url = new URL(location);
      expect(url.pathname).toBe('/');
    });
  });

  describe('Session Validation', () => {
    it('treats request without accessToken cookie as unauthenticated', async () => {
      const request = createRequest('/dashboard');

      const response = await middleware(request);

      expect(response?.headers.get('location')).toContain('/login');
    });

    it('treats request with accessToken cookie as authenticated', async () => {
      const request = createRequest(
        '/dashboard',
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEifQ.mock',
      );

      const response = await middleware(request);

      expect(response).toBeUndefined();
    });
  });
});
