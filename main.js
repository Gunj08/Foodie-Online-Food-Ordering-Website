var swiper = new Swiper(".mySwiper", {
    loop: true,
    autoplay: {
        delay: 3500,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: "#next",
        prevEl: "#prev",
    },
});

const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cardList = document.querySelector('.card-list');
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const bars = document.querySelector('.fa-bars');
const searchInput = document.getElementById('search');
const darkToggle = document.getElementById('darkToggle');
const checkoutBtn = document.getElementById('checkoutBtn');

// prevent default for cart anchor click so page doesn't jump
const updateCartPosition = () => {
    // ensure header is available
    const headerHeight = header ? header.offsetHeight : 0;

    // Position the cart panel just under the header and flush to the bottom of the viewport.
    // Using top + bottom keeps the panel "sticky" from below the navbar to the viewport bottom.
    cartTab.style.top = headerHeight + 'px';
    cartTab.style.bottom = '0';
    // ensure we don't keep an old fixed 100vh height (let top/bottom define height)
    cartTab.style.height = 'auto';
    // (optional) set max-height to allow internal scrolling when needed
    cartTab.style.maxHeight = `calc(100vh - ${headerHeight}px)`;
};

cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    updateCartPosition(); // position before showing
    cartTab.classList.add('cart-tab-active');
    cartTab.setAttribute('aria-hidden', 'false');
    // ensure accessible focus
    cartTab.focus && cartTab.focus();
});
closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cartTab.classList.remove('cart-tab-active');
    cartTab.setAttribute('aria-hidden', 'true');
});
hamburger.addEventListener('click', (e) => { e.preventDefault(); mobileMenu.classList.toggle('mobile-menu-active'); });
hamburger.addEventListener('click', () => bars && bars.classList.toggle('fa-xmark'));

// Sticky navbar & active state
const header = document.querySelector('header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) header.classList.add('sticky'); else header.classList.remove('sticky');

    // active nav
    sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const bottom = top + sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (window.scrollY >= top && window.scrollY < bottom) {
            navLinks.forEach(l => l.classList.remove('active'));
            const link = document.querySelector('.nav-link[href="#' + id + '"]');
            if (link) link.classList.add('active');
        }
    });

    // if cart is open, reposition it so it stays below header
    if (cartTab.classList.contains('cart-tab-active')) updateCartPosition();
});

// update position on resize
window.addEventListener('resize', () => {
    if (cartTab.classList.contains('cart-tab-active')) updateCartPosition();
    // always update position so panel has correct top even when hidden
    updateCartPosition();
});

// ensure correct position on load
window.addEventListener('load', () => {
    updateCartPosition();
});

// dark mode toggle
const applyDark = (on) => {
    if (on) {
        document.body.classList.add('dark-mode');
        darkToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('dark', '1');
    } else {
        document.body.classList.remove('dark-mode');
        darkToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.removeItem('dark');
    }
};
darkToggle.addEventListener('click', () => applyDark(!document.body.classList.contains('dark-mode')));
if (localStorage.getItem('dark')) applyDark(true);

// search / filter
searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.order-card').forEach(card => {
        const txt = card.textContent.toLowerCase();
        card.style.display = txt.includes(q) ? '' : 'none';
    });
});

// Chatbot (simple canned)
const chatToggle = document.getElementById('chatToggle');
const chatbotRoot = document.getElementById('chatbot');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendChat = document.getElementById('sendChat');

chatToggle.addEventListener('click', () => {
    chatbotRoot.classList.toggle('open');
    chatbotRoot.classList.toggle('closed');
    chatbotRoot.setAttribute('aria-hidden', !chatbotRoot.classList.contains('open'));
});
const botReply = (msg) => {
    msg = msg.toLowerCase();
    if (msg.includes('menu')) return 'You can browse menu on the Menu section. Try searching "pizza" or "burger".';
    if (msg.includes('help') || msg.includes('support')) return 'For support, email support@foodie.test (demo).';
    if (msg.includes('order')) return 'Use the "Add to Cart" buttons then checkout. This is a demo payment.';
    return "Sorry, I didn't understand. Try 'menu', 'order', or 'help'.";
};
sendChat.addEventListener('click', () => {
    const v = chatInput.value.trim();
    if (!v) return;
    const user = document.createElement('div'); user.className = 'user-msg'; user.textContent = v;
    chatBody.appendChild(user);
    const bot = document.createElement('div'); bot.className = 'bot-msg'; bot.textContent = botReply(v);
    chatBody.appendChild(bot);
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
});

