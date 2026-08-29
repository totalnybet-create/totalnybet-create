"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { AuthCard } from "./AuthCard";
import { resetAuthSessionProbe } from "@/lib/auth/sessionProbe";
import { flattenApiErrors } from "@/lib/auth/flatten-api-errors";
import { toast } from "@/lib/toast-bus";

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tTop = useTranslations("topbar");
  const [pending, setPending] = useState(false);
  const [terms, setTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loginHref =
    redirectTo !== ROUTES.home
      ? `${ROUTES.login}?from=${encodeURIComponent(redirectTo)}`
      : ROUTES.login;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") ?? "").trim().toLowerCase();
    const pw = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");

    setTermsError(false);
    setMismatch(false);
    setErrorKey(null);
    setRemoteMessage(null);
    setFieldErrors({});

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      setFieldErrors({ username: "Use 3–24 lowercase letters, numbers or _." });
      return;
    }
    if (pw.length < 8) {
      setFieldErrors({ password: "Password must contain at least 8 characters." });
      return;
    }
    if (pw !== confirm) {
      setMismatch(true);
      return;
    }
    if (!terms) {
      setTermsError(true);
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          username,
          password: pw,
          password_confirmation: confirm,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string[] | string>;
      };

      const fe = flattenApiErrors(json.errors);

      if (!res.ok) {
        if (Object.keys(fe).length) setFieldErrors(fe);
        if (typeof json.message === "string" && json.message.trim()) {
          setRemoteMessage(json.message.trim());
        } else if (Object.keys(fe).length === 0) {
          setErrorKey("registrationFailed");
        }
        return;
      }

      resetAuthSessionProbe();
      toast({
        variant: "success",
        title: t("toastSignupTitle"),
        description: t("toastSignupDescription"),
      });
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorKey("networkError");
    } finally {
      setPending(false);
    }
  }

  function errorCopy(): string | null {
    if (remoteMessage) return remoteMessage;
    if (errorKey === "registrationFailed") return t("registrationFailed");
    if (errorKey === "networkError") return t("networkError");
    return null;
  }

  const summary = errorCopy();
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const showAlert = summary || hasFieldErrors;

  return (
    <AuthCard
      title={t("signupTitle")}
      subtitle={t("signupSubtitle")}
      shellClassName="max-w-[min(520px,calc(100vw-2rem))]"
      footer={
        <p className="text-center text-sm font-bold text-[var(--color-text-muted)]">
          {t("hasAccount")}{" "}
          <Link
            href={loginHref}
            className="text-[var(--color-brand)] underline-offset-4 hover:text-[var(--color-brand-soft)] hover:underline"
          >
            {tTop("login")}
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        {showAlert ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-[var(--color-pink)]/40 bg-[var(--color-pink)]/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            {summary ? (
              <p className="text-sm font-bold leading-snug text-[var(--color-pink)]">{summary}</p>
            ) : null}
            {hasFieldErrors ? (
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-white/85">
                {t("formErrorsHint")}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-2xl bg-[var(--color-bg-elevated)] p-5 ring-1 ring-white/[0.06]">
          <div className="flex gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] ring-1 ring-[var(--color-brand)]/25">
              <KeyRound className="h-5 w-5 text-[var(--color-brand)]" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-display text-sm font-extrabold tracking-[-0.02em] text-white">
                {t("signupSectionAccountTitle")}
              </p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--color-text-muted)]">
                {t("signupSectionAccountDesc")}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <FieldGroup
              label={t("username")}
              htmlFor="signup-username"
              hint={t("usernameHint")}
              error={fieldErrors.username}
            >
              <Input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder={t("usernamePlaceholder")}
                pattern="[a-zA-Z0-9_]{3,24}"
                minLength={3}
                maxLength={24}
                required
              />
            </FieldGroup>

            <FieldGroup label={t("password")} htmlFor="signup-password" error={fieldErrors.password}>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </FieldGroup>

            <FieldGroup
              label={t("confirmPassword")}
              htmlFor="signup-confirm"
              error={
                mismatch
                  ? t("passwordMismatch")
                  : fieldErrors.password_confirmation ?? fieldErrors.confirmPassword
              }
            >
              <Input
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </FieldGroup>
          </div>
        </div>

        <div
          className={`rounded-2xl bg-[var(--color-bg-elevated)] p-4 ring-1 ring-white/[0.06] ${
            termsError ? "ring-[var(--color-pink)]/45" : ""
          }`}
        >
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="terms"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                if (e.target.checked) setTermsError(false);
              }}
              aria-invalid={termsError ? true : undefined}
              className="mt-1 size-[1.125rem] shrink-0 rounded border border-[var(--color-line)] bg-[var(--color-bg)] accent-[var(--color-brand)]"
            />
            <span className="text-xs font-bold leading-snug text-[var(--color-text-muted)]">
              {t("termsLabel")}{" "}
              <Link
                href={ROUTES.responsibleGaming}
                className="text-[var(--color-brand)] underline-offset-4 hover:underline"
              >
                {t("readPolicy")}
              </Link>
            </span>
          </label>
          {termsError ? (
            <p className="mt-3 pl-[calc(1.125rem+0.75rem)] text-xs font-bold text-[var(--color-pink)]">
              {t("termsRequired")}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? "…" : t("submitSignup")}
        </Button>
      </form>
    </AuthCard>
  );
}
