// ============================================
// SHOPEASE E-COMMERCE - PHP Backend Integration
// ============================================

// Resolve API path reliably when served via XAMPP (http://localhost/Market/FRONTEND/)
function resolveApiBase() {
    if (window.location.protocol === 'file:') {
        return null;
    }
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const frontendIndex = pathParts.findIndex(p => p.toLowerCase() === 'frontend');
    if (frontendIndex !== -1) {
        const base = '/' + pathParts.slice(0, frontendIndex).join('/');
        return (base === '/' ? '' : base) + '/Api';
    }
    return new URL('../Api/', window.location.href).pathname.replace(/\/$/, '');
}

const API_BASE = resolveApiBase();
const REDIRECT_KEY = 'ecommerce_redirectAfterLogin';

function setRedirectAfterLogin(page) {
    sessionStorage.setItem(REDIRECT_KEY, page);
}

function consumeRedirectAfterLogin() {
    const page = sessionStorage.getItem(REDIRECT_KEY) || 'index.html';
    sessionStorage.removeItem(REDIRECT_KEY);
    return page;
}

function goAfterAuth() {
    window.location.href = consumeRedirectAfterLogin();
}

// ============================================
// THEME TOGGLE
// ============================================

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================
// API HELPER
// ============================================

async function apiRequest(endpoint, method = 'GET', body = null) {
    if (!API_BASE) {
        return {
            success: false,
            message: 'Site ko browser se direct file ki tarah mat kholein. XAMPP chalu karke http://localhost/Market/FRONTEND/ se open karein.'
        };
    }

    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, options);
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            console.error('Invalid API response:', text);
            return { success: false, message: 'Server se sahi response nahi mila. Apache aur MySQL check karein.' };
        }
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Server se connect nahi ho pa raha. XAMPP (Apache + MySQL) chalu karein.' };
    }
}

// ============================================
// PRODUCTS
// ============================================

let products = [];

function normalizeProduct(p) {
    return {
        id: parseInt(p.id),
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: parseFloat(p.price),
        compare_price: p.compare_price ? parseFloat(p.compare_price) : null,
        category: p.category_name || p.category || 'General',
        image: p.image,
        stock: parseInt(p.stock),
        featured: p.featured == 1 || p.featured === true,
        rating: parseFloat(p.rating) || 0,
        num_reviews: parseInt(p.num_reviews) || 0,
        colors: p.colors ? (typeof p.colors === 'string' ? p.colors.split(',') : p.colors) : []
    };
}

async function loadProductsFromAPI() {
    const result = await apiRequest('products.php');
    if (result.success && result.products) {
        products = result.products.map(normalizeProduct);
    }
}

// ============================================
// CATEGORIES
// ============================================

let categories = [];

async function loadCategoriesFromAPI() {
    const result = await apiRequest('categories.php');
    if (result.success && result.categories) {
        categories = result.categories;
    }
}

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    if (categories.length === 0) {
        container.innerHTML = `
            <a href="#" class="category-card" data-category="Electronics">
                <div class="category-icon-wrap"><i class="fas fa-laptop"></i></div>
                <h3>Electronics</h3><span class="category-count">Items</span>
            </a>
            <a href="#" class="category-card" data-category="Clothing">
                <div class="category-icon-wrap"><i class="fas fa-tshirt"></i></div>
                <h3>Clothing</h3><span class="category-count">Items</span>
            </a>
            <a href="#" class="category-card" data-category="Books">
                <div class="category-icon-wrap"><i class="fas fa-book"></i></div>
                <h3>Books</h3><span class="category-count">Items</span>
            </a>
            <a href="#" class="category-card" data-category="Home & Kitchen">
                <div class="category-icon-wrap"><i class="fas fa-home"></i></div>
                <h3>Home & Kitchen</h3><span class="category-count">Items</span>
            </a>
            <a href="#" class="category-card" data-category="Sports">
                <div class="category-icon-wrap"><i class="fas fa-dumbbell"></i></div>
                <h3>Sports</h3><span class="category-count">Items</span>
            </a>`;
    } else {
        container.innerHTML = categories.map(cat => `
            <a href="#" class="category-card" data-category="${cat.name}">
                <div class="category-icon-wrap"><i class="fas ${cat.icon || 'fa-tag'}"></i></div>
                <h3>${cat.name}</h3>
                <span class="category-count">${cat.product_count} items</span>
            </a>
        `).join('');
    }

    initCategoryFilter();
}

