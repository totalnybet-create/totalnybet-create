FROM node:22-alpine AS builder
ARG PORTAL_COMMIT=2ddcd09a7693fb4bcf856ba934c6c0836094d763
ARG OVERLAY_COMMIT=2121ebbe2cfb8800d0999f003b1947f9c2018ec8
ARG ROYAL_OVERLAY_COMMIT=401168fd037bae1f3a7b5eefc7770e049bf7a964
ARG POLISH_COMMIT=a1249ea7b65d99a177b2d25b3a5f08d10cfd3d5a
ARG GAMES_COMMIT=0ed5afa96275fbf038d65f9cc5f586f227a4486e
ARG STATIC_FIX_COMMIT=f18abf47af36012256cb803a884225751ea0fa5a
ARG AUTH_FIX_COMMIT=eabe21be2b2958763d6f453e01c1408aa432a941
ARG QA_COPY_COMMIT=dadacc2004cfb20034285ac22f1a324ae06c64ac
ARG PERSONE_POLISH_COMMIT=3dffa4a7dd8956dd0e258219670812f002ecc06b
ARG FINAL_CLEANUP_COMMIT=9dca115060a3a58856fbc254a27a90556f9ce254
ARG DAILY_BONUS_COMMIT=9f390dc29d36a933482c701461ee137ecc67edce
ARG ELITE_POKER_COMMIT=4e38645897501badc279d62e2b18de5021617c37
ARG ROULETTE_COMMIT=4247df162d23fda53fddfb2a70d751e25f531a2e
RUN apk add --no-cache git libc6-compat
WORKDIR /app

RUN git clone https://github.com/scriptcasino/free-casino-script-portal.git . \
    && git checkout "$PORTAL_COMMIT" \
    && rm -rf .git \
    && node -e "const fs=require('fs'); const p='lib/request-public-origin.ts'; let s=fs.readFileSync(p,'utf8'); const a='if (proto === \"https\" && port === 3000) {\\n      port = defaultPort;\\n    }'; const b=a+'\\n\\n    /** Proxies can report the HTTP listener port while the public edge is HTTPS. */\\n    if ((proto === \"https\" && port === 80) || (proto === \"http\" && port === 443)) {\\n      port = defaultPort;\\n    }'; if(!s.includes(a)) throw new Error('redirect origin anchor not found'); fs.writeFileSync(p,s.replace(a,b));"

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

RUN git clone --depth 1 --branch royal-arc-casino https://github.com/totalnybet-create/totalnybet-create.git /tmp/royal \
    && mkdir -p public/royal-arc \
    && cp -R /tmp/royal/casino/. public/royal-arc/ \
    && rm -rf /tmp/royal \
    && wget -qO public/royal-arc/phaser.min.js https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js \
    && wget -qO /tmp/royal-arc-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${ROYAL_OVERLAY_COMMIT}/casino/portal-service/royal-arc-overlay.mjs" \
    && node /tmp/royal-arc-overlay.mjs \
    && rm /tmp/royal-arc-overlay.mjs

RUN git clone https://github.com/opadips/Elite-Poker.git /tmp/elite-poker \
    && cd /tmp/elite-poker \
    && git checkout "$ELITE_POKER_COMMIT" \
    && cd frontend \
    && sed -i 's/BrowserRouter/HashRouter/g' src/App.jsx \
    && sed -i 's#new WebSocket(`${protocol}://${host}:${WS_PORT}`)#new WebSocket(`${protocol}://${host}/api/games/poker/ws`)#' src/App.jsx \
    && sed -i 's/Elite Poker/Persone Royale Poker/g' src/App.jsx \
    && sed -i "s/export default defineConfig({/export default defineConfig({\\n  base: '\/poker\/',/" vite.config.js \
    && npm install \
    && npm run build \
    && cd /app \
    && mkdir -p public/poker lib/poker-engine \
    && cp -R /tmp/elite-poker/frontend/dist/. public/poker/ \
    && cp -R /tmp/elite-poker/backend/. lib/poker-engine/ \
    && rm -rf /tmp/elite-poker

RUN git clone https://github.com/IvanAdmaers/react-casino-roulette.git /tmp/roulette \
    && cd /tmp/roulette \
    && git checkout "$ROULETTE_COMMIT" \
    && npm ci \
    && npm run build \
    && cd example \
    && npm install \
    && npm run build \
    && cd /app \
    && mkdir -p public/roulette \
    && cp -R /tmp/roulette/example/dist/. public/roulette/ \
    && rm -rf /tmp/roulette

