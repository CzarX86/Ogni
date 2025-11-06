describe('Review System', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123')
  })

  it('should display existing reviews', () => {
    cy.visit('/product/test-product-id')
    cy.get('[data-cy=reviews-section]').should('be.visible')
    cy.get('[data-cy=review-item]').should('have.length.greaterThan', 0)
  })

  it('should submit a new review', () => {
    cy.visit('/product/test-product-id')
    cy.get('[data-cy=write-review]').click()
    cy.get('[data-cy=rating-stars]').within(() => {
      cy.get('[data-rating="5"]').click()
    })
    cy.get('[data-cy=review-title]').type('Great product!')
    cy.get('[data-cy=review-comment]').type('This product exceeded my expectations.')
    cy.get('[data-cy=submit-review]').click()
    cy.get('[data-cy=review-success]').should('be.visible')
  })

  it('should validate review form', () => {
    cy.visit('/product/test-product-id')
    cy.get('[data-cy=write-review]').click()
    cy.get('[data-cy=submit-review]').click()
    cy.get('[data-cy=rating-error]').should('be.visible')
    cy.get('[data-cy=comment-error]').should('be.visible')
  })

  it('should display review statistics', () => {
    cy.visit('/product/test-product-id')
    cy.get('[data-cy=average-rating]').should('be.visible')
    cy.get('[data-cy=total-reviews]').should('be.visible')
    cy.get('[data-cy=rating-distribution]').should('be.visible')
  })
})