// small keyboard submit for chat
chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat.click(); } });

// cart, products & payments (existing logic with added session store)
let productList = [];
let cartProduct = []; // store product ids currently in cart to prevent duplicates

const saveCartToSession = () => {
    const items = [];
    document.querySelectorAll('.item').forEach(itemEl => {
        const name = itemEl.querySelector('.detail h4').textContent;
        const qty = parseInt(itemEl.querySelector('.quantity-value').textContent);
        const total = itemEl.querySelector('.item-total').textContent;
        const img = itemEl.querySelector('.item-image img').getAttribute('src');
        // try to find product id by matching name or image
        const p = productList.find(p => p.name === name || p.image === img) || {};
        items.push({ id: p.id || null, name, qty, total, img });
    });
    sessionStorage.setItem('cartItems', JSON.stringify(items));
};

const updateTotals = () => {

    let totalPrice = 0;
    let totalQuantity = 0;

    document.querySelectorAll('.item').forEach(item => {

        const quantity = parseInt(item.querySelector('.quantity-value').textContent);
        const price = parseFloat(item.querySelector('.item-total').textContent.replace('$', '')) || 0;

        totalPrice += price;
        totalQuantity += quantity;
    });

    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
    cartValue.textContent = totalQuantity;

    // persist state
    saveCartToSession();
}

const createCartItemDOM = (product, initialQty = 1) => {
    let quantity = initialQty;
    const pricePerUnit = parseFloat(product.price ? product.price.replace('$', '') : (product.unitPrice || 0));

    const cartItem = document.createElement('div');
    cartItem.classList.add('item');
    cartItem.innerHTML = `
        <div class="item-image">
            <img src="${product.image || product.img}" alt="${product.name}">
        </div>
        <div class="detail">
            <h4>${product.name}</h4>
            <h4 class="item-total">$${(pricePerUnit * quantity).toFixed(2)}</h4>
        </div>
        <div class="flex">
            <a href="#" class="quantity-btn minus">
                <i class="fa-solid fa-minus"></i>
            </a>
            <h4 class="quantity-value">${quantity}</h4>
            <a href="#" class="quantity-btn plus">
                <i class="fa-solid fa-plus"></i>
            </a>
        </div>
    `;

    const plusBtn = cartItem.querySelector('.plus');
    const minusBtn = cartItem.querySelector('.minus');
    const quantityValue = cartItem.querySelector('.quantity-value');
    const itemTotal = cartItem.querySelector('.item-total');

    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        quantity++;
        quantityValue.textContent = quantity;
        itemTotal.textContent = `$${(pricePerUnit * quantity).toFixed(2)}`;
        updateTotals();
    });

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
            itemTotal.textContent = `$${(pricePerUnit * quantity).toFixed(2)}`;
            updateTotals();
        }
        else {
            cartItem.classList.add('slide-out');
            setTimeout(() => {
                cartItem.remove();
                cartProduct = cartProduct.filter(id => id !== product.id);
                updateTotals();
            }, 300);
        }
    });

    cartList.appendChild(cartItem);
    updateTotals();
    return cartItem;
}

const showCards = () => {
    cardList.innerHTML = ''; // reset when re-rendering
    productList.forEach(product => {

        const orderCard = document.createElement('div');
        orderCard.classList.add('order-card');
        orderCard.innerHTML = `
        <div class="card-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <h4>${product.name}</h4>
        <h4 class="price">${product.price}</h4>
        <a href="#" class="btn card-btn">Add to Cart</a>
        `;

        cardList.appendChild(orderCard);

        const cardBtn = orderCard.querySelector('.card-btn');
        cardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(product);
            // micro animation
            cardBtn.classList.add('popped');
            setTimeout(() => cardBtn.classList.remove('popped'), 250);
        });
    });
};

