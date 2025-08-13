// Constante para a URL da API (ajuste conforme necessário)
const API_URL = 'http://localhost:5002'; // Certifique-se de que esta URL corresponde ao seu backend

let token = null;
let userRole = null;

// Elementos do DOM
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const closeBtn = document.getElementsByClassName('close-btn')[0];
const loginSection = document.getElementById('loginSection');
const productManagement = document.getElementById('productManagementSection');
const productCatalog = document.getElementById('productCatalogSection');
const loginSubmit = document.getElementById('loginSubmit');
const productForm = document.getElementById('productForm');
const productListAdmin = document.getElementById('productListAdmin');
const productListClient = document.getElementById('productListClient');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const searchProduct = document.getElementById('searchProduct');
const filterCategory = document.getElementById('filterCategory');
const cartTotal = document.getElementById('cartTotal');
const viewCartButton = document.getElementById('viewCartButton');

let cart = [];


// Funções de UI

// Funções de UI
// Funções do Modal
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000); // O modal desaparecerá após 3 segundos (3000 milissegundos)
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Funções de UI
function updateUI() {
    if (token) {
            loginSection.style.display = 'none';
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            welcomeMessage.style.display = 'inline-block';
            welcomeMessage.textContent = `Bem-vindo, ${userRole}!`;

            if (userRole === 'admin') {
                productManagement.style.display = 'block';
                productCatalog.style.display = 'block'; // Admin também vê o catálogo de cliente
            } // Fecha o if (userRole === 'admin')
        } else {
            loginSection.style.display = 'block'; // Mostrar seção de login se não houver token
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            welcomeMessage.style.display = 'none';
            productManagement.style.display = 'none';
            productCatalog.style.display = 'block'; // Clientes sempre veem o catálogo, mesmo sem login
        }
    fetchProducts();
    fetchCategories();
}

async function fetchProducts(search = '', category = '') {
    let url = `${API_URL}/produtos`;
    const params = new URLSearchParams();

    if (search) {
        params.append('search', search);
    }

    if (category) {
        params.append('category', category);
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        showModal('Erro ao buscar produtos.');
    }
}

function displayProducts(products) {
    productListAdmin.innerHTML = '';
    productListClient.innerHTML = '';

    products.forEach(product => {
        // Para administradores (com opções de editar/excluir)
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.nome}</td>
            <td>${product.preco.toFixed(2)}</td>
            <td>${product.estoque}</td>
            <td>${product.categoria}</td>
            <td>
                <button class="btn-small waves-effect waves-light blue darken-3" onclick="editProduct('${product.id}')"><i class="material-icons">edit</i></button>
                <button class="btn-small waves-effect waves-light red darken-3" onclick="deleteProduct('${product.id}')"><i class="material-icons">delete</i></button>
            </td>
        `;
        if (userRole === 'admin') {
            productListAdmin.appendChild(tr);
        }

        // Para clientes (com opção de comprar)
        const col = document.createElement('div');
        col.className = 'col s12 m6 l4'; // Usando Materialize grid para responsividade
        col.innerHTML = `
            <div class="card">
                <div class="card-content">
                    <span class="card-title">${product.nome}</span>
                    <p>Preço: R$ ${product.preco.toFixed(2)}</p>
                    <p>Estoque: ${product.estoque}</p>
                    <p>Categoria: ${product.categoria}</p>
                </div>
                <div class="card-action">
                    <div class="input-field inline" style="width: 80px; margin-right: 10px;">
                        <button class="btn-floating btn-small waves-effect waves-light blue darken-3 quantity-minus" data-product-id="${product.id}">-</button>
                        <input type="number" id="quantity-${product.id}" value="1" min="1" class="validate center-align" style="width: 40px;" readonly>
                        <button class="btn-floating btn-small waves-effect waves-light blue darken-3 quantity-plus" data-product-id="${product.id}" data-product-stock="${product.estoque}">+</button>
                        <label for="quantity-${product.id}">Qtd</label>
                    </div>
                    <button class="btn waves-effect waves-light blue darken-3 add-to-cart" data-product-id="${product.id}" data-product-name="${product.nome}" data-product-price="${product.preco}" data-product-stock="${product.estoque}">Adicionar ao Carrinho</button>
                </div>
            </div>
        `;
        productListClient.appendChild(col);
    });
}

async function fetchCategories() {
     try {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}/produtos/categorias`, { headers });
        if (!response.ok) {
            const errorBody = await response.text();
            if (response.status === 401) {
                if (token) { // If 401 and token exists, it means token is invalid
                    console.error('Token inválido ou expirado. Realizando logout.');
                    logout(); // Log out the user
                    showModal('Sessão expirada. Por favor, faça login novamente.');
                    return;
                } else { // If 401 and no token, it's an unexpected 401 for an unauthenticated route
                    console.warn('WARN: Categorias não carregadas. API retornou 401 sem token.');
                    // This case should ideally not happen if backend is correctly configured
                    return;
                }
            }
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }
        const categories = await response.json();

        // Populate filterCategory dropdown
        filterCategory.innerHTML = '<option value="" disabled selected>Todas as Categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategory.appendChild(option);
        });
        M.FormSelect.init(filterCategory); // Re-initialize Materialize select

        // Populate productCategory dropdown
        const productCategorySelect = document.getElementById('productCategory');
        productCategorySelect.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            productCategorySelect.appendChild(option);
        });
        M.FormSelect.init(productCategorySelect); // Re-initialize Materialize select

        // Display categories in the management section
        displayCategories(categories);

    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        // Não mostrar modal de erro se não houver token (usuário não logado)
        // Isso evita a mensagem "Erro ao buscar categorias." ao carregar a página
         if (token) { // Só mostra o modal se o usuário estiver logado
             showModal('Erro ao buscar categorias.');
         }
    }
}

