    const utils = {
            formatCurrency: (amount) => `$${amount.toFixed(2)}`,
            showToast: (message, type = 'info') => {
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                toast.innerHTML = `
                    <span class="material-symbols-outlined">
                        ${type === 'success' ? 'check_circle' : 
                          type === 'error' ? 'error' :
                          type === 'warning' ? 'warning' : 'info'}
                    </span>
                    <span>${message}</span>
                `;
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 5000);
            },
            generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),
            debounce: (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },
            validateEmail: (email) => {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            },
            formatDate: (date) => {
                return new Date(date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            },
            calculateDiscount: (original, discounted) => {
                return Math.round(((original - discounted) / original) * 100);
            },
            getStockStatus: (stock) => {
                if (stock === 0) return { text: 'Agotado', class: 'stock-out' };
                if (stock < 10) return { text: `Solo ${stock} disponibles`, class: 'stock-low' };
                return { text: 'En stock', class: '' };
            },
            generateRatingStars: (rating) => {
                const stars = [];
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;
                
                for (let i = 0; i < fullStars; i++) {
                    stars.push('<span class="material-symbols-outlined" style="color: var(--color-warning);">star</span>');
                }
                
                if (hasHalfStar) {
                    stars.push('<span class="material-symbols-outlined" style="color: var(--color-warning);">star_half</span>');
                }
                
                const emptyStars = 5 - stars.length;
                for (let i = 0; i < emptyStars; i++) {
                    stars.push('<span class="material-symbols-outlined" style="color: var(--color-surface-variant);">star</span>');
                }
                
                return stars.join('');
            }
        };

    document.addEventListener('DOMContentLoaded', () => {
        const state = {
            products: [], 
            cart: [], 
            users: [], 
            stores: [],
            orders: [],
            categories: [],
            coupons: [],
            banners: [],
            currentUser: null,
            currentView: 'product-view', 
            activeCategory: 'all', 
            activeMainCategory: 'all',
            searchQuery: '', 
            sortOrder: 'name-asc',
            filters: {
                priceRange: 'all',
                minRating: 0,
                availability: 'all'
            },
            wishlist: [],
            notifications: [],
            currentPage: 1,
            productsPerPage: 12,
            appliedDiscount: null
        };

        const DOM = {
            sidebar: document.getElementById('sidebar-left'),
            viewContainer: document.querySelector('.view-container'),
            views: document.querySelectorAll('.view'),
            viewTitle: document.getElementById('view-title'),
            productGrid: document.getElementById('product-grid'),
            sortOrderSelect: document.getElementById('sort-order'),
            searchInput: document.getElementById('search-input'),
            searchSuggestions: document.getElementById('search-suggestions'),
            categoryMenu: document.getElementById('category-menu'),
            cartButton: document.getElementById('cart-button'),
            cartItemCount: document.getElementById('cart-item-count'),
            cartSidebar: document.getElementById('cart-sidebar'),
            cartOverlay: document.getElementById('cart-overlay'),
            cartItemsContainer: document.querySelector('.cart-items-container'),
            cartTotal: document.getElementById('cart-total'),
            cartSubtotal: document.getElementById('cart-subtotal'),
            cartShipping: document.getElementById('cart-shipping'),
            cartDiscount: document.getElementById('cart-discount'),
            checkoutBtn: document.getElementById('checkout-btn'),
            authModal: document.getElementById('auth-modal-overlay'),
            loginView: document.getElementById('login-view'),
            registerView: document.getElementById('register-view'),
            loginForm: document.getElementById('login-form'),
            registerForm: document.getElementById('register-form'),
            loginError: document.getElementById('login-error-message'),
            authMenuItems: document.getElementById('auth-menu-items'),
            userMenuItems: document.getElementById('user-menu-items'),
            userMenuName: document.getElementById('user-menu-name'),
            deliveryMethodRadios: document.querySelectorAll('input[name="delivery-method"]'),
            shippingDetails: document.getElementById('shipping-details'),
            pickupDetails: document.getElementById('pickup-details'),
            pickupStoreSelect: document.getElementById('pickup-store'),
            paymentForm: document.getElementById('payment-form'),
            orderSummary: document.getElementById('order-summary'),
            orderTotal: document.getElementById('order-total'),
            deliverySummary: document.getElementById('delivery-summary'),
            discountSummary: document.getElementById('discount-summary'),
            orderDetails: document.getElementById('order-details'),
            discountCode: document.getElementById('discount-code'),
            applyDiscount: document.getElementById('apply-discount'),
            adminProductsList: document.getElementById('admin-products-list'),
            adminUsersList: document.getElementById('admin-users-list'),
            adminStoresList: document.getElementById('admin-stores-list'),
            adminCategoriesList: document.getElementById('admin-categories-list'),
            adminProductForm: document.getElementById('admin-product-form'),
            adminUserForm: document.getElementById('admin-user-form'),
            adminStoreForm: document.getElementById('admin-store-form'),
            adminMainCategoryForm: document.getElementById('admin-main-category-form'),
            adminSubcategoryForm: document.getElementById('admin-subcategory-form'),
            adminProductCategorySelect: document.getElementById('admin-product-category'),
            adminSubcategoryMainSelect: document.getElementById('admin-subcategory-main'),
            salesDetails: document.getElementById('sales-details'),
            generateReportBtn: document.getElementById('generate-report'),
            exportReportBtn: document.getElementById('export-report'),
            tabs: document.querySelectorAll('.tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            totalSales: document.getElementById('total-sales'),
            totalOrders: document.getElementById('total-orders'),
            totalProducts: document.getElementById('total-products'),
            totalUsers: document.getElementById('total-users'),
            totalRevenue: document.getElementById('total-revenue'),
            conversionRate: document.getElementById('conversion-rate'),
            accountForm: document.getElementById('account-form'),
            orderHistory: document.getElementById('order-history'),
            wishlistGrid: document.getElementById('wishlist-grid'),
            wishlistButton: document.getElementById('wishlist-button'),
            wishlistHeaderCount: document.getElementById('wishlist-header-count'),
            wishlistCount: document.getElementById('wishlist-count'),
            productDetailContent: document.getElementById('product-detail-content'),
            filterPanel: document.getElementById('filter-panel'),
            filterToggle: document.getElementById('filter-toggle'),
            applyFilters: document.getElementById('apply-filters'),
            clearFilters: document.getElementById('clear-filters'),
            priceRange: document.getElementById('price-range'),
            ratingFilter: document.getElementById('rating-filter'),
            availabilityFilter: document.getElementById('availability-filter'),
            paginationControls: document.getElementById('pagination-controls'),
            notificationButton: document.getElementById('notification-button'),
            notificationDropdown: document.getElementById('notification-dropdown'),
            notificationList: document.getElementById('notification-list'),
            notificationCount: document.getElementById('notification-count'),
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            adminCouponForm: document.getElementById('admin-coupon-form'),
            adminBannerForm: document.getElementById('admin-banner-form'),
            adminCouponsList: document.getElementById('admin-coupons-list')
        };

        const API = {
            fetchProducts: async () => [
                { 
                    id: 1, 
                    name: 'Aceite de Oliva Extra Virgen', 
                    mainCategory: 'abarrotes', 
                    category: 'aceites', 
                    price: 55.50, 
                    originalPrice: 65.50,
                    stock: 25, 
                    image: 'https://images.unsplash.com/photo-1626082626244-a9ea351b2b87?w=500&q=80',
                    description: 'Aceite de oliva extra virgen de primera calidad, ideal para ensaladas y cocina.',
                    rating: 4.5,
                    reviewCount: 128,
                    sku: 'ACE-001',
                    barcode: '123456789012',
                    features: ['Extra virgen', 'Primera prensada en frío', 'Botella de vidrio oscuro', '500ml'],
                    tags: ['orgánico', 'premium', 'saludable']
                },
                { 
                    id: 2, 
                    name: 'Arroz Blanco Grano Largo', 
                    mainCategory: 'abarrotes', 
                    category: 'granos', 
                    price: 12.00, 
                    stock: 50, 
                    image: 'https://images.unsplash.com/photo-1586201375822-5221a7765237?w=500&q=80',
                    description: 'Arroz blanco de grano largo, perfecto para acompañar tus comidas.',
                    rating: 4.2,
                    reviewCount: 89,
                    sku: 'ARR-001',
                    barcode: '123456789013',
                    features: ['Grano largo', 'Bolsa de 1kg', 'No transgénico'],
                    tags: ['básico', 'económico']
                },
                { 
                    id: 3, 
                    name: 'Filete de Res Premium', 
                    mainCategory: 'carnes', 
                    category: 'res', 
                    price: 75.00, 
                    stock: 15, 
                    image: 'https://images.unsplash.com/photo-1603048297172-c925e476a625?w=500&q=80',
                    description: 'Filete de res de la más alta calidad, perfecto para asar o freír.',
                    rating: 4.8,
                    reviewCount: 45,
                    sku: 'CAR-001',
                    barcode: '123456789014',
                    features: ['Corte premium', 'Empacado al vacío', 'Aprox. 500g'],
                    tags: ['premium', 'fresco']
                },
                { 
                    id: 4, 
                    name: 'Pechuga de Pollo Orgánica', 
                    mainCategory: 'carnes', 
                    category: 'pollo', 
                    price: 28.00, 
                    stock: 30, 
                    image: 'https://images.unsplash.com/photo-1604503468828-106aead70f61?w=500&q=80',
                    description: 'Pechuga de pollo orgánica, criada sin antibióticos ni hormonas.',
                    rating: 4.3,
                    reviewCount: 67,
                    sku: 'POL-001',
                    barcode: '123456789015',
                    features: ['Orgánico', 'Sin antibióticos', 'Empacado al vacío', 'Aprox. 400g'],
                    tags: ['orgánico', 'saludable']
                },
                { 
                    id: 5, 
                    name: 'Chorizo Argentino Artesanal', 
                    mainCategory: 'carnes', 
                    category: 'embutidos', 
                    price: 45.00, 
                    originalPrice: 50.00, 
                    stock: 20, 
                    image: 'https://images.unsplash.com/photo-1588285324792-38734da8cb6b?w=500&q=80',
                    description: 'Chorizo argentino artesanal, elaborado con recetas tradicionales.',
                    rating: 4.7,
                    reviewCount: 34,
                    sku: 'EMB-001',
                    barcode: '123456789016',
                    features: ['Artesanal', 'Receta tradicional', 'Paquete de 4 unidades'],
                    tags: ['artesanal', 'premium', 'argentino']
                },
                { 
                    id: 6, 
                    name: 'Salmón Fresco Noruego', 
                    mainCategory: 'pescados', 
                    category: 'salmón', 
                    price: 95.00, 
                    stock: 8, 
                    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80',
                    description: 'Salmón fresco noruego, perfecto para sashimi o a la parrilla.',
                    rating: 4.9,
                    reviewCount: 23,
                    sku: 'PES-001',
                    barcode: '123456789017',
                    features: ['Fresco', 'Noruego', 'Filete sin piel', 'Aprox. 300g'],
                    tags: ['premium', 'fresco', 'noruego']
                },
                { 
                    id: 7, 
                    name: 'Queso Gouda Holandés', 
                    mainCategory: 'lacteos', 
                    category: 'quesos', 
                    price: 32.00, 
                    stock: 18, 
                    image: 'https://images.unsplash.com/photo-1552760514-53727e1c95c2?w=500&q=80',
                    description: 'Queso Gouda holandés añejado, con sabor suave y textura cremosa.',
                    rating: 4.4,
                    reviewCount: 56,
                    sku: 'QUE-001',
                    barcode: '123456789018',
                    features: ['Holandés', 'Añejado 6 meses', 'Cuña de 250g'],
                    tags: ['importado', 'premium']
                },
                { 
                    id: 8, 
                    name: 'Yogur Griego Natural', 
                    mainCategory: 'lacteos', 
                    category: 'yogures', 
                    price: 8.50, 
                    stock: 35, 
                    image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500&q=80',
                    description: 'Yogur griego natural, alto en proteína y bajo en azúcar.',
                    rating: 4.1,
                    reviewCount: 42,
                    sku: 'YOG-001',
                    barcode: '123456789019',
                    features: ['Alto en proteína', 'Bajo en azúcar', 'Pote de 500g'],
                    tags: ['saludable', 'proteína']
                },
                { 
                    id: 9, 
                    name: 'Manzanas Royal Gala', 
                    mainCategory: 'frutas', 
                    category: 'manzanas', 
                    price: 6.00, 
                    stock: 60, 
                    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80',
                    description: 'Manzanas Royal Gala frescas, crujientes y dulces.',
                    rating: 4.0,
                    reviewCount: 31,
                    sku: 'FRU-001',
                    barcode: '123456789020',
                    features: ['Variedad Royal Gala', 'Bolsa de 1kg', 'Origen nacional'],
                    tags: ['fresco', 'dulce']
                },
                { 
                    id: 10, 
                    name: 'Aguacates Hass Maduros', 
                    mainCategory: 'frutas', 
                    category: 'aguacates', 
                    price: 18.00, 
                    stock: 22, 
                    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80',
                    description: 'Aguacates Hass maduros, listos para consumir.',
                    rating: 4.6,
                    reviewCount: 78,
                    sku: 'FRU-002',
                    barcode: '123456789021',
                    features: ['Variedad Hass', 'Listos para consumir', 'Bolsa de 4 unidades'],
                    tags: ['maduro', 'cremoso']
                },
                { 
                    id: 11, 
                    name: 'Pan Integral Multigrano', 
                    mainCategory: 'panaderia', 
                    category: 'panes', 
                    price: 15.00, 
                    stock: 25, 
                    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&q=80',
                    description: 'Pan integral multigrano, rico en fibra y nutrientes.',
                    rating: 4.3,
                    reviewCount: 29,
                    sku: 'PAN-001',
                    barcode: '123456789022',
                    features: ['Multigrano', 'Alto en fibra', 'Barra de 500g'],
                    tags: ['integral', 'saludable']
                },
                { 
                    id: 12, 
                    name: 'Croissants de Mantequilla', 
                    mainCategory: 'panaderia', 
                    category: 'pasteles', 
                    price: 4.50, 
                    stock: 40, 
                    image: 'https://images.unsplash.com/photo-1555507036-ab794f27d2e5?w=500&q=80',
                    description: 'Croissants de mantequilla, hojaldrados y deliciosos.',
                    rating: 4.7,
                    reviewCount: 63,
                    sku: 'PAN-002',
                    barcode: '123456789023',
                    features: ['Mantequilla 100%', 'Hojaldrado', 'Paquete de 4 unidades'],
                    tags: ['mantequilla', 'francés']
                },
                { 
                    id: 13, 
                    name: 'Vino Tinto Malbec', 
                    mainCategory: 'bebidas', 
                    category: 'vinos', 
                    price: 120.00, 
                    stock: 12, 
                    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&q=80',
                    description: 'Vino tinto Malbec argentino, con notas frutales y taninos suaves.',
                    rating: 4.8,
                    reviewCount: 18,
                    sku: 'VIN-001',
                    barcode: '123456789024',
                    features: ['Malbec', 'Botella 750ml', '13.5% alcohol'],
                    tags: ['argentino', 'premium', 'tinto']
                },
                { 
                    id: 14, 
                    name: 'Café Molido Premium', 
                    mainCategory: 'bebidas', 
                    category: 'café', 
                    price: 45.00, 
                    stock: 28, 
                    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&q=80',
                    description: 'Café molido premium, mezcla de granos arábicos tostados.',
                    rating: 4.5,
                    reviewCount: 95,
                    sku: 'CAF-001',
                    barcode: '123456789025',
                    features: ['100% arábica', 'Tostado medio', 'Paquete de 500g'],
                    tags: ['premium', 'arábica']
                },
                { 
                    id: 15, 
                    name: 'Agua Mineral Sin Gas', 
                    mainCategory: 'bebidas', 
                    category: 'aguas', 
                    price: 8.00, 
                    stock: 100, 
                    image: 'https://images.unsplash.com/photo-1548839149-851a5e9115a2?w=500&q=80',
                    description: 'Agua mineral natural sin gas, en botella de 1.5 litros.',
                    rating: 4.0,
                    reviewCount: 24,
                    sku: 'AGU-001',
                    barcode: '123456789026',
                    features: ['Mineral natural', 'Sin gas', 'Botella 1.5L', '6 unidades'],
                    tags: ['natural', 'hidratante']
                }
            ],
        };

        
        const renderers = {
            products: () => {
                const template = document.getElementById('product-card-template');
                let filtered = state.products.filter(p => {
                    // CORRECCIÓN: El buscador ahora funciona sin importar la categoría
                    const searchMatch = state.searchQuery === '' || 
                                      p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                                      p.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                                      p.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()));
                    
                    // Filtro por categoría
                       
                    const categoryMatch = state.activeCategory === 'all' || 
                                        p.category === state.activeCategory || 
                                        p.mainCategory === state.activeCategory ||
                                        (state.categories.some(cat => 
                                            cat.id === state.activeCategory && 
                                            cat.subcategories && 
                                            cat.subcategories.some(sub => sub.id === p.category)
                                        ));
                    
                    const priceMatch = state.filters.priceRange === 'all' || (() => {
                        const [min, max] = state.filters.priceRange.split('-').map(Number);
                        return max === 9999 ? p.price >= min : p.price >= min && p.price <= max;
                    })();
                    
                    const ratingMatch = p.rating >= state.filters.minRating;
                    
                    const availabilityMatch = state.filters.availability === 'all' ||
                                            (state.filters.availability === 'in-stock' && p.stock > 0) ||
                                            (state.filters.availability === 'out-of-stock' && p.stock === 0);
                    
                    return searchMatch && categoryMatch && priceMatch && ratingMatch && availabilityMatch;
                });
                
                filtered.sort((a, b) => {
                    switch (state.sortOrder) {
                        case 'price-asc': return a.price - b.price;
                        case 'price-desc': return b.price - a.price;
                        case 'name-desc': return b.name.localeCompare(a.name);
                        case 'rating-desc': return b.rating - a.rating;
                        case 'popularity-desc': return b.reviewCount - a.reviewCount;
                        default: return a.name.localeCompare(b.name);
                    }
                });
                
                const totalPages = Math.ceil(filtered.length / state.productsPerPage);
                const startIndex = (state.currentPage - 1) * state.productsPerPage;
                const paginatedProducts = filtered.slice(startIndex, startIndex + state.productsPerPage);
                
                DOM.productGrid.innerHTML = '';
                if (paginatedProducts.length === 0) {
                    document.getElementById('no-results-message').classList.remove('hidden');
                    DOM.paginationControls.classList.add('hidden');
                } else {
                    document.getElementById('no-results-message').classList.add('hidden');
                    paginatedProducts.forEach(p => {
                        const card = template.content.cloneNode(true);
                        const productCard = card.querySelector('.product-card');
                        
                        card.querySelector('.product-name').textContent = p.name;
                        card.querySelector('.product-category').textContent = p.category;
                        card.querySelector('.product-image').src = p.image;
                        card.querySelector('.product-image').alt = p.name;
                        card.querySelector('.product-price').textContent = utils.formatCurrency(p.price);
                        
                        const originalPrice = card.querySelector('.product-original-price');
                        if (p.originalPrice) {
                            originalPrice.textContent = utils.formatCurrency(p.originalPrice);
                        } else {
                            originalPrice.style.display = 'none';
                        }
                        
                        const ratingValue = card.querySelector('.rating-value');
                        ratingValue.textContent = p.rating.toFixed(1);
                        
                        const ratingCount = card.querySelector('.rating-count');
                        ratingCount.textContent = `(${p.reviewCount})`;
                        
                        const stockStatus = utils.getStockStatus(p.stock);
                        const stockElement = card.querySelector('.product-stock');
                        stockElement.textContent = stockStatus.text;
                        stockElement.className = `product-stock ${stockStatus.class}`;
                        
                        const wishlistBtn = card.querySelector('.wishlist-btn');
                        wishlistBtn.dataset.productId = p.id;
                        if (state.wishlist.includes(p.id)) {
                            wishlistBtn.classList.add('active');
                            wishlistBtn.querySelector('.material-symbols-outlined').textContent = 'favorite';
                        }
                        
                        const addToCartBtn = card.querySelector('[data-action="add-to-cart"]');
                        addToCartBtn.dataset.productId = p.id;
                        
                        if (p.originalPrice) {
                            const saleBadge = card.querySelector('[data-badge-type="sale"]');
                            saleBadge.classList.remove('hidden');
                            const discount = utils.calculateDiscount(p.originalPrice, p.price);
                            saleBadge.textContent = `-${discount}%`;
                        }
                        
                        if (p.tags.includes('nuevo') || p.id > 10) {
                            const newBadge = card.querySelector('[data-badge-type="new"]');
                            newBadge.classList.remove('hidden');
                        }
                        
                        productCard.addEventListener('click', (e) => {
                            if (!e.target.closest('button')) {
                                handlers.showProductDetail(p.id);
                            }
                        });
                        
                        DOM.productGrid.appendChild(card);
                    });
                    
                    if (filtered.length > state.productsPerPage) {
                        renderers.pagination(totalPages);
                        DOM.paginationControls.classList.remove('hidden');
                    } else {
                        DOM.paginationControls.classList.add('hidden');
                    }
                }
            },
            
            pagination: (totalPages) => {
                DOM.paginationControls.innerHTML = '';
                
                if (state.currentPage > 1) {
                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'pagination-btn';
                    prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
                    prevBtn.addEventListener('click', () => {
                        state.currentPage--;
                        renderers.products();
                    });
                    DOM.paginationControls.appendChild(prevBtn);
                }
                
                const startPage = Math.max(1, state.currentPage - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                
                for (let i = startPage; i <= endPage; i++) {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = `pagination-btn ${i === state.currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i;
                    pageBtn.addEventListener('click', () => {
                        state.currentPage = i;
                        renderers.products();
                    });
                    DOM.paginationControls.appendChild(pageBtn);
                }
                
                if (state.currentPage < totalPages) {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'pagination-btn';
                    nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
                    nextBtn.addEventListener('click', () => {
                        state.currentPage++;
                        renderers.products();
                    });
                    DOM.paginationControls.appendChild(nextBtn);
                }
            },
            
            cart: () => {
                const template = document.getElementById('cart-item-template');
                DOM.cartItemsContainer.innerHTML = '';
                let subtotal = 0;
                
                if (state.cart.length === 0) {
                    DOM.cartItemsContainer.innerHTML = '<p style="text-align:center; padding:20px;">Tu carrito está vacío.</p>';
                } else {
                    state.cart.forEach(item => {
                        const product = state.products.find(p => p.id === item.id);
                        if (!product) return;
                        
                        subtotal += product.price * item.quantity;
                        const cartItem = template.content.cloneNode(true);
                        
                        cartItem.querySelector('.cart-item-name').textContent = product.name;
                        cartItem.querySelector('.cart-item-price').textContent = utils.formatCurrency(product.price);
                        cartItem.querySelector('.cart-item-image').src = product.image;
                        cartItem.querySelector('.cart-item-image').alt = product.name;
                        cartItem.querySelector('.item-quantity').textContent = item.quantity;
                        
                        ['increase-quantity', 'decrease-quantity', 'remove-from-cart'].forEach(action => {
                            cartItem.querySelector(`[data-action="${action}"]`).dataset.productId = item.id;
                        });
                        
                        DOM.cartItemsContainer.appendChild(cartItem);
                    });
                }
                
                const shippingCost = renderers.calculateShipping();
                const discountAmount = renderers.calculateDiscount(subtotal);
                const total = subtotal + shippingCost - discountAmount;
                
                DOM.cartSubtotal.textContent = utils.formatCurrency(subtotal);
                DOM.cartShipping.textContent = shippingCost === 0 ? 'Gratis' : utils.formatCurrency(shippingCost);
                DOM.cartDiscount.textContent = utils.formatCurrency(discountAmount);
                DOM.cartTotal.textContent = utils.formatCurrency(total);
                
                DOM.cartItemCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
                DOM.cartItemCount.classList.toggle('hidden', state.cart.length === 0);
                DOM.checkoutBtn.disabled = state.cart.length === 0;
            },
            
            calculateShipping: () => {
                const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked');
                if (!deliveryMethod) return 0;
                
                switch (deliveryMethod.value) {
                    case 'pickup': return 0;
                    case 'shipping': return 25.00;
                    case 'express': return 40.00;
                    default: return 0;
                }
            },
            
            calculateDiscount: (subtotal) => {
                if (!state.appliedDiscount) return 0;
                
                const discount = state.appliedDiscount;
                if (discount.type === 'percentage') {
                    return subtotal * (discount.value / 100);
                } else {
                    return Math.min(discount.value, subtotal);
                }
            },
            
            authUI: () => {
                const loggedIn = !!state.currentUser;
                DOM.authMenuItems.classList.toggle('hidden', loggedIn);
                DOM.userMenuItems.classList.toggle('hidden', !loggedIn);
                
                if (loggedIn) {
                    DOM.userMenuName.textContent = state.currentUser.name;
                    DOM.wishlistCount.textContent = state.wishlist.length;
                    DOM.wishlistHeaderCount.textContent = state.wishlist.length;
                    DOM.wishlistCount.classList.toggle('hidden', state.wishlist.length === 0);
                    DOM.wishlistHeaderCount.classList.toggle('hidden', state.wishlist.length === 0);
                }
            },
            
            orderSummary: () => {
                let subtotal = 0;
                DOM.orderSummary.innerHTML = '';
                
                state.cart.forEach(item => {
                    const product = state.products.find(p => p.id === item.id);
                    subtotal += product.price * item.quantity;
                    DOM.orderSummary.innerHTML += `
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span>${item.quantity}x ${product.name}</span>
                            <span>${utils.formatCurrency(product.price * item.quantity)}</span>
                        </div>
                    `;
                });
                
                const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked');
                let deliveryCost = 0;
                let deliveryText = '';
                
                if (deliveryMethod) {
                    switch (deliveryMethod.value) {
                        case 'shipping':
                            deliveryCost = 25.00;
                            deliveryText = 'Envío a domicilio';
                            break;
                        case 'express':
                            deliveryCost = 40.00;
                            deliveryText = 'Envío express (24h)';
                            break;
                        default:
                            deliveryText = 'Recoger en tienda';
                    }
                }
                
                const discountAmount = renderers.calculateDiscount(subtotal);
                const total = subtotal + deliveryCost - discountAmount;
                
                DOM.deliverySummary.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>${deliveryText}</span>
                        <span>${deliveryCost > 0 ? utils.formatCurrency(deliveryCost) : 'Gratis'}</span>
                    </div>
                `;
                
                if (discountAmount > 0) {
                    DOM.discountSummary.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px; color: var(--color-success);">
                            <span>Descuento (${state.appliedDiscount.code})</span>
                            <span>-${utils.formatCurrency(discountAmount)}</span>
                        </div>
                    `;
                } else {
                    DOM.discountSummary.innerHTML = '';
                }
                
                DOM.orderTotal.textContent = utils.formatCurrency(total);
            },
            
            stores: () => {
                DOM.pickupStoreSelect.innerHTML = '<option value="">Selecciona una tienda</option>';
                state.stores.forEach(store => {
                    const option = document.createElement('option');
                    option.value = store.id;
                    option.textContent = `${store.name} - ${store.address}`;
                    DOM.pickupStoreSelect.appendChild(option);
                });
            },
            
            adminProducts: () => {
                DOM.adminProductsList.innerHTML = '';
                state.products.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>${utils.formatCurrency(product.price)}</td>
                        <td>${product.stock}</td>
                        <td>${product.rating}</td>
                        <td class="action-buttons">
                            <button class="btn btn-warning" data-action="edit-product" data-id="${product.id}">Editar</button>
                            <button class="btn btn-danger" data-action="delete-product" data-id="${product.id}">Eliminar</button>
                        </td>
                    `;
                    DOM.adminProductsList.appendChild(row);
                });
            },
            
            adminUsers: () => {
                DOM.adminUsersList.innerHTML = '';
                state.users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${user.loyaltyPoints || 0}</td>
                        <td class="action-buttons">
                            <button class="btn btn-warning" data-action="edit-user" data-id="${user.id}">Editar</button>
                            <button class="btn btn-danger" data-action="delete-user" data-id="${user.id}">Eliminar</button>
                        </td>
                    `;
                    DOM.adminUsersList.appendChild(row);
                });
            },
            
            adminStores: () => {
                DOM.adminStoresList.innerHTML = '';
                state.stores.forEach(store => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${store.id}</td>
                        <td>${store.name}</td>
                        <td>${store.address}</td>
                        <td>${store.phone}</td>
                        <td>${store.hours}</td>
                        <td class="action-buttons">
                            <button class="btn btn-warning" data-action="edit-store" data-id="${store.id}">Editar</button>
                            <button class="btn btn-danger" data-action="delete-store" data-id="${store.id}">Eliminar</button>
                        </td>
                    `;
                    DOM.adminStoresList.appendChild(row);
                });
            },
            
            adminStats: () => {
                const totalSales = state.orders.reduce((sum, order) => sum + order.total, 0);
                const totalOrders = state.orders.length;
                const totalProducts = state.products.length;
                const totalUsers = state.users.length;
                
                const monthlyRevenue = state.orders
                    .filter(order => {
                        const orderDate = new Date(order.date);
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, order) => sum + order.total, 0);
                
                const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers * 100).toFixed(1) : 0;
                
                DOM.totalSales.textContent = utils.formatCurrency(totalSales);
                DOM.totalOrders.textContent = totalOrders;
                DOM.totalProducts.textContent = totalProducts;
                DOM.totalUsers.textContent = totalUsers;
                DOM.totalRevenue.textContent = utils.formatCurrency(monthlyRevenue);
                DOM.conversionRate.textContent = `${conversionRate}%`;
            },
            
            salesReports: () => {
                DOM.salesDetails.innerHTML = '';
                state.orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.id}</td>
                        <td>${new Date(order.date).toLocaleDateString()}</td>
                        <td>${order.customerName}</td>
                        <td>${utils.formatCurrency(order.total)}</td>
                        <td>${order.status}</td>
                        <td>${order.paymentMethod || 'Tarjeta'}</td>
                    `;
                    DOM.salesDetails.appendChild(row);
                });
            },
            
            accountInfo: () => {
                if (state.currentUser) {
                    document.getElementById('account-name').value = state.currentUser.name;
                    document.getElementById('account-email').value = state.currentUser.email;
                    document.getElementById('account-phone').value = state.currentUser.phone || '';
                    document.getElementById('account-address').value = state.currentUser.address || '';
                }
            },
            
            orderHistory: () => {
                const userOrders = state.orders.filter(order => order.userId === state.currentUser?.id);
                DOM.orderHistory.innerHTML = '';
                
                if (userOrders.length === 0) {
                    DOM.orderHistory.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--color-on-surface-variant);">No hay pedidos recientes</p>';
                } else {
                    userOrders.forEach(order => {
                        const orderElement = document.createElement('div');
                        orderElement.style.padding = '16px';
                        orderElement.style.borderBottom = '1px solid var(--color-surface-variant)';
                        orderElement.innerHTML = `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <strong>Pedido #${order.id}</strong>
                                <span>${utils.formatCurrency(order.total)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--color-on-surface-variant);">
                                <span>${new Date(order.date).toLocaleDateString()}</span>
                                <span>${order.status}</span>
                            </div>
                        `;
                        DOM.orderHistory.appendChild(orderElement);
                    });
                }
            },
            
            categories: () => {
                DOM.categoryMenu.innerHTML = `
                    <li><a href="#" class="nav-link nav-item" data-category="all" data-main-category="all">
                        <span class="material-symbols-outlined">store</span>
                        <span class="menu-label">Todos los Productos</span>
                    </a></li>
                `;
                
                state.categories.forEach(category => {
                    const categoryItem = document.createElement('li');
                    
                    if (category.subcategories && category.subcategories.length > 0) {
                        categoryItem.className = 'has-submenu';
                        categoryItem.innerHTML = `
                            <a href="#" class="nav-link nav-item" data-action="toggle-submenu" data-category="${category.id}" data-main-category="${category.id}">
                                <span class="material-symbols-outlined">${category.icon}</span>
                                <span class="menu-label">${category.name}</span>
                                <span class="material-symbols-outlined submenu-toggle-icon">chevron_right</span>
                            </a>
                            <ul class="submenu">
                                ${category.subcategories.map(sub => `
                                    <li><a href="#" class="nav-link nav-item" data-category="${sub.id}" data-main-category="${category.id}">${sub.name}</a></li>
                                `).join('')}
                            </ul>
                        `;
                    } else {
                        categoryItem.innerHTML = `
                            <a href="#" class="nav-link nav-item" data-category="${category.id}" data-main-category="${category.id}">
                                <span class="material-symbols-outlined">${category.icon}</span>
                                <span class="menu-label">${category.name}</span>
                            </a>
                        `;
                    }
                    
                    DOM.categoryMenu.appendChild(categoryItem);
                });
                
                // CORRECCIÓN: Agregar botón Panel Admin solo para usuarios admin
                if (state.currentUser?.role === 'admin') {
                    const adminItem = document.createElement('li');
                    adminItem.innerHTML = `
                        <a href="#" class="nav-link nav-item" data-action="view-admin-panel">
                            <span class="material-symbols-outlined">admin_panel_settings</span>
                            <span class="menu-label">Panel Admin</span>
                        </a>
                    `;
                    DOM.categoryMenu.appendChild(adminItem);
                }
            },
            
            adminCategories: () => {
                DOM.adminProductCategorySelect.innerHTML = '<option value="">Selecciona categoría</option>';
                DOM.adminSubcategoryMainSelect.innerHTML = '<option value="">Selecciona categoría principal</option>';
                
                state.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    DOM.adminProductCategorySelect.appendChild(option);
                    
                    const mainOption = document.createElement('option');
                    mainOption.value = category.id;
                    mainOption.textContent = category.name;
                    DOM.adminSubcategoryMainSelect.appendChild(mainOption);
                    
                    if (category.subcategories) {
                        category.subcategories.forEach(sub => {
                            const subOption = document.createElement('option');
                            subOption.value = sub.id;
                            subOption.textContent = `${category.name} - ${sub.name}`;
                            DOM.adminProductCategorySelect.appendChild(subOption);
                        });
                    }
                });
                
                DOM.adminCategoriesList.innerHTML = '';
                state.categories.forEach(category => {
                    const categoryCard = document.createElement('div');
                    categoryCard.className = 'admin-card';
                    categoryCard.style.marginBottom = '16px';
                    
                    let subcategoriesHtml = '';
                    if (category.subcategories && category.subcategories.length > 0) {
                        subcategoriesHtml = `
                            <h5>Subcategorías:</h5>
                            <ul>
                                ${category.subcategories.map(sub => `
                                    <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--color-surface-variant);">
                                        <span>${sub.name}</span>
                                        <button class="btn btn-danger btn-sm" data-action="delete-subcategory" data-category-id="${category.id}" data-subcategory-id="${sub.id}">Eliminar</button>
                                    </li>
                                `).join('')}
                            </ul>
                        `;
                    } else {
                        subcategoriesHtml = '<p style="color: var(--color-on-surface-variant); font-style: italic;">No hay subcategorías</p>';
                    }
                    
                    categoryCard.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="display: flex; align-items: center; gap: 8px;">
                                <span class="material-symbols-outlined">${category.icon}</span>
                                ${category.name}
                            </h4>
                            <button class="btn btn-danger" data-action="delete-category" data-category-id="${category.id}">Eliminar Categoría</button>
                        </div>
                        ${subcategoriesHtml}
                    `;
                    
                    DOM.adminCategoriesList.appendChild(categoryCard);
                });
            },
            
            wishlist: () => {
                const template = document.getElementById('product-card-template');
                DOM.wishlistGrid.innerHTML = '';
                
                const wishlistProducts = state.products.filter(p => state.wishlist.includes(p.id));
                
                if (wishlistProducts.length === 0) {
                    DOM.wishlistGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--color-on-surface-variant); grid-column: 1 / -1;">Tu lista de deseos está vacía</p>';
                } else {
                    wishlistProducts.forEach(p => {
                        const card = template.content.cloneNode(true);
                        
                        card.querySelector('.product-name').textContent = p.name;
                        card.querySelector('.product-category').textContent = p.category;
                        card.querySelector('.product-image').src = p.image;
                        card.querySelector('.product-price').textContent = utils.formatCurrency(p.price);
                        
                        const originalPrice = card.querySelector('.product-original-price');
                        if (p.originalPrice) {
                            originalPrice.textContent = utils.formatCurrency(p.originalPrice);
                        } else {
                            originalPrice.style.display = 'none';
                        }
                        
                        const ratingValue = card.querySelector('.rating-value');
                        ratingValue.textContent = p.rating.toFixed(1);
                        
                        const ratingCount = card.querySelector('.rating-count');
                        ratingCount.textContent = `(${p.reviewCount})`;
                        
                        const stockStatus = utils.getStockStatus(p.stock);
                        const stockElement = card.querySelector('.product-stock');
                        stockElement.textContent = stockStatus.text;
                        stockElement.className = `product-stock ${stockStatus.class}`;
                        
                        const wishlistBtn = card.querySelector('.wishlist-btn');
                        wishlistBtn.dataset.productId = p.id;
                        wishlistBtn.classList.add('active');
                        wishlistBtn.querySelector('.material-symbols-outlined').textContent = 'favorite';
                        
                        const addToCartBtn = card.querySelector('[data-action="add-to-cart"]');
                        addToCartBtn.dataset.productId = p.id;
                        
                        DOM.wishlistGrid.appendChild(card);
                    });
                }
            },
            
            productDetail: (product) => {
                const template = document.getElementById('product-detail-template');
                DOM.productDetailContent.innerHTML = '';
                
                const detail = template.content.cloneNode(true);
                
                detail.querySelector('#detail-product-image').src = product.image;
                detail.querySelector('#detail-product-name').textContent = product.name;
                detail.querySelector('#detail-product-price').textContent = utils.formatCurrency(product.price);
                
                const originalPrice = detail.querySelector('#detail-product-original-price');
                if (product.originalPrice) {
                    originalPrice.textContent = utils.formatCurrency(product.originalPrice);
                } else {
                    originalPrice.style.display = 'none';
                }
                
                detail.querySelector('#detail-rating-value').textContent = product.rating.toFixed(1);
                detail.querySelector('#detail-rating-count').textContent = `(${product.reviewCount} reseñas)`;
                
                const stockStatus = utils.getStockStatus(product.stock);
                detail.querySelector('#detail-product-stock').textContent = stockStatus.text;
                detail.querySelector('#detail-product-stock').className = `product-stock ${stockStatus.class}`;
                
                detail.querySelector('#detail-product-description').textContent = product.description;
                
                const featuresContainer = detail.querySelector('#detail-product-features');
                product.features.forEach(feature => {
                    const featureElement = document.createElement('div');
                    featureElement.style.display = 'flex';
                    featureElement.style.alignItems = 'center';
                    featureElement.style.gap = '8px';
                    featureElement.innerHTML = `
                        <span class="material-symbols-outlined" style="color: var(--color-success); font-size: 1.2rem;">check_circle</span>
                        <span>${feature}</span>
                    `;
                    featuresContainer.appendChild(featureElement);
                });
                
                const wishlistBtn = detail.querySelector('[data-action="toggle-wishlist-detail"]');
                wishlistBtn.dataset.productId = product.id;
                if (state.wishlist.includes(product.id)) {
                    wishlistBtn.classList.add('active');
                    wishlistBtn.querySelector('.material-symbols-outlined').textContent = 'favorite';
                }
                
                const addToCartBtn = detail.querySelector('[data-action="add-to-cart-detail"]');
                addToCartBtn.dataset.productId = product.id;
                
                const quantityControls = detail.querySelectorAll('.quantity-btn');
                quantityControls.forEach(btn => {
                    btn.dataset.productId = product.id;
                });
                
                DOM.productDetailContent.appendChild(detail);
            },
            
            searchSuggestions: (query) => {
                if (!query.trim()) {
                    DOM.searchSuggestions.classList.add('hidden');
                    return;
                }
                
                const suggestions = state.products.filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.category.toLowerCase().includes(query.toLowerCase()) ||
                    p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                ).slice(0, 5);
                
                DOM.searchSuggestions.innerHTML = '';
                
                if (suggestions.length === 0) {
                    DOM.searchSuggestions.classList.add('hidden');
                    return;
                }
                
                suggestions.forEach(product => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'search-suggestion-item';
                    suggestionItem.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                            <div>
                                <div style="font-weight: 500;">${product.name}</div>
                                <div style="font-size: 0.875rem; color: var(--color-on-surface-variant);">${product.category}</div>
                            </div>
                        </div>
                    `;
                    suggestionItem.addEventListener('click', () => {
                        DOM.searchInput.value = product.name;
                        DOM.searchSuggestions.classList.add('hidden');
                        state.searchQuery = product.name;
                        state.currentPage = 1;
                        renderers.products();
                    });
                    DOM.searchSuggestions.appendChild(suggestionItem);
                });
                
                DOM.searchSuggestions.classList.remove('hidden');
            },
            
            notifications: () => {
                DOM.notificationList.innerHTML = '';
                DOM.notificationCount.textContent = state.notifications.filter(n => !n.read).length;
                DOM.notificationCount.classList.toggle('hidden', state.notifications.filter(n => !n.read).length === 0);
                
                const unreadNotifications = state.notifications.filter(n => !n.read);
                const recentNotifications = unreadNotifications.slice(0, 5);
                
                if (recentNotifications.length === 0) {
                    DOM.notificationList.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--color-on-surface-variant);">No hay notificaciones nuevas</p>';
                } else {
                    recentNotifications.forEach(notification => {
                        const notificationItem = document.createElement('div');
                        notificationItem.className = `notification-item ${!notification.read ? 'unread' : ''}`;
                        notificationItem.innerHTML = `
                            <div style="font-weight: 500;">${notification.title}</div>
                            <div style="font-size: 0.875rem; color: var(--color-on-surface-variant);">${notification.message}</div>
                            <div style="font-size: 0.75rem; color: var(--color-on-surface-variant); margin-top: 4px;">${utils.formatDate(notification.date)}</div>
                        `;
                        notificationItem.addEventListener('click', () => {
                            notification.read = true;
                            handlers.saveState();
                            renderers.notifications();
                        });
                        DOM.notificationList.appendChild(notificationItem);
                    });
                }
            },
            
            adminCoupons: () => {
                DOM.adminCouponsList.innerHTML = '';
                state.coupons.forEach(coupon => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${coupon.code}</td>
                        <td>${coupon.type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}</td>
                        <td>${coupon.type === 'percentage' ? `${coupon.value}%` : utils.formatCurrency(coupon.value)}</td>
                        <td>${utils.formatDate(coupon.endDate)}</td>
                        <td>${coupon.usedCount || 0}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                        <td class="action-buttons">
                            <button class="btn btn-danger" data-action="delete-coupon" data-coupon-code="${coupon.code}">Eliminar</button>
                        </td>
                    `;
                    DOM.adminCouponsList.appendChild(row);
                });
            }
        };

        const handlers = {
            saveState: () => {
                const stateToSave = {
                    ...state,
                    currentUser: state.currentUser ? {
                        ...state.currentUser,
                        password: undefined
                    } : null
                };
                localStorage.setItem('superGo_state', JSON.stringify(stateToSave));
            },
            
            loadState: () => {
                const saved = localStorage.getItem('superGo_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    
                    Object.keys(state).forEach(key => {
                        if (parsed[key] !== undefined) {
                            state[key] = parsed[key];
                        }
                    });
                    
                    if (state.currentUser) {
                        const fullUser = state.users.find(u => u.id === state.currentUser.id);
                        if (fullUser) {
                            state.currentUser = { ...fullUser };
                        }
                    }
                } else {
                    state.users.push({ 
                        id: 1, 
                        name: 'Administrador', 
                        email: 'admin@supergo.com', 
                        password: 'admin', 
                        role: 'admin',
                        phone: '+502 1234-5678',
                        address: '6a Avenida 7-50, Zona 1',
                        loyaltyPoints: 1250
                    });
                    
                    state.stores.push(
                        { id: 1, name: 'SuperGo Centro', address: '6a Avenida 7-50, Zona 1', phone: '+502 1234-5678', hours: '7:00 - 22:00', lat: '14.6349', lng: '-90.5069' },
                        { id: 2, name: 'SuperGo Norte', address: 'Plaza Norte, Local 15', phone: '+502 2345-6789', hours: '8:00 - 21:00', lat: '14.6472', lng: '-90.5357' },
                        { id: 3, name: 'SuperGo Sur', address: 'Centro Comercial Sur, Nivel 2', phone: '+502 3456-7890', hours: '7:30 - 21:30', lat: '14.5928', lng: '-90.5485' }
                    );
                    
                    state.orders.push(
                        { 
                            id: 1001, 
                            userId: 1, 
                            customerName: 'Administrador', 
                            date: new Date().toISOString(), 
                            total: 120.50, 
                            status: 'Completado',
                            items: [
                                { id: 1, quantity: 1 },
                                { id: 2, quantity: 2 }
                            ],
                            delivery: { method: 'pickup', store: 'SuperGo Centro', address: '6a Avenida 7-50, Zona 1' },
                            paymentMethod: 'Tarjeta'
                        },
                        { 
                            id: 1002, 
                            userId: 1, 
                            customerName: 'Administrador', 
                            date: new Date(Date.now() - 86400000).toISOString(), 
                            total: 85.75, 
                            status: 'Completado',
                            items: [
                                { id: 3, quantity: 1 }
                            ],
                            delivery: { method: 'shipping', address: '6a Avenida 7-50, Zona 1', city: 'Guatemala City' },
                            paymentMethod: 'Tarjeta'
                        }
                    );
                    
                    state.categories = [
                        {
                            id: 'abarrotes',
                            name: 'Abarrotes',
                            icon: 'shopping_basket',
                            color: '#6750A4',
                            subcategories: [
                                { id: 'aceites', name: 'Aceites' },
                                { id: 'cereales', name: 'Cereales' },
                                { id: 'granos', name: 'Granos' },
                                { id: 'conservas', name: 'Conservas' }
                            ]
                        },
                        {
                            id: 'carnes',
                            name: 'Carnicería',
                            icon: 'kebab_dining',
                            color: '#B3261E',
                            subcategories: [
                                { id: 'res', name: 'Res' },
                                { id: 'pollo', name: 'Pollo' },
                                { id: 'embutidos', name: 'Embutidos' },
                                { id: 'cerdo', name: 'Cerdo' }
                            ]
                        },
                        {
                            id: 'pescados',
                            name: 'Pescadería',
                            icon: 'set_meal',
                            color: '#0288D1',
                            subcategories: [
                                { id: 'salmón', name: 'Salmón' },
                                { id: 'atún', name: 'Atún' },
                                { id: 'mariscos', name: 'Mariscos' }
                            ]
                        },
                        {
                            id: 'lacteos',
                            name: 'Lácteos',
                            icon: 'local_cafe',
                            color: '#2E7D32',
                            subcategories: [
                                { id: 'quesos', name: 'Quesos' },
                                { id: 'yogures', name: 'Yogures' },
                                { id: 'leches', name: 'Leches' }
                            ]
                        },
                        {
                            id: 'frutas',
                            name: 'Frutas y Verduras',
                            icon: 'nutrition',
                            color: '#4CAF50',
                            subcategories: [
                                { id: 'manzanas', name: 'Manzanas' },
                                { id: 'aguacates', name: 'Aguacates' },
                                { id: 'citricos', name: 'Cítricos' }
                            ]
                        },
                        {
                            id: 'panaderia',
                            name: 'Panadería',
                            icon: 'bakery_dining',
                            color: '#F57C00',
                            subcategories: [
                                { id: 'panes', name: 'Panes' },
                                { id: 'pasteles', name: 'Pasteles' },
                                { id: 'galletas', name: 'Galletas' }
                            ]
                        },
                        {
                            id: 'bebidas',
                            name: 'Bebidas',
                            icon: 'local_bar',
                            color: '#7B1FA2',
                            subcategories: [
                                { id: 'vinos', name: 'Vinos' },
                                { id: 'café', name: 'Café' },
                                { id: 'aguas', name: 'Aguas' },
                                { id: 'refrescos', name: 'Refrescos' }
                            ]
                        }
                    ];
                    
                    state.coupons.push(
                        {
                            code: 'BIENVENIDA10',
                            type: 'percentage',
                            value: 10,
                            startDate: new Date().toISOString(),
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                            usageLimit: 100,
                            usedCount: 25,
                            minOrder: 50
                        },
                        {
                            code: 'ENVIOGRATIS',
                            type: 'fixed',
                            value: 25,
                            startDate: new Date().toISOString(),
                            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                            usageLimit: 50,
                            usedCount: 12,
                            minOrder: 100
                        }
                    );
                    
                    state.notifications.push(
                        {
                            id: 1,
                            title: '¡Bienvenido a SuperGo!',
                            message: 'Disfruta de envío gratis en tu primera compra',
                            date: new Date().toISOString(),
                            read: false,
                            type: 'welcome'
                        },
                        {
                            id: 2,
                            title: 'Oferta Especial',
                            message: '10% de descuento en productos seleccionados',
                            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                            read: false,
                            type: 'promotion'
                        }
                    );
                }
            },
            
            navigateTo: (viewId) => {
                DOM.views.forEach(v => {
                    v.classList.remove('active');
                    v.classList.add('hidden');
                });
                const targetView = document.getElementById(viewId);
                if (targetView) {
                    targetView.classList.add('active');
                    targetView.classList.remove('hidden');
                }
                state.currentView = viewId;
                
                if (viewId === 'admin-view') {
                    renderers.adminProducts();
                    renderers.adminUsers();
                    renderers.adminStores();
                    renderers.adminStats();
                    renderers.salesReports();
                    renderers.adminCategories();
                    renderers.adminCoupons();
                }
                
                if (viewId === 'account-view') {
                    renderers.accountInfo();
                    renderers.orderHistory();
                }
                
                if (viewId === 'checkout-view') {
                    renderers.orderSummary();
                }
                
                if (viewId === 'wishlist-view') {
                    renderers.wishlist();
                }
                
                if (viewId === 'product-view') {
                    state.currentPage = 1;
                    renderers.products();
                }
                
                handlers.closeMobileMenu();
            },
            
            toggleCart: (show) => {
                DOM.cartSidebar.classList.toggle('open', show);
                DOM.cartOverlay.classList.toggle('hidden', !show);
            },
            
            toggleAuthModal: (show) => {
                DOM.authModal.classList.toggle('hidden', !show);
                if (show) {
                    DOM.loginView.classList.remove('hidden');
                    DOM.registerView.classList.add('hidden');
                    DOM.loginError.textContent = '';
                    document.getElementById('register-error-message').textContent = '';
                }
            },
            
            addToCart: (productId) => {
                const product = state.products.find(p => p.id === productId);
                if (!product) return;
                
                if (product.stock <= 0) {
                    utils.showToast('Producto agotado', 'error');
                    return;
                }
                
                const item = state.cart.find(i => i.id === productId);
                if (item) {
                    if (item.quantity >= product.stock) {
                        utils.showToast('No hay suficiente stock', 'warning');
                        return;
                    }
                    item.quantity++;
                } else {
                    // CORRECCIÓN: Cambiado de state.ccart a state.cart
                    state.cart.push({ id: productId, quantity: 1 });
                }
                
                renderers.cart();
                handlers.saveState();
                utils.showToast(`${product.name} agregado al carrito`, 'success');
            },

            removeFromCart: (productId) => {
                state.cart = state.cart.filter(item => item.id !== productId);
                renderers.cart();
                handlers.saveState();
                utils.showToast('Producto removido del carrito', 'info');
            },

            increaseQuantity: (productId) => {
                const item = state.cart.find(i => i.id === productId);
                const product = state.products.find(p => p.id === productId);
                if (item && product) {
                    if (item.quantity < product.stock) {
                        item.quantity++;
                        renderers.cart();
                        handlers.saveState();
                    } else {
                        utils.showToast('No hay más stock disponible', 'warning');
                    }
                }
            },

            decreaseQuantity: (productId) => {
                const item = state.cart.find(i => i.id === productId);
                if (item) {
                    if (item.quantity > 1) {
                        item.quantity--;
                    } else {
                        state.cart = state.cart.filter(i => i.id !== productId);
                    }
                    renderers.cart();
                    handlers.saveState();
                }
            },

            toggleWishlist: (productId) => {
                const index = state.wishlist.indexOf(productId);
                if (index > -1) {
                    state.wishlist.splice(index, 1);
                    utils.showToast('Producto removido de la lista de deseos', 'info');
                } else {
                    state.wishlist.push(productId);
                    utils.showToast('Producto agregado a la lista de deseos', 'success');
                }
                renderers.authUI();
                handlers.saveState();
                
                // Si estamos en la vista de wishlist, volver a renderizar
                if (state.currentView === 'wishlist-view') {
                    renderers.wishlist();
                }
                
                // Si estamos en la vista de productos, volver a renderizar para actualizar los botones
                if (state.currentView === 'product-view') {
                    renderers.products();
                }
            },

            login: (email, password) => {
                const user = state.users.find(u => u.email === email && u.password === password);
                if (user) {
                    state.currentUser = { ...user };
                    handlers.saveState();
                    renderers.authUI();
                    renderers.categories(); // Actualizar menú para mostrar Panel Admin
                    handlers.toggleAuthModal(false);
                    utils.showToast(`Bienvenido, ${user.name}`, 'success');
                    
                    // Agregar notificación de bienvenida
                    state.notifications.push({
                        id: utils.generateId(),
                        title: 'Inicio de sesión exitoso',
                        message: `Bienvenido de nuevo, ${user.name}`,
                        date: new Date().toISOString(),
                        read: false,
                        type: 'info'
                    });
                    renderers.notifications();
                } else {
                    DOM.loginError.textContent = 'Credenciales incorrectas';
                }
            },

            register: (name, email, password, phone) => {
                // Verificar si el usuario ya existe
                if (state.users.find(u => u.email === email)) {
                    document.getElementById('register-error-message').textContent = 'El usuario ya existe';
                    return;
                }
                
                const newUser = {
                    id: utils.generateId(),
                    name,
                    email,
                    password,
                    phone: phone || '',
                    role: 'user',
                    loyaltyPoints: 0
                };
                
                state.users.push(newUser);
                state.currentUser = newUser;
                handlers.saveState();
                renderers.authUI();
                renderers.categories();
                handlers.toggleAuthModal(false);
                utils.showToast(`Cuenta creada para ${name}`, 'success');
                
                // Agregar notificación de bienvenida
                state.notifications.push({
                    id: utils.generateId(),
                    title: 'Bienvenido a SuperGo',
                    message: 'Gracias por registrarte. Disfruta de tus compras.',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'info'
                });
                renderers.notifications();
            },

            logout: () => {
                state.currentUser = null;
                handlers.saveState();
                renderers.authUI();
                renderers.categories(); // Actualizar menú para quitar Panel Admin
                utils.showToast('Sesión cerrada', 'info');
                handlers.navigateTo('product-view');
            },

            closeMobileMenu: () => {
                DOM.sidebar.classList.remove('open');
            },

            showProductDetail: (productId) => {
                const product = state.products.find(p => p.id === productId);
                if (product) {
                    handlers.navigateTo('product-detail-view');
                    renderers.productDetail(product);
                }
            }
        };

        // CORRECCIÓN: Inicializar la aplicación correctamente
        handlers.loadState();
        API.fetchProducts().then(products => {
            state.products = products;
            renderers.categories();
            renderers.products();
            renderers.stores();
            renderers.authUI();
            renderers.notifications();
            renderers.cart();
        });

        // Event Listeners
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;
            
            const actionName = action.dataset.action;
            const productId = action.dataset.productId ? parseInt(action.dataset.productId) : null;
            const category = action.dataset.category;
            const mainCategory = action.dataset.mainCategory;
            
            switch (actionName) {
                case 'go-home':
                    e.preventDefault();
                    handlers.navigateTo('product-view');
                    break;
                case 'view-account':
                    e.preventDefault();
                    if (state.currentUser) {
                        handlers.navigateTo('account-view');
                    } else {
                        handlers.toggleAuthModal(true);
                    }
                    break;
                case 'view-admin-panel':
                    e.preventDefault();
                    if (state.currentUser?.role === 'admin') {
                        handlers.navigateTo('admin-view');
                    }
                    break;
                case 'view-wishlist':
                    e.preventDefault();
                    handlers.navigateTo('wishlist-view');
                    break;
                case 'open-cart':
                    e.preventDefault();
                    handlers.toggleCart(true);
                    break;
                case 'close-cart':
                    e.preventDefault();
                    handlers.toggleCart(false);
                    break;
                case 'open-auth-modal':
                    e.preventDefault();
                    handlers.toggleAuthModal(true);
                    break;
                case 'close-modal':
                    e.preventDefault();
                    handlers.toggleAuthModal(false);
                    break;
                case 'show-login':
                    e.preventDefault();
                    DOM.loginView.classList.remove('hidden');
                    DOM.registerView.classList.add('hidden');
                    break;
                case 'show-register':
                    e.preventDefault();
                    DOM.loginView.classList.add('hidden');
                    DOM.registerView.classList.remove('hidden');
                    break;
                case 'logout':
                    e.preventDefault();
                    handlers.logout();
                    break;
                case 'go-to-checkout':
                    e.preventDefault();
                    handlers.navigateTo('checkout-view');
                    handlers.toggleCart(false);
                    break;
                case 'continue-shopping':
                    e.preventDefault();
                    handlers.toggleCart(false);
                    break;
                case 'add-to-cart':
                case 'add-to-cart-detail':
                    e.preventDefault();
                    if (productId) {
                        handlers.addToCart(productId);
                    }
                    break;
                case 'remove-from-cart':
                    e.preventDefault();
                    if (productId) {
                        handlers.removeFromCart(productId);
                    }
                    break;
                case 'increase-quantity':
                    e.preventDefault();
                    if (productId) {
                        handlers.increaseQuantity(productId);
                    }
                    break;
                case 'decrease-quantity':
                    e.preventDefault();
                    if (productId) {
                        handlers.decreaseQuantity(productId);
                    }
                    break;
                case 'toggle-wishlist':
                case 'toggle-wishlist-detail':
                    e.preventDefault();
                    if (productId) {
                        handlers.toggleWishlist(productId);
                    }
                    break;
                case 'toggle-notifications':
                    e.preventDefault();
                    DOM.notificationDropdown.classList.toggle('hidden');
                    break;
		case 'delete-category':
                    e.preventDefault();
                    const categoryId = action.dataset.categoryId;
                    state.categories = state.categories.filter(c => c.id !== categoryId);
                    renderers.categories();
                    renderers.adminCategories();
                    utils.showToast('Categoría eliminada', 'success');
                    break;
                case 'delete-subcategory':
                    e.preventDefault();
                    const catId = action.dataset.categoryId;
                    const subId = action.dataset.subcategoryId;
                    const categoryToUpdate = state.categories.find(c => c.id === catId);
                    if (categoryToUpdate && categoryToUpdate.subcategories) {
                        categoryToUpdate.subcategories = categoryToUpdate.subcategories.filter(s => s.id !== subId);
                    }
                    renderers.categories();
                    renderers.adminCategories();
                    utils.showToast('Subcategoría eliminada', 'success');
                    break;
                case 'go-back':
                    e.preventDefault();
                    history.back();
                    break;
            }
            
                        if (category) {
                e.preventDefault();
                state.activeCategory = category;
                state.activeMainCategory = mainCategory;
                state.currentPage = 1;
                state.searchQuery = ''; // Limpiar búsqueda al cambiar categoría
                DOM.searchInput.value = '';
                
                // Actualizar título de la vista
                if (category === 'all') {
                    DOM.viewTitle.textContent = 'Todos los Productos';
                    state.activeCategory = 'all';
                    state.activeMainCategory = 'all';
                } else {
                    const categoryObj = state.categories.flatMap(c => [c, ...(c.subcategories || [])]).find(c => c.id === category);
                    DOM.viewTitle.textContent = categoryObj?.name || 'Productos';
                }
                
                // Forzar el re-renderizado de productos
                renderers.products();
                
                // Solo navegar si no estamos ya en product-view
                if (state.currentView !== 'product-view') {
                    handlers.navigateTo('product-view');
                }
            }
        });

        // Toggle submenús
        DOM.categoryMenu.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="toggle-submenu"]')) {
                e.preventDefault();
                const parent = e.target.closest('.has-submenu');
                parent.classList.toggle('open');
            }
        });

        // Formularios
        DOM.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handlers.login(email, password);
        });

        DOM.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const phone = document.getElementById('register-phone').value;
            handlers.register(name, email, password, phone);
        });

        // Búsqueda
        DOM.searchInput.addEventListener('input', utils.debounce((e) => {
            state.searchQuery = e.target.value;
            state.currentPage = 1;
            renderers.products();
            renderers.searchSuggestions(state.searchQuery);
        }, 300));

        // Ordenar productos
        DOM.sortOrderSelect.addEventListener('change', () => {
            state.sortOrder = DOM.sortOrderSelect.value;
            state.currentPage = 1;
            renderers.products();
        });

        // Filtros
        DOM.filterToggle.addEventListener('click', () => {
            DOM.filterPanel.classList.toggle('hidden');
        });

        DOM.applyFilters.addEventListener('click', () => {
            state.filters.priceRange = DOM.priceRange.value;
            state.filters.minRating = parseInt(DOM.ratingFilter.value);
            state.filters.availability = DOM.availabilityFilter.value;
            state.currentPage = 1;
            renderers.products();
            DOM.filterPanel.classList.add('hidden');
        });

        DOM.clearFilters.addEventListener('click', () => {
            DOM.priceRange.value = 'all';
            DOM.ratingFilter.value = '0';
            DOM.availabilityFilter.value = 'all';
            state.filters.priceRange = 'all';
            state.filters.minRating = 0;
            state.filters.availability = 'all';
            state.currentPage = 1;
            renderers.products();
            DOM.filterPanel.classList.add('hidden');
        });

        // Método de entrega
        DOM.deliveryMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'pickup') {
                    DOM.pickupDetails.classList.remove('hidden');
                    DOM.shippingDetails.classList.add('hidden');
                } else {
                    DOM.pickupDetails.classList.add('hidden');
                    DOM.shippingDetails.classList.remove('hidden');
                }
                renderers.orderSummary();
            });
        });

        // Tabs del panel de administración
        DOM.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remover clase active de todos los tabs
                DOM.tabs.forEach(t => t.classList.remove('active'));
                DOM.tabContents.forEach(c => c.classList.remove('active'));
                
                // Agregar clase active al tab clickeado
                tab.classList.add('active');
                const tabId = tab.dataset.tab;
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Menú móvil
        DOM.mobileMenuBtn.addEventListener('click', () => {
            DOM.sidebar.classList.toggle('open');
        });

        // Cerrar menú móvil al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!DOM.sidebar.contains(e.target) && !DOM.mobileMenuBtn.contains(e.target)) {
                DOM.sidebar.classList.remove('open');
            }
        });

        // Cerrar dropdown de notificaciones al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!DOM.notificationButton.contains(e.target) && !DOM.notificationDropdown.contains(e.target)) {
                DOM.notificationDropdown.classList.add('hidden');
            }
        });

        // Formularios de administración
        DOM.adminProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newProduct = {
                id: utils.generateId(),
                name: document.getElementById('admin-product-name').value,
                category: document.getElementById('admin-product-category').value,
                price: parseFloat(document.getElementById('admin-product-price').value),
                stock: parseInt(document.getElementById('admin-product-stock').value),
                rating: parseFloat(document.getElementById('admin-product-rating').value) || 0,
                image: document.getElementById('admin-product-image').value,
                description: document.getElementById('admin-product-description').value,
                sku: document.getElementById('admin-product-sku').value,
                barcode: document.getElementById('admin-product-barcode').value,
                mainCategory: document.getElementById('admin-product-category').value.split('-')[0],
                reviewCount: 0,
                features: [],
                tags: []
            };
            
            state.products.push(newProduct);
            renderers.adminProducts();
            renderers.adminStats();
            DOM.adminProductForm.reset();
            utils.showToast('Producto agregado exitosamente', 'success');
        });
        DOM.adminMainCategoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newCategory = {
                id: utils.generateId(),
                name: document.getElementById('admin-main-category-name').value,
                icon: document.getElementById('admin-main-category-icon').value,
                color: document.getElementById('admin-main-category-color').value,
                subcategories: []
            };
            
            state.categories.push(newCategory);
            renderers.categories();
            renderers.adminCategories();
            DOM.adminMainCategoryForm.reset();
            utils.showToast('Categoría principal agregada exitosamente', 'success');
        });

        DOM.adminSubcategoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const mainCategoryId = document.getElementById('admin-subcategory-main').value;
            const subcategoryName = document.getElementById('admin-subcategory-name').value;
            
            const mainCategory = state.categories.find(c => c.id === mainCategoryId);
            if (mainCategory) {
                if (!mainCategory.subcategories) {
                    mainCategory.subcategories = [];
                }
                mainCategory.subcategories.push({
                    id: utils.generateId(),
                    name: subcategoryName
                });
                renderers.categories();
                renderers.adminCategories();
                DOM.adminSubcategoryForm.reset();
                utils.showToast('Subcategoría agregada exitosamente', 'success');
            }
        });

        DOM.adminUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = {
                id: utils.generateId(),
                name: document.getElementById('admin-user-name').value,
                email: document.getElementById('admin-user-email').value,
                password: document.getElementById('admin-user-password').value,
                role: document.getElementById('admin-user-role').value,
                phone: document.getElementById('admin-user-phone').value,
                loyaltyPoints: parseInt(document.getElementById('admin-user-loyalty').value) || 0
            };
            
            state.users.push(newUser);
            renderers.adminUsers();
            renderers.adminStats();
            DOM.adminUserForm.reset();
            utils.showToast('Usuario creado exitosamente', 'success');
        });
        DOM.adminStoreForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newStore = {
                id: utils.generateId(),
                name: document.getElementById('admin-store-name').value,
                address: document.getElementById('admin-store-address').value,
                phone: document.getElementById('admin-store-phone').value,
                hours: document.getElementById('admin-store-hours').value,
                lat: document.getElementById('admin-store-lat').value,
                lng: document.getElementById('admin-store-lng').value
            };
            
            state.stores.push(newStore);
            renderers.adminStores();
            renderers.stores();
            DOM.adminStoreForm.reset();
            utils.showToast('Tienda agregada exitosamente', 'success');
        });

        DOM.adminCouponForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newCoupon = {
                code: document.getElementById('coupon-code').value,
                type: document.getElementById('coupon-type').value,
                value: parseFloat(document.getElementById('coupon-value').value),
                startDate: new Date(document.getElementById('coupon-start').value).toISOString(),
                endDate: new Date(document.getElementById('coupon-end').value).toISOString(),
                usageLimit: document.getElementById('coupon-usage').value ? parseInt(document.getElementById('coupon-usage').value) : null,
                usedCount: 0,
                minOrder: document.getElementById('coupon-min-order').value ? parseFloat(document.getElementById('coupon-min-order').value) : 0
            };
            
            state.coupons.push(newCoupon);
            renderers.adminCoupons();
            DOM.adminCouponForm.reset();
            utils.showToast('Cupón creado exitosamente', 'success');
        });

        DOM.adminBannerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newBanner = {
                id: utils.generateId(),
                title: document.getElementById('banner-title').value,
                description: document.getElementById('banner-description').value,
                startDate: new Date(document.getElementById('banner-start').value).toISOString(),
                endDate: new Date(document.getElementById('banner-end').value).toISOString(),
                image: document.getElementById('banner-image').value,
                link: document.getElementById('banner-link').value
            };
            
            state.banners.push(newBanner);
            DOM.adminBannerForm.reset();
            utils.showToast('Banner programado exitosamente', 'success');
        });
        DOM.applyDiscount.addEventListener('click', () => {
            const code = DOM.discountCode.value.trim();
            const coupon = state.coupons.find(c => c.code === code);
            
            if (coupon) {
                state.appliedDiscount = coupon;
                renderers.cart();
                renderers.orderSummary();
                utils.showToast('Cupón aplicado correctamente', 'success');
            } else {
                utils.showToast('Cupón no válido', 'error');
            }
        });

        DOM.paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (state.cart.length === 0) {
                utils.showToast('El carrito está vacío', 'error');
                return;
            }
            
            const order = {
                id: utils.generateId(),
                userId: state.currentUser?.id,
                customerName: document.getElementById('card-name').value,
                date: new Date().toISOString(),
                total: parseFloat(DOM.orderTotal.textContent.replace('$', '')),
                status: 'Completado',
                items: [...state.cart],
                delivery: {
                    method: document.querySelector('input[name="delivery-method"]:checked').value,
                    address: document.getElementById('shipping-address').value || '',
                    store: document.getElementById('pickup-store').value || ''
                },
                paymentMethod: 'Tarjeta'
            };
            
            state.orders.push(order);
            state.cart = [];
            renderers.cart();
            handlers.navigateTo('order-confirmation-view');
            
            DOM.orderDetails.innerHTML = `
                <strong>Pedido #${order.id}</strong><br>
                Total: ${utils.formatCurrency(order.total)}<br>
                Fecha: ${new Date().toLocaleDateString()}<br>
                Método: ${order.delivery.method}
            `;
            
            utils.showToast('¡Pago procesado exitosamente!', 'success');
        });
        // Cerrar sugerencias de búsqueda al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!DOM.searchInput.contains(e.target) && !DOM.searchSuggestions.contains(e.target)) {
                DOM.searchSuggestions.classList.add('hidden');
            }
        });
    });
 