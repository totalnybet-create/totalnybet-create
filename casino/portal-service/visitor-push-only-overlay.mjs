import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const componentDir = path.join(root, "components/analytics");
const apiDir = path.join(root, "app/api/visit");
const layoutPath = path.join(root, "app/layout.tsx");

fs.mkdirSync(componentDir, { recursive: true });
fs.mkdirSync(apiDir, { recursive: true });

fs.writeFileSync(path.join(componentDir, "VisitorPing.tsx"), `'use client';
import { useEffect, useRef, useState } from 'react';

export function VisitorPing() {
  const [count, setCount] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 16, y: 110 });
  const drag = useRef<{dx:number;dy:number}|null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('persone-royale-counter-pos');
      if (saved) setPos(JSON.parse(saved));
    } catch {}

    let cancelled = false;
    async function syncVisit() {
      try {
        const sentKey = 'persone-royale-visit-pushed';
        let visitorId = localStorage.getItem('persone-royale-visitor-id');
        if (!visitorId) {
          visitorId = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('persone-royale-visitor-id', visitorId);
        }
        const firstThisSession = !sessionStorage.getItem(sentKey);
        const visitKey = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
        const response = await fetch('/api/visit', {
          method: firstThisSession ? 'POST' : 'GET',
          headers: { 'content-type': 'application/json' },
          body: firstThisSession ? JSON.stringify({ path: location.pathname, referrer: document.referrer || '', visitorId, visitKey }) : undefined,
          cache: 'no-store', keepalive: true,
        });
        if (response.ok && !cancelled) {
          const data = await response.json().catch(() => ({}));
          if (typeof data.count === 'number') setCount(data.count);
          if (firstThisSession) sessionStorage.setItem(sentKey, '1');
        }
      } catch {}
    }
    void syncVisit();
    const timer = setInterval(syncVisit, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function moveDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const x = Math.max(6, Math.min(innerWidth - 126, e.clientX - drag.current.dx));
    const y = Math.max(6, Math.min(innerHeight - 58, e.clientY - drag.current.dy));
    setPos({ x, y });
  }
  function endDrag() {
    drag.current = null;
    try { localStorage.setItem('persone-royale-counter-pos', JSON.stringify(pos)); } catch {}
  }

  return <div onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
    style={{position:'fixed',left:pos.x,top:pos.y,zIndex:2147483000,touchAction:'none',userSelect:'none',cursor:'grab',minWidth:120,padding:'9px 12px',borderRadius:16,border:'1px solid rgba(234,190,83,.72)',background:'linear-gradient(145deg,rgba(18,15,10,.94),rgba(4,4,4,.94))',boxShadow:'0 8px 28px rgba(0,0,0,.45),inset 0 0 18px rgba(212,165,55,.08)',color:'#f6df9a',fontFamily:'system-ui,sans-serif',textAlign:'center',backdropFilter:'blur(10px)'}} aria-label="Licznik wejść">
      <div style={{fontSize:9,letterSpacing:'1.6px',opacity:.72,fontWeight:700}}>WEJŚCIA</div>
      <div style={{fontSize:21,lineHeight:'24px',fontWeight:900,fontVariantNumeric:'tabular-nums'}}>{count === null ? '—' : count.toLocaleString('pl-PL')}</div>
    </div>;
}
`);

fs.writeFileSync(path.join(apiDir, "route.ts"), `import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VISIT_PUSH_URL = 'https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/visit-push';
function isBot(ua: string) { return /bot|crawler|spider|headless|lighthouse|pagespeed|preview|googlebot|bingbot|yandex|duckduckbot|semrush|ahrefs|uptimerobot/i.test(ua); }
async function upstream(action:string, req:NextRequest, body:any={}) {
  const ua=req.headers.get('user-agent')||'';
  const response=await fetch(VISIT_PUSH_URL+'?action='+action,{method:'POST',headers:{'content-type':'application/json','user-agent':ua},body:JSON.stringify(body),cache:'no-store'});
  const out=await response.json().catch(()=>({ok:response.ok}));
  return NextResponse.json(out,{status:response.ok?200:502,headers:{'cache-control':'no-store'}});
}
export async function GET(req:NextRequest) { try { return await upstream('count',req); } catch { return NextResponse.json({ok:false},{status:502}); } }
export async function POST(req: NextRequest) {
  const ua=req.headers.get('user-agent')||'';
  if(!ua||isBot(ua)) return NextResponse.json({ok:true,ignored:true});
  let body:any={}; try{body=await req.json();}catch{}
  try{return await upstream('visit',req,{path:typeof body.path==='string'?body.path.slice(0,500):'/',referrer:typeof body.referrer==='string'?body.referrer.slice(0,1000):'',visitorId:typeof body.visitorId==='string'?body.visitorId.slice(0,128):'',visitKey:typeof body.visitKey==='string'?body.visitKey.slice(0,128):''});}
  catch{return NextResponse.json({ok:false},{status:502});}
}
`);

if (!fs.existsSync(layoutPath)) throw new Error("app/layout.tsx not found");
let layout = fs.readFileSync(layoutPath, "utf8");
if (!layout.includes("VisitorPing")) {
  const importAnchor = 'import "./globals.css";';
  const bodyAnchor = '<body suppressHydrationWarning>{children}</body>';
  if (!layout.includes(importAnchor) || !layout.includes(bodyAnchor)) throw new Error("VisitorPing layout anchor not found");
  layout = layout.replace(importAnchor, `${importAnchor}\nimport { VisitorPing } from "@/components/analytics/VisitorPing";`);
  layout = layout.replace(bodyAnchor, '<body suppressHydrationWarning><VisitorPing />{children}</body>');
  fs.writeFileSync(layoutPath, layout);
}
if (!fs.readFileSync(layoutPath,"utf8").includes("<VisitorPing />")) throw new Error("VisitorPing injection verification failed");
console.log("Installed Persone Royale visitor tracking + draggable live counter.");
