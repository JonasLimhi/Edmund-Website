// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateAuthNav();
    
    // Check which page we're on
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'product.html' || window.location.search.includes('id=')) {
        initProductPage();
    } else {
        initProductListing();
    }
});

// ============== PRODUCT MANAGEMENT ==============

// Get all products from localStorage
function getAllProducts() {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
}

// Save products to localStorage
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

// Create a new product
function createProduct(name, price, image, description, colors = [], sizes = []) {
    const products = getAllProducts();
    const newProduct = {
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        image: image || 'https://via.placeholder.com/400x300?text=No+Image',
        description,
        colors: Array.isArray(colors) ? colors : [],
        sizes: Array.isArray(sizes) ? sizes : [],
        createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
}

// Get product by ID
function getProductById(id) {
    const products = getAllProducts();
    return products.find(p => p.id === id);
}

// Update product
function updateProduct(id, name, price, image, description, colors, sizes) {
    const products = getAllProducts();
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
        const existing = products[productIndex];
        const updated = {
            ...existing,
            name,
            price: parseFloat(price),
            image: image || existing.image,
            description
        };
        if (colors !== undefined) updated.colors = Array.isArray(colors) ? colors : [];
        if (sizes !== undefined) updated.sizes = Array.isArray(sizes) ? sizes : [];

        products[productIndex] = updated;
        saveProducts(products);
        return products[productIndex];
    }
    return null;
}

// Delete product
function deleteProduct(id) {
    const products = getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
}

// ============== PRODUCT LISTING PAGE ==============

function initProductListing() {
    const addProductBtn = document.getElementById('createProductBtn');
    const addProductForm = document.getElementById('addProductForm');
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';

    // Show/hide add product nav item based on role
    const addProductNav = document.getElementById('addProductNav');
    if (addProductNav) {
        addProductNav.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Show/hide create first product link
    const createFirstProductLink = document.getElementById('createFirstProductLink');
    if (createFirstProductLink) {
        createFirstProductLink.style.display = isAdmin ? 'block' : 'none';
    }
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            const name = document.getElementById('productName').value.trim();
            const price = document.getElementById('productPrice').value;
            const image = document.getElementById('productImage').value.trim();
            const description = document.getElementById('productDescription').value.trim();

            const colorsRaw = document.getElementById('productColors') ? document.getElementById('productColors').value : '';
            const sizesRaw = document.getElementById('productSizes') ? document.getElementById('productSizes').value : '';
            const colors = colorsRaw ? colorsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
            const sizes = sizesRaw ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

            if (!name || !price) {
                alert('Please fill in required fields (Name and Price)');
                return;
            }

            createProduct(name, price, image, description, colors, sizes);
            displayProducts();
            addProductForm.reset();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            if (modal) modal.hide();
        });
    }

    displayProducts();
}

function displayProducts() {
    const products = getAllProducts();
    const container = document.getElementById('productContainer');
    const emptyMessage = document.getElementById('emptyMessage');
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';

    if (products.length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    container.innerHTML = products.map(product => {
        let actionButtons = `<a href="product.html?id=${product.id}" class="btn btn-primary btn-sm">View Details</a>`;
        if (isAdmin) {
            actionButtons += `
                <button class="btn btn-warning btn-sm" onclick="editProductQuick('${product.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProductQuick('${product.id}')">Delete</button>
            `;
        }
        return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="product-card">
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-card-image" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <div class="product-card-body">
                    <h5 class="product-card-title">${escapeHtml(product.name)}</h5>
                    <p class="product-card-price">$${product.price.toFixed(2)}</p>
                    <p class="product-card-description">${escapeHtml(product.description || 'No description available')}</p>
                    <div class="product-card-footer">
                        ${actionButtons}
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function editProductQuick(id) {
    const product = getProductById(id);
    if (!product) return;

    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductImage').value = product.image;
    document.getElementById('editProductDescription').value = product.description || '';
    // Populate colors/sizes if present
    const editColorsEl = document.getElementById('editProductColors');
    const editSizesEl = document.getElementById('editProductSizes');
    if (editColorsEl) editColorsEl.value = product.colors ? product.colors.join(',') : '';
    if (editSizesEl) editSizesEl.value = product.sizes ? product.sizes.join(',') : '';

    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();

    const saveBtn = document.getElementById('saveProductBtn');
    saveBtn.onclick = () => {
        const name = document.getElementById('editProductName').value.trim();
        const price = document.getElementById('editProductPrice').value;
        const image = document.getElementById('editProductImage').value.trim();
        const description = document.getElementById('editProductDescription').value.trim();

        const colorsRaw = document.getElementById('editProductColors') ? document.getElementById('editProductColors').value : '';
        const sizesRaw = document.getElementById('editProductSizes') ? document.getElementById('editProductSizes').value : '';
        const colors = colorsRaw ? colorsRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
        const sizes = sizesRaw ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;

        if (!name || !price) {
            alert('Please fill in required fields');
            return;
        }

        updateProduct(id, name, price, image, description, colors, sizes);
        displayProducts();
        modal.hide();
    };
}

function deleteProductQuick(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id);
        displayProducts();
    }
}

// ============== PRODUCT DETAILS PAGE ==============

function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        window.location.href = 'Website.html';
        return;
    }

    const product = getProductById(productId);
    if (!product) {
        alert('Product not found');
        window.location.href = 'Website.html';
        return;
    }

    displayProductDetails(product);
    setupEditButton(product);
    setupDeleteButton(productId);
    setupAddProductForm();
}