function updateHeroStats() {
    const statProducts = document.getElementById('statProducts');
    if (statProducts && products.length) {
        statProducts.textContent = products.length + '+';
    }
}

function setActiveFilter(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

function filterProductsByType(type, categoryName) {
    const title = document.getElementById('productsTitle');
    let list;

    if (categoryName) {
        list = getProductsByCategory(categoryName);
        if (title) title.textContent = `${categoryName} Products`;
        setActiveFilter('');
    } else if (type === 'all') {
        list = getProducts();
        if (title) title.textContent = 'All Products';
        setActiveFilter('all');
    } else {
        list = getFeaturedProducts();
        if (title) title.textContent = 'Featured Products';
        setActiveFilter('featured');
    }

    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    renderProducts('productsGrid', list);
}

function initProductFilters() {
    const filters = document.getElementById('productFilters');
    if (!filters) return;

    filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterProductsByType(btn.dataset.filter);
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    });
}

function getProducts() { return products; }
function getProductById(id) { return products.find(p => p.id === parseInt(id)); }
function getProductsByCategory(category) { return products.filter(p => p.category === category); }
function getFeaturedProducts() { return products.filter(p => p.featured); }

function searchProducts(query) {
    query = query.toLowerCase().trim();
    if (!query) return [];
    return products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query)
    );
}

function getRelatedProducts(productId, limit = 4) {
    const product = getProductById(productId);
    if (!product) return [];
    return products.filter(p => p.id !== productId && p.category === product.category).slice(0, limit);
}

function formatPrice(price) {
    return '₹' + parseFloat(price).toLocaleString('en-IN');
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ============================================
// AUTHENTICATION (MySQL via PHP API)
// ============================================

let currentUser = JSON.parse(localStorage.getItem('ecommerce_currentUser') || 'null');
let cartId = localStorage.getItem('ecommerce_cartId') || null;

function saveSession(user, newCartId) {
    currentUser = user;
    localStorage.setItem('ecommerce_currentUser', JSON.stringify(user));
    if (newCartId) {
        cartId = newCartId;
        localStorage.setItem('ecommerce_cartId', newCartId);
    }
}

function clearSession() {
    currentUser = null;
    cartId = null;
    localStorage.removeItem('ecommerce_currentUser');
    localStorage.removeItem('ecommerce_cartId');
    loadGuestCartIntoMemory();
}

async function registerUser(userData) {
    if (!userData.firstName || !userData.email || !userData.password) {
        return { success: false, message: 'First name, email aur password zaroori hain' };
    }
    if (userData.password.length < 6) {
        return { success: false, message: 'Password kam se kam 6 characters ka hona chahiye' };
    }

    const result = await apiRequest('register.php', 'POST', {
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password
    });

    if (result.success) {
        saveSession(result.user, result.cart?.id);
        await mergeGuestCartToAPI();
        await syncCartFromAPI();
        return { success: true, user: result.user, message: 'Registration successful!' };
    }
    const msg = result.errors ? result.errors.join(', ') : (result.message || 'Registration failed');
    return { success: false, message: msg };
}

async function loginUser(email, password) {
    if (!email || !password) {
        return { success: false, message: 'Email aur password zaroori hain' };
    }

    const result = await apiRequest('login.php', 'POST', { email, password });

    if (result.success) {
        saveSession(result.user, result.cart?.id);
        await mergeGuestCartToAPI();
        await syncCartFromAPI();
        return { success: true, user: result.user, message: 'Login successful!' };
    }
    return { success: false, message: result.message || 'Invalid email or password' };
}

async function logoutUser() {
    await apiRequest('logout.php', 'POST');
    clearSession();
    updateAuthUI();
    updateCartUI();
    return { success: true };
}

function getCurrentUser() {
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem('ecommerce_currentUser') || 'null');
    }
    return currentUser;
}

function isAuthenticated() {
    const user = getCurrentUser();
    return !!(user && user.id);
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (isAuthenticated()) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userName) userName.textContent = getCurrentUser().firstName || getCurrentUser().email;
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// ============================================
// SHOPPING CART (Guest localStorage + MySQL API)
// ============================================

