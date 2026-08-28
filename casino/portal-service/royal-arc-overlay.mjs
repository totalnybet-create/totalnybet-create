import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const royal = path.join(root, "public", "royal-arc");
const slotPath = path.join(royal, "slot.js");
const htmlPath = path.join(royal, "index.html");

function mustReplace(source, oldValue, newValue, label) {
  if (!source.includes(oldValue)) throw new Error(`Royal Arc patch anchor missing: ${label}`);
  return source.replace(oldValue, newValue);
}

let html = fs.readFileSync(htmlPath, "utf8");
html = mustReplace(
  html,
  '<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js" crossorigin="anonymous"></script>',
  '<script src="./phaser.min.js"></script>',
  "local phaser",
);
html = html.replace("<title>Royal Arc — Premium Slot Prototype</title>", "<title>Royal Arc — SEDLAR CASINO</title>");
html = html.replace("<span>BALANCE</span>", "<span>CHIP</span>");
fs.writeFileSync(htmlPath, html);

let js = fs.readFileSync(slotPath, "utf8");
js = mustReplace(
  js,
  "const state = { balance:1000, bet:1, win:0, spinning:false, turbo:false, sound:true, freeSpins:0, scene:null };",
  "const state = { balance:0, bet:1, win:0, spinning:false, turbo:false, sound:true, freeSpins:0, scene:null, walletReady:false };",
  "server wallet state",
);
js = mustReplace(
  js,
  "ui.spin.disabled=state.spinning || (state.balance<state.bet && state.freeSpins<=0);",
  "ui.spin.disabled=state.spinning || !state.walletReady || (state.balance<state.bet && state.freeSpins<=0);",
  "wallet-ready spin guard",
);

const syncAnchor = `  function syncUi(){\n    ui.balance.textContent=fmt(state.balance); ui.win.textContent=fmt(state.win); ui.bet.textContent=fmt(state.bet);\n    ui.spin.disabled=state.spinning || !state.walletReady || (state.balance<state.bet && state.freeSpins<=0);\n    ui.betDown.disabled=state.spinning; ui.betUp.disabled=state.spinning;\n    ui.freeSpins.textContent=state.freeSpins>0?\`FREE SPINS: \${state.freeSpins}\`:'';\n    ui.turbo.setAttribute('aria-pressed',String(state.turbo)); ui.sound.setAttribute('aria-pressed',String(state.sound));\n  }`;
const syncWithLoader = `${syncAnchor}\n\n  async function loadServerWallet(){\n    state.walletReady=false; syncUi();\n    try{\n      const res=await fetch('/api/games/royal-arc/state',{credentials:'same-origin',cache:'no-store'});\n      const data=await res.json().catch(()=>({}));\n      if(!res.ok){ui.status.textContent=res.status===401?'ZALOGUJ SIĘ W PORTALU':'BŁĄD PORTFELA';return;}\n      state.balance=Number(data.balance||0);\n      state.freeSpins=Number(data.free_spins||0);\n      state.walletReady=true;\n      ui.status.textContent='GOTOWY — PORTFEL CHIP';\n      syncUi();\n    }catch(_e){ui.status.textContent='BRAK POŁĄCZENIA Z PORTFELEM';syncUi();}\n  }`;
js = mustReplace(js, syncAnchor, syncWithLoader, "wallet loader");

const oldSpin = `    async spin(){\n      if(state.spinning)return;const free=state.freeSpins>0;\n      if(!free&&state.balance<state.bet){ui.status.textContent='ZA MAŁO ŚRODKÓW';return;}\n      ensureAudio();this.clearWin();this.setAnticipation(false);state.spinning=true;state.win=0;if(free)state.freeSpins--;else state.balance=Math.max(0,state.balance-state.bet);syncUi();\n      ui.status.textContent=free?'FREE SPIN':(state.turbo?'TURBO SPIN':'SPIN');sfx('spin');haptic(10);\n      const matrix=makeMatrix();for(const r of this.reels)r.start();this.tweens.add({targets:this.cameras.main,zoom:1.012,duration:state.turbo?90:180,ease:'Sine.Out'});\n      await this.wait(state.turbo?250:580);\n      const stagger=state.turbo?48:108,stopTime=state.turbo?105:210;let scatterSoFar=0;\n      for(let i=0;i<REELS;i++){\n        if(!state.turbo&&i>=3&&scatterSoFar>=2){this.setAnticipation(true,i);await this.wait(430);}\n        this.reels[i].stop(matrix[i],stopTime);this.impact(i);scatterSoFar+=matrix[i].filter((s)=>META[s].scatter).length;this.setAnticipation(false);\n        await this.wait(stagger);\n      }\n      await this.wait(stopTime+55);this.tweens.add({targets:this.cameras.main,zoom:1,duration:160,ease:'Back.Out'});\n      const result=evaluate(matrix,state.bet);state.win=Number(result.total.toFixed(2));state.balance+=state.win;state.freeSpins+=result.awardedFreeSpins;syncUi();\n      if(result.wins.length)this.showWin(result);else ui.status.textContent=state.freeSpins>0?'BONUS GOTOWY':'SPRÓBUJ PONOWNIE';\n      state.spinning=false;syncUi();if(free&&state.freeSpins>0)window.setTimeout(()=>this.spin(),state.turbo?320:760);\n    }`;