const addToCart = (product) => {

    const existing = cartProduct.includes(product.id);
    if (existing) {
        // increment quantity instead of blocking (find the item node)
        const itemNode = Array.from(document.querySelectorAll('.item')).find(it => it.querySelector('.detail h4').textContent === product.name);
        if (itemNode) {
            const qNode = itemNode.querySelector('.quantity-value');
            const newQty = parseInt(qNode.textContent) + 1;
            qNode.textContent = newQty;
            const price = parseFloat(product.price.replace('$', '')) || 0;
            itemNode.querySelector('.item-total').textContent = `$${(price * newQty).toFixed(2)}`;
            updateTotals();
            return;
        }
    }

    cartProduct.push(product.id);

    createCartItemDOM(product, 1);

    // persist
    saveCartToSession();
}

// checkout: save cart in sessionStorage and route to payment page (fake)
checkoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // collect current cart items
    const items = [];
    document.querySelectorAll('.item').forEach(itemEl => {
        const name = itemEl.querySelector('.detail h4').textContent;
        const qty = parseInt(itemEl.querySelector('.quantity-value').textContent);
        const total = itemEl.querySelector('.item-total').textContent;
        const img = itemEl.querySelector('.item-image img').getAttribute('src');
        items.push({ name, qty, total, img });
    });
    if (items.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    // store checkout cart separately for payment page
    sessionStorage.setItem('checkoutCart', JSON.stringify(items));
    // keep cartItems (persist) as well
    saveCartToSession();
    // fake payment route
    window.location.href = 'payment.html';
});

const restoreCartFromSession = () => {
    const stored = sessionStorage.getItem('cartItems');
    if (!stored) return;
    try {
        const items = JSON.parse(stored);
        items.forEach(it => {
            // try match product in productList to get price & id
            let prod = productList.find(p => p.id === it.id || p.name === it.name || p.image === it.img);
            if (!prod) {
                // fallback construct product-like object from stored data
                prod = { id: it.id || null, name: it.name, image: it.img, price: `$${(parseFloat(it.total.replace('$', '')) / (it.qty || 1)).toFixed(2)}` };
            }
            // ensure id tracked
            if (prod.id) cartProduct.push(prod.id);
            createCartItemDOM(prod, it.qty || 1);
        });
    } catch (err) {
        console.error('Error restoring cart from session', err);
    }
}

const initApp = () => {
    fetch('product.json').then
        (response => response.json()).then
        (data => {
            productList = data;
            showCards();
            // restore cart after products are loaded so we can match ids/prices
            restoreCartFromSession();
        })
}
initApp();

// PRELOADER
window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    pre.classList.add('hidden');
    setTimeout(() => pre.remove(), 400);
});

// AUTH modal handlers (show-only)
const authModal = document.getElementById('authModal');
const openAuth = document.getElementById('open-auth');
const openAuthMobile = document.getElementById('open-auth-mobile');
const closeAuth = document.querySelector('.close-auth');
const authTabs = document.querySelectorAll('.auth-tabs .tab');
const authForms = document.querySelectorAll('.auth-form');

const toggleAuth = (open) => {
    if (open) authModal.classList.add('open'); else authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', !open);
};
openAuth.addEventListener('click', (e) => { e.preventDefault(); toggleAuth(true); });
openAuthMobile.addEventListener('click', (e) => { e.preventDefault(); toggleAuth(true); });
closeAuth.addEventListener('click', () => toggleAuth(false));

authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.target;
        authForms.forEach(f => f.classList.remove('active'));
        document.getElementById(target).classList.add('active');
    });
});
document.getElementById('loginBtn').addEventListener('click', (e) => { e.preventDefault(); alert('Demo login — no real auth.'); toggleAuth(false); });
document.getElementById('regBtn').addEventListener('click', (e) => { e.preventDefault(); alert('Demo register — no real backend.'); toggleAuth(false); });

// intersection observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
}, { threshold: 0.15 });

document.querySelectorAll('.animate-on-scroll').forEach(s => observer.observe(s));

// small button animation (popped)
document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('btn')) {
        e.target.animate([{ transform: 'scale(1)' }, { transform: 'scale(.98)' }, { transform: 'scale(1)' }], { duration: 180 });
    }
});

// keyboard accessibility: close cart or modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cartTab.classList.remove('cart-tab-active');
        cartTab.setAttribute('aria-hidden', 'true');
        toggleAuth(false);
    }
});