/* Funciones generales (usadas en todas las páginas) */
function loadSection(section) {
    const content = document.getElementById('content');
    let url = '';

    switch (section) {
        case 'inicio':
            url = 'inicio.html';
            break;
        case 'contacto':
            url = 'contacto.html';
            break;
        case 'carta':
            url = 'carta.html';
            break;
        case 'carrito':
            url = 'carrito.html';
            break;
        default:
            content.innerHTML = `
                <div class="error-message">
                    <h3>¡Vaya!</h3>
                    <p>Parece que esta sección no está disponible ahora.</p>
                </div>
            `;
            updateActiveNav(section);
            return;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar ${url}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            content.innerHTML = data;
            updateActiveNav(section);
            localStorage.setItem('activeSection', section);

            if (section === 'inicio') {
                initSlider();
            } else if (section === 'contacto') {
                initMap();
                initReserveForm();
                initDirections();
            } else if (section === 'carta') {
                initCarta();
            } else if (section === 'carrito') {
                initCarrito();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            content.innerHTML = `
                <div class="error-message">
                    <h3>¡Oh no!</h3>
                    <p>No pudimos cargar esta sección, intenta de nuevo más tarde.</p>
                </div>
            `;
            updateActiveNav(section);
        });
}

function updateActiveNav(section) {
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.onclick.toString().includes(`'${section}'`)) btn.classList.add('active');
    });
    updateCartCount();
}

window.onload = function() {
    const activeSection = localStorage.getItem('activeSection') || 'inicio';
    loadSection(activeSection);
    updateCartCount();
};

/* Función para mostrar notificaciones con modal */
function showNotification(title, message) {
    let modal = document.querySelector('.notification-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.innerHTML = `
            <div class="notification-modal-content">
                <h3></h3>
                <p></p>
                <button>Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalTitle = modal.querySelector('h3');
    const modalMessage = modal.querySelector('p');
    const modalButton = modal.querySelector('button');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'flex';

    modalButton.onclick = () => {
        modal.style.display = 'none';
    };
}

/* Funciones del carrito */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function triggerCartJump() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.classList.add('cart-jump');
        setTimeout(() => cartBtn.classList.remove('cart-jump'), 300);
    }
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) return;

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>S/ ${item.price.toFixed(2)} x ${item.quantity}${item.notes ? ` - ${item.notes}` : ''}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                    <button onclick="removeFromCart(${index})">X</button>
                </div>
            </div>
        `;
    });

    cartTotal.textContent = `Total: S/ ${total.toFixed(2)}`;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

/* Funciones para index.html (inicio.html) */
function initSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) slide.classList.add('active');
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    const slideInterval = setInterval(nextSlide, 5000);

    let touchStartX = 0;
    let touchEndX = 0;

    const slider = document.querySelector('.slider');
    if (slider) {
        slider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        slider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                nextSlide();
            } else if (touchEndX - touchStartX > 50) {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(currentSlide);
            }
        });
    }
}

/* Funciones para contacto.html */
function initMap() {
    const mapElement = document.getElementById('map');
    if (mapElement && !mapElement.hasAttribute('data-initialized')) {
        const map = L.map('map').setView([-7.9327781, -79.1006204], 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        L.marker([-7.9327781, -79.1006204]).addTo(map)
            .bindPopup('Restaurant Soledad')
            .openPopup();
        mapElement.setAttribute('data-initialized', 'true');
    }
}

function initReserveForm() {
    const form = document.getElementById('reserve-form');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const modalBack = document.getElementById('modal-back');
    const modalConfirm = document.getElementById('modal-confirm');

    if (form && modal && modalMessage && modalBack && modalConfirm) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const people = document.getElementById('people').value;

            if (!name) {
                showNotification('Error', 'Por favor, ingresa tu nombre.');
                return;
            }
            if (!date) {
                showNotification('Error', 'Por favor, selecciona una fecha.');
                return;
            }
            if (!time) {
                showNotification('Error', 'Por favor, selecciona una hora.');
                return;
            }
            if (!people || people < 1) {
                showNotification('Error', 'Por favor, ingresa la cantidad de personas (mínimo 1).');
                return;
            }

            modalMessage.innerHTML = `
                Revisa tu reserva:<br>
                <strong>Nombre:</strong> ${name}<br>
                <strong>Fecha:</strong> ${date}<br>
                <strong>Hora:</strong> ${time}<br>
                <strong>Personas:</strong> ${people}<br><br>
                Pronto confirmaremos tu solicitud de reserva.
            `;
            modal.style.display = 'flex';

            modalBack.onclick = () => {
                modal.style.display = 'none';
            };

            modalConfirm.onclick = () => {
                const message = `Nueva reserva:\nNombre: ${name}\nFecha: ${date}\nHora: ${time}\nPersonas: ${people}`;
                const whatsappUrl = `https://wa.me/51930288404?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                modal.style.display = 'none';
                form.reset();
            };
        });
    }
}

function initDirections() {
    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) {
        directionsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const destination = '-7.9327781,-79.1006204';
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            window.open(googleMapsUrl, '_blank');
        });
    }
}

