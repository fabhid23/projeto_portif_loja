const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const PORT = 5002;
const SECRET_KEY = 'super-secret';

app.use(express.json());

// Dados em memória
let products = {};
let nextProductId = 1;

const users = {
    'admin': { password: 'admin_password', roles: ['admin'] },
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
    res.json({ access_token: accessToken });
});

// Rotas de Produtos

// GET /produtos - Lista todos os produtos, com busca por nome
app.get('/produtos', authenticateJWT, (req, res) => {
    const { search } = req.query;
    let filteredProducts = products;

    if (search) {
        filteredProducts = Object.values(products).filter(product => 
            product.nome.toLowerCase().includes(search.toLowerCase())
        ).reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {});
    }
    res.json(filteredProducts);
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

// GET /produtos/categoria/:nome_categoria - Filtra produtos por categoria
app.get('/produtos/categoria/:nome_categoria', authenticateJWT, (req, res) => {
    const categoryName = req.params.nome_categoria.toLowerCase();
    const filteredProducts = Object.values(products).filter(product => 
        product.categoria.toLowerCase() === categoryName
    ).reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
    }, {});
    res.json(filteredProducts);
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