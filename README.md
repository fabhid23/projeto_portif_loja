# Projeto Bugfree Shop

## Objetivo do Projeto

Este projeto tem como objetivo simular uma aplicação de e-commerce completa, dividida em frontend, backend e testes automatizados com Cypress. Ele serve como um ambiente para demonstração de funcionalidades, arquitetura de sistemas e práticas de teste.

## Tecnologias Utilizadas

Este projeto é desenvolvido utilizando JavaScript e um conjunto de bibliotecas e frameworks para cada uma de suas partes:

### Geral
- **JavaScript**: Linguagem de programação principal.
- **Cypress**: Framework de testes end-to-end para automação de testes de interface de usuário.
- **Cypress-mochawesome-reporter**: Gerador de relatórios HTML para os testes Cypress.

### Backend (API REST)
- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express.js**: Framework web para construção de APIs RESTful.
- **CORS**: Middleware para habilitar o Cross-Origin Resource Sharing.
- **jsonwebtoken**: Para implementação de autenticação baseada em JWT (JSON Web Tokens).
- **swagger-ui-express**: Para servir a documentação da API gerada com Swagger/OpenAPI.
- **YAMLJS**: Parser YAML para carregar a especificação Swagger.

### Frontend (Aplicação Web)
- **HTML5**: Estrutura da página web.
- **CSS3**: Estilização da aplicação.
- **JavaScript (Vanilla)**: Lógica de interação e consumo da API.
- **http-server**: Servidor HTTP simples para servir os arquivos estáticos do frontend.

## Pré-requisitos

Para executar este projeto, você precisará ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** (geralmente instalado com o Node.js)

## Estrutura do Projeto

A estrutura de diretórios do projeto é organizada da seguinte forma:

```
projeto_portif_loja/
├── .gitattributes
├── .gitignore
├── README.md
├── backend/          # Contém a API RESTful desenvolvida com Node.js e Express.
│   ├── app.js       # Ponto de entrada da API.
│   ├── package.json # Gerenciamento de dependências do backend.
│   └── swagger.yaml # Definição da documentação da API (OpenAPI/Swagger).
├── cypress/          # Contém os testes end-to-end com Cypress.
│   ├── e2e/         # Testes de ponta a ponta.
│   │   ├── gerenciamentoProdutos.cy.js # Testes para gerenciamento de produtos.
│   │   └── login.cy.js # Testes para o fluxo de login.
│   ├── fixtures/    # Dados de teste (ex: credenciais de usuário).
│   └── support/     # Comandos e configurações customizadas do Cypress.
├── frontend/        # Contém a aplicação web cliente.
│   ├── index.html   # Página principal da aplicação.
│   ├── script.js    # Lógica JavaScript do frontend.
│   └── style.css    # Estilos CSS da aplicação.
├── package.json     # Dependências gerais do projeto (incluindo Cypress).
└── bugfree_shop.PNG # Imagem de exemplo da aplicação.
```

## Como Executar o Projeto

Para rodar o projeto completo (backend, frontend e testes Cypress), siga os passos abaixo:

### 1. Instalação das Dependências

Abra o terminal na raiz do projeto (`projeto_portif_loja/`) e execute:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 2. Execução do Backend (API)

No terminal, a partir da raiz do projeto, navegue até o diretório `backend` e inicie a API:

```bash
cd backend
npm start
```

A API estará disponível em `http://localhost:5002`.

### 3. Execução do Frontend

Abra um **novo terminal**. A partir da raiz do projeto, navegue até o diretório `frontend` e inicie a aplicação web:

```bash
cd frontend
npm start
```

O frontend estará disponível em `http://localhost:3000`.

### 4. Execução dos Testes Cypress

Abra um **terceiro terminal**. A partir da raiz do projeto, execute os testes Cypress:

```bash
npx cypress run
```

Para abrir a interface gráfica do Cypress e executar os testes interativamente:

```bash
npx cypress open
```

### 5. Geração de Relatórios com Mochawesome

Após a execução dos testes Cypress (usando `npx cypress run`), o Mochawesome gerará um relatório HTML detalhado. Este relatório será salvo automaticamente no diretório `mochawesome-report/` na raiz do projeto. Para visualizá-lo, basta abrir o arquivo `mochawesome.html` em seu navegador.

## Usuários Cadastrados

Para facilitar os testes e a exploração da aplicação, os seguintes usuários estão pré-cadastrados:

- **Admin:** username: `admin`, password: `admin_password`
- **Client:** username: `client`, password: `client_password`

## Informações Importantes
- A API utiliza autenticação JWT
- O frontend faz requisições para a API em `http://localhost:5002`
- Documentação da API disponível em `http://localhost:5002/api-docs`
=======

- A API utiliza autenticação JWT para proteger suas rotas.
- O frontend faz requisições para a API em `http://localhost:5002`.
- A documentação interativa da API (Swagger UI) está disponível em `http://localhost:5002/api-docs`.

## Repositório de Testes de Performance

Este projeto possui um repositório dedicado para testes de performance, que utiliza a ferramenta k6. Você pode encontrar mais detalhes e instruções de execução no seguinte link:

- [Repositório de Testes de Performance](https://github.com/fabhid23/porti_loja_performance) <mcreference link="https://github.com/fabhid23/porti_loja_performance" index="0">0</mcreference>

Para que os testes de performance funcionem corretamente, é necessário que este projeto (`projeto_portif_loja`) esteja em execução localmente, conforme as instruções de "Como Executar o Projeto".

## Documentação de Testes

O projeto inclui uma pasta `DocumentosDeTeste/` com os seguintes documentos:

- **Caso de Teste - Exemplo - loja.docx**: Um exemplo de caso de teste detalhado para a aplicação.
- **Plano e Estratégia de Testes loja.docx**: Documento que descreve o plano geral e a estratégia adotada para os testes do projeto.
- **Relatório de Sessão - loja.docx**: Um relatório de sessão de testes, registrando as atividades e resultados de uma sessão de teste exploratório ou formal.

=======
Requisitos, User Story e Epic
Os requisitos, user stories e epics estão documentados no Wiki do projeto.

Exemplos de Bugs Conhecidos (Issues)
=======

- A API utiliza autenticação JWT para proteger suas rotas.
- O frontend faz requisições para a API em `http://localhost:5002`.
- A documentação interativa da API (Swagger UI) está disponível em `http://localhost:5002/api-docs`.

