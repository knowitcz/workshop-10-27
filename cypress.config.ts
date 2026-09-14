import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: false,
    viewportWidth: 1280,
    viewportHeight: 900,
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'reports/mochawesome',
    overwrite: false,
    html: false,
    json: true,
  },
});
