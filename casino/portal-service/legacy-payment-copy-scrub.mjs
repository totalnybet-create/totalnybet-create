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
    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }
    if (text !== before) fs.writeFileSync(file, text);
  }
}

console.log("Removed remaining legacy payment and crypto copy from locale bundles.");
