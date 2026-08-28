import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync("/tmp/social-loading.tsx", "utf8");
const match = source.match(/const LOGO_SRC = \"data:image\/webp;base64,([^\"]+)\";/);
if (!match) throw new Error("Siedlar logo data URI not found in social-loading.tsx");

const brandAsset = "/assets/brand/siedlar-casino-royale.webp";
const brandDir = path.join(process.cwd(), "public/assets/brand");
fs.mkdirSync(brandDir, { recursive: true });
fs.writeFileSync(
  path.join(brandDir, "siedlar-casino-royale.webp"),
  Buffer.from(match[1], "base64"),
);

const assetsPath = path.join(process.cwd(), "lib/assets.ts");
let assets = fs.readFileSync(assetsPath, "utf8");
for (const [key, value] of [
  ["logoFull", brandAsset],
  ["mark", brandAsset],
  ["logo", brandAsset],
  ["icon", brandAsset],
]) {
  const re = new RegExp(`(${key}:\\s*)\"[^\"]+\"`);
  if (!re.test(assets)) throw new Error(`Brand asset key not found: ${key}`);
  assets = assets.replace(re, `$1\"${value}\"`);
}
fs.writeFileSync(assetsPath, assets);

const animatedLogo = `import Image from "next/image";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";

export function AnimatedBrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
  video?: boolean;
}) {
  return (
    <Image
      src={assets.brand.logoFull}
      alt=""
      fill
      sizes="(max-width: 768px) 180px, 220px"
      priority={priority}
      aria-hidden
      className={cn("object-contain", className)}
    />
  );
}
`;
fs.writeFileSync(
  path.join(process.cwd(), "components/layout/AnimatedBrandLogo.tsx"),
  animatedLogo,
);

const brandLockup = `import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";
import { AnimatedBrandLogo } from "@/components/layout/AnimatedBrandLogo";

type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, string> = {
  sm: "h-10 w-[124px]",
  md: "h-12 w-[154px]",
  lg: "h-16 w-[204px]",
};

export function BrandLockup({
  size = "md",
  href = ROUTES.home,
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
  const inner = (
    <span
      aria-hidden
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-[8px] drop-shadow-[0_0_16px_rgba(220,166,62,0.22)]",
        SIZE_MAP[size],
      )}
    >
      <AnimatedBrandLogo
        priority={priority}
        className="absolute inset-0 h-full w-full object-contain"
      />
    </span>
  );

  if (!href) {
    return <span className={cn("inline-flex items-center", className)}>{inner}</span>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={`${SITE.name} home`}
      className={cn(
        "inline-flex items-center transition-transform duration-200 hover:translate-y-[-1px]",
        className,
      )}
    >
      {inner}
    </Link>
  );
}
`;
fs.writeFileSync(
  path.join(process.cwd(), "components/layout/BrandLockup.tsx"),
  brandLockup,
);

const roots = ["app", "components", "lib"];
const replaceInFile = (file) => {
  if (!/\.(?:ts|tsx|js|jsx|json)$/.test(file)) return;
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  text = text
    .replaceAll("/assets/brand/logo-full.png", brandAsset)
    .replaceAll("/assets/brand/mark-192.png", brandAsset);
  if (text !== before) fs.writeFileSync(file, text);
};
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else replaceInFile(full);
  }
};
for (const root of roots) walk(path.join(process.cwd(), root));

console.log("Applied Siedlar Casino Royale brand asset and lockup across portal.");
