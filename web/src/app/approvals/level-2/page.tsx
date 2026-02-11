/**
 * Approval Level 2 Page - Portfolio Manager Approval
 *
 * Dedicated page for Level 2 approvers only.
 * Focus: Holdings reasonableness, performance results, risk metrics accuracy.
 * Route: /approvals/level-2
 * Required role: ApproverL2
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/auth-server';
import { hasPageAccess } from '@/lib/auth/auth-helpers';

export default async function ApprovalLevel2Page() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!hasPageAccess(user, '/approvals/level-2')) {
    redirect('/auth/forbidden');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">
          Approval Review - Level 2 (Portfolio Manager)
        </h1>
        <p className="text-muted-foreground mt-2">
          Review holdings reasonableness, performance results, and risk metrics.
        </p>
      </div>
    </main>
  );
}
