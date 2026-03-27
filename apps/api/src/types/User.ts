export type UserRole = 'admin' | 'consultant' | 'viewer' | 'demo';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}