function scrollToReserve() {
    setTimeout(() => {
        const reserveSection = document.getElementById('reserve-section');
        if (reserveSection) {
            reserveSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

/* Funciones para carta.html */
function initCarta() {
    const categories = document.querySelectorAll('.category');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const allItemsContainer = document.querySelector('.category[data-category="todos"] .items');

    categories.forEach(category => {
        if (category.getAttribute('data-category') !== 'todos') {
            const items = category.querySelectorAll('.item');
            items.forEach(item => {
                allItemsContainer.appendChild(item.cloneNode(true));
            });
        }
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            categories.forEach(cat => {
                cat.classList.add('hidden');
                if (cat.getAttribute('data-category') === category) {
                    cat.classList.remove('hidden');
                }
            });
        });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.item');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            const image = button.getAttribute('data-image');
            const quantity = parseInt(item.querySelector('.quantity').value) || 1;
            const notes = item.querySelector('.notes').value.trim();

            const existingItem = cart.find(i => i.name === name && i.notes === notes);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ name, price, image, quantity, notes });
            }
            renderCart();
            triggerCartJump();
            updateCartCount();
            item.querySelector('.quantity').value = 1;
            item.querySelector('.notes').value = '';
        });
    });
}

/* Funciones para carrito.html */
function initCarrito() {
    const content = document.getElementById('content');
    if (cart.length === 0) {
        content.innerHTML = `
            <div class="empty-cart-message">
                <h3>¡Tu carrito está vacío!</h3>
                <p>Explora nuestra deliciosa carta para empezar tu pedido.</p>
                <div class="flex gap-4 justify-center">
                    <button class="btn" onclick="loadSection('carta')">Ver Carta</button>
                </div>
            </div>
        `;
        return;
    }

    renderCart();

    const steps = {
        review: document.getElementById('step-review'),
        payment: document.getElementById('step-payment'),
        details: document.getElementById('step-details')
    };

    document.getElementById('cart-clear')?.addEventListener('click', () => {
        cart = [];
        renderCart();
        loadSection('carrito');
    });

    document.getElementById('cart-next')?.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Carrito vacío', 'El carrito está vacío. Añade algunos ítems antes de continuar.');
            return;
        }
        steps.review.classList.add('hidden');
        steps.payment.classList.remove('hidden');
    });

    document.getElementById('payment-back')?.addEventListener('click', () => {
        steps.payment.classList.add('hidden');
        steps.review.classList.remove('hidden');
    });

    document.getElementById('payment-next')?.addEventListener('click', () => {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const cashAmount = document.getElementById('cash-amount')?.value;
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (paymentMethod === 'efectivo') {
            if (!cashAmount || cashAmount <= 0) {
                showNotification('Error', 'Por favor, ingresa con cuánto pagas en efectivo.');
                return;
            }
            if (parseFloat(cashAmount) < total) {
                showNotification('Error', `El monto ingresado (S/ ${cashAmount}) es menor al total (S/ ${total.toFixed(2)}).`);
                return;
            }
        }
        steps.payment.classList.add('hidden');
        steps.details.classList.remove('hidden');
    });

    document.getElementById('details-back')?.addEventListener('click', () => {
        steps.details.classList.add('hidden');
        steps.payment.classList.remove('hidden');
    });

    // Lógica para métodos de pago
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cashDetails = document.getElementById('cash-details');
    const transferDetails = document.getElementById('transfer-details');
    const qrOutput = document.getElementById('qr-output');
    const qrImage = document.getElementById('qr-image');

    const paymentData = {
        plin: { qr: 'assets/img/qr/qr_plin.jpg' },
        yape: { qr: 'assets/img/qr/qr_yape.jpg' }
    };

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const method = radio.value;
            cashDetails.classList.add('hidden');
            transferDetails.classList.add('hidden');
            qrOutput.classList.add('hidden');

            if (method === 'efectivo') {
                cashDetails.classList.remove('hidden');
            } else if (method === 'plin' || method === 'yape') {
                transferDetails.classList.remove('hidden');
                qrImage.src = paymentData[method].qr;
                qrOutput.classList.remove('hidden');
            }
        });
    });

    document.getElementById('order-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('order-name').value.trim();
        const address = document.getElementById('order-address').value.trim();
        const deliveryMethod = document.getElementById('delivery-method').value;
        const payment = document.querySelector('input[name="payment"]:checked').value;
        const cashAmount = document.getElementById('cash-amount')?.value;

        if (!name || !address) {
            showNotification('Campos incompletos', 'Por favor, completa todos los campos antes de enviar el pedido.');
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let paymentDetails = '';

        if (payment === 'efectivo') {
            const cash = parseFloat(cashAmount);
            const change = cash - total;
            paymentDetails = `efectivo (Paga con S/ ${cash.toFixed(2)} - Vuelto: S/ ${change.toFixed(2)})`;
        } else {
            paymentDetails = payment;
        }

        let message = `🍽️ *Nuevo Pedido - Restaurant Soledad* 🍽️\n\n`;
        message += `📋 *Detalles del Pedido:*\n`;
        message += cart.map(item => 
            `   • ${item.name} x${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}${item.notes ? ` (✏️ ${item.notes})` : ''}`
        ).join('\n') + '\n\n';

        message += `💰 *Total:* S/ ${total.toFixed(2)}\n`;
        message += `💳 *Método de Pago:* ${paymentDetails}\n\n`;
        message += `👤 *Cliente:* ${name}\n`;
        message += `📍 *Dirección:* ${address}\n`;
        message += `🚚 *Entrega:* ${deliveryMethod === 'delivery' ? 'Delivery' : 'Recojo en local'}\n`;
        message += `\nGracias por tu pedido! 🙌`;

        const whatsappUrl = `https://wa.me/51930288404?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        loadSection('inicio');
    });
}