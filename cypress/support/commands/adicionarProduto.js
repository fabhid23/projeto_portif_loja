Cypress.Commands.add('adicionarNovoProduto', (nome, descricao, preco, quantidade, categoria) => {
    cy.get('#productName').focus().type(nome)
    cy.get('#productDescription').focus().type(descricao)
    cy.get('#productPrice').focus().type(preco)
    cy.get('#productQuantity').focus().type(quantidade)
    cy.get('[data-cy="product-category-select"]').parent().find('.select-dropdown.dropdown-trigger').first().click()
    cy.get(`.dropdown-content li:contains("${categoria}")`).first().should('be.visible').click()
    cy.get('[data-cy="save-product-button"]').click()
})