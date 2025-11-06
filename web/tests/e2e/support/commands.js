// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth')
  cy.get('[data-cy=email]').type(email)
  cy.get('[data-cy=password]').type(password)
  cy.get('[data-cy=login-button]').click()
})

// Custom command to add product to cart
Cypress.Commands.add('addToCart', (productId) => {
  cy.visit(`/product/${productId}`)
  cy.get('[data-cy=add-to-cart]').click()
})

// Custom command to complete checkout
Cypress.Commands.add('completeCheckout', () => {
  cy.visit('/checkout')
  cy.get('[data-cy=shipping-address]').type('Rua Teste, 123')
  cy.get('[data-cy=city]').type('São Paulo')
  cy.get('[data-cy=zip]').type('01234-567')
  cy.get('[data-cy=payment-method]').select('pix')
  cy.get('[data-cy=complete-order]').click()
})