async function displayCategories(categories) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = ''; // Clear existing list

    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category}</td>
            <td>
                <button class="btn waves-effect waves-light blue darken-3 edit-category" data-category="${category}">Editar</button>
                <button class="btn waves-effect waves-light red darken-3 delete-category" data-category="${category}">Excluir</button>
            </td>
        `;
        categoryList.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-category').forEach(button => {
        button.addEventListener('click', (event) => {
            const oldCategoryName = event.target.dataset.category;
            const newCategoryName = prompt(`Editar categoria '${oldCategoryName}':`, oldCategoryName);
            if (newCategoryName && newCategoryName !== oldCategoryName) {
                editCategory(oldCategoryName, newCategoryName);
            }
        });
    });

    document.querySelectorAll('.delete-category').forEach(button => {
        button.addEventListener('click', (event) => {
            const categoryName = event.target.dataset.category;
            if (confirm(`Tem certeza que deseja excluir a categoria '${categoryName}'?`)) {
                deleteCategory(categoryName);
            }
        });
    });
}

async function editCategory(oldName, newName) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showModal('Você precisa estar logado para editar categorias.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categorias/${oldName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newName })
        });

        if (response.ok) {
            showModal('Categoria atualizada com sucesso!');
            fetchCategories(); // Refresh the list
            fetchProducts(); // Refresh products to reflect category changes
        } else {
            const errorData = await response.json();
            showModal(`Erro ao atualizar categoria: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Erro ao editar categoria:', error);
        showModal('Erro ao editar categoria.');
    }
}

async function deleteCategory(categoryName) {
    console.log('Attempting to delete category:', categoryName);
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showModal('Você precisa estar logado para excluir categorias.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categorias/${categoryName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showModal('Categoria excluída com sucesso!');
            fetchCategories(); // Refresh the list
            fetchProducts(); // Refresh products to reflect category changes
        } else {
            const errorData = await response.json();
            showModal(`Erro ao excluir categoria: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        showModal('Erro ao excluir categoria.');
    }
}

// Event Listeners

const categoryForm = document.getElementById('categoryForm');

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('categoryName').value;

    try {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome: categoryName })
        });
        const data = await response.json();
        if (response.ok) {
            showModal('Categoria adicionada com sucesso!');
            document.getElementById('categoryName').value = ''; // Limpar o campo
            fetchCategories(); // Refresh categories after adding a new one
        } else {
            const errorData = await response.json();
            showModal(`Erro: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        showModal('Erro ao adicionar categoria.');
    }
});

loginButton.addEventListener('click', () => {
    loginSection.style.display = 'block';
    productCatalog.style.display = 'none';
});

async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            token = data.access_token;
            userRole = data.role;
            // showModal('Login bem-sucedido!'); // Removed as per user request
            updateUI();
        } else {
            showModal(data.message || 'Erro no login.');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showModal('Erro ao fazer login.');
    }
         

}

loginSubmit.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    await login(username, password);
});

