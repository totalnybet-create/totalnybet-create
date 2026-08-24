import { Container, getContainer } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

export class CasinoApi extends Container {
  defaultPort = 8080;
  sleepAfter = "15m";
  enableInternet = true;
  pingEndpoint = "localhost/api/v1/health";

  envVars = {
    DATABASE_URL: env.DATABASE_URL,
    DB_URL: env.DATABASE_URL,
    APP_KEY: env.APP_KEY,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    APP_ENV: "production",
    APP_DEBUG: "false",
    DB_CONNECTION: "pgsql",
    SESSION_DRIVER: "database",
    CACHE_STORE: "database",
    QUEUE_CONNECTION: "sync",
    BROADCAST_CONNECTION: "log",
    CRASH_BROADCAST_IMMEDIATE: "true",
    DEFAULT_TENANT_SLUG: "crashx",
    ADMIN_PANEL_PATH: "operator-console",
    APP_URL: env.API_URL || "",
    FRONTEND_URL: env.PORTAL_URL || "",
    CORS_ALLOWED_ORIGINS: env.PORTAL_URL || ""
  };

  onStart() {
    console.log("casino-api container started");
  }

  onStop() {
    console.log("casino-api container stopped");
  }

  onError(error) {
    console.error("casino-api container error", error);
  }
}

export default {
  async fetch(request, workerEnv) {
    const url = new URL(request.url);
    if (url.pathname === "/_edge/health") {
      return Response.json({ ok: true, service: "casino-api-edge" });
    }
    return getContainer(workerEnv.CASINO_API, "casino-api-prod").fetch(request);
  }
};
