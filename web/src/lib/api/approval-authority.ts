/**
 * Approval Authority API Functions
 *
 * API wrappers for configuring approval authorities at each level (L1, L2, L3),
 * managing backup approvers, and configuring approval rules.
 */

import { get, post, put, del } from '@/lib/api/client';

/**
 * Summary information for an approver (used in backup approver lists)
 */
export interface ApproverSummary {
  id: number;
  userId: number;
  displayName: string;
  approvalLevel: number;
}

/**
 * Approval authority entry with user details, level, backup info, and OOO status
 */
export interface ApprovalAuthorityEntry {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  email: string | null;
  roleName: string;
  approvalLevel: 1 | 2 | 3;
  isBackup: boolean;
  isActive: boolean;
  isOutOfOffice: boolean;
  outOfOfficeUntil: string | null;
  backupApprovers: ApproverSummary[];
  effectiveFrom: string;
  effectiveTo: string | null;
  assignedBy: string;
  assignedAt: string;
  pendingApprovalCount: number;
}

/**
 * Request to create a new approval authority assignment
 */
export interface CreateApprovalAuthorityRequest {
  userId: number;
  approvalLevel: 1 | 2 | 3;
  isBackup?: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

/**
 * Request to update an existing approval authority
 */
export interface UpdateApprovalAuthorityRequest {
  isActive?: boolean;
  isOutOfOffice?: boolean;
  outOfOfficeUntil?: string | null;
  effectiveTo?: string | null;
}

/**
 * Request to configure backup approvers for a primary approver
 */
export interface ConfigureBackupRequest {
  backupUserIds: number[];
}

/**
 * Approval rules configuration for a level
 */
export interface ApprovalRulesConfig {
  level: 1 | 2 | 3;
  rule: 'any_one' | 'specific' | 'specific_assignee' | 'consensus';
  consensusRequired?: number | null;
}

/**
 * Request to update approval rules for a level
 */
export interface UpdateApprovalRulesRequest {
  level: 1 | 2 | 3;
  rule: 'any_one' | 'specific' | 'specific_assignee' | 'consensus';
  consensusRequired?: number | null;
}

/**
 * List approval authorities with optional filtering
 *
 * @param params - Query parameters for filtering
 * @returns Array of approval authority entries
 */
export async function listApprovalAuthorities(params?: {
  level?: 1 | 2 | 3;
  activeOnly?: boolean;
}): Promise<ApprovalAuthorityEntry[]> {
  return get<ApprovalAuthorityEntry[]>('/approval-authorities', params);
}

/**
 * Assign a new approval authority
 *
 * @param data - Approval authority assignment data
 * @param lastChangedUser - Username of the admin assigning the authority (for audit)
 * @returns Created approval authority entry
 */
export async function assignApprovalAuthority(
  data: CreateApprovalAuthorityRequest,
  lastChangedUser: string,
): Promise<ApprovalAuthorityEntry> {
  return post<ApprovalAuthorityEntry>(
    '/approval-authorities',
    data,
    lastChangedUser,
  );
}

/**
 * Update an approval authority (e.g., mark out-of-office, change effective dates)
 *
 * @param id - Approval authority ID
 * @param data - Updated approval authority data
 * @param lastChangedUser - Username of the admin updating the authority (for audit)
 * @returns Updated approval authority entry
 */
export async function updateApprovalAuthority(
  id: number,
  data: UpdateApprovalAuthorityRequest,
  lastChangedUser: string,
): Promise<ApprovalAuthorityEntry> {
  return put<ApprovalAuthorityEntry>(
    `/approval-authorities/${id}`,
    data,
    lastChangedUser,
  );
}

/**
 * Remove an approval authority (deactivate)
 *
 * @param id - Approval authority ID
 * @param lastChangedUser - Username of the admin removing the authority (for audit)
 */
export async function removeApprovalAuthority(
  id: number,
  lastChangedUser: string,
): Promise<void> {
  return del<void>(`/approval-authorities/${id}`, lastChangedUser);
}

/**
 * Configure backup approvers for a primary approver
 *
 * @param id - Primary approver's approval authority ID
 * @param data - Backup approver configuration
 * @param lastChangedUser - Username of the admin configuring backups (for audit)
 */
export async function configureBackupApprovers(
  id: number,
  data: ConfigureBackupRequest,
  lastChangedUser: string,
): Promise<void> {
  return post<void>(
    `/approval-authorities/${id}/backup`,
    data,
    lastChangedUser,
  );
}

/**
 * Get approval rules configuration for all levels
 *
 * @returns Array of approval rules configurations
 */
export async function getApprovalRules(): Promise<ApprovalRulesConfig[]> {
  return get<ApprovalRulesConfig[]>('/approval-authorities/rules');
}

/**
 * Update approval rules configuration for a specific level
 *
 * @param data - Updated approval rules configuration
 * @param lastChangedUser - Username of the admin updating the rules (for audit)
 * @returns Updated approval rules configuration
 */
export async function updateApprovalRules(
  data: UpdateApprovalRulesRequest,
  lastChangedUser: string,
): Promise<ApprovalRulesConfig> {
  return put<ApprovalRulesConfig>(
    '/approval-authorities/rules',
    data,
    lastChangedUser,
  );
}