logoutButton.addEventListener('click', () => {
    token = null;
    userRole = null;
    // showModal('Logout realizado.'); // Removed as per user request
    updateUI();
});

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('productId').value;
    const nome = document.getElementById('productName').value;
    const descricao = document.getElementById('productDescription').value;
    const preco = parseFloat(document.getElementById('productPrice').value);
    const estoque = parseInt(document.getElementById('productQuantity').value);
    const categoria = document.getElementById('productCategory').value;

    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `${API_URL}/produtos/${productId}` : `${API_URL}/produtos`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome, descricao, preco, estoque, categoria })
        });
        const data = await response.json();
        if (response.ok) {
            showModal(`Produto ${productId ? 'atualizado' : 'adicionado'} com sucesso!`);
            e.target.reset();
            const productIdField = document.getElementById('productId');
            if (productIdField) {
                productIdField.value = '';
            }
            
            productForm.removeAttribute('data-product-id');
            fetchProducts();
        } else {
            showModal(data.message || `Erro ao ${productId ? 'atualizar' : 'adicionar'} produto.`);
        }
    } catch (error) {
        console.error(`Erro ao ${productId ? 'atualizar' : 'adicionar'} produto:`, error);
        showModal(`Erro ao ${productId ? 'atualizar' : 'adicionar'} produto.`);
    }
});

searchProduct.addEventListener('keyup', () => {
    fetchProducts(searchProduct.value, filterCategory.value);
});

filterCategory.addEventListener('change', () => {
    fetchProducts(searchProduct.value, filterCategory.value);
});

// Inicialização
updateUI();

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.FormSelect.init(document.querySelectorAll('select'));
    M.Modal.init(document.querySelectorAll('.modal'));
    M.AutoInit();

    // Event listeners for quantity buttons and add to cart
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-plus')) {
            const productId = e.target.dataset.productId;
            const productStock = parseInt(e.target.dataset.productStock);
            const quantityInput = document.getElementById(`quantity-${productId}`);
            let currentQuantity = parseInt(quantityInput.value);
            if (currentQuantity < productStock) {
                quantityInput.value = currentQuantity + 1;
            } else {
                showModal(`Quantidade máxima para este produto é ${productStock}.`);
            }
        } else if (e.target.classList.contains('quantity-minus')) {
            const productId = e.target.dataset.productId;
            const quantityInput = document.getElementById(`quantity-${productId}`);
            let currentQuantity = parseInt(quantityInput.value);
            if (currentQuantity > 1) {
                 quantityInput.value = currentQuantity - 1;
             }
        } else if (e.target.classList.contains('add-to-cart')) {

            const productId = e.target.dataset.productId;
            const productName = e.target.dataset.productName;
            const productPrice = parseFloat(e.target.dataset.productPrice);
            const productStock = parseInt(e.target.dataset.productStock);
            const quantityInput = document.getElementById(`quantity-${productId}`);
            const quantity = parseInt(quantityInput.value);

            if (quantity > 0 && quantity <= productStock) {
                addToCart(productId, productName, productPrice, quantity, productStock);
                showModal(`${quantity}x ${productName} adicionado(s) ao carrinho!`);
            } else if (quantity > productStock) {
                showModal(`Não há estoque suficiente para adicionar ${quantity} unidades de ${productName}. Estoque disponível: ${productStock}.`);
            } else {
                showModal('Por favor, insira uma quantidade válida.');
            }
        }
    });
});

function addToCart(id, name, price, quantity, stock) {
    const existingItemIndex = cart.findIndex(item => item.id === id);

    if (existingItemIndex > -1) {
        // Item já existe no carrinho, atualiza a quantidade
        cart[existingItemIndex].quantity += quantity;
        // Ensure the quantity does not exceed stock
        if (cart[existingItemIndex].quantity > cart[existingItemIndex].stock) {
            cart[existingItemIndex].quantity = cart[existingItemIndex].stock;
        }
    } else {
        // Adiciona novo item ao carrinho
        cart.push({ id, name, price, quantity, stock });
    }
    updateCartTotal();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById('cartTotalView').textContent = `R$ ${total.toFixed(2)}`;
}

