describe('Gerenciamento de Produtos', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.fazerLoginComCredenciaisValidas()
    })
    afterEach(() => {
        cy.removerProduto('Coca cola')
    })
    
    it('Deve adicionar um novo produto', () => {
        cy.adcionarNovaCategoria('Bebida')
        cy.adicionarNovoProduto('Coca cola', 'Refrigerante', '5.6', '15', 'Bebida')
        cy.contains('.toast', 'Produto adicionado com sucesso!').should('be.visible')
    })
    it.only('Deve remover um produto', () => {
        cy.adcionarNovaCategoria('Grão')
        cy.adicionarNovoProduto('Arroz', 'grao curto', '30,4', '20', 'Grão')
        cy.removerProduto('Arroz')
        cy.contains('.toast', 'Produto excluído com sucesso!').should('be.visible')
    })
})