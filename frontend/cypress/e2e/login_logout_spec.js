describe('Login and Logout flow', () => {
  const adminUsername = Cypress.env('ADMIN_USERNAME') || 'admin';
  const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'password';

  it('logs in as admin and logs out', () => {
    cy.visit('/login');
    cy.get('#username').type(adminUsername);
    cy.get('#password').type(adminPassword);
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.url().should('include', '/dashboard');
    // Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
