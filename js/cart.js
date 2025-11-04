// Shopping Cart JavaScript

$(document).ready(function() {
    loadCartItems();
    loadRecommendedProducts();
    
    // Update quantity
    $(document).on('click', '.quantity-btn', function() {
        const productId = parseInt($(this).data('id'));
        const action = $(this).data('action');
        
        updateQuantity(productId, action);
    });
    
    // Remove item
    $(document).on('click', '.remove-item', function() {
        const productId = parseInt($(this).data('id'));
        removeFromCart(productId);
    });
    
    // Apply promo code
    $('#apply-promo').click(function() {
        applyPromoCode();
    });
    
    // Checkout button
    $('#checkout-btn').click(function(e) {
        const cart = getCart();
        if (cart.length === 0) {
            e.preventDefault();
            showNotification('Your cart is empty!', 'error');
        }
    });
});

// Load cart items
function loadCartItems() {
    const cart = getCart();
    const container = $('#cart-items-container');
    const emptyCart = $('#empty-cart');
    const checkoutBtn = $('#checkout-btn');
    
    if (cart.length === 0) {
        container.hide();
        emptyCart.show();
        checkoutBtn.prop('disabled', true);
        updateCartSummary(0, 0, 0, 0);
        return;
    }
    
    container.show();
    emptyCart.hide();
    checkoutBtn.prop('disabled', false);
    
    container.empty();
    
    cart.forEach(item => {
        const cartItem = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-category">${item.category}</div>
                </div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="quantity-control">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
                <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.append(cartItem);
    });
    
    // Update totals
    calculateTotals();
}

// Update quantity
function updateQuantity(productId, action) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;
    
    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease') {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            // Remove item if quantity becomes 0
            removeFromCart(productId);
            return;
        }
    }
    
    saveCart(cart);
    loadCartItems();
    showNotification('Cart updated', 'success');
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    loadCartItems();
    showNotification('Item removed from cart', 'success');
}

// Calculate totals
function calculateTotals() {
    const cart = getCart();
    
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Calculate shipping (free over $100)
    const shipping = subtotal >= 100 ? 0 : 10;
    
    // Calculate tax (10%)
    const tax = subtotal * 0.10;
    
    // Apply promo discount if exists
    const discount = parseFloat(sessionStorage.getItem('promoDiscount') || 0);
    
    const total = subtotal + shipping + tax - discount;
    
    updateCartSummary(subtotal, shipping, tax, total);
    
    // Update item count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#total-items').text(totalItems);
}

// Update cart summary
function updateCartSummary(subtotal, shipping, tax, total) {
    $('#cart-subtotal').text(`$${subtotal.toFixed(2)}`);
    $('#cart-shipping').text(shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`);
    $('#cart-tax').text(`$${tax.toFixed(2)}`);
    $('#cart-total').text(`$${total.toFixed(2)}`);
}

// Apply promo code
function applyPromoCode() {
    const promoCode = $('#promo-code').val().trim().toUpperCase();
    const messageDiv = $('#promo-message');
    
    // Valid promo codes
    const validCodes = {
        'TECH10': 10,      // $10 off
        'SAVE20': 20,      // $20 off
        'STUDENT15': 15    // $15 off
    };
    
    if (promoCode === '') {
        messageDiv.html('<small class="text-danger">Please enter a promo code</small>');
        return;
    }
    
    if (validCodes[promoCode]) {
        const discount = validCodes[promoCode];
        sessionStorage.setItem('promoDiscount', discount);
        messageDiv.html(`<small class="text-success">Promo code applied! You saved $${discount}!</small>`);
        calculateTotals();
        showNotification(`Promo code applied! $${discount} discount`, 'success');
    } else {
        messageDiv.html('<small class="text-danger">Invalid promo code</small>');
        sessionStorage.removeItem('promoDiscount');
    }
}

// Load recommended products
function loadRecommendedProducts() {
    const cart = getCart();
    const cartProductIds = cart.map(item => item.id);
    
    // Get products not in cart
    const recommended = products
        .filter(p => !cartProductIds.includes(p.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const container = $('#recommended-products');
    container.empty();
    
    recommended.forEach(product => {
        const productCard = `
            <div class="col-md-4">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <button class="btn btn-primary btn-sm w-100 add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.append(productCard);
    });
}

// Add to cart from recommended
$(document).on('click', '.add-to-cart', function() {
    const productId = parseInt($(this).data('id'));
    const product = getProductById(productId);
    
    if (!product) return;
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1
        });
    }
    
    saveCart(cart);
    loadCartItems();
    loadRecommendedProducts();
    showNotification(`${product.name} added to cart!`, 'success');
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = $(`
        <div class="toast-notification ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(() => {
        notification.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}

// Add fade-in animation
$('.cart-item').addClass('fade-in');
