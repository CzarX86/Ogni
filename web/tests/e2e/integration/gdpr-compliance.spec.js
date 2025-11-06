describe('GDPR Compliance', () => {
  it('should display GDPR consent banner', () => {
    cy.visit('/')
    cy.get('[data-cy=gdpr-banner]').should('be.visible')
    cy.get('[data-cy=accept-cookies]').should('be.visible')
    cy.get('[data-cy=decline-cookies]').should('be.visible')
  })

  it('should handle cookie consent', () => {
    cy.visit('/')
    cy.get('[data-cy=accept-cookies]').click()
    cy.get('[data-cy=gdpr-banner]').should('not.be.visible')
    // Verify cookies are set
    cy.getCookie('gdpr-consent').should('exist')
  })

  it('should display data rights panel', () => {
    cy.login('test@example.com', 'password123')
    cy.visit('/profile')
    cy.get('[data-cy=data-rights]').click()
    cy.get('[data-cy=export-data]').should('be.visible')
    cy.get('[data-cy=delete-account]').should('be.visible')
  })

  it('should handle data export request', () => {
    cy.login('test@example.com', 'password123')
    cy.visit('/profile')
    cy.get('[data-cy=data-rights]').click()
    cy.get('[data-cy=export-data]').click()
    cy.get('[data-cy=export-success]').should('be.visible')
  })

  it('should validate GDPR compliance on forms', () => {
    cy.visit('/register')
    cy.get('[data-cy=gdpr-checkbox]').should('be.visible')
    cy.get('[data-cy=register-button]').click()
    cy.get('[data-cy=gdpr-error]').should('be.visible')
  })
})