const newSpin = `    async spin(){\n      if(state.spinning||!state.walletReady)return;const free=state.freeSpins>0;\n      if(!free&&state.balance<state.bet){ui.status.textContent='ZA MAŁO ŻETONÓW CHIP';return;}\n      ensureAudio();this.clearWin();this.setAnticipation(false);state.spinning=true;state.win=0;syncUi();\n      ui.status.textContent=free?'FREE SPIN — SERWER':(state.turbo?'TURBO SPIN — SERWER':'SPIN — SERWER');sfx('spin');haptic(10);\n\n      let server;\n      try{\n        const res=await fetch('/api/games/royal-arc/spin',{\n          method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},\n          body:JSON.stringify({bet_minor:Math.round(state.bet*100),free_spin:free})\n        });\n        server=await res.json().catch(()=>({}));\n        if(!res.ok){\n          state.spinning=false;\n          ui.status.textContent=res.status===401?'ZALOGUJ SIĘ W PORTALU':server.message||'SPIN ODRZUCONY';\n          if(res.status===401)state.walletReady=false;\n          syncUi();return;\n        }\n      }catch(_e){state.spinning=false;ui.status.textContent='BRAK POŁĄCZENIA Z SERWEREM';syncUi();return;}\n\n      const matrix=server.matrix;\n      for(const r of this.reels)r.start();this.tweens.add({targets:this.cameras.main,zoom:1.012,duration:state.turbo?90:180,ease:'Sine.Out'});\n      await this.wait(state.turbo?250:580);\n      const stagger=state.turbo?48:108,stopTime=state.turbo?105:210;let scatterSoFar=0;\n      for(let i=0;i<REELS;i++){\n        if(!state.turbo&&i>=3&&scatterSoFar>=2){this.setAnticipation(true,i);await this.wait(430);}\n        this.reels[i].stop(matrix[i],stopTime);this.impact(i);scatterSoFar+=matrix[i].filter((s)=>META[s].scatter).length;this.setAnticipation(false);\n        await this.wait(stagger);\n      }\n      await this.wait(stopTime+55);this.tweens.add({targets:this.cameras.main,zoom:1,duration:160,ease:'Back.Out'});\n      const result={total:Number(server.payout||0),wins:Array.isArray(server.wins)?server.wins:[],awardedFreeSpins:Number(server.awarded_free_spins||0)};\n      state.win=Number(result.total.toFixed(2));state.balance=Number(server.balance||0);state.freeSpins=Number(server.free_spins||0);syncUi();\n      if(result.wins.length)this.showWin(result);else ui.status.textContent=state.freeSpins>0?'BONUS GOTOWY':'SPRÓBUJ PONOWNIE';\n      state.spinning=false;syncUi();if(free&&state.freeSpins>0)window.setTimeout(()=>this.spin(),state.turbo?320:760);\n    }`;
js = mustReplace(js, oldSpin, newSpin, "server-authoritative spin");
js = mustReplace(js, "  syncUi();\n})();", "  syncUi();\n  loadServerWallet();\n})();", "initial wallet load");
fs.writeFileSync(slotPath, js);

const stateRoute = `import { NextResponse } from "next/server";\nimport { serverLaravelFetch } from "@/lib/server/laravel";\n\nexport async function GET() {\n  const walletRes = await serverLaravelFetch("/api/v1/wallet");\n  const walletPayload = await walletRes.json().catch(() => ({}));\n  if (!walletRes.ok) return NextResponse.json(walletPayload, { status: walletRes.status });\n\n  const txRes = await serverLaravelFetch("/api/v1/games/royal-arc/state");\n  const txPayload = await txRes.json().catch(() => ({}));\n  const freeSpins = txRes.ok ? Number(txPayload.free_spins ?? 0) : 0;\n  const wallet = walletPayload.wallet ?? {};\n  return NextResponse.json({\n    currency: wallet.currency ?? "CHIP",\n    balance_minor: Number(wallet.balance_minor ?? 0),\n    balance: Number(wallet.balance ?? Number(wallet.balance_minor ?? 0) / 100),\n    free_spins: freeSpins,\n  }, { headers: { "Cache-Control": "no-store" } });\n}\n`;

const spinRoute = `import { NextResponse } from "next/server";\nimport { serverLaravelFetch } from "@/lib/server/laravel";\n\nexport async function POST(request: Request) {\n  let body: unknown;\n  try { body = await request.json(); } catch {\n    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });\n  }\n  const res = await serverLaravelFetch("/api/v1/games/royal-arc/spin", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(body),\n  });\n  const payload = await res.json().catch(() => ({}));\n  return NextResponse.json(payload, { status: res.status, headers: { "Cache-Control": "no-store" } });\n}\n`;

const stateDir = path.join(root, "app", "api", "games", "royal-arc", "state");
const spinDir = path.join(root, "app", "api", "games", "royal-arc", "spin");
fs.mkdirSync(stateDir, { recursive: true });
fs.mkdirSync(spinDir, { recursive: true });
fs.writeFileSync(path.join(stateDir, "route.ts"), stateRoute);
fs.writeFileSync(path.join(spinDir, "route.ts"), spinRoute);

const homePath = path.join(root, "app", "[locale]", "(shell)", "page.tsx");
let home = fs.readFileSync(homePath, "utf8");
home = mustReplace(
  home,
  `<div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">\n            Wallet bridge in progress\n          </div>`,
  `<a\n            href="/royal-arc/index.html"\n            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffc56b,#ff6478)] px-5 text-xs font-black uppercase tracking-[0.1em] text-[#090a0d] shadow-[0_14px_38px_-16px_rgba(255,100,120,0.75)]"\n          >\n            Open Royal Arc\n          </a>`,
  "Royal Arc lobby link",
);
home = home.replace(
  "First slot selected for integration with the shared CHIP wallet. The\n              standalone game build is preserved while the portal bridge is being\n              connected.",
  "Royal Arc is connected to the shared CHIP wallet. Spins are settled by the server and the browser only animates the returned result.",
);
fs.writeFileSync(homePath, home);
