describe('Gerenciamento de Produtos', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.fazerLoginComCredenciaisValidas()
    })
    
    it('Deve adicionar um novo produto', () => {
        cy.adcionarNovaCategoria('Bebida')
        cy.adicionarNovoProduto('Coca cola', 'Refrigerante', '5.6', '15', 'Bebida')
        cy.contains('.toast', 'Produto adicionado com sucesso!').should('be.visible')
        cy.contains('tr', 'Coca cola').should('contain', 'Refrigerante')
        cy.contains('tr', 'Coca cola').should('contain', '5.6')
        cy.contains('tr', 'Coca cola').should('contain', '15')
        cy.contains('tr', 'Coca cola').should('contain', 'Bebida')
    })
    it('Deve remover um produto', () => {
        cy.adcionarNovaCategoria('Grão')
        cy.adicionarNovoProduto('Arroz', 'grao curto', '30.4', '20', 'Grão')
        cy.removerProduto('Arroz')
        cy.contains('.toast', 'Produto excluído com sucesso!').should('be.visible')
    })
    it('Deve editar um produto', () => {
        cy.adcionarNovaCategoria('Grão')
        cy.adicionarNovoProduto('Arroz', 'grao curto', '30,4', '20', 'Grão')
        cy.editarProduto('Arroz', 'grao curto', '40.60', '30', 'Grão')
        cy.contains('.toast', 'Produto atualizado com sucesso!').should('be.visible')
        cy.contains('tr', 'Arroz').should('contain', '40.60')
        cy.contains('tr', 'Arroz').should('contain', '30')
    })

})