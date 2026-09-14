Cypress.Commands.add('typeAmount', (selector, value) => {
  cy.get(selector).clear();
  cy.get(selector).type(String(value));
});

Cypress.Commands.add('expectText', (selector, text) => {
  cy.get(selector).should('contain', text);
});
