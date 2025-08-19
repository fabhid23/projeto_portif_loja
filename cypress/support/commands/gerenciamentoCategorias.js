Cypress.Commands.add('adcionarNovaCategoria', (nomeCategoria) => {
    cy.get('#categoryName').focus().type(nomeCategoria)
    cy.get('#categoryForm').submit()
})

Cypress.Commands.add('removerCategoria', (nomeCategoria) => {
    cy.get('table').contains(nomeCategoria).siblings('td').get('button').click()
})