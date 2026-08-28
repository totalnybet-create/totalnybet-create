import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function mustReplace(source, oldValue, newValue, label) {
  if (!source.includes(oldValue)) throw new Error(`Portal polish anchor missing: ${label}`);
  return source.replace(oldValue, newValue);
}

function set(obj, dotted, value) {
  const parts = dotted.split(".");
  let cursor = obj;
  for (const key of parts.slice(0, -1)) {
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[parts.at(-1)] = value;
}

// Route all legacy game and money CTAs into the play-money portal.
const pathsPath = path.join(root, "lib", "paths.ts");
let paths = fs.readFileSync(pathsPath, "utf8");
paths = mustReplace(paths, 'crash: "/games/crash",', 'crash: "/games/royal-arc",', "Royal Arc route");
paths = mustReplace(paths, 'deposit: "/profile/deposit",', 'deposit: "/profile",', "deposit disabled route");
paths = mustReplace(paths, 'withdraw: "/profile/withdraw",', 'withdraw: "/profile",', "withdraw disabled route");
fs.writeFileSync(pathsPath, paths);

// Keep the existing component contract but replace the Crash artwork/wording with Royal Arc.
const ctaPath = path.join(root, "components", "layout", "CrashSidebarCta.tsx");
const royalCta = `"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { NavItem } from "@/lib/types";
import { isNavItemActive } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function CrashSidebarCta({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "/";
  const t = useTranslations("nav");
  const active = isNavItemActive(item, pathname);
  return (
    <Link
      href={item.href}
      aria-label={t("crashSidebarSub")}
      onClick={() => onNavigate?.()}
      className={cn(
        "group relative isolate mb-1 overflow-hidden rounded-2xl px-3 py-3.5 ring-1 transition-[transform,box-shadow] duration-300 active:scale-[0.98]",
        active
          ? "bg-gradient-to-br from-[#5b3610] via-[#20120b] to-[#09070c] ring-[#ffc56b]/65 shadow-[0_0_44px_-16px_rgba(255,197,107,0.72)]"
          : "bg-gradient-to-br from-[#3b220d] via-[#171017] to-[#08080d] ring-[#ffc56b]/38 hover:ring-[#ffc56b]/62 hover:shadow-[0_0_48px_-18px_rgba(255,197,107,0.65)]",
      )}
    >
      <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 text-[7rem] leading-none text-[#ffc56b]/10">♛</span>
      <div className="relative flex min-h-[138px] flex-col justify-between gap-4">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ffc56b]/75">{t("crashSidebarTag")}</div>
          <div className="mt-2 font-display text-2xl font-black tracking-[-0.04em] text-white">Royal Arc</div>
          <div className="mt-1 text-[10px] font-bold leading-relaxed text-white/48">{t("crashSidebarSub")}</div>
        </div>
        <span className="relative z-[1] flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ffd98a]/30 bg-[linear-gradient(135deg,#ffe19a,#e3a63d)] text-[13px] font-black text-[#1a1004] shadow-[0_12px_30px_-14px_rgba(255,197,107,0.8)]">
          {t("playCrash")}
          <ChevronRight className="h-[1.0625rem] w-[1.0625rem]" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
`;
fs.writeFileSync(ctaPath, royalCta);

// Remove the mobile authenticated deposit/withdraw shortcut block from the sidebar.
const sidebarPath = path.join(root, "components", "layout", "Sidebar.tsx");
let sidebar = fs.readFileSync(sidebarPath, "utf8");
sidebar = mustReplace(
  sidebar,
  "const showUserCard = Boolean(embedded && authed && userPreview);",
  "const showUserCard = false; // play-money build: no deposit/withdraw quick actions",
  "sidebar money shortcuts",
);
fs.writeFileSync(sidebarPath, sidebar);

// Add a locale-aware portal route that opens the static Royal Arc client.
const royalPageDir = path.join(root, "app", "[locale]", "(shell)", "games", "royal-arc");
fs.mkdirSync(royalPageDir, { recursive: true });
const redirectRoyal = `import { redirect } from "next/navigation";\n\nexport default function RoyalArcPage() {\n  redirect("/royal-arc/index.html");\n}\n`;
fs.writeFileSync(path.join(royalPageDir, "page.tsx"), redirectRoyal);

// Direct visits to legacy real-money surfaces are redirected away.
const disabledPage = `import { redirect } from "next/navigation";\n\nexport default function DisabledPage() {\n  redirect("/");\n}\n`;
const legacyPages = [
  path.join(root, "app", "[locale]", "(shell)", "games", "crash", "page.tsx"),
  path.join(root, "app", "[locale]", "(shell)", "profile", "deposit", "page.tsx"),
  path.join(root, "app", "[locale]", "(shell)", "profile", "withdraw", "page.tsx"),
];
for (const page of legacyPages) {
  fs.mkdirSync(path.dirname(page), { recursive: true });
  fs.writeFileSync(page, disabledPage);
}

// Clean visible copy inherited from the upstream Crash/real-money template.
const messagesDir = path.join(root, "messages");
for (const file of fs.readdirSync(messagesDir).filter((name) => name.endsWith(".json"))) {
  const full = path.join(messagesDir, file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  const rewrites = {
    "nav.crash": "Royal Arc",
    "nav.playCrash": "Play Royal Arc",
    "nav.crashSidebarTag": "Royal Arc · Slot",
    "nav.crashSidebarSub": "Server-settled spins · virtual CHIP only",
    "nav.deposit": "Balance",
    "nav.withdraw": "Activity",
    "home.crashCtaTitle": "Play Royal Arc",
    "home.crashCtaBody": "Premium 5×3 slot connected to your shared virtual CHIP balance.",
    "home.crashCtaButton": "Play Royal Arc",
    "home.gameSectionTitle": "Games",
    "hero.gameEyebrow": "Royal Arc · Premium Slot",
    "hero.ctaTitle": "Play Royal Arc",
    "hero.ctaHint": "Virtual CHIP · server-settled result",
    "hero.playTableCta": "Open Royal Arc",
    "about.builtHeading": "Built for social-casino play",
    "about.builtExtra": "A mobile-first social casino centered on virtual CHIP, rewards and server-settled games. No deposits, withdrawals or cash conversion.",
    "promotions.body": "Virtual-chip rewards, missions and social-casino events. No cash prizes or deposits.",
    "vip.body": "Progress through social VIP tiers using virtual-chip gameplay and in-app activity.",
    "feedback.body": "Read player feedback about the social-casino experience, games and support.",
    "licenses.body": "Play-money mode with encrypted account sessions and server-side wallet settlement.",
    "news.body": "Product updates, new social-casino games and virtual-chip features.",
    "support.body": "Write to us about your account, virtual CHIP balance or games.",
    "liveChat.greeting": "Hi — SEDLAR CASINO support here. Ask us about your account, virtual CHIP balance, Royal Arc or rewards.",
    "liveChat.quickDeposit": "Account help",
    "liveChat.quickWithdraw": "Chip balance",
    "liveChat.quickBonus": "Reward question",
    "responsibleGaming.body": "Use session reminders, breaks and personal play limits to keep social-casino play controlled and recreational.",
    "profile.index.transactionsShortcutBody": "Virtual-chip ledger, wagers, payouts and rewards.",
    "profile.transactions.historyDescription": "Your virtual-chip ledger appears here as you play and claim rewards.",
    "profile.transactions.historyCta": "Back to lobby",
    "crashGame.metaTitle": "Royal Arc · SEDLAR CASINO",
    "crashGame.metaDescription": "Royal Arc is a play-money slot using virtual CHIP only."
  };
  for (const [key, value] of Object.entries(rewrites)) set(data, key, value);
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
}
