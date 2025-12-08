describe('Admin Users CRUD and audit logs', () => {
  const adminUsername = Cypress.env('ADMIN_USERNAME') || 'admin';
  const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'password';

  beforeEach(() => {
    // login as admin
    cy.visit('/login');
    cy.get('#username').type(adminUsername);
    cy.get('#password').type(adminPassword);
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.url().should('include', '/dashboard');
    // go to admin users
    cy.visit('/admin/users');
  });

  it('creates and deletes a user and verifies audit log', () => {
    const username = `testuser_${Date.now()}`;
    // Click New User
    cy.contains('New User').click();
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type('secret123');
    cy.get('select[name="role"]').select('employee');
    cy.contains('Create User').click();
    // wait for created and list, then search
    cy.wait(500);
    cy.get('input[placeholder="Search..."]').clear().type(username).type('{enter}');
    cy.contains(username).should('exist');
    // Open history and verify at least one audit log
    cy.get('table').contains('History').click();
    cy.contains('Audit Log').should('exist');
    // Delete the user
    cy.get('table').contains(username).parent('tr').within(() => {
        cy.contains('Delete').click();
    });
    cy.contains('Delete').click(); // confirm
    // verify removal
    cy.wait(500);
    cy.get('input[placeholder="Search..."]').clear().type(username).type('{enter}');
    cy.contains('No users found').should('exist');
  });
});
