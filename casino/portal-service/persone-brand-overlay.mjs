import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const assetDir = path.join(root, 'public/assets/brand');
fs.mkdirSync(assetDir, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 260" role="img" aria-label="Persone Royale Casino">
  <defs>
    <linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f7d77b"/><stop offset="0.5" stop-color="#fff2b6"/><stop offset="1" stop-color="#c99632"/></linearGradient>
  </defs>
  <rect width="960" height="260" fill="none"/>
  <g fill="none" stroke="url(#g)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M405 62l31-32 43 28 43-28 31 32 34-19-17 67H388l-17-67z"/>
    <circle cx="479" cy="90" r="58" stroke-width="5"/>
  </g>
  <text x="479" y="109" text-anchor="middle" font-family="Georgia,serif" font-size="62" font-weight="700" fill="url(#g)">PR</text>
  <text x="480" y="176" text-anchor="middle" font-family="Georgia,serif" font-size="54" font-weight="700" letter-spacing="10" fill="url(#g)">PERSONE ROYALE</text>
  <text x="480" y="222" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" letter-spacing="14" fill="#f7e7b1">CASINO</text>
</svg>`;
fs.writeFileSync(path.join(assetDir, 'persone-royale.svg'), svg);

const assetsPath = path.join(root, 'lib/assets.ts');
if (fs.existsSync(assetsPath)) {
  let src = fs.readFileSync(assetsPath, 'utf8');
  for (const key of ['logoFull', 'mark', 'logo', 'icon']) {
    src = src.replace(new RegExp(`(${key}\\s*:\\s*)["'][^"']+["']`), `$1"/assets/brand/persone-royale.svg"`);
  }
  src = src.replaceAll('/assets/brand/logo-full.png', '/assets/brand/persone-royale.svg');
  src = src.replaceAll('/assets/brand/mark-192.png', '/assets/brand/persone-royale.svg');
  fs.writeFileSync(assetsPath, src);
}

const brandLockup = path.join(root, 'components/layout/BrandLockup.tsx');
if (fs.existsSync(path.dirname(brandLockup))) {
  fs.writeFileSync(brandLockup, `import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";
const SIZE_MAP: Record<Size, string> = {
  sm: "h-9 w-[138px]",
  md: "h-11 w-[176px]",
  lg: "h-14 w-[232px]",
};

export function BrandLockup({
  size = "md",
  href = ROUTES.home,
  showWordmark = true,
  wordmarkClassName,
  onClick,
  className,
  priority = false,
}: {
  size?: Size;
  href?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}) {
  const image = (
    <Image
      src="/assets/brand/persone-royale.svg"
      alt="Persone Royale Casino"
      width={960}
      height={260}
      priority={priority}
      className={cn(SIZE_MAP[size], "object-contain drop-shadow-[0_0_14px_rgba(247,215,123,0.28)]", !showWordmark && "max-w-[64px]", wordmarkClassName)}
    />
  );

  if (!href) {
    return <span className={cn("inline-flex items-center", className)}>{image}</span>;
  }

  return (
    <Link href={href} onClick={onClick} aria-label="Persone Royale Casino home" className={cn("inline-flex items-center transition-transform duration-200 hover:translate-y-[-1px]", className)}>
      {image}
    </Link>
  );
}
`);
}

const animated = path.join(root, 'components/layout/AnimatedBrandLogo.tsx');
if (fs.existsSync(path.dirname(animated))) {
  fs.writeFileSync(animated, `import Image from "next/image";
import { cn } from "@/lib/cn";

export function AnimatedBrandLogo({
  className,
  priority = false,
  video = false,
}: {
  className?: string;
  priority?: boolean;
  video?: boolean;
}) {
  void video;
  return (
    <Image
      src="/assets/brand/persone-royale.svg"
      alt=""
      fill
      sizes="240px"
      priority={priority}
      aria-hidden
      className={cn("object-contain", className)}
    />
  );
}

export default AnimatedBrandLogo;
`);
}

const loadingDir = path.join(root, 'app/[locale]');
fs.mkdirSync(loadingDir, { recursive: true });
fs.writeFileSync(path.join(loadingDir, 'loading.tsx'), `export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#08090d] px-6 text-center text-white">
      <div>
        <img src="/assets/brand/persone-royale.svg" alt="Persone Royale Casino" className="mx-auto h-auto w-[min(82vw,520px)]" />
        <div className="mx-auto mt-5 h-[2px] w-44 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse bg-[#e4bc58]" />
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Social Casino · Play Money</p>
      </div>
    </main>
  );
}

`);
}

const replacements = [
  ['SIEDLAR CASINO ROYALE', 'PERSONE ROYALE CASINO'],
  ['Siedlar Casino Royale', 'Persone Royale Casino'],
  ['SEDLAR CASINO', 'PERSONE ROYALE CASINO'],
  ['Sedlar Casino', 'Persone Royale Casino'],
  ['sedlar-casino', 'persone-royale'],
  ['Script.Casino', 'Persone Royale Casino'],
  ['script.casino', 'personeroyale.pl'],
  ['CRASHX', 'PERSONE ROYALE CASINO'],
  ['CrashX', 'PERSONE ROYALE CASINO'],
  ['crashx.cc', 'personeroyale.pl'],
];

for (const base of ['app', 'components', 'lib', 'messages']) {
  const dir = path.join(root, base);
  if (!fs.existsSync(dir)) continue;
  const walk = (p) => {
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      const fp = path.join(p, entry.name);
      if (entry.isDirectory()) walk(fp);
      else if (/\.(tsx?|jsx?|json)$/.test(entry.name)) {
        const text = fs.readFileSync(fp, 'utf8');
        let next = text;
        for (const [from, to] of replacements) next = next.replaceAll(from, to);
        if (next !== text) fs.writeFileSync(fp, next);
      }
    }
  };
  walk(dir);
}

console.log('Applied Persone Royale Casino branding across source and locale messages.');
