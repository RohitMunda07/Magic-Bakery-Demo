const toggle = document.querySelector('.nav-toggle'), links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.textContent = isOpen ? '✕' : '☰';
  });
  
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target) && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }
  });
}
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
  links?.classList.remove('open');
  toggle?.classList.remove('active');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle && (toggle.textContent = '☰');
}));

const closeCoupon = document.querySelector('#closeCoupon');
if (closeCoupon) closeCoupon.addEventListener('click', () => { document.querySelector('.coupon-bar')?.remove() });

const CART_KEY = 'magicBakeryCart';
const COUPON_KEY = 'magicBakeryCoupon';
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const saveCart = cart => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount() };
const getAppliedCoupon = () => (localStorage.getItem(COUPON_KEY) || '').trim().toUpperCase();
const saveCoupon = coupon => { if (coupon) { localStorage.setItem(COUPON_KEY, coupon.trim().toUpperCase()) } else { localStorage.removeItem(COUPON_KEY) } };
function updateCartCount() { const count = getCart().reduce((sum, item) => sum + item.qty, 0); document.querySelectorAll('.cart-count').forEach(el => el.textContent = count) }
function getCouponDiscount(subtotal) { const code = getAppliedCoupon(); return code === 'GURU' && subtotal >= 499 ? subtotal * 0.3 : 0 }
function updateCouponUI() { const input = document.querySelector('#couponInput'), status = document.querySelector('#couponStatus'); if (!input || !status) return; const code = getAppliedCoupon(); input.value = code; const valid = code === 'GURU'; status.innerHTML = valid ? 'Coupon applied successfully. 30% discount is active.' : 'Use code <strong>GURU</strong> for 30% off'; status.classList.toggle('valid', valid); status.classList.toggle('invalid', !valid && code) }
function addToCart(product) {
    const cart = getCart(), existing = cart.find(item => item.id === product.id);
    if (existing) existing.qty += 1; else cart.push({ ...product, qty: 1 });
    saveCart(cart); const button = document.querySelector(`[data-add="${product.id}"]`);
    if (button) { const old = button.textContent; button.textContent = 'Added ✓'; setTimeout(() => button.textContent = old, 900) }
}
document.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart({
    id: btn.dataset.add, name: btn.dataset.name, price: Number(btn.dataset.price), image: btn.dataset.image, category: btn.dataset.category
})));

document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active')); btn.classList.add('active');
    const filter = btn.dataset.filter; document.querySelectorAll('[data-category]').forEach(item => item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter));
}));

function renderCart() {
    const list = document.querySelector('#cartItems'), empty = document.querySelector('#emptyCart'), summary = document.querySelector('#cartSummary'); if (!list) return;
    const cart = getCart(); if (!cart.length) { list.innerHTML = ''; empty.hidden = false; summary.hidden = true; return }
    empty.hidden = true; summary.hidden = false;
    list.innerHTML = cart.map(item => `<article class="cart-row"><img src="${item.image}" alt="${item.name}"><div><h3>${item.name}</h3><p>₹${item.price.toLocaleString('en-IN')} each</p><div class="qty"><button aria-label="Decrease" data-minus="${item.id}">−</button><span>${item.qty}</span><button aria-label="Increase" data-plus="${item.id}">+</button></div><button class="remove" data-remove="${item.id}">Remove</button></div><strong>₹${(item.price * item.qty).toLocaleString('en-IN')}</strong></article>`).join('');
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0), delivery = subtotal >= 399 ? 0 : 80, discount = getCouponDiscount(subtotal), total = subtotal + delivery - discount;
    document.querySelector('#subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`; document.querySelector('#delivery').textContent = delivery ? '₹80' : 'FREE'; document.querySelector('#discount').textContent = `-₹${discount.toLocaleString('en-IN')}`; document.querySelector('#total').textContent = `₹${Math.max(total, 0).toLocaleString('en-IN')}`; updateCouponUI();
    list.querySelectorAll('[data-plus]').forEach(b => b.onclick = () => changeQty(b.dataset.plus, 1)); list.querySelectorAll('[data-minus]').forEach(b => b.onclick = () => changeQty(b.dataset.minus, -1)); list.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => removeItem(b.dataset.remove));
}
function changeQty(id, delta) { const cart = getCart(), item = cart.find(x => x.id === id); if (!item) return; item.qty += delta; if (item.qty <= 0) cart.splice(cart.indexOf(item), 1); saveCart(cart); renderCart() }
function removeItem(id) { saveCart(getCart().filter(x => x.id !== id)); renderCart() }
const couponInput = document.querySelector('#couponInput'), applyCoupon = document.querySelector('#applyCoupon');
if (couponInput) { couponInput.addEventListener('input', () => { saveCoupon(couponInput.value); updateCouponUI(); renderCart() }) }
if (applyCoupon) { applyCoupon.addEventListener('click', () => { saveCoupon(couponInput ? couponInput.value : ''); updateCouponUI(); renderCart() }) }
const checkout = document.querySelector('#checkout'); if (checkout) checkout.addEventListener('click', () => { const notice = document.querySelector('#checkoutNotice'); notice.hidden = false; notice.textContent = 'Demo checkout: connect this button to your payment/order system for a real bakery launch.' });
updateCartCount(); renderCart();

const form = document.querySelector('#contactForm'); if (form) form.addEventListener('submit', e => { e.preventDefault(); const note = document.querySelector('#formNotice'); note.hidden = false; note.textContent = 'Thanks! Your message has been received in this demo. A bakery team member would reply shortly.'; form.reset() });
