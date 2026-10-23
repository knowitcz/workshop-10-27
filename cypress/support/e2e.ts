import './commands';

// Renewal state lives in sessionStorage. Clear it as the app window loads, so
// that no test can depend on what an earlier one renewed.
beforeEach(() => {
  cy.on('window:before:load', (win) => {
    win.sessionStorage.clear();
  });
});
