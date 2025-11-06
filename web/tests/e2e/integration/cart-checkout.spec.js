describe('Cart and Checkout Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should add product to cart', () => {
    cy.get('[data-cy=product-card]').first().then(($product) => {
      const productId = $product.attr('data-product-id')
      cy.addToCart(productId)
      cy.get('[data-cy=cart-count]').should('contain', '1')
    })
  })

  it('should update cart quantity', () => {
    cy.addToCart('test-product-id')
    cy.visit('/cart')
    cy.get('[data-cy=quantity-increase]').click()
    cy.get('[data-cy=cart-quantity]').should('contain', '2')
  })

  it('should complete checkout process', () => {
    cy.addToCart('test-product-id')
    cy.completeCheckout()
    cy.url().should('include', '/order-confirmation')
    cy.get('[data-cy=order-success]').should('be.visible')
  })

  it('should handle empty cart', () => {
    cy.visit('/cart')
    cy.get('[data-cy=empty-cart-message]').should('be.visible')
    cy.get('[data-cy=continue-shopping]').should('be.visible')
  })
})