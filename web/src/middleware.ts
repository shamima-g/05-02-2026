/**
 * Next.js Middleware for Route Protection
 *
 * Handles authentication checks and redirects for protected routes.
 * Reads the accessToken cookie directly from the request.
 * Unauthenticated users are redirected to /login.
 * Authenticated users trying to access /login are redirected to /.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * List of protected route patterns that require authentication
 */
const PROTECTED_ROUTES = [
  '/',
  '/dashboard',
  '/portfolios',
  '/reports',
  '/admin',
  '/approvals',
];

/**
 * List of public paths that don't require authentication
 */
const PUBLIC_PATHS = ['/login'];

/**
 * List of static asset patterns that should be allowed without authentication
 */
const STATIC_ASSET_PATTERNS = ['/_next/static', '/favicon.ico', '/images'];

/**
 * Check if a path matches any of the static asset patterns
 */
function isStaticAsset(pathname: string): boolean {
  return STATIC_ASSET_PATTERNS.some((pattern) => pathname.startsWith(pattern));
}

/**
 * Check if a path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.includes(pathname);
}

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

/**
 * Middleware function to protect routes based on authentication
 *
 * @param request - The Next.js request object
 * @returns Response with redirect if needed, undefined to allow request to proceed
 */
export async function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  const { pathname } = request.nextUrl;

  // Allow static assets without authentication
  if (isStaticAsset(pathname)) {
    return undefined;
  }

  // Check authentication status via accessToken cookie
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // Handle authenticated users
  if (isAuthenticated) {
    // Redirect authenticated users away from login page
    if (isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow access to all other routes
    return undefined;
  }

  // Handle unauthenticated users
  // Allow access to public routes (login page)
  if (isPublicRoute(pathname)) {
    return undefined;
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 307,
    });
  }

  // Allow access to other routes by default
  return undefined;
}

/**
 * Matcher configuration for middleware
 * Only run middleware on specific paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (already protected by API auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
