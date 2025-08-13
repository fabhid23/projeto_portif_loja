# BugFree Shop - Manual de Instalação e Execução

## Pré-requisitos
- Node.js (versão 16 ou superior)
- npm (geralmente instalado com o Node.js)

## Estrutura do Projeto
```
projeto_portif_loja/
├── backend/          # API Node.js
│   ├── app.js       # Ponto de entrada da API
│   ├── package.json # Dependências do backend
│   └── swagger.yaml # Documentação da API
└── frontend/        # Aplicação web
    ├── index.html   # Página principal
    ├── script.js    # Lógica do frontend
    └── style.css    # Estilos CSS
```

## Como Executar

1. **Backend (API):**
   ```bash
   cd backend
   npm install
   npm start
   ```
   A API estará disponível em `http://localhost:5002`

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   O frontend estará disponível em `http://localhost:3000`

## Usuários Cadastrados
- **Admin:** username: `admin`, password: `admin_password`
- **Client:** username: `client`, password: `client_password`

## Informações Importantes
- A API utiliza autenticação JWT
- O frontend faz requisições para a API em `http://localhost:5002`
- Documentação da API disponível em `http://localhost:5002/api-docs`