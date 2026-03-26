import { useState } from 'react';
import { signInDemo } from '@nexus/api';
import type { AuthUser } from '@nexus/api';

interface UseDemoLoginReturn {
  loading: boolean;
  error: string | null;
  loginAsDemo: () => Promise<AuthUser | null>;
}

export function useDemoLogin(): UseDemoLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginAsDemo(): Promise<AuthUser | null> {
    setLoading(true);
    setError(null);
    try {
      const user = await signInDemo();
      setLoading(false);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
      setLoading(false);
      return null;
    }
  }

  return { loading, error, loginAsDemo };
}
