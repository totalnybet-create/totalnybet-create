import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const componentDir = path.join(root, 'components/analytics');
const apiDir = path.join(root, 'app/api/visit');
const layoutPath = path.join(root, 'app/layout.tsx');

fs.mkdirSync(componentDir, { recursive: true });
fs.mkdirSync(apiDir, { recursive: true });

fs.writeFileSync(path.join(componentDir, 'VisitorPing.tsx'), `'use client';

import { useEffect } from 'react';

export function VisitorPing() {
  useEffect(() => {
    try {
      const key = 'persone-royale-visit-pushed';
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      const payload = JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer || '',
        language: navigator.language || '',
        screen: window.screen ? \`${window.screen.width}x${window.screen.height}\` : '',
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/visit', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/visit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, []);
  return null;
}
`);

fs.writeFileSync(path.join(apiDir, 'route.ts'), `import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOPIC = process.env.VISITOR_PUSH_TOPIC || 'persone-royale-visits-9f4c7a31d2e64b5aa9c7';

function isBot(ua: string) {
  return /bot|crawler|spider|crawling|headless|lighthouse|pagespeed|preview|facebookexternalhit|slurp|bingbot|googlebot|yandex|duckduckbot|baiduspider|semrush|ahrefs|uptimerobot|vercel-screenshot/i.test(ua);
}

function deviceLabel(ua: string) {
  if (/android/i.test(ua)) return /mobile/i.test(ua) ? 'Android phone' : 'Android';
  if (/iphone/i.test(ua)) return 'iPhone';
  if (/ipad/i.test(ua)) return 'iPad';
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os/i.test(ua)) return 'Mac';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown device';
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  if (!ua || isBot(ua)) return NextResponse.json({ ok: true, ignored: true });

  let body: { path?: string; referrer?: string; language?: string; screen?: string } = {};
  try { body = await req.json(); } catch {}

  const city = decodeURIComponent(req.headers.get('x-vercel-ip-city') || '').trim();
  const country = (req.headers.get('x-vercel-ip-country') || '').trim();
  const region = decodeURIComponent(req.headers.get('x-vercel-ip-country-region') || '').trim();
  const location = [city, region, country].filter(Boolean).join(', ') || 'location unavailable';
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const maskedIp = ip ? ip.replace(/(\\d+)$/, 'xxx') : 'n/a';
  const now = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw', dateStyle: 'short', timeStyle: 'medium'
  }).format(new Date());

  const lines = [
    'Nowe wejście na Persone Royale',
    \`📍 ${location}\`,
    \`📱 ${deviceLabel(ua)} · ${body.screen || 'screen n/a'}\`,
    \`🌐 ${body.path || '/'}\`,
    body.referrer ? \`↩️ Ref: ${body.referrer.slice(0, 180)}\` : '↩️ Wejście bezpośrednie',
    \`🕒 ${now}\`,
    \`IP: ${maskedIp}\`,
  ];

  try {
    const r = await fetch(\`https://ntfy.sh/${TOPIC}\`, {
      method: 'POST',
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'title': 'Persone Royale — nowy gość',
        'priority': 'high',
        'tags': 'bell,chart_with_upwards_trend',
        'click': 'https://www.personeroyale.pl/',
      },
      body: lines.join('\\n'),
      cache: 'no-store',
    });
    return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
`);

let layout = fs.readFileSync(layoutPath, 'utf8');
if (!layout.includes('VisitorPing')) {
  layout = layout.replace('import "./globals.css";', 'import "./globals.css";\nimport { VisitorPing } from "@/components/analytics/VisitorPing";');
  layout = layout.replace('<body suppressHydrationWarning>{children}</body>', '<body suppressHydrationWarning><VisitorPing />{children}</body>');
  fs.writeFileSync(layoutPath, layout);
}

console.log('Visitor push notifications installed.');
