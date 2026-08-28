import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'app/[locale]/(shell)/page.tsx');
const wsRouteDir = path.join(root, 'app/api/games/poker/ws');
const pokerPageDir = path.join(root, 'app/[locale]/games/texas-holdem');
const roulettePageDir = path.join(root, 'app/[locale]/games/roulette');

fs.mkdirSync(wsRouteDir, { recursive: true });
fs.mkdirSync(pokerPageDir, { recursive: true });
fs.mkdirSync(roulettePageDir, { recursive: true });

fs.writeFileSync(path.join(wsRouteDir, 'route.js'), `import { experimental_upgradeWebSocket } from '@vercel/functions';
import { LobbyManager } from '@/lib/poker-engine/LobbyManager.js';
import { ClientRegistry } from '@/lib/poker-engine/ClientRegistry.js';
import { createMessageRouter } from '@/lib/poker-engine/MessageRouter.js';
import { BroadcastScheduler } from '@/lib/poker-engine/BroadcastScheduler.js';
import * as timerUtils from '@/lib/poker-engine/utils/timerUtils.js';
import { getDealerMessage } from '@/lib/poker-engine/game/dealerMessages.js';
import { MAX_NAME_LENGTH, CHAT_HISTORY_SIZE } from '@/lib/poker-engine/constants.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stateKey = '__personePokerRuntime';

function createRuntime() {
  const lobbyManager = new LobbyManager();
  const clientRegistry = new ClientRegistry();
  const generalChat = [];

  function isOpen(ws) { return ws && ws.readyState === 1; }

  function broadcastGameState(lobbyId, dealerMessage = null) {
    const lobby = lobbyManager.getLobby(lobbyId);
    if (!lobby) return;
    const state = lobby.game.getState();
    if (dealerMessage) state.dealerMessage = dealerMessage;
    const msg = JSON.stringify({ type: 'gameState', state });
    clientRegistry.forEach((ws, client) => {
      if (client.lobbyId === lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastSystemMessage(lobbyId, message) {
    const msg = JSON.stringify({ type: 'system', text: message });
    clientRegistry.forEach((ws, client) => {
      if (client.lobbyId === lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastChat(lobbyId, senderName, message) {
    const payload = { type: 'chat', sender: senderName, message, timestamp: Date.now() };
    lobbyManager.addChatMessage(lobbyId, senderName, message);
    const msg = JSON.stringify(payload);
    clientRegistry.forEach((ws, client) => {
      if (client.lobbyId === lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastDealerMessage(lobbyId, message) {
    if (message) broadcastChat(lobbyId, 'Dealer', message);
  }

  function broadcastGeneralChat(senderName, message) {
    const payload = { type: 'chat', sender: senderName, message, timestamp: Date.now() };
    generalChat.push(payload);
    if (generalChat.length > CHAT_HISTORY_SIZE) generalChat.shift();
    const msg = JSON.stringify(payload);
    clientRegistry.forEach((ws, client) => {
      if (!client.lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastOnlinePlayers() {
    const players = [];
    clientRegistry.forEach((ws, client) => {
      if (!client.lobbyId && isOpen(ws)) players.push(client.name);
    });
    const msg = JSON.stringify({ type: 'onlinePlayers', players });
    clientRegistry.forEach((ws, client) => {
      if (!client.lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastAchievement(lobbyId, achievement) {
    const msg = JSON.stringify({ type: 'achievement', ...achievement });
    clientRegistry.forEach((ws, client) => {
      if (client.lobbyId === lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastSideBetWin(lobbyId, bettorName, targetName, amount, profit, refunded) {
    const msg = JSON.stringify({ type: 'sideBetWin', bettorName, targetName, amount, profit, refunded });
    clientRegistry.forEach((ws, client) => {
      if (client.lobbyId === lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastAllInSound(lobbyId) {
    const msg = JSON.stringify({ type: 'allInSound' });
    clientRegistry.forEach((ws, client) => {
      if (client.lobbyId === lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function broadcastLobbyList() {
    const msg = JSON.stringify({ type: 'lobbyList', lobbies: lobbyManager.getLobbyList() });
    clientRegistry.forEach((ws, client) => {
      if (!client.lobbyId && isOpen(ws)) ws.send(msg);
    });
  }

  function setupLobbyCallbacks(lobbyId) {
    const lobby = lobbyManager.getLobby(lobbyId);
    if (!lobby) return;
    lobby.game.onStateChange = () => {
      broadcastGameState(lobbyId);
      timerUtils.ensureTurnTimer(lobbyId, lobbyManager, clientRegistry, broadcastGameState);
    };
    lobby.game._onTimerReset = () => timerUtils.removeTurnTimer(lobbyId);
  }

  timerUtils.setTurnTimerRefs({ lobbyManager, clientRegistry, broadcastGameState });

  const messageRouter = createMessageRouter({
    lobbyManager,
    clientRegistry,
    broadcastGameState,
    broadcastSystemMessage,
    broadcastChat,
    broadcastGeneralChat,
    broadcastOnlinePlayers,
    broadcastLobbyList,
    broadcastAchievement,
    broadcastSideBetWin,
    broadcastAllInSound,
    setupLobbyCallbacks,
    generalChat,
    timerUtils,
    MAX_NAME_LENGTH,
    CHAT_HISTORY_SIZE,
    broadcastDealerMessage,
    getDealerMessage,
  });

  const scheduler = new BroadcastScheduler(lobbyManager, clientRegistry, {
    broadcastGameState,
    broadcastChat,
    broadcastSystemMessage,
    broadcastAchievement,
    broadcastSideBetWin,
    broadcastLobbyList,
    broadcastOnlinePlayers,
    broadcastDealerMessage,
  }, timerUtils);
  scheduler.start();

  function close(ws) {
    const client = clientRegistry.get(ws);
    if (!client) return;
    if (client.lobbyId) {
      const lobbyId = client.lobbyId;
      lobbyManager.leaveLobby(lobbyId, client.playerId);
      broadcastGameState(lobbyId);
      broadcastDealerMessage(lobbyId, getDealerMessage('playerLeft', { name: client.name || 'A player' }));
      timerUtils.clearAllTimers(lobbyId, clientRegistry);
    }
    timerUtils.clearTimer(ws, clientRegistry);
    clientRegistry.remove(ws);
    broadcastLobbyList();
    broadcastOnlinePlayers();
  }

  return { messageRouter, close };
}

const runtimeState = globalThis[stateKey] || (globalThis[stateKey] = createRuntime());

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    ws.on('message', (data) => {
      try {
        const raw = typeof data === 'string' ? data : data.toString();
        runtimeState.messageRouter(JSON.parse(raw), ws);
      } catch (error) {
        console.error('Poker websocket message error', error);
      }
    });
    ws.on('close', () => runtimeState.close(ws));
  });
}
`);

