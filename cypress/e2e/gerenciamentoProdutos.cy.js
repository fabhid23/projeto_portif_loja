describe('Gerenciamento de Produtos', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.fazerLoginComCredenciaisValidas()
    })
    
    it('Deve adicionar um novo produto', () => {
        //cy.removerCategoria('Bebida')
        if (!cy.contains('table', 'Bebida').should('be.visible')) {
            cy.adcionarNovaCategoria('Bebida')
        }
        //Act
        cy.adicionarNovoProduto('Coca cola', 'Refrigerante', '5.6', '15', 'Bebida')
        //Assert
        cy.contains('.toast', 'Produto adicionado com sucesso!').should('be.visible')
    })
})