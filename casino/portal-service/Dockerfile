FROM node:22-alpine AS builder
ARG PORTAL_COMMIT=2ddcd09a7693fb4bcf856ba934c6c0836094d763
RUN apk add --no-cache git
WORKDIR /app

COPY social-home.tsx /tmp/social-home.tsx
COPY social-footer.tsx /tmp/social-footer.tsx
COPY social-nav.ts /tmp/social-nav.ts
COPY social-loading.tsx /tmp/social-loading.tsx
COPY patch-social-messages.mjs /tmp/patch-social-messages.mjs
COPY siedlar-brand-overlay.mjs /tmp/siedlar-brand-overlay.mjs
COPY visitor-push-only-overlay.mjs /tmp/visitor-push-only-overlay.mjs

RUN git clone https://github.com/scriptcasino/free-casino-script-portal.git . \
    && git checkout "$PORTAL_COMMIT" \
    && rm -rf .git

RUN cp /tmp/social-home.tsx 'app/[locale]/(shell)/page.tsx' \
    && cp /tmp/social-footer.tsx components/layout/Footer.tsx \
    && cp /tmp/social-nav.ts lib/nav.ts \
    && cp /tmp/social-loading.tsx 'app/[locale]/loading.tsx' \
    && cp /tmp/patch-social-messages.mjs ./patch-social-messages.mjs \
    && node ./patch-social-messages.mjs \
    && node /tmp/siedlar-brand-overlay.mjs \
    && node /tmp/visitor-push-only-overlay.mjs \
    && rm ./patch-social-messages.mjs

RUN node -e "const fs=require('fs'); const p='lib/env.ts'; let s=fs.readFileSync(p,'utf8'); const a='NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,'; const b='NEXT_PUBLIC_API_URL: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL,'; if(!s.includes(a)) throw new Error('API env anchor not found'); fs.writeFileSync(p,s.replace(a,b));"

ENV NEXT_PUBLIC_SITE_URL=https://casino-turnkey-base-git-casino-turnkey-soci-322c80-my-team-e648.vercel.app \
    NEXT_PUBLIC_SITE_NAME="SIEDLAR CASINO ROYALE" \
    NEXT_PUBLIC_SITE_TAGLINE="Social Casino — Play Money" \
    NEXT_PUBLIC_SITE_DESCRIPTION="SIEDLAR CASINO ROYALE is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value." \
    NEXT_PUBLIC_SUPPORT_EMAIL=support@sedlarcasino.example \
    NEXT_PUBLIC_API_URL=https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/casino-api \
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
    NEXT_PUBLIC_SITE_NAME="SIEDLAR CASINO ROYALE" \
    NEXT_PUBLIC_SITE_TAGLINE="Social Casino — Play Money" \
    NEXT_PUBLIC_SITE_DESCRIPTION="SIEDLAR CASINO ROYALE is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value." \
    NEXT_PUBLIC_SUPPORT_EMAIL=support@sedlarcasino.example \
    NEXT_PUBLIC_API_URL=https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/casino-api \
    NEXT_PUBLIC_REALTIME_ENABLED=false \
    NEXT_PUBLIC_CRASH_REAL_MONEY=false
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node","server.js"]
