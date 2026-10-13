import { cart, CART_MAX_QTY } from '../../lib/cart.js';
import { announce } from '../../lib/announcer.js';

export class BuyBox {
  constructor(root, { getPack }) {
    this.getPack = getPack;
    this.form = root;
    this.addButton = root.querySelector('[data-buy-add]');
    this.inCart = root.querySelector('[data-buy-in-cart]');
    this.value = root.querySelector('[data-qty-value]');
    this.dec = root.querySelector('[data-qty-dec]');
    this.inc = root.querySelector('[data-qty-inc]');

    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.change(1);
      this.inc.focus();
    });

    this.inc.addEventListener('click', () => this.change(1));

    this.dec.addEventListener('click', () => {
      const willBeEmpty = cart.get(this.getPack().sku) === 1;
      this.change(-1);
      if (willBeEmpty) this.addButton.focus();
    });
  }

  change(delta) {
    const pack = this.getPack();
    const qty = cart.get(pack.sku) + delta;

    cart.set(pack.sku, qty);
    this.render(pack);

    announce(qty > 0
      ? `${pack.label}: в корзине ${qty} шт. Всего товаров: ${cart.total}.`
      : `${pack.label} убран из корзины. Всего товаров: ${cart.total}.`);
  }

  render(pack) {
    const qty = cart.get(pack.sku);

    this.addButton.hidden = qty > 0;
    this.inCart.hidden = qty === 0;
    this.value.textContent = qty;
    this.inc.disabled = qty >= CART_MAX_QTY;
    this.dec.setAttribute('aria-label', qty === 1 ? 'Убрать из корзины' : 'Убрать одну упаковку');
  }
}
