/**
 * Approvals Index Page
 *
 * Redirects to the appropriate approval level page based on user's role.
 * Each approval level has its own dedicated page:
 * - /approvals/level-1 (ApproverL1)
 * - /approvals/level-2 (ApproverL2)
 * - /approvals/level-3 (ApproverL3)
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/auth-server';
import { UserRole } from '@/types/roles';

export default async function ApprovalsPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Redirect to the appropriate approval level based on role
  if ((user.roles as string[]).includes(UserRole.ApproverL1)) {
    redirect('/approvals/level-1');
  }
  if ((user.roles as string[]).includes(UserRole.ApproverL2)) {
    redirect('/approvals/level-2');
  }
  if ((user.roles as string[]).includes(UserRole.ApproverL3)) {
    redirect('/approvals/level-3');
  }

  // User has no approver role
  redirect('/auth/forbidden');
}
