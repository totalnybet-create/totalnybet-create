'use client';

import { useEffect } from 'react';

const VISIT_ENDPOINT = 'https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/visit-counter';
const SESSION_KEY = 'personeroyale_visit_ping_v1';

export function VisitPing() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      window.sessionStorage.setItem(SESSION_KEY, '1');

      let referrer = document.referrer || '';
      try {
        if (referrer && new URL(referrer).hostname === window.location.hostname) referrer = '';
      } catch {
        referrer = '';
      }

      void fetch(VISIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
          referrer: referrer.slice(0, 1000),
        }),
        keepalive: true,
      }).then((response) => {
        if (!response.ok) window.sessionStorage.removeItem(SESSION_KEY);
      }).catch(() => {
        window.sessionStorage.removeItem(SESSION_KEY);
      });
    } catch {
      // Analytics must never interfere with the casino UI.
    }
  }, []);

  return null;
}
