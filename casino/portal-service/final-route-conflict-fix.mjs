import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const duplicateDirs = [
  "app/[locale]/games/crash",
  "app/[locale]/profile/deposit",
  "app/[locale]/profile/withdraw",
  "app/[locale]/profile/verification",
];

for (const relative of duplicateDirs) {
  fs.rmSync(path.join(root, relative), { recursive: true, force: true });
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

console.log("Removed duplicate Next.js routes and neutralized legacy money routes inside the shell group.");
