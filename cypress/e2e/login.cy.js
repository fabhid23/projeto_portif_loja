describe('Login', () => {
  beforeEach(() => {
    //Arrange
    cy.visit('/')
    cy.screenshot('apos-visitar-pagina')
  })
  it('Login com dados válidos deve permitir entrada no sistema', () => {
    
    //Act
    cy.fazerLoginComCredenciaisValidas()

    //Assert
    cy.contains('#welcomeMessage', 'Bem-vindo, admin!').should('be.visible')
  })
})