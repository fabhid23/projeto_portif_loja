Cypress.Commands.add('adicionarNovaCategoria', (descricao) => {
    cy.get('#categoryDescription').type(descricao)
    cy.get('#addCategoryButton').click()
})
Cypress.Commands.add('produtoExiste', (nomeProduto) => {
    return cy.get('table').then($table => {
        if ($table.find(`tr:contains("${nomeProduto}")`).length > 0) {
            return true;
        } else {
            return false;
        }
    });
});

Cypress.Commands.add('removerProduto', (nome) => {
    cy.produtoExiste(nome).then((existe) => {
        if (existe) {
            cy.get('table').contains('tr', nome).find('button').last().click();
        }
    });
});

Cypress.Commands.add('editarProduto', (nome, descricao, preco, quantidade, categoria) => {
    cy.produtoExiste(nome).then((existe) => {
        if (existe) {
            cy.get('table').contains('tr', nome).find('button').first().click();
            cy.get('#productDescription').clear().type(descricao);
            cy.get('#productPrice').clear().type(preco);
            cy.get('#productQuantity').clear().type(quantidade);
            cy.get('[data-cy="product-category-select"]').parent().find('.select-dropdown.dropdown-trigger').first().click()
            cy.get(`.dropdown-content li:contains("${categoria}")`).first().should('be.visible').click()
            cy.get('[data-cy="save-product-button"]').click()
        }
    })
})
