export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystemRole: boolean;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
}

export interface UserDetail {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  isActive: boolean;
  roles: Role[];
  lastChangedUser: string;
  validFrom: string;
  validTo: string;
}

export interface UserWithPassword extends UserDetail {
  passwordHash: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PendingAction {
  id: string;
  type: 'file_alert' | 'validation' | 'approval' | 'master_data' | 'admin';
  title: string;
  description: string;
  link: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  entityType?: string;
  entityId?: number;
}

export interface DataQualitySummary {
  missingRatings: number;
  missingDurations: number;
  missingBetas: number;
  missingIndexPrices: number;
}

export interface ReportBatch {
  id: number;
  reportBatchType: 'Monthly' | 'Weekly';
  reportDate: string;
  workflowInstanceId: string | null;
  status: 'DataPreparation' | 'Level1Pending' | 'Level2Pending' | 'Level3Pending' | 'Approved' | 'Rejected';
}
