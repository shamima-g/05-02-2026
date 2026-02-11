/**
 * Batches Page
 *
 * Requires Analyst role (uses dynamic page access via allowedPages).
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/auth-server';
import { hasPageAccess } from '@/lib/auth/auth-helpers';

export default async function BatchesPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!hasPageAccess(user, '/batches')) {
    redirect('/auth/forbidden');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Batches</h1>
        <p className="text-muted-foreground mt-2">
          Manage reporting batches and submissions.
        </p>
      </div>
    </main>
  );
}
