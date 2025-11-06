describe('Product Browsing', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display products on homepage', () => {
    cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0)
    cy.get('[data-cy=product-title]').first().should('be.visible')
    cy.get('[data-cy=product-price]').first().should('be.visible')
  })

  it('should navigate to product detail page', () => {
    cy.get('[data-cy=product-card]').first().click()
    cy.url().should('include', '/product/')
    cy.get('[data-cy=product-detail-title]').should('be.visible')
    cy.get('[data-cy=product-detail-price]').should('be.visible')
  })

  it('should filter products by category', () => {
    cy.get('[data-cy=category-filter]').first().click()
    cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0)
  })
})