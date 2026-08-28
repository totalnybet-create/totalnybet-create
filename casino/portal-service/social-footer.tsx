import { BrandLockup } from "./BrandLockup";
import { FooterInstallApp } from "@/components/pwa/FooterInstallApp";
import { OpenLiveChatButton } from "@/components/support/OpenLiveChatButton";

export async function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dashboard-shell mt-8 overflow-hidden p-4 sm:p-6 lg:p-7">
      <div className="grid gap-6 border-b border-[var(--chrome-border)] pb-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <BrandLockup size="lg" />
          <p className="mt-4 max-w-[46ch] text-sm font-semibold leading-relaxed text-[var(--color-text-muted)]">
            Premium social casino for virtual-chip gameplay. No deposits, no
            withdrawals and no cash value.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["18+", "Virtual chips", "No cash-out", "Play money only"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/62"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <OpenLiveChatButton variant="primary" className="h-11" />
          <FooterInstallApp className="h-11" />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-5 text-xs font-medium leading-relaxed text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} SEDLAR CASINO · Social casino preview.</p>
        <p>Virtual CHIP balance cannot be redeemed, withdrawn or exchanged for money.</p>
      </div>
    </footer>
  );
}