RUN wget -qO /tmp/portal-polish-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${POLISH_COMMIT}/casino/portal-service/portal-polish-overlay.mjs" \
    && node /tmp/portal-polish-overlay.mjs \
    && rm /tmp/portal-polish-overlay.mjs

RUN wget -qO /tmp/persone-brand-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${GAMES_COMMIT}/casino/portal-service/persone-brand-overlay.mjs" \
    && wget -qO /tmp/poker-roulette-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${GAMES_COMMIT}/casino/portal-service/poker-roulette-overlay.mjs" \
    && wget -qO /tmp/game-static-path-fix.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${STATIC_FIX_COMMIT}/casino/portal-service/game-static-path-fix.mjs" \
    && node /tmp/persone-brand-overlay.mjs \
    && node /tmp/poker-roulette-overlay.mjs \
    && node /tmp/game-static-path-fix.mjs \
    && rm /tmp/persone-brand-overlay.mjs /tmp/poker-roulette-overlay.mjs /tmp/game-static-path-fix.mjs

RUN wget -qO components/auth/SignupForm.tsx "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${AUTH_FIX_COMMIT}/casino/portal-service/SignupForm.fixed.tsx"

RUN wget -qO /tmp/social-cleanup-qa-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${QA_COPY_COMMIT}/casino/portal-service/social-cleanup-qa-overlay.mjs" \
    && node /tmp/social-cleanup-qa-overlay.mjs \
    && rm /tmp/social-cleanup-qa-overlay.mjs

RUN wget -qO /tmp/persone-polish-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${PERSONE_POLISH_COMMIT}/casino/portal-service/persone-polish-overlay.mjs" \
    && node /tmp/persone-polish-overlay.mjs \
    && rm /tmp/persone-polish-overlay.mjs

RUN wget -qO /tmp/persone-final-cleanup-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${FINAL_CLEANUP_COMMIT}/casino/portal-service/persone-final-cleanup-overlay.mjs" \
    && node /tmp/persone-final-cleanup-overlay.mjs \
    && rm /tmp/persone-final-cleanup-overlay.mjs

RUN wget -qO /tmp/daily-bonus-overlay.mjs "https://raw.githubusercontent.com/totalnybet-create/totalnybet-create/${DAILY_BONUS_COMMIT}/casino/portal-service/daily-bonus-overlay.mjs" \
    && node /tmp/daily-bonus-overlay.mjs \
    && rm /tmp/daily-bonus-overlay.mjs

ENV NEXT_PUBLIC_SITE_URL=https://personeroyale.pl \
    NEXT_PUBLIC_SITE_NAME="PERSONE ROYALE CASINO" \
    NEXT_PUBLIC_SITE_TAGLINE="Social Casino — Play Money" \
    NEXT_PUBLIC_SITE_DESCRIPTION="PERSONE ROYALE CASINO is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value." \
    NEXT_PUBLIC_SUPPORT_EMAIL=support@personeroyale.pl \
    NEXT_PUBLIC_API_URL=https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/casino-api \
    NEXT_PUBLIC_TENANT_SLUG=persone-royale \
    NEXT_PUBLIC_REALTIME_ENABLED=true \
    NEXT_PUBLIC_CRASH_REAL_MONEY=false \
    LARAVEL_FETCH_TIMEOUT_MS=15000 \
    NEXT_TELEMETRY_DISABLED=1

RUN npm ci --include=dev \
    && npm install @vercel/functions@latest --save-exact \
    && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_SITE_URL=https://personeroyale.pl \
    NEXT_PUBLIC_SITE_NAME="PERSONE ROYALE CASINO" \
    NEXT_PUBLIC_SITE_TAGLINE="Social Casino — Play Money" \
    NEXT_PUBLIC_SITE_DESCRIPTION="PERSONE ROYALE CASINO is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value." \
    NEXT_PUBLIC_SUPPORT_EMAIL=support@personeroyale.pl \
    NEXT_PUBLIC_API_URL=https://wmcgybrgnxeghvryqitt.supabase.co/functions/v1/casino-api \
    NEXT_PUBLIC_TENANT_SLUG=persone-royale \
    NEXT_PUBLIC_REALTIME_ENABLED=true \
    NEXT_PUBLIC_CRASH_REAL_MONEY=false \
    LARAVEL_FETCH_TIMEOUT_MS=15000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node","server.js"]
