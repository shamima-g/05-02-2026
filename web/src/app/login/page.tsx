'use client';

/**
 * Login Page
 *
 * User authentication interface with AD/LDAP integration.
 * Handles login form submission, validation, and redirects.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, getCurrentUser } from '@/lib/api/auth';
import { resetSessionTimeout } from '@/lib/auth/session';

/**
 * Login Page Component
 *
 * Features:
 * - Username and password form with validation
 * - Error handling for invalid credentials, locked accounts, and deactivated users
 * - Automatic redirect if user is already authenticated
 * - Loading state during authentication
 * - Accessible form with ARIA labels and error messages
 */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        // If getCurrentUser succeeds, user is authenticated
        router.replace('/');
      } catch {
        // User is not authenticated, stay on login page
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Client-side validation
    if (!username.trim()) {
      setValidationError('Username is required');
      return;
    }

    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ username, password });

      // Store tokens in cookies (this would typically be handled by the API client)
      document.cookie = `accessToken=${response.accessToken}; path=/; max-age=${response.expiresIn}`;
      document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=${response.expiresIn * 2}`;

      // Initialize session timeout
      resetSessionTimeout();

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      // Handle authentication errors
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="text-sm text-red-600">{validationError}</div>
            )}

            {/* API Error */}
            {error && (
              <div
                role="alert"
                className="rounded-md bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
