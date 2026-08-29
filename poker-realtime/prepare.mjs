import fs from 'node:fs/promises';
import path from 'node:path';

const commit = '4e38645897501badc279d62e2b18de5021617c37';
const base = `https://raw.githubusercontent.com/opadips/Elite-Poker/${commit}/backend/`;
const targetRoot = path.resolve('engine');
const files = [
  'BroadcastScheduler.js',
  'ClientRegistry.js',
  'HandHistoryStore.js',
  'LobbyChatStore.js',
  'LobbyManager.js',
  'MessageRouter.js',
  'WaitlistManager.js',
  'constants.js',
  'game/AchievementTracker.js',
  'game/BettingRound.js',
  'game/Deck.js',
  'game/Game.js',
  'game/HandEvaluator.js',
  'game/HandLifecycle.js',
  'game/Player.js',
  'game/PlayerActionValidator.js',
  'game/PotManager.js',
  'game/TournamentManager.js',
  'game/dealerMessages.js',
  'handlers/gameHandlers.js',
  'handlers/lobbyHandlers.js',
  'utils/logger.js',
  'utils/timerUtils.js',
  'server.js',
];

await fs.rm(targetRoot, { recursive: true, force: true });

for (const file of files) {
  const response = await fetch(base + file);
  if (!response.ok) {
    throw new Error(`Failed to fetch Elite Poker backend file ${file}: ${response.status}`);
  }
  const destination = path.join(targetRoot, file);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, await response.text(), 'utf8');
}

const serverPath = path.join(targetRoot, 'server.js');
let server = await fs.readFile(serverPath, 'utf8');
server = server.replace(
  "const app = express();\napp.use(cors());",
  "const app = express();\nconst allowedOrigins = new Set(['https://personeroyale.pl', 'https://www.personeroyale.pl']);\napp.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.has(origin)) return callback(null, true); callback(new Error('Origin not allowed')); } }));\napp.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'persone-royale-poker' }));",
);
server = server.replace(
  /const PORT = process\.env\.PORT \|\| 3000;[\s\S]*$/,
  "export default server;\n",
);
await fs.writeFile(serverPath, server, 'utf8');
console.log(`Prepared Elite Poker backend at ${commit} for Vercel Functions.`);
