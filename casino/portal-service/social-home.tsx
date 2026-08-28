import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = ROUTES.home;
  return {
    title: "SEDLAR CASINO — Social Casino",
    description:
      "Play-money social casino with virtual chips only. No deposits, withdrawals or cash value.",
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: alternateLanguageUrls(path),
    },
  };
}

const featureCards = [
  {
    eyebrow: "START",
    title: "2,500 virtual chips",
    body: "Every new account starts with 2,500 CHIP. The balance is for gameplay only and has no cash value.",
  },
  {
    eyebrow: "REWARDS",
    title: "+500 chips from rewarded video",
    body: "Rewarded ads are being wired to server-side verification with daily limits and cooldown protection.",
  },
  {
    eyebrow: "SAFETY",
    title: "Play-money only",
    body: "Deposits, withdrawals and cash-out routes are disabled in this build.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="dashboard-shell relative isolate overflow-hidden px-4 py-8 sm:px-7 sm:py-12 lg:px-10 lg:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_20%_10%,rgba(255,100,120,0.18),transparent_58%),radial-gradient(ellipse_65%_70%_at_85%_90%,rgba(255,197,107,0.16),transparent_60%),linear-gradient(145deg,#08090d_0%,#111217_48%,#07080c_100%)]"
        />
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/65">
            Social Casino · Play Money
          </div>
          <h1 className="font-display text-[clamp(2.5rem,10vw,5.8rem)] font-black leading-[0.9] tracking-[-0.055em] text-white">
            SEDLAR
            <span className="block bg-[linear-gradient(90deg,#ffc56b,#ff6478)] bg-clip-text text-transparent">
              CASINO
            </span>
          </h1>
          <p className="mt-5 max-w-[58ch] text-sm font-semibold leading-relaxed text-white/65 sm:text-base">
            Premium social-casino portal built around virtual chips. No deposits,
            no withdrawals and no conversion to money.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={ROUTES.signup}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffc56b,#ff6478)] px-6 text-sm font-black text-[#090a0d] shadow-[0_16px_40px_-16px_rgba(255,100,120,0.7)] transition-transform hover:-translate-y-0.5"
            >
              Start with 2,500 chips
            </Link>
            <Link
              href={ROUTES.login}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 text-sm font-extrabold text-white transition-colors hover:bg-white/[0.08]"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {featureCards.map((card) => (
          <article key={card.title} className="dashboard-card p-5 sm:p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand)]">
              {card.eyebrow}
            </div>
            <h2 className="mt-2 font-display text-xl font-black tracking-[-0.03em] text-white">
              {card.title}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/55">
              {card.body}
            </p>
          </article>
        ))}
      </section>

      <section className="dashboard-shell overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
              GAME 01
            </div>
            <h2 className="mt-1 font-display text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              Royal Arc
            </h2>
            <p className="mt-2 max-w-[54ch] text-sm font-semibold leading-relaxed text-white/55">
              First slot selected for integration with the shared CHIP wallet. The
              standalone game build is preserved while the portal bridge is being
              connected.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">
            Wallet bridge in progress
          </div>
        </div>
      </section>
    </div>
  );
}
