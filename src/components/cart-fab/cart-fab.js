import { cart } from '../../lib/cart.js';

const BUMP_CLASS = 'cart-fab--bump';

export class CartFab {
  constructor(root) {
    this.root = root;
    this.count = root.querySelector('[data-cart-count]');

    cart.subscribe(({ total }) => this.render(total));
  }

  render(total) {
    this.root.hidden = total === 0;
    this.count.textContent = total > 99 ? '99+' : String(total);

    this.root.classList.remove(BUMP_CLASS);
    void this.root.offsetWidth;
    this.root.classList.add(BUMP_CLASS);
  }
}
