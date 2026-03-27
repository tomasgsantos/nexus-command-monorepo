import { useState } from 'react';
import { signIn } from '@nexus/api';
import type { AuthUser } from '@nexus/api';

interface UseLoginFormReturn {
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
}

export function useLoginForm(onSuccess: (user: AuthUser) => void): UseLoginFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const user = await signIn(email, password);
      setLoading(false);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  }

  return { loading, error, login };
}
