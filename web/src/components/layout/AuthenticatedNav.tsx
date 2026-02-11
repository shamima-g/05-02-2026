'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';

interface UserInfo {
  displayName: string;
  roles: string[];
  allowedPages: string[];
}

function decodeTokenPayload(token: string): UserInfo | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    return {
      displayName: payload.displayName || payload.username || 'User',
      roles: payload.roles || [],
      allowedPages: payload.allowedPages || [],
    };
  } catch {
    return null;
  }
}

function getUserInfoFromCookie(): UserInfo | null {
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  if (match && match[1]) {
    return decodeTokenPayload(match[1]);
  }
  return null;
}

export function AuthenticatedNav() {
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Wrap in requestAnimationFrame to defer state update
    requestAnimationFrame(() => {
      const info = getUserInfoFromCookie();
      setUserInfo(info);
    });
  }, [pathname]);

  // Don't show nav on login or auth pages
  if (!userInfo || pathname === '/login' || pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <AppHeader
      displayName={userInfo.displayName}
      roles={userInfo.roles}
      allowedPages={userInfo.allowedPages}
    />
  );
}
