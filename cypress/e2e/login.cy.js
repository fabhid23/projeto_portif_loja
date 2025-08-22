describe('Login', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('Login com dados válidos deve permitir entrada no sistema', () => {
    cy.fazerLoginComCredenciaisValidas()
    cy.contains('#welcomeMessage', 'Bem-vindo, admin!').should('be.visible')
  })
})