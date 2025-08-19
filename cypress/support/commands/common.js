Cypress.Commands.add('adicionarNovaCategoria', (descricao) => {
    cy.get('#categoryDescription').type(descricao)
    cy.get('#addCategoryButton').click()
})