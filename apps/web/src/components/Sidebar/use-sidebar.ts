import { useState, useCallback } from 'react';

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => window.matchMedia('(max-width: 480px)').matches,
  );
  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  return { collapsed, toggle };
}
