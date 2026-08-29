import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const messagesDir = path.join(root, "messages");

const replacements = [
  [/USDT/gi, "virtual CHIP"],
  [/Trust Wallet/gi, "account"],
  [/Cura[cç]ao/gi, "social-casino"],
  [/Mastercard/gi, "virtual-chip balance"],
  [/\bVISA\b/gi, "virtual-chip balance"],
  [/Apple Pay/gi, "virtual-chip balance"],
  [/Google Pay/gi, "virtual-chip balance"],
  [/wallet address/gi, "account balance"],
  [/on-chain/gi, "server-side"],
  [/withdraw winnings/gi, "view activity"],
  [/deposit cryptocurrency/gi, "virtual-chip balance"],
];

if (fs.existsSync(messagesDir)) {
  for (const name of fs.readdirSync(messagesDir)) {
    if (!name.endsWith(".json")) continue;
    const file = path.join(messagesDir, name);
    let text = fs.readFileSync(file, "utf8");
    const before = text;
    for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
    if (text !== before) fs.writeFileSync(file, text);
  }
}

const componentDir = path.join(root, "components/analytics");
const apiDir = path.join(root, "app/api/visit");
const layoutPath = path.join(root, "app/layout.tsx");
fs.mkdirSync(componentDir, { recursive: true });
fs.mkdirSync(apiDir, { recursive: true });

fs.writeFileSync(path.join(componentDir, "VisitorPing.tsx"), `'use client';
import { useEffect } from 'react';
export function VisitorPing() {
  useEffect(() => {
    try {
      const sentKey = 'persone-royale-visit-pushed';
      if (sessionStorage.getItem(sentKey)) return;
      sessionStorage.setItem(sentKey, '1');
      let visitorId = localStorage.getItem('persone-royale-visitor-id');
      if (!visitorId) {
        visitorId = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('persone-royale-visitor-id', visitorId);
      }
      const visitKey = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
      const body = JSON.stringify({ path: location.pathname, referrer: document.referrer || '', visitorId, visitKey });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/visit', new Blob([body], { type: 'application/json' }));
      else fetch('/api/visit', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
    } catch {}
  }, []);
  return null;
}
`);

fs.writeFileSync(path.join(apiDir, "route.ts"), `import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VISIT_PUSH_URL = 'https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/visit-push?action=visit';
function isBot(ua:string){ return /bot|crawler|spider|headless|lighthouse|pagespeed|preview|googlebot|bingbot|yandex|duckduckbot|semrush|ahrefs|uptimerobot/i.test(ua); }
export async function POST(req:NextRequest){
  const ua=req.headers.get('user-agent')||'';
  if(!ua||isBot(ua)) return NextResponse.json({ok:true,ignored:true});
  let body:any={}; try{body=await req.json()}catch{}
  try{
    const r=await fetch(VISIT_PUSH_URL,{method:'POST',headers:{'content-type':'application/json','user-agent':ua},body:JSON.stringify({
      path: typeof body.path==='string'?body.path:'/',
      referrer: typeof body.referrer==='string'?body.referrer:'',
      visitorId: typeof body.visitorId==='string'?body.visitorId:'',
      visitKey: typeof body.visitKey==='string'?body.visitKey:''
    }),cache:'no-store'});
    const out=await r.json().catch(()=>({ok:r.ok}));
    return NextResponse.json(out,{status:r.ok?200:502});
  }catch{return NextResponse.json({ok:false},{status:502});}
}
`);

let layout = fs.readFileSync(layoutPath, "utf8");
if (!layout.includes("VisitorPing")) {
  layout = layout.replace('import "./globals.css";', 'import "./globals.css";\nimport { VisitorPing } from "@/components/analytics/VisitorPing";');
  layout = layout.replace('<body suppressHydrationWarning>{children}</body>', '<body suppressHydrationWarning><VisitorPing />{children}</body>');
  fs.writeFileSync(layoutPath, layout);
}

console.log("Removed remaining legacy payment copy and installed server-backed visitor counter + push tracking.");
