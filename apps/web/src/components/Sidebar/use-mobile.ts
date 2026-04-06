import { useState, useEffect } from 'react';

const BREAKPOINT = '(max-width: 480px)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(BREAKPOINT).matches);

  useEffect(() => {
    const mq = window.matchMedia(BREAKPOINT);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
