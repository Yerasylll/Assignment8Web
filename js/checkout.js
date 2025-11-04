// Checkout Page JavaScript

let currentStep = 1;

$(document).ready(function() {
    loadCheckoutSummary();
    
    // Check if cart is empty
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty! Redirecting to products page...');
        window.location.href = 'products.html';
        return;
    }
    
    // Next to payment step
    $('#next-to-payment').click(function() {
        if (validateShippingInfo()) {
            goToStep(2);
        }
    });
    
    // Back to shipping
    $('#back-to-shipping').click(function() {
        goToStep(1);
    });
    
    // Payment method change
    $('input[name="paymentMethod"]').change(function() {
        const method = $(this).val();
        if (method === 'card') {
            $('#card-details').slideDown();
            setCardFieldsRequired(true);
        } else {
            $('#card-details').slideUp();
            setCardFieldsRequired(false);
        }
    });
    
    // Card number formatting
    $('#cardNumber').on('input', function() {
        let value = $(this).val().replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        $(this).val(formattedValue);
    });
    
    // Expiry date formatting
    $('#expiry').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        $(this).val(value);
    });
    
    // CVV validation
    $('#cvv').on('input', function() {
        $(this).val($(this).val().replace(/\D/g, ''));
    });
    
    // Form submission
    $('#checkout-form').submit(function(e) {
        e.preventDefault();
        
        if (validatePaymentInfo()) {
            processOrder();
        }
    });
});

// Go to specific step
function goToStep(step) {
    // Hide all steps
    $('.checkout-step-content').hide();
    
    // Show current step
    $(`#step-${step}`).show();
    
    // Update step indicators
    $('.step').removeClass('active completed');
    
    for (let i = 1; i < step; i++) {
        $(`.step[data-step="${i}"]`).addClass('completed');
    }
    
    $(`.step[data-step="${step}"]`).addClass('active');
    
    currentStep = step;
    
    // Scroll to top
    $('html, body').animate({ scrollTop: 0 }, 300);
}

// Validate shipping information
function validateShippingInfo() {
    const form = document.getElementById('checkout-form');
    
    // Check required fields in step 1
    const firstName = $('#firstName').val().trim();
    const lastName = $('#lastName').val().trim();
    const email = $('#email').val().trim();
    const phone = $('#phone').val().trim();
    const address = $('#address').val().trim();
    const city = $('#city').val().trim();
    const zip = $('#zip').val().trim();
    const country = $('#country').val();
    
    let isValid = true;
    
    // Reset validation
    $('#step-1 input, #step-1 select').removeClass('is-invalid is-valid');
    
    if (!firstName) {
        $('#firstName').addClass('is-invalid');
        isValid = false;
    } else {
        $('#firstName').addClass('is-valid');
    }
    
    if (!lastName) {
        $('#lastName').addClass('is-invalid');
        isValid = false;
    } else {
        $('#lastName').addClass('is-valid');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        $('#email').addClass('is-invalid');
        isValid = false;
    } else {
        $('#email').addClass('is-valid');
    }
    
    // Phone validation
    const phoneRegex = /^[\d\+\-\(\)\s]+$/;
    if (!phone || !phoneRegex.test(phone)) {
        $('#phone').addClass('is-invalid');
        isValid = false;
    } else {
        $('#phone').addClass('is-valid');
    }
    
    if (!address) {
        $('#address').addClass('is-invalid');
        isValid = false;
    } else {
        $('#address').addClass('is-valid');
    }
    
    if (!city) {
        $('#city').addClass('is-invalid');
        isValid = false;
    } else {
        $('#city').addClass('is-valid');
    }
    
    // ZIP validation
    const zipRegex = /^\d{5,6}$/;
    if (!zip || !zipRegex.test(zip)) {
        $('#zip').addClass('is-invalid');
        isValid = false;
    } else {
        $('#zip').addClass('is-valid');
    }
    
    if (!country) {
        $('#country').addClass('is-invalid');
        isValid = false;
    } else {
        $('#country').addClass('is-valid');
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

// Validate payment information
function validatePaymentInfo() {
    const paymentMethod = $('input[name="paymentMethod"]:checked').val();
    
    // Check terms agreement
    if (!$('#terms').is(':checked')) {
        $('#terms').addClass('is-invalid');
        showNotification('Please agree to the terms and conditions', 'error');
        return false;
    }
    
    // If cash on delivery, no need to validate card
    if (paymentMethod !== 'card') {
        return true;
    }
    
    // Card validation
    let isValid = true;
    
    $('#step-2 input').removeClass('is-invalid is-valid');
    
    const cardName = $('#cardName').val().trim();
    if (!cardName) {
        $('#cardName').addClass('is-invalid');
        isValid = false;
    } else {
        $('#cardName').addClass('is-valid');
    }
    
    const cardNumber = $('#cardNumber').val().replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13) {
        $('#cardNumber').addClass('is-invalid');
        isValid = false;
    } else {
        $('#cardNumber').addClass('is-valid');
    }
    
    const expiry = $('#expiry').val();
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiry || !expiryRegex.test(expiry)) {
        $('#expiry').addClass('is-invalid');
        isValid = false;
    } else {
        $('#expiry').addClass('is-valid');
    }
    
    const cvv = $('#cvv').val();
    if (!cvv || cvv.length !== 3) {
        $('#cvv').addClass('is-invalid');
        isValid = false;
    } else {
        $('#cvv').addClass('is-valid');
    }
    
    if (!isValid) {
        showNotification('Please fill in all payment details correctly', 'error');
    }
    
    return isValid;
}

