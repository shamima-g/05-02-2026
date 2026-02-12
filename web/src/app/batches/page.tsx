/**
 * Batches Page
 *
 * Server component that handles authentication and authorization,
 * then renders the client-side batch management UI.
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/auth-server';
import { hasPageAccess } from '@/lib/auth/auth-helpers';
import BatchesClient from './BatchesClient';

export default async function BatchesPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!hasPageAccess(user, '/batches')) {
    redirect('/auth/forbidden');
  }

  return <BatchesClient />;
}