const GUEST_CART_KEY = 'ecommerce_guestCart';
let cart = [];

function loadGuestCartRaw() {
    try {
        return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveGuestCartRaw(items) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function loadGuestCartIntoMemory() {
    cart = loadGuestCartRaw().map(item => ({
        id: `guest-${item.productId}`,
        productId: parseInt(item.productId),
        name: item.name,
        price: parseFloat(item.price),
        image: item.image,
        quantity: parseInt(item.quantity),
        isGuest: true
    }));
}

function isGuestCartItem(itemId) {
    return String(itemId).startsWith('guest-');
}

async function mergeGuestCartToAPI() {
    if (!isAuthenticated()) return;
    const guestItems = loadGuestCartRaw();
    if (!guestItems.length) return;

    const user = getCurrentUser();
    for (const item of guestItems) {
        await apiRequest('cart.php', 'POST', {
            user_id: parseInt(user.id),
            product_id: parseInt(item.productId),
            quantity: parseInt(item.quantity) || 1
        });
    }
    localStorage.removeItem(GUEST_CART_KEY);
}

async function syncCartFromAPI() {
    if (!isAuthenticated()) {
        loadGuestCartIntoMemory();
        updateCartUI();
        return { success: true };
    }

    const user = getCurrentUser();
    if (!user?.id) {
        clearSession();
        loadGuestCartIntoMemory();
        updateCartUI();
        return { success: false };
    }

    const result = await apiRequest(`cart.php?user_id=${user.id}`);
    if (result.success && result.cart) {
        cart = (result.cart.items || []).map(item => ({
            id: item.id,
            productId: parseInt(item.product_id),
            name: item.name,
            price: parseFloat(item.price),
            image: item.image,
            quantity: parseInt(item.quantity),
            isGuest: false
        }));
        cartId = result.cart.id;
        localStorage.setItem('ecommerce_cartId', cartId);
        updateCartUI();
        return { success: true };
    }

    console.error('Cart sync failed:', result.message);
    updateCartUI();
    return { success: false, message: result.message };
}

function getCart() { return cart; }
function getCartTotal() { return cart.reduce((total, item) => total + (item.price * item.quantity), 0); }
function getCartCount() { return cart.reduce((total, item) => total + item.quantity, 0); }

async function addToCart(productId, quantity = 1) {
    let product = getProductById(productId);
    if (!product && API_BASE) {
        await loadProductsFromAPI();
        product = getProductById(productId);
    }
    if (!product) {
        return { success: false, message: 'Product load nahi ho saka. Page refresh karein.' };
    }

    const qty = parseInt(quantity) || 1;
    const pid = parseInt(productId);

    if (isAuthenticated()) {
        const user = getCurrentUser();
        if (!user?.id) {
            clearSession();
            return { success: false, message: 'Session expire ho gaya. Dobara login karein.' };
        }

        const result = await apiRequest('cart.php', 'POST', {
            user_id: parseInt(user.id),
            product_id: pid,
            quantity: qty
        });

        if (result.success) {
            await syncCartFromAPI();
            return { success: true, message: 'Product cart mein add ho gaya!' };
        }
        return { success: false, message: result.message || 'Cart mein add nahi ho saka' };
    }

    // Guest cart (localStorage) — bina login ke kaam karega
    let guestCart = loadGuestCartRaw();
    const existing = guestCart.find(i => parseInt(i.productId) === pid);
    if (existing) {
        existing.quantity = parseInt(existing.quantity) + qty;
    } else {
        guestCart.push({
            productId: pid,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: qty
        });
    }
    saveGuestCartRaw(guestCart);
    loadGuestCartIntoMemory();
    updateCartUI();
    return { success: true, message: 'Product cart mein add ho gaya!' };
}

async function removeFromCart(itemId) {
    const item = cart.find(i => i.id == itemId);
    if (!item) return { success: false, message: 'Item not found' };

    if (!isAuthenticated() || item.isGuest || isGuestCartItem(itemId)) {
        const guestCart = loadGuestCartRaw().filter(i => parseInt(i.productId) !== item.productId);
        saveGuestCartRaw(guestCart);
        loadGuestCartIntoMemory();
        updateCartUI();
        return { success: true };
    }

    const user = getCurrentUser();
    if (!user?.id) return { success: false, message: 'Login required' };

    const result = await apiRequest('cart.php', 'DELETE', {
        user_id: parseInt(user.id),
        item_id: itemId
    });
    if (result.success) {
        await syncCartFromAPI();
        return { success: true };
    }
    return { success: false, message: result.message };
}

async function updateCartQuantity(itemId, quantity) {
    if (quantity <= 0) return removeFromCart(itemId);

    const item = cart.find(i => i.id == itemId);
    if (!item) return { success: false, message: 'Item not found' };

    if (!isAuthenticated() || item.isGuest || isGuestCartItem(itemId)) {
        const guestCart = loadGuestCartRaw();
        const gItem = guestCart.find(i => parseInt(i.productId) === item.productId);
        if (gItem) gItem.quantity = quantity;
        saveGuestCartRaw(guestCart);
        loadGuestCartIntoMemory();
        updateCartUI();
        return { success: true };
    }

    const user = getCurrentUser();
    if (!user?.id) return { success: false, message: 'Login required' };

    const result = await apiRequest('cart.php', 'PUT', {
        user_id: parseInt(user.id),
        item_id: itemId,
        quantity
    });

    if (result.success) {
        await syncCartFromAPI();
        return { success: true };
    }
    return { success: false, message: result.message };
}

function updateCartUI() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

// ============================================
// ORDERS (MySQL via PHP API)
// ============================================

async function createOrder(orderData) {
    if (!isAuthenticated()) return { success: false, message: 'Order ke liye pehle login karein' };

    await mergeGuestCartToAPI();
    await syncCartFromAPI();

    if (cart.length === 0) return { success: false, message: 'Cart khali hai' };

    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
        if (!orderData[field]) return { success: false, message: 'Saari shipping details bharein' };
    }

    const result = await apiRequest('orders.php', 'POST', {
        user_id: parseInt(getCurrentUser().id),
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        zipCode: orderData.zipCode,
        country: orderData.country || 'India',
        paymentMethod: orderData.paymentMethod || 'COD'
    });

    if (result.success) {
        await syncCartFromAPI();
        return { success: true, order: result };
    }
    return { success: false, message: result.message || 'Order place nahi ho saka' };
}

async function getOrders() {
    if (!isAuthenticated()) return [];
    const result = await apiRequest(`orders.php?user_id=${getCurrentUser().id}`);
    if (result.success) return result.orders || [];
    return [];
}

// ============================================
// UI FUNCTIONS
// ============================================

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'alert');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button type="button" class="toast-close" aria-label="Close">&times;</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);
    document.body.appendChild(container);

    toast.querySelector('.toast-close').addEventListener('click', () => container.remove());
    setTimeout(() => { if (container.parentElement) container.remove(); }, 4000);
}