function renderCart() {
    const cartItemsList = document.getElementById('cartItemsList');
    cartItemsList.innerHTML = ''; // Clear existing items

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li class="collection-item center-align">Seu carrinho está vazio.</li>';
        return;
    }

    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'collection-item';
        li.innerHTML = `
            <div class="row valign-wrapper" style="margin-bottom: 0;">
                <div class="col s6">
                    ${item.name} - R$ ${item.price.toFixed(2)}
                </div>
                <div class="col s4">
                    <button class="btn-floating btn-small waves-effect waves-light blue darken-3 cart-quantity-minus" data-product-id="${item.id}">-</button>
                    <span class="cart-item-quantity" data-product-id="${item.id}">${item.quantity}</span>
                    <button class="btn-floating btn-small waves-effect waves-light blue darken-3 cart-quantity-plus" data-product-id="${item.id}" data-product-stock="${item.stock}">+</button>
                </div>
                <div class="col s2">
                    <a href="#!" class="secondary-content remove-from-cart" data-product-id="${item.id}">
                        <i class="material-icons">delete</i>
                    </a>
                </div>
            </div>
        `;
        cartItemsList.appendChild(li);
    });

    // Add event listeners for remove from cart buttons
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            removeFromCart(productId);
        });
    });

    document.querySelectorAll('.cart-quantity-plus').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const item = cart.find(i => i.id === productId);
            if (item && item.quantity < item.stock) {
                item.quantity++;
                renderCart();
                updateCartTotal();
            } else if (item) {
                showModal(`Quantidade máxima para ${item.name} é ${item.stock}.`);
            }
        });
    });

    document.querySelectorAll('.cart-quantity-minus').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const item = cart.find(i => i.id === productId);
            if (item && item.quantity > 1) {
                item.quantity--;
                renderCart();
                updateCartTotal();
            }
        });
    });

    document.getElementById('checkoutButton').addEventListener('click', () => {
        showModal('Funcionalidade de Finalizar Compra ainda não implementada.');
        // Implementar lógica de checkout aqui
    });
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
    updateCartTotal();
    showModal('Item removido do carrinho.');
}

viewCartButton.addEventListener('click', () => {
    renderCart();
    updateCartTotal();
    const instance = M.Modal.getInstance(document.getElementById('cartView'));
    instance.open();
});

// Funções de CRUD (chamadas pelos botões)
async function editProduct(id) {
    // Implementar lógica de edição (ex: abrir modal, preencher formulário)
    // Implementar lógica de edição (ex: abrir modal, preencher formulário)
    // alert(`Editar produto com ID: ${id}`); // Removido para usar modal
    showModal(`Editar produto com ID: ${id}`);
    // Exemplo: buscar produto e preencher formulário para edição
    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const product = await response.json();
        if (response.ok) {
            // Preencher o formulário de produto com os dados para edição
            document.getElementById('productName').value = product.nome;
            document.getElementById('productDescription').value = product.descricao;
            document.getElementById('productPrice').value = product.preco;
            document.getElementById('productQuantity').value = product.estoque;
            document.getElementById('productCategory').value = product.categoria;
            // Adicionar um botão de "Salvar Edição" ou mudar o comportamento do botão "Adicionar"
            document.getElementById('productId').value = product.id;

            productForm.setAttribute('data-product-id', product.id);
            showModal('Formulário preenchido para edição. Altere os campos e clique em Salvar Produto.');
        } else {
            showModal(product.message || 'Erro ao buscar produto para edição.');
        }
    } catch (error) {
        console.error('Erro ao buscar produto para edição:', error);
        showModal('Erro ao buscar produto para edição.');
    }
}

async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            showModal('Produto excluído com sucesso!');
            fetchProducts();
        } else {
            const data = await response.json();
            showModal(data.message || 'Erro ao excluir produto.');
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        showModal('Erro ao excluir produto.');
    }
}



function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
}



async function sellProduct(id, quantity) {
    // This function will now be called when the user "checks out" or confirms the purchase from the cart
    // For now, it's a placeholder for future checkout logic.
    // The original "Comprar" button logic is replaced by "Adicionar ao Carrinho".
    // If you want to implement a direct "buy now" for a single item, you would call this with quantity = 1.
    if (!confirm(`Deseja realmente comprar ${quantity} unidade(s) do produto ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/produtos/comprar/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantidade: quantity })
        });
        const data = await response.json();
        if (response.ok) {
            showModal('Produto comprado com sucesso!');
            fetchProducts();
        } else {
            showModal(data.message || 'Erro ao comprar produto.');
        }
    } catch (error) {
        console.error('Erro ao comprar produto:', error);
        showModal('Erro ao comprar produto.');
    }
}

// Inicialização
updateUI();