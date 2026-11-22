export type UserRole = 'FOUNDER' | 'ENTERPRISE' | 'BACKER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organization?: string;
  headline?: string;
}

export interface AuthSession {
  user: User;
  mockToken: string;
}
