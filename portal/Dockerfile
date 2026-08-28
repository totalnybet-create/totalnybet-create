FROM node:22-alpine AS builder
ARG PORTAL_COMMIT=2ddcd09a7693fb4bcf856ba934c6c0836094d763
ARG OVERLAY_COMMIT=2121ebbe2cfb8800d0999f003b1947f9c2018ec8
RUN apk add --no-cache git libc6-compat
WORKDIR /app

RUN git clone https://github.com/scriptcasino/free-casino-script-portal.git . \
    && git checkout "$PORTAL_COMMIT" \
    && rm -rf .git

RUN wget -qO /tmp/social-home.tsx "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${OVERLAY_COMMIT}/casino/portal-service/social-home.tsx" \
    && wget -qO /tmp/social-footer.tsx "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${OVERLAY_COMMIT}/casino/portal-service/social-footer.tsx" \
    && wget -qO /tmp/social-nav.ts "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${OVERLAY_COMMIT}/casino/portal-service/social-nav.ts" \
    && wget -qO /tmp/patch-social-messages.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${OVERLAY_COMMIT}/casino/portal-service/patch-social-messages.mjs" \
    && cp /tmp/social-home.tsx 'app/[locale]/(shell)/page.tsx' \
    && cp /tmp/social-footer.tsx components/layout/Footer.tsx \
    && cp /tmp/social-nav.ts lib/nav.ts \
    && cp /tmp/patch-social-messages.mjs ./patch-social-messages.mjs \
    && node ./patch-social-messages.mjs \
    && rm ./patch-social-messages.mjs

ENV NEXT_PUBLIC_SITE_URL=https://casino-turnkey-base-git-casino-turnkey-soci-322c80-my-team-e648.vercel.app \
    NEXT_PUBLIC_SITE_NAME="SEDLAR CASINO" \
    NEXT_PUBLIC_SITE_TAGLINE="Social Casino — Play Money" \
    NEXT_PUBLIC_SITE_DESCRIPTION="SEDLAR CASINO is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value." \
    NEXT_PUBLIC_SUPPORT_EMAIL=support@sedlarcasino.example \
    NEXT_PUBLIC_API_URL=https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/casino-api \
    NEXT_PUBLIC_TENANT_SLUG=sedlar-casino \
    NEXT_PUBLIC_REALTIME_ENABLED=false \
    NEXT_PUBLIC_CRASH_REAL_MONEY=false \
    NEXT_TELEMETRY_DISABLED=1

RUN npm ci --include=dev && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_SITE_URL=https://casino-turnkey-base-git-casino-turnkey-soci-322c80-my-team-e648.vercel.app \
    NEXT_PUBLIC_SITE_NAME="SEDLAR CASINO" \
    NEXT_PUBLIC_SITE_TAGLINE="Social Casino — Play Money" \
    NEXT_PUBLIC_SITE_DESCRIPTION="SEDLAR CASINO is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value." \
    NEXT_PUBLIC_SUPPORT_EMAIL=support@sedlarcasino.example \
    NEXT_PUBLIC_API_URL=https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/casino-api \
    NEXT_PUBLIC_TENANT_SLUG=sedlar-casino \
    NEXT_PUBLIC_REALTIME_ENABLED=false \
    NEXT_PUBLIC_CRASH_REAL_MONEY=false
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node","server.js"]