function renderProducts(containerId, productsToRender) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!productsToRender || productsToRender.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px; display: block;"></i>
                <h3 style="color: #666;">No products found</h3>
            </div>
        `;
        return;
    }

    container.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-wrapper">
                <a href="product-detail.html?id=${product.id}">
                    <img src="${product.image || 'https://via.placeholder.com/400'}"
                         alt="${product.name}"
                         class="product-image"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/400?text=No+Image'">
                </a>
                ${product.compare_price ? `
                    <span class="product-badge">${Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF</span>
                ` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <a href="product-detail.html?id=${product.id}" class="product-name">${product.name}</a>
                <div class="product-rating">
                    ${renderStars(product.rating)}
                    <span>(${product.num_reviews})</span>
                </div>
                <div class="product-price-row">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    ${product.compare_price ? `
                        <span class="product-compare-price">${formatPrice(product.compare_price)}</span>
                    ` : ''}
                </div>
                <button type="button" class="add-to-cart-btn" data-product-id="${product.id}"
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? '<i class="fas fa-cart-plus"></i> Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `).join('');

    initProductCardActions(containerId);
}

function initProductCardActions(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.cartBound === '1') return;

    container.dataset.cartBound = '1';
    container.addEventListener('click', async (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn || btn.disabled) return;

        e.preventDefault();
        e.stopPropagation();

        const productId = btn.dataset.productId || btn.closest('.product-card')?.dataset.id;
        if (productId) await handleAddToCart(productId, e);
    });
}

