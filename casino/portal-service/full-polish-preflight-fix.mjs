import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "messages", "en.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const deposit = data?.profile?.deposit;

if (deposit && typeof deposit === "object") {
  const legacyPairs = [
    ["virtual CHIPNetworksTitle", "usdtNetworksTitle"],
    ["virtual CHIPNetworksFootnote", "usdtNetworksFootnote"],
  ];
  for (const [badKey, canonicalKey] of legacyPairs) {
    if (Object.prototype.hasOwnProperty.call(deposit, badKey)) {
      if (!Object.prototype.hasOwnProperty.call(deposit, canonicalKey)) {
        deposit[canonicalKey] = deposit[badKey];
      }
      delete deposit[badKey];
    }
  }
}

fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
console.log("Normalized legacy locale keys before complete Polish validation.");
