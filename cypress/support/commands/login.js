Cypress.Commands.add('fazerLoginComCredenciaisValidas', () => {
    cy.fixture('userData').then(userData => {
      cy.get('#username').focus().type(userData.usuario)
      cy.get('#password').focus().type(userData.senha)
    })
    cy.get('#loginSubmit').click()
})