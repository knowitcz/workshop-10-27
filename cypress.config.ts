import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    testIsolation: true,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: false,
    viewportWidth: 1280,
    viewportHeight: 900,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      // The app's vite config pins :5173 with strictPort. Component tests run
      // their own server and must not collide with a running `npm run dev`.
      viteConfig: {
        server: { port: 0, strictPort: false },
      },
    },
    specPattern: 'cypress/components/**/*.cy.tsx',
    supportFile: 'cypress/support/component.tsx',
    video: false,
    screenshotOnRunFailure: false,
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'reports/mochawesome',
    overwrite: false,
    html: false,
    json: true,
  },
});
