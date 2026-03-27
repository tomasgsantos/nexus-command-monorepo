import { useState, useEffect } from 'react';
import { getSession, signIn, signOut } from '@nexus/api';
import type { AuthUser } from '@nexus/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    getSession()
      .then((user) => setState({ user, loading: false, error: null }))
      .catch(() => setState({ user: null, loading: false, error: null }));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const user = await signIn(email, password);
      setState({ user, loading: false, error: null });
    } catch (err) {
      setState({ user: null, loading: false, error: err instanceof Error ? err.message : 'Login failed' });
    }
  }

  async function logout(): Promise<void> {
    await signOut();
    setState({ user: null, loading: false, error: null });
  }

  return { ...state, login, logout };
}
