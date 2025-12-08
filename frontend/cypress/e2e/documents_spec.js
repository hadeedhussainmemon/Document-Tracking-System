describe('Document create & edit flows', () => {
  const adminUsername = Cypress.env('ADMIN_USERNAME') || 'admin';
  const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'password';

  beforeEach(() => {
    // login first
    cy.visit('/login');
    cy.get('#username').type(adminUsername);
    cy.get('#password').type(adminPassword);
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.url().should('include', '/dashboard');
    cy.visit('/dashboard');
  });

  it('creates and edits a document', () => {
    const title = `Document ${Date.now()}`;
    cy.get('a').contains('Add Document').click();
    cy.get('#document-form').within(() => {
      cy.get('input[name="title"]').type(title);
      cy.get('textarea[name="content"]').type('This is a test content.');
      cy.get('input[name="tags"]').type('test,e2e');
      cy.get('button[type="submit"]').click();
    });
    // Wait & validate the list shows the document
    cy.get('table').contains(title).should('exist');
    // edit the document
    cy.get('table').contains(title).parent('tr').within(() => {
      cy.contains('Edit').click();
    });
    cy.get('#document-form').within(() => {
      cy.get('input[name="title"]').clear().type(`${title} - edited`);
      cy.contains('Update Document').click();
    });
    cy.get('table').contains(`${title} - edited`).should('exist');
  });
});