async function handleAddToCart(productId, evt) {
    const btn = (evt || window.event)?.target?.closest('.add-to-cart-btn, .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...'; }

    const wasEmpty = cart.length === 0;
    const page = window.location.pathname.split('/').pop() || '';
    const onIndex = page === '' || page === 'index.html';

    const result = await addToCart(productId);

    if (result.success) {
        showToast(result.message + ' <a href="cart.html" style="color:#fff;text-decoration:underline;margin-left:8px;">Cart dekhein</a>', 'success');
        // Landing page (index) se first cart add karte hi user ko cart page pe le jao.
        if (onIndex && wasEmpty) {
            setTimeout(() => { window.location.href = 'cart.html'; }, 900);
        }
    } else {
        showToast(result.message, 'error');
    }

    if (btn) {
        const product = getProductById(productId);
        btn.disabled = product ? product.stock <= 0 : false;
        btn.innerHTML = product && product.stock > 0
            ? '<i class="fas fa-cart-plus"></i> Add to Cart'
            : (product ? 'Out of Stock' : '<i class="fas fa-cart-plus"></i> Add to Cart');
    }
}

function handleProceedToCheckout(evt) {
    if (evt) evt.preventDefault();

    if (cart.length === 0) {
        showToast('Pehle cart mein koi product add karein', 'warning');
        return false;
    }

    if (!isAuthenticated()) {
        setRedirectAfterLogin('checkout.html');
        showToast('Order place karne ke liye login karein', 'info');
        setTimeout(() => { window.location.href = 'login.html'; }, 800);
        return false;
    }

    window.location.href = 'checkout.html';
    return false;
}

// ============================================
// PAGE FUNCTIONS
// ============================================

async function loadHomePage() {
    renderCategories();
    filterProductsByType('featured');
    updateHeroStats();
    updateCartUI();
    updateAuthUI();
}

async function loadCartPage() {
    if (isAuthenticated()) {
        await syncCartFromAPI();
    } else {
        loadGuestCartIntoMemory();
    }

    const container = document.getElementById('cartItems');
    const emptyDiv = document.getElementById('cartEmpty');
    const summaryDiv = document.getElementById('cartSummary');
    const layoutDiv = document.getElementById('cartLayout');

    if (cart.length === 0) {
        if (emptyDiv) emptyDiv.style.display = 'block';
        if (layoutDiv) layoutDiv.style.display = 'none';
        if (container) container.style.display = 'none';
        if (summaryDiv) summaryDiv.style.display = 'none';
        updateCartUI();
        return;
    }

    if (emptyDiv) emptyDiv.style.display = 'none';
    if (layoutDiv) layoutDiv.style.display = 'grid';
    if (container) {
        container.style.display = 'block';
        container.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button type="button" onclick="handleQuantityChange('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" onclick="handleQuantityChange('${item.id}', 1)">+</button>
                    </div>
                    <button type="button" onclick="handleRemoveItem('${item.id}')" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    if (summaryDiv) {
        summaryDiv.style.display = 'block';
        const subtotal = document.getElementById('subtotal');
        const totalAmount = document.getElementById('totalAmount');
        if (subtotal) subtotal.textContent = formatPrice(getCartTotal());
        if (totalAmount) totalAmount.textContent = formatPrice(getCartTotal());
    }
    updateCartUI();
}

async function handleQuantityChange(itemId, change) {
    const item = cart.find(i => i.id == itemId);
    if (!item) return;
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) { await handleRemoveItem(itemId); return; }
    const result = await updateCartQuantity(itemId, newQuantity);
    if (result.success) await loadCartPage();
    else showToast(result.message, 'error');
}

async function handleRemoveItem(itemId) {
    await removeFromCart(itemId);
    await loadCartPage();
    showToast('Item cart se remove ho gaya', 'info');
}