function displayProductDetails(product) {
    document.getElementById('productName').textContent = escapeHtml(product.name);
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description || 'No description available';
    
    const imgElement = document.getElementById('productImage');
    imgElement.src = product.image || 'https://via.placeholder.com/400x300?text=No+Image';
    imgElement.alt = escapeHtml(product.name);
    imgElement.onerror = () => {
        imgElement.src = 'https://via.placeholder.com/400x300?text=No+Image';
    };
    
    // Generate QR Code (links to the buy page)
    const qrCodeContainer = document.getElementById('qrCode');
    if (qrCodeContainer) {
        qrCodeContainer.innerHTML = ''; // Clear previous QR code
        const basePath = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        const qrData = `${basePath}buy.html?id=${product.id}`;
        new QRCode(qrCodeContainer, {
            text: qrData,
            width: 200,
            height: 200
        });
    }
}

function setupEditButton(product) {
    const editBtn = document.getElementById('editProductBtn');
    const adminControls = document.getElementById('adminControls');
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    // Hide admin controls for customers
    if (adminControls) {
        adminControls.style.display = isAdmin ? 'block' : 'none';
    }
    
    if (editBtn && isAdmin) {
        editBtn.addEventListener('click', () => {
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductImage').value = product.image;
            document.getElementById('editProductDescription').value = product.description || '';
            // populate colors/sizes
            const editColorsEl = document.getElementById('editProductColors');
            const editSizesEl = document.getElementById('editProductSizes');
            if (editColorsEl) editColorsEl.value = product.colors ? product.colors.join(',') : '';
            if (editSizesEl) editSizesEl.value = product.sizes ? product.sizes.join(',') : '';

            const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
            modal.show();

            const saveBtn = document.getElementById('saveProductBtn');
            saveBtn.onclick = () => {
                const name = document.getElementById('editProductName').value.trim();
                const price = document.getElementById('editProductPrice').value;
                const image = document.getElementById('editProductImage').value.trim();
                const description = document.getElementById('editProductDescription').value.trim();
                const colorsRaw = document.getElementById('editProductColors') ? document.getElementById('editProductColors').value : '';
                const sizesRaw = document.getElementById('editProductSizes') ? document.getElementById('editProductSizes').value : '';
                const colors = colorsRaw ? colorsRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
                const sizes = sizesRaw ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;

                if (!name || !price) {
                    alert('Please fill in required fields');
                    return;
                }

                updateProduct(product.id, name, price, image, description, colors, sizes);
                const updatedProduct = getProductById(product.id);
                displayProductDetails(updatedProduct);
                modal.hide();
            };
        });
    }
}

function setupDeleteButton(productId) {
    const deleteBtn = document.getElementById('deleteProductBtn');
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    if (deleteBtn && isAdmin) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(productId);
                window.location.href = 'Website.html';
            }
        });
    }
}

