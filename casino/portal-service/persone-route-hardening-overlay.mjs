import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const wrongFiles = [
  "app/[locale]/games/crash/page.tsx",
  "app/[locale]/profile/deposit/page.tsx",
  "app/[locale]/profile/withdraw/page.tsx",
  "app/[locale]/profile/verification/page.tsx",
];
for (const relative of wrongFiles) {
  fs.rmSync(path.join(root, relative), { force: true });
}

const redirectPage = (target) => `import { redirect } from "next/navigation";\n\nexport default async function RedirectPage({ params }: { params: Promise<{ locale: string }> }) {\n  const { locale } = await params;\n  redirect(\`/\${locale}${target}\`);\n}\n`;

const replacements = [
  ["app/[locale]/(shell)/games/crash/page.tsx", "/games/royal-arc"],
  ["app/[locale]/(shell)/profile/deposit/page.tsx", "/profile"],
  ["app/[locale]/(shell)/profile/withdraw/page.tsx", "/profile/transactions"],
  ["app/[locale]/(shell)/profile/verification/page.tsx", "/profile/settings"],
];

for (const [relative, target] of replacements) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, redirectPage(target));
}

console.log("Hardened legacy routes inside the active shell route group and removed duplicate route files.");
