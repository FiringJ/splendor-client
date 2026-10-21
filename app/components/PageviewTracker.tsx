'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageview } from '../lib/analytics/pageview';

/**
 * Mount once in the root layout. Fires on initial load and on route changes.
 */
export function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    void trackPageview(pathname);
  }, [pathname]);

  return null;
}