function setupAddProductForm() {
    const createBtn = document.getElementById('createProductBtn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const name = document.getElementById('productName').value.trim();
            const price = document.getElementById('productPrice').value;
            const image = document.getElementById('productImage').value.trim();
            const description = document.getElementById('productDescription').value.trim();

            const colorsRaw = document.getElementById('productColors') ? document.getElementById('productColors').value : '';
            const sizesRaw = document.getElementById('productSizes') ? document.getElementById('productSizes').value : '';
            const colors = colorsRaw ? colorsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
            const sizes = sizesRaw ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

            if (!name || !price) {
                alert('Please fill in required fields');
                return;
            }

            createProduct(name, price, image, description, colors, sizes);
            document.getElementById('addProductForm').reset();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            if (modal) modal.hide();
        });
    }
}

// ============== AUTHENTICATION ==============

// Simple SHA-256 hash function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Set current user
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Update navigation based on auth state
function updateAuthNav() {
    const authNav = document.getElementById('authNav');
    if (!authNav) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
        const role = currentUser.role || 'customer';
        // Check if user already linked to a Facebook account
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userRecord = users.find(u => u.username === currentUser.username) || {};
        const isLinked = !!userRecord.fbId;

        // Show username and logout. If customer and not linked, show link-to-FB action.
        if (role === 'customer') {
            authNav.innerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <span class="nav-link p-0">${escapeHtml(currentUser.username)} (customer)</span>
                    ${isLinked ? '' : '<a class="nav-link" href="#" id="linkFbNav" onclick="openFbLinkModal(); return false;">Link Facebook</a>'}
                    <a class="nav-link" href="#" onclick="logout(); return false;">Logout</a>
                </div>
            `;
        } else {
            authNav.innerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <span class="nav-link p-0">${escapeHtml(currentUser.username)} (admin)</span>
                    <a class="nav-link" href="#" onclick="logout(); return false;">Logout</a>
                </div>
            `;
        }
    } else {
        authNav.innerHTML = '<a class="nav-link" href="login.html">Login</a>';
    }
}

// ------------------ Facebook (simulated) helpers ------------------
function findUserByFbId(fbId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.fbId === fbId);
}

async function fbLogin(fbEmail, fbName) {
    // Use email as fbId (lowercase)
    const fbId = (fbEmail || '').toLowerCase();
    if (!fbId) {
        alert('Facebook email required');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.fbId === fbId);

    if (user) {
        // existing linked user -> log in
        setCurrentUser({ username: user.username, role: user.role || 'customer' });
        updateAuthNav();
        window.location.href = 'Website.html';
        return;
    }

    // Not linked: create a new customer account automatically
    const base = (fbName || fbEmail.split('@')[0]).replace(/[^a-z0-9]/gi, '').toLowerCase() || 'fbuser';
    let username = base;
    let i = 1;
    while (users.find(u => u.username === username)) {
        username = base + i;
        i++;
    }

    // create a random password (user can reset later)
    const randomPass = Math.random().toString(36).slice(-10);
    const hashed = await hashPassword(randomPass);

    const newUser = { username, password: hashed, role: 'customer', fbId };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    setCurrentUser({ username: newUser.username, role: 'customer' });
    updateAuthNav();
    window.location.href = 'Website.html';
}

function openFbLinkModal() {
    const el = document.getElementById('fbLinkModal');
    if (!el) return alert('FB link UI not available on this page');
    const modal = new bootstrap.Modal(el);
    modal.show();
}

function linkFacebookToCurrentUser(fbEmail) {
    const fbId = (fbEmail || '').toLowerCase();
    if (!fbId) return alert('Facebook email required');

    const currentUser = getCurrentUser();
    if (!currentUser) return alert('You must be logged in to link a Facebook account');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.fbId === fbId)) return alert('This Facebook account is already linked to another user');

    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx === -1) return alert('Current user not found');

    users[idx].fbId = fbId;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Facebook account linked successfully');
    updateAuthNav();
}

function logout() {
    setCurrentUser(null);
    updateAuthNav();
    if (window.location.pathname.includes('profile')) {
        window.location.href = 'Website.html';
    }
}

// ============== UTILITY FUNCTIONS ==============

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