fs.writeFileSync(path.join(pokerPageDir, 'page.tsx'), `import { redirect } from 'next/navigation';
export default function PokerPage() { redirect('/poker/'); }
`);

fs.writeFileSync(path.join(roulettePageDir, 'page.tsx'), `import { redirect } from 'next/navigation';
export default function RoulettePage() { redirect('/roulette/'); }
`);

if (fs.existsSync(homePath)) {
  let home = fs.readFileSync(homePath, 'utf8');
  const start = home.indexOf('      <section className="dashboard-shell overflow-hidden p-4 sm:p-6">');
  if (start !== -1) {
    const endMarker = '      </section>\n    </div>\n  );';
    const end = home.indexOf(endMarker, start);
    if (end !== -1) {
      const replacement = `      <section className="dashboard-shell overflow-hidden p-4 sm:p-6">
        <div className="mb-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">GAMES</div>
          <h2 className="mt-1 font-display text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Play now</h2>
          <p className="mt-2 max-w-[60ch] text-sm font-semibold leading-relaxed text-white/55">Three playable social-casino games. Virtual chips only — no deposits, withdrawals or cash value.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <a href="/royal-arc/" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand)]">SLOT</div>
            <h3 className="mt-2 font-display text-2xl font-black text-white">Royal Arc</h3>
            <p className="mt-2 text-sm font-semibold text-white/55">Spin the reels with the shared virtual CHIP wallet.</p>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">PLAY →</div>
          </a>
          <a href="/poker/" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand)]">TEXAS HOLD'EM · BETA</div>
            <h3 className="mt-2 font-display text-2xl font-black text-white">Elite Poker</h3>
            <p className="mt-2 text-sm font-semibold text-white/55">Real-time Texas Hold'em lobby and tables for 2–10 players.</p>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">PLAY →</div>
          </a>
          <a href="/roulette/" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand)]">ROULETTE · BETA</div>
            <h3 className="mt-2 font-display text-2xl font-black text-white">European Roulette</h3>
            <p className="mt-2 text-sm font-semibold text-white/55">Playable roulette preview while the final Persone skin is prepared.</p>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">PLAY →</div>
          </a>
        </div>
      </section>
`;
      home = home.slice(0, start) + replacement + home.slice(end + '      </section>\n'.length);
    }
  }
  home = home.replaceAll('SEDLAR CASINO', 'PERSONE ROYALE CASINO').replaceAll('SEDLAR', 'PERSONE ROYALE');
  fs.writeFileSync(homePath, home);
}

console.log('Applied Poker + Roulette portal integration overlay.');
