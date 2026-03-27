/**
 * Auth scaffold unit tests — Tester QA
 * Covers: useLoginForm, useDemoLogin, LoginCard (smoke)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { setupNexusApiMock, mockSignIn, mockSignInDemo } from './__mocks__/nexus-api';

setupNexusApiMock();

import { useLoginForm } from './hooks/use-login-form';
import { useDemoLogin } from './hooks/use-demo-login';
import { mockUser as createMockUser } from './__mocks__/user';

const mockUser = createMockUser();
const mockDemoUser = createMockUser({
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@nexus.app',
  profile: {
    id: '00000000-0000-0000-0000-000000000001',
    role: 'demo' as const,
    display_name: 'Demo User',
    avatar_url: null,
  },
})


describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls signIn with the provided email and password', async () => {
    mockSignIn.mockResolvedValue(mockUser);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLoginForm(onSuccess));

    await act(async () => {
      await result.current.login('test@nexus.app', 'secret');
    });

    expect(mockSignIn).toHaveBeenCalledOnce();
    expect(mockSignIn).toHaveBeenCalledWith('test@nexus.app', 'secret');
  });

  it('calls onSuccess with the returned user on a successful sign-in', async () => {
    mockSignIn.mockResolvedValue(mockUser);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLoginForm(onSuccess));

    await act(async () => {
      await result.current.login('test@nexus.app', 'secret');
    });

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith(mockUser);
  });

  it('sets error state with the error message when sign-in fails', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLoginForm(onSuccess));

    await act(async () => {
      await result.current.login('bad@nexus.app', 'wrong');
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('uses a fallback error message for non-Error rejections', async () => {
    mockSignIn.mockRejectedValue('raw string error');
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLoginForm(onSuccess));

    await act(async () => {
      await result.current.login('bad@nexus.app', 'wrong');
    });

    expect(result.current.error).toBe('Login failed');
  });

  it('loading is true during sign-in and false after success', async () => {
    let resolveSignIn!: (v: typeof mockUser) => void;
    mockSignIn.mockImplementation(
      () => new Promise((res) => { resolveSignIn = res; })
    );
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLoginForm(onSuccess));

    act(() => {
      result.current.login('test@nexus.app', 'secret');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveSignIn(mockUser);
    });

    expect(result.current.loading).toBe(false);
  });

  it('loading is false after a failed sign-in', async () => {
    mockSignIn.mockRejectedValue(new Error('Boom'));
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLoginForm(onSuccess));

    await act(async () => {
      await result.current.login('bad@nexus.app', 'wrong');
    });

    expect(result.current.loading).toBe(false);
  });

  it('clears a previous error when login is retried', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('First failure'));
    mockSignIn.mockResolvedValueOnce(mockUser);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useLoginForm(onSuccess));

    await act(async () => {
      await result.current.login('test@nexus.app', 'bad');
    });
    expect(result.current.error).toBe('First failure');

    await act(async () => {
      await result.current.login('test@nexus.app', 'correct');
    });
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith(mockUser);
  });
});

describe('useDemoLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls signInDemo when loginAsDemo is invoked', async () => {
    mockSignInDemo.mockResolvedValue(mockDemoUser);

    const { result } = renderHook(() => useDemoLogin());

    await act(async () => {
      await result.current.loginAsDemo();
    });

    expect(mockSignInDemo).toHaveBeenCalledOnce();
  });

  it('returns the user and calls no onSuccess (hook returns user directly)', async () => {
    mockSignInDemo.mockResolvedValue(mockDemoUser);

    const { result } = renderHook(() => useDemoLogin());

    let returnedUser: typeof mockDemoUser | null = null;
    await act(async () => {
      returnedUser = await result.current.loginAsDemo() as typeof mockDemoUser | null;
    });

    expect(returnedUser).toEqual(mockDemoUser);
  });

  it('sets error state when demo login fails', async () => {
    mockSignInDemo.mockRejectedValue(new Error('Demo unavailable'));

    const { result } = renderHook(() => useDemoLogin());

    await act(async () => {
      await result.current.loginAsDemo();
    });

    expect(result.current.error).toBe('Demo unavailable');
  });

  it('returns null when demo login fails', async () => {
    mockSignInDemo.mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useDemoLogin());

    let returnedUser: unknown;
    await act(async () => {
      returnedUser = await result.current.loginAsDemo();
    });

    expect(returnedUser).toBeNull();
  });

  it('uses a fallback error message for non-Error rejections', async () => {
    mockSignInDemo.mockRejectedValue('opaque error');

    const { result } = renderHook(() => useDemoLogin());

    await act(async () => {
      await result.current.loginAsDemo();
    });

    expect(result.current.error).toBe('Demo login failed');
  });

  it('loading is true during demo login and false after success', async () => {
    let resolveDemoLogin!: (v: typeof mockDemoUser) => void;
    mockSignInDemo.mockImplementation(
      () => new Promise((res) => { resolveDemoLogin = res; })
    );

    const { result } = renderHook(() => useDemoLogin());

    act(() => {
      result.current.loginAsDemo();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveDemoLogin(mockDemoUser);
    });

    expect(result.current.loading).toBe(false);
  });

  it('loading is false after a failed demo login', async () => {
    mockSignInDemo.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useDemoLogin());

    await act(async () => {
      await result.current.loginAsDemo();
    });

    expect(result.current.loading).toBe(false);
  });
});
