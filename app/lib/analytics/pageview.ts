/**
 * Self-hosted pageview reporting via shared Supabase `public.pageviews`.
 *
 * Uses native fetch → PostgREST (no `@supabase/supabase-js`).
 *
 * When `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unset,
 * reporting is skipped silently — no throw, no game impact.
 */

/** Master switch. Default: on. Flip to false to disable all reporting. */
export const PAGEVIEW_TRACKING_ENABLED = true;

const SESSION_STORAGE_KEY = 'splendor_pageview_session_id';

function getConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }
  return { url: url.replace(/\/$/, ''), anonKey };
}

function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export type PageviewPayload = {
  path: string;
  referrer: string;
  user_agent: string;
  session_id: string;
};

/**
 * Report one pageview. Failures are swallowed — never throws into the game.
 */
export async function trackPageview(path?: string): Promise<void> {
  if (!PAGEVIEW_TRACKING_ENABLED) {
    return;
  }

  try {
    const config = getConfig();
    if (!config) {
      return;
    }

    const payload: PageviewPayload = {
      path:
        path ??
        (typeof window !== 'undefined' ? window.location.pathname : '/'),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      session_id: getSessionId(),
    };

    await fetch(`${config.url}/rest/v1/pageviews`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Intentional: analytics must never break gameplay.
  }
}
