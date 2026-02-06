/**
 * Next.js 16 Proxy - Lightweight Request Interception
 *
 * IMPORTANT: This file uses Next.js 16's new proxy convention.
 * - File name: proxy.ts (NOT middleware.ts)
 * - Export name: proxy (NOT middleware)
 * - Runtime: Node.js (NOT Edge Runtime)
 *
 * Following Next.js 16 and Vercel's security best practices:
 * - This proxy is used ONLY for lightweight redirects
 * - Authentication/authorization checks are in Server Components (layouts)
 * - This prevents middleware-based authentication vulnerabilities
 *
 * Security Note:
 * Do NOT add authentication or authorization logic here. Use Server Components instead.
 */

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * Proxy function - handles lightweight request interception
 *
 * Current responsibilities:
 * - Redirect authenticated users away from /login
 *
 * NOT handled here (moved to layouts):
 * - Authentication checks → See app/(protected)/layout.tsx
 * - Role-based access control → See RoleGate component
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from login page
  if (pathname === '/login') {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (accessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
