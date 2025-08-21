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
