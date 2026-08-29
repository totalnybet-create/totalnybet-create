import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const componentDir = path.join(root, "components/analytics");
const apiDir = path.join(root, "app/api/visit");
const layoutPath = path.join(root, "app/layout.tsx");

fs.mkdirSync(componentDir, { recursive: true });
fs.mkdirSync(apiDir, { recursive: true });

fs.writeFileSync(path.join(componentDir, "VisitorPing.tsx"), `'use client';
import { useEffect } from 'react';

export function VisitorPing() {
  useEffect(() => {
    let cancelled = false;

    async function sendVisit() {
      try {
        const sentKey = 'persone-royale-visit-pushed';
        if (sessionStorage.getItem(sentKey)) return;

        let visitorId = localStorage.getItem('persone-royale-visitor-id');
        if (!visitorId) {
          visitorId = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('persone-royale-visitor-id', visitorId);
        }

        const visitKey = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
        const body = JSON.stringify({
          path: location.pathname,
          referrer: document.referrer || '',
          visitorId,
          visitKey,
        });

        for (let attempt = 0; attempt < 2 && !cancelled; attempt += 1) {
          try {
            const response = await fetch('/api/visit', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body,
              keepalive: true,
              cache: 'no-store',
            });
            if (response.ok) {
              sessionStorage.setItem(sentKey, '1');
              return;
            }
          } catch {}
          if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 900));
        }
      } catch {}
    }

    void sendVisit();
    return () => { cancelled = true; };
  }, []);

  return null;
}
`);

fs.writeFileSync(path.join(apiDir, "route.ts"), `import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VISIT_PUSH_URL = 'https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/visit-push?action=visit';

function isBot(ua: string) {
  return /bot|crawler|spider|headless|lighthouse|pagespeed|preview|googlebot|bingbot|yandex|duckduckbot|semrush|ahrefs|uptimerobot/i.test(ua);
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  if (!ua || isBot(ua)) return NextResponse.json({ ok: true, ignored: true });

  let body: any = {};
  try { body = await req.json(); } catch {}

  try {
    const response = await fetch(VISIT_PUSH_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': ua },
      body: JSON.stringify({
        path: typeof body.path === 'string' ? body.path.slice(0, 500) : '/',
        referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 1000) : '',
        visitorId: typeof body.visitorId === 'string' ? body.visitorId.slice(0, 128) : '',
        visitKey: typeof body.visitKey === 'string' ? body.visitKey.slice(0, 128) : '',
      }),
      cache: 'no-store',
    });

    const out = await response.json().catch(() => ({ ok: response.ok }));
    return NextResponse.json(out, { status: response.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
`);

if (!fs.existsSync(layoutPath)) throw new Error("app/layout.tsx not found");
let layout = fs.readFileSync(layoutPath, "utf8");

if (!layout.includes("VisitorPing")) {
  const importAnchor = 'import "./globals.css";';
  const bodyAnchor = '<body suppressHydrationWarning>{children}</body>';

  if (!layout.includes(importAnchor)) throw new Error("VisitorPing import anchor not found");
  if (!layout.includes(bodyAnchor)) throw new Error("VisitorPing body anchor not found");

  layout = layout.replace(importAnchor, `${importAnchor}\nimport { VisitorPing } from "@/components/analytics/VisitorPing";`);
  layout = layout.replace(bodyAnchor, '<body suppressHydrationWarning><VisitorPing />{children}</body>');
  fs.writeFileSync(layoutPath, layout);
}

const finalLayout = fs.readFileSync(layoutPath, "utf8");
if (!finalLayout.includes("<VisitorPing />")) throw new Error("VisitorPing injection verification failed");

console.log("Installed isolated Persone Royale visitor push tracking.");
