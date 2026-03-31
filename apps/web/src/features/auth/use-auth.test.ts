/**
 * Unit tests — useAuth hook
 * Covers: initial loading state, resolves with user on success, resolves with null on failure,
 *         logout calls signOut and clears user
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/* ── Mocks ─────────────────────────────────────────────────── */

// Must be called before the module under test is imported
import {
  setupNexusApiMock,
  mockSignIn,
  mockSignOut,
  mockGetSession,
} from './__mocks__/nexus-api';

setupNexusApiMock();

import { useAuth } from './hooks/use-auth';
import { mockUser } from './__mocks__/user';

/* ── Tests ──────────────────────────────────────────────────── */

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with loading=true and user=null before session resolves', () => {
    // Never-resolving promise keeps us in loading state
    mockGetSession.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets user and loading=false after getSession resolves with a user', async () => {
    const user = mockUser();
    mockGetSession.mockResolvedValue(user);

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(user);
    expect(result.current.error).toBeNull();
  });

  it('sets user=null and loading=false after getSession rejects', async () => {
    mockGetSession.mockRejectedValue(new Error('Session expired'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets user after successful login', async () => {
    const user = mockUser({ email: 'admin@nexus.app' });
    mockGetSession.mockResolvedValue(null);
    mockSignIn.mockResolvedValue(user);

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    await act(async () => {
      await result.current.login('admin@nexus.app', 'password');
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when login fails', async () => {
    mockGetSession.mockResolvedValue(null);
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    await act(async () => {
      await result.current.login('bad@nexus.app', 'wrong');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('calls signOut and clears user on logout', async () => {
    const user = mockUser();
    mockGetSession.mockResolvedValue(user);
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(result.current.user).toEqual(user);

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
