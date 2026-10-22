// Serve a pasta do site (um nível acima) e roda os testes no Chromium.
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: ".",
  timeout: 60_000,
  retries: 1,
  /* "github": as falhas aparecem como anotações no resumo da execução no GitHub. */
  reporter: [["list"], ["github"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 4173 --directory ..",
    url: "http://localhost:4173/index.html",
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
});
