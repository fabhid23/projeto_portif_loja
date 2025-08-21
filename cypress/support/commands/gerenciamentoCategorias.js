Cypress.Commands.add('categoriaExiste', (nomeCategoria) => {
    return cy.get('table').then($table => {
        if ($table.find(`td:contains("${nomeCategoria}")`).length > 0) {
            return true;
        } else {
            return false;
        }
    });
});

Cypress.Commands.add('adcionarNovaCategoria', (nomeCategoria) => {
    cy.categoriaExiste(nomeCategoria).then((existe) => {
        if (!existe) {
            cy.get('#categoryName').focus().type(nomeCategoria);
            cy.get('#categoryForm').submit();
            cy.contains('.toast', 'Categoria adicionada com sucesso!').should('be.visible');
        }
    });
});

Cypress.Commands.add('removerCategoria', (nomeCategoria) => {
    cy.get('table').contains(nomeCategoria).siblings('td').get('button').click()
})