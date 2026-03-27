import type { AuthUser } from "@nexus/api";


export const mockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 'user-123',
  email: 'test@nexus.app',
  profile: {
    id: 'user-123',
    role: 'consultant' as const,
    display_name: 'Test User',
    avatar_url: null,
  },
  ...overrides
})