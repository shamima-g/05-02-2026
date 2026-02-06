import { UserRole } from './roles';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