async function loadOrdersPage() {
    if (!isAuthenticated()) { window.location.href = 'login.html'; return; }
    const container = document.getElementById('ordersList');
    const userOrders = await getOrders();

    if (userOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 0;">
                <i class="fas fa-shopping-bag" style="font-size: 64px; color: #ccc; margin-bottom: 20px; display: block;"></i>
                <h2 style="color: #666;">No orders yet</h2>
                <p style="color: #999; margin-bottom: 25px;">Start shopping to see your orders here</p>
                <a href="index.html#products" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    container.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <strong>Order #${order.order_number}</strong>
                    <span style="color: #666; font-size: 14px; margin-left: 15px;">
                        <i class="far fa-calendar-alt"></i> ${new Date(order.created_at).toLocaleDateString('en-IN')}
                    </span>
                </div>
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.product_name} × ${item.quantity}</span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <strong>Total: ${formatPrice(order.total_amount)}</strong>
                <span style="color: #666; font-size: 14px;">
                    ${order.payment_method === 'COD' ? '💳 Cash on Delivery' : '💳 Online Payment'}
                </span>
            </div>
        </div>
    `).join('');
}

async function loadProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) { window.location.href = 'index.html'; return; }
    const product = getProductById(productId);
    if (!product) { showToast('Product not found', 'error'); window.location.href = 'index.html'; return; }

    document.title = `${product.name} - ShopEase`;
    const container = document.getElementById('productDetail');
    container.innerHTML = `
        <div class="product-detail-grid">
            <div class="product-detail-image">
                <img src="${product.image || 'https://via.placeholder.com/600'}" alt="${product.name}">
            </div>
            <div class="product-detail-info">
                <div class="product-category">${product.category}</div>
                <h1>${product.name}</h1>
                <div class="product-rating">${renderStars(product.rating)}<span>(${product.num_reviews} reviews)</span></div>
                <div class="product-price-row">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    ${product.compare_price ? `<span class="product-compare-price">${formatPrice(product.compare_price)}</span><span class="product-discount-badge">${Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF</span>` : ''}
                </div>
                <div class="product-description"><p>${product.description || 'No description available.'}</p></div>
                <div class="product-meta"><div><strong>Availability:</strong> ${product.stock > 0 ? `✅ In Stock (${product.stock} items)` : '❌ Out of Stock'}</div></div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-lg" onclick="handleAddToCart(${product.id}, event)" ${product.stock <= 0 ? 'disabled' : ''}><i class="fas fa-cart-plus"></i> Add to Cart</button>
                    <a href="index.html" class="btn btn-outline btn-lg"><i class="fas fa-arrow-left"></i> Continue Shopping</a>
                </div>
            </div>
        </div>
    `;
    renderProducts('relatedProducts', getRelatedProducts(productId));
    updateCartUI();
    updateAuthUI();
}

async function loadCheckoutPage() {
    if (!isAuthenticated()) {
        setRedirectAfterLogin('checkout.html');
        window.location.href = 'login.html';
        return;
    }

    await mergeGuestCartToAPI();
    await syncCartFromAPI();

    if (cart.length === 0) {
        showToast('Cart khali hai — pehle products add karein', 'warning');
        setTimeout(() => { window.location.href = 'cart.html'; }, 1200);
        return;
    }

    const user = getCurrentUser();
    const form = document.querySelector('.checkout-form form');
    if (form && user) {
        const setField = (name, value) => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && value) el.value = value;
        };
        setField('firstName', user.firstName);
        setField('lastName', user.lastName);
        setField('email', user.email);
        setField('phone', user.phone);
    }

    const container = document.getElementById('checkoutSummary');
    container.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');
    document.getElementById('checkoutTotal').textContent = formatPrice(getCartTotal());
    updateCartUI();
    updateAuthUI();
}

async function handleCheckout(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...'; }
    const result = await createOrder(data);
    if (result.success) {
        showToast('🎉 Order successfully place ho gaya!', 'success');
        setTimeout(() => window.location.href = 'orders.html', 1500);
    } else {
        showToast(result.message, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Place Order'; }
    }
}

// ============================================
// AUTH HANDLERS
// ============================================

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('[type="submit"]');
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...'; }
    const result = await loginUser(email, password);
    if (result.success) {
        showToast('Welcome ' + result.user.firstName + '!', 'success');
        updateAuthUI();
        updateCartUI();
        setTimeout(() => goAfterAuth(), 800);
    } else {
        showToast(result.message, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In'; }
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('[type="submit"]');
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector('[name="confirmPassword"]')?.value;

    if (confirmPassword && password !== confirmPassword) {
        showToast('Passwords match nahi kar rahe', 'error');
        return;
    }

    const data = {
        firstName: form.querySelector('[name="firstName"]').value,
        lastName: form.querySelector('[name="lastName"]').value || '',
        email: form.querySelector('[name="email"]').value,
        phone: form.querySelector('[name="phone"]').value || '',
        password
    };

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...'; }
    const result = await registerUser(data);
    if (result.success) {
        updateAuthUI();
        updateCartUI();
        showToast('Account ban gaya! Ab shopping shuru karein.', 'success');
        setTimeout(() => goAfterAuth(), 1000);
    } else {
        showToast(result.message, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account'; }
    }
}

async function handleLogout() {
    await logoutUser();
    showToast('Logout successful', 'info');
    setTimeout(() => window.location.href = 'index.html', 500);
}

// ============================================
// INITIALIZATION
// ============================================

function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('mobileMenuOverlay');
    const closeBtn = document.getElementById('closeMobileMenu');
    const content = document.getElementById('mobileMenuContent');
    if (!menuBtn || !overlay || !content) return;

    function openMenu() { overlay.classList.add('active'); content.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function closeMenu() { overlay.classList.remove('active'); content.classList.remove('active'); document.body.style.overflow = ''; }

    menuBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;
    let timeout;

    searchInput.addEventListener('input', function() {
        clearTimeout(timeout);
        const query = this.value.trim();
        timeout = setTimeout(() => {
            if (query.length < 2) { searchResults.classList.remove('active'); return; }
            const results = searchProducts(query);
            if (results.length > 0) {
                searchResults.innerHTML = results.map(p => `
                    <a href="product-detail.html?id=${p.id}" class="search-result-item">
                        <img src="${p.image || 'https://via.placeholder.com/50'}" alt="${p.name}">
                        <div class="info"><div class="name">${p.name}</div><div class="price">${formatPrice(p.price)}</div></div>
                    </a>
                `).join('');
                searchResults.classList.add('active');
            } else {
                searchResults.innerHTML = `<div style="padding:15px;color:#999;text-align:center;">No products found for "${query}"</div>`;
                searchResults.classList.add('active');
            }
        }, 300);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrapper')) searchResults.classList.remove('active'); });
}

function initCategoryFilter() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            filterProductsByType('', category);
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            showToast(`${category} products`, 'info');
        });
    });
}

function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
}

async function initApp() {
    loadTheme();
    updateAuthUI();

    // Guest cart turant load karo
    if (!isAuthenticated()) {
        loadGuestCartIntoMemory();
        updateCartUI();
    }

    if (!API_BASE) {
        showToast('XAMPP se site open karein: http://localhost/Market/FRONTEND/', 'error');
    } else {
        await loadProductsFromAPI();
        await loadCategoriesFromAPI();

        if (isAuthenticated()) {
            await mergeGuestCartToAPI();
            await syncCartFromAPI();
        }
    }

    initMobileMenu();
    initSearch();
    initProductFilters();
    initStickyHeader();

    const page = window.location.pathname.split('/').pop() || 'index.html';
    const pageName = (page === '' || page.toLowerCase() === 'frontend') ? 'index.html' : page;

    switch (pageName) {
        case 'index.html': await loadHomePage(); break;
        case 'cart.html': await loadCartPage(); break;
        case 'checkout.html': await loadCheckoutPage(); break;
        case 'orders.html': await loadOrdersPage(); break;
        case 'product-detail.html': await loadProductDetailPage(); break;
        case 'login.html':
        case 'register.html':
            updateCartUI();
            updateAuthUI();
            if (sessionStorage.getItem(REDIRECT_KEY) === 'checkout.html') {
                showToast('Checkout ke liye login ya register karein — cart save rahega', 'info');
            }
            break;
    }
}

document.addEventListener('DOMContentLoaded', initApp);

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.toggleTheme = toggleTheme;
window.handleAddToCart = handleAddToCart;
window.handleProceedToCheckout = handleProceedToCheckout;
window.handleQuantityChange = handleQuantityChange;
window.handleRemoveItem = handleRemoveItem;
window.handleCheckout = handleCheckout;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.formatPrice = formatPrice;
window.showToast = showToast;
window.getProductById = getProductById;
