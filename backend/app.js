const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const cors = require('cors');
const path = require('path');
const PORT = 5002;
const SECRET_KEY = 'super-secret';

app.use(express.json());
app.use(cors());

// Dados em memória
let products = {};
let nextProductId = 1;
let categories = []; // New array to store categories independently

const users = {   'admin': { password: 'admin_password', roles: ['admin'] },
    'client': { password: 'client_password', roles: ['client'] }
};

// Middleware de autenticação
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Token inválido ou expirado
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Não autorizado
    }
};

// Middleware de autorização
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.sendStatus(403); // Sem usuário ou roles
        }
        const hasPermission = roles.some(role => req.user.roles.includes(role));
        if (hasPermission) {
            next();
        } else {
            res.sendStatus(403); // Sem permissão
        }
    };
};

// Rota de Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Bad username or password' });
    }

    const accessToken = jwt.sign({ username: user.username, roles: user.roles }, SECRET_KEY);
    res.json({ access_token: accessToken, role: user.roles[0] });
});

// Rotas de Produtos

// GET /produtos - Lista todos os produtos, com busca por nome e/ou categoria
app.get('/produtos', (req, res) => {
    const { search, category } = req.query;
    let filteredProducts = Object.values(products);

    if (search) {
        filteredProducts = filteredProducts.filter(product => 
            product.nome.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (category) {
        filteredProducts = filteredProducts.filter(product => 
            product.categoria.toLowerCase() === category.toLowerCase()
        );
    }
    res.json(filteredProducts);
});

// GET /produtos/categorias - Retorna todas as categorias únicas
app.get('/produtos/categorias', (req, res) => {
    res.json(categories);
});

// GET /produtos/:id - Retorna um produto específico
app.get('/produtos/:id', authenticateJWT, (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products[productId];
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
});

// POST /produtos - Cria um novo produto
app.post('/produtos', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
    const { nome, descricao, preco, estoque, categoria } = req.body;

    if (!nome || !descricao || preco === undefined || estoque === undefined || !categoria) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof preco !== 'number' || preco <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (typeof estoque !== 'number' || !Number.isInteger(estoque) || estoque < 0) {
        return res.status(400).json({ message: 'Stock must be a non-negative integer' });
    }

    const newProduct = {
        id: nextProductId,
        nome,
        descricao,
        preco,
        estoque,
        categoria
    };
    products[nextProductId] = newProduct;
    nextProductId++;
    res.status(201).json(newProduct);
});

// PUT /produtos/:id - Atualiza um produto existente
app.put('/produtos/:id', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products[productId];

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const { preco, estoque } = req.body;

    if (preco !== undefined && (typeof preco !== 'number' || preco <= 0)) {
        return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (estoque !== undefined && (typeof estoque !== 'number' || !Number.isInteger(estoque) || estoque < 0)) {
        return res.status(400).json({ message: 'Stock must be a non-negative integer' });
    }

    Object.assign(product, req.body);
    res.json(product);
});

// DELETE /produtos/:id - Exclui um produto
app.delete('/produtos/:id', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
    const productId = parseInt(req.params.id);
    if (!products[productId]) {
        return res.status(404).json({ message: 'Product not found' });
    }
    delete products[productId];
    res.json({ message: 'Product deleted' });
});

// Rotas de Categorias

// POST /categorias - Cria uma nova categoria
app.post('/categorias', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    const normalizedNome = nome.toLowerCase();
    if (categories.some(cat => cat.toLowerCase() === normalizedNome)) {
        return res.status(400).json({ message: 'Category already exists' });
    }

    categories.push(nome);
    res.status(201).json({ message: `Category '${nome}' created successfully` });
});

// DELETE /categorias/:nome - Exclui uma categoria
app.delete('/categorias/:nome', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
    const categoryName = req.params.nome;
    const initialLength = categories.length;
    categories = categories.filter(cat => cat.toLowerCase() !== categoryName.toLowerCase());

    if (categories.length === initialLength) {
        return res.status(404).json({ message: 'Category not found' });
    }

    // Remove a categoria dos produtos que a utilizam
    Object.values(products).forEach(product => {
        if (product.categoria.toLowerCase() === categoryName.toLowerCase()) {
            product.categoria = 'Uncategorized'; // Ou outra categoria padrão
        }
    });

    res.json({ message: 'Category deleted successfully' });
});

// PUT /categorias/:nome - Atualiza o nome de uma categoria
app.put('/categorias/:nome', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
    const oldCategoryName = req.params.nome;
    const { newNome } = req.body;

    if (!newNome) {
        return res.status(400).json({ message: 'New category name is required' });
    }

    const oldCategoryIndex = categories.findIndex(cat => cat.toLowerCase() === oldCategoryName.toLowerCase());
    if (oldCategoryIndex === -1) {
        return res.status(404).json({ message: 'Category not found' });
    }

    const normalizedNewNome = newNome.toLowerCase();
    if (categories.some((cat, index) => index !== oldCategoryIndex && cat.toLowerCase() === normalizedNewNome)) {
        return res.status(400).json({ message: 'New category name already exists' });
    }

    categories[oldCategoryIndex] = newNome;

    // Atualiza a categoria nos produtos que a utilizam
    Object.values(products).forEach(product => {
        if (product.categoria.toLowerCase() === oldCategoryName.toLowerCase()) {
            product.categoria = newNome;
        }
    });

    res.json({ message: `Category '${oldCategoryName}' updated to '${newNome}' successfully` });
});



// POST /produtos/:id/vender - Diminui o estoque do produto
app.post('/produtos/:id/vender', authenticateJWT, authorizeRoles(['admin', 'client']), (req, res) => {
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    const product = products[productId];
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    if (product.estoque < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
    }

    product.estoque -= quantity;
    res.json({ message: 'Product sold successfully', new_stock: product.estoque });
});

// Configuração do Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);

});