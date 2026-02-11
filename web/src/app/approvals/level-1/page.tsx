/**
 * Approval Level 1 Page - Operations Approval
 *
 * Dedicated page for Level 1 approvers only.
 * Focus: File receipt completeness, data validation checks, all expected data elements present.
 * Route: /approvals/level-1
 * Required role: ApproverL1
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/auth-server';
import { hasPageAccess } from '@/lib/auth/auth-helpers';

export default async function ApprovalLevel1Page() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!hasPageAccess(user, '/approvals/level-1')) {
    redirect('/auth/forbidden');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">
          Approval Review - Level 1 (Operations)
        </h1>
        <p className="text-muted-foreground mt-2">
          Review file completeness, data validation, and all expected data
          elements.
        </p>
      </div>
    </main>
  );
}
