/**
 * Approval Level 3 Page - Executive Approval
 *
 * Dedicated page for Level 3 approvers only.
 * Focus: Overall report quality, material issues or concerns, final sign-off.
 * Route: /approvals/level-3
 * Required role: ApproverL3
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/auth-server';
import { hasPageAccess } from '@/lib/auth/auth-helpers';

export default async function ApprovalLevel3Page() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!hasPageAccess(user, '/approvals/level-3')) {
    redirect('/auth/forbidden');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">
          Approval Review - Level 3 (Executive)
        </h1>
        <p className="text-muted-foreground mt-2">
          Review overall report quality for final sign-off before publication.
        </p>
      </div>
    </main>
  );
}
