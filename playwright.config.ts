import { defineConfig, devices } from '@playwright/test'

const browserPort = process.env.BASELINE_BROWSER_PORT ?? '4175'
const browserBaseURL = `http://127.0.0.1:${browserPort}`
const isPackedRemixFixture = Boolean(process.env.BASELINE_KIT_PACKAGE_ROOT)
const firefoxEndpoint = process.env.BASELINE_FIREFOX_WS_ENDPOINT

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    baseURL: browserBaseURL,
    // Playwright 1.63 can lose WebKit trace artifacts during context
    // teardown; assertions and Playwright's failure output remain enabled.
    trace: 'off',
  },
  webServer: {
    command: `bunx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${browserPort} --strictPort`,
    // The packed native fixture intentionally has no React peer installed.
    // Probe its own entrypoint so Playwright does not request the React demo
    // page merely to decide whether the Vite server is ready.
    url: isPackedRemixFixture ? `${browserBaseURL}/remix.html` : browserBaseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...(firefoxEndpoint
          ? {
              connectOptions: {
                wsEndpoint: firefoxEndpoint,
                exposeNetwork: '<loopback>',
              },
            }
          : {}),
      },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
