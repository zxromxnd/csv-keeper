import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    locale: "en-US",
    viewport: { width: 1365, height: 950 },
  },
  webServer: {
    command: "node tests/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