// Set card fields required/optional
function setCardFieldsRequired(required) {
    $('#cardName, #cardNumber, #expiry, #cvv').prop('required', required);
}

// Process order
function processOrder() {
    // Show loading
    showNotification('Processing your order...', 'success');
    
    // Simulate order processing
    setTimeout(() => {
        // Generate order number
        const orderNumber = 'ORD-' + Date.now();
        const email = $('#email').val();
        
        // Store order details
        const orderDetails = {
            orderNumber: orderNumber,
            date: new Date().toISOString(),
            items: getCart(),
            shippingInfo: {
                firstName: $('#firstName').val(),
                lastName: $('#lastName').val(),
                email: email,
                phone: $('#phone').val(),
                address: $('#address').val(),
                city: $('#city').val(),
                zip: $('#zip').val(),
                country: $('#country').val()
            },
            paymentMethod: $('input[name="paymentMethod"]:checked').val(),
            total: $('#checkout-total').text()
        };
        
        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderDetails);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        localStorage.removeItem('cart');
        sessionStorage.removeItem('promoDiscount');
        updateCartCount();
        
        // Show confirmation
        $('#order-number').text(orderNumber);
        $('#confirm-email').text(email);
        goToStep(3);
        
        showNotification('Order placed successfully!', 'success');
        
        // Confetti animation (optional)
        celebrateOrder();
    }, 2000);
}

// Celebrate order completion
function celebrateOrder() {
    // Simple animation - you could add a confetti library here
    $('.success-icon').css('animation', 'scaleIn 0.5s ease');
}

// Load checkout summary
function loadCheckoutSummary() {
    const cart = getCart();
    const container = $('#checkout-items-list');
    
    container.empty();
    
    cart.forEach(item => {
        const checkoutItem = `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
        container.append(checkoutItem);
    });
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const shipping = subtotal >= 100 ? 0 : 10;
    const tax = subtotal * 0.10;
    const discount = parseFloat(sessionStorage.getItem('promoDiscount') || 0);
    const total = subtotal + shipping + tax - discount;
    
    $('#checkout-subtotal').text(`$${subtotal.toFixed(2)}`);
    $('#checkout-shipping').text(shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`);
    $('#checkout-tax').text(`$${tax.toFixed(2)}`);
    $('#checkout-total').text(`$${total.toFixed(2)}`);
}

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

// Form field animations
$('#checkout-form input, #checkout-form select').focus(function() {
    $(this).parent().addClass('focused');
});

$('#checkout-form input, #checkout-form select').blur(function() {
    if ($(this).val() === '') {
        $(this).parent().removeClass('focused');
    }
});
