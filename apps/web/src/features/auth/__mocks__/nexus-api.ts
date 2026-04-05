/**
 * Shared mock factory for @nexus/api
 *
 * Usage in test files:
 *   import { setupNexusApiMock, mockSignIn, mockSignInDemo, mockSignOut, mockGetSession } from './__mocks__/nexus-api';
 *   setupNexusApiMock();
 */

import { vi } from 'vitest';

export const mockSignIn = vi.fn();
export const mockSignInDemo = vi.fn();
export const mockSignOut = vi.fn();
export const mockGetSession = vi.fn();
export const mockSeedDemoEvents = vi.fn().mockResolvedValue(undefined);

export function setupNexusApiMock(): void {
  vi.mock('@nexus/api', () => ({
    signIn: mockSignIn,
    signInDemo: mockSignInDemo,
    signOut: mockSignOut,
    getSession: mockGetSession,
    seedDemoEvents: mockSeedDemoEvents,
  }));
}
