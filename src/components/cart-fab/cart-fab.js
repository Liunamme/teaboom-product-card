import { subscribe } from '../../lib/cart.js';

const BUMP_CLASS = 'cart-fab--bump';

export const initCartFab = (root) => {
  const count = root.querySelector('[data-cart-count]');

  subscribe(({ total }) => {
    root.hidden = total === 0;
    count.textContent = total > 99 ? '99+' : String(total);

    root.classList.remove(BUMP_CLASS);
    void root.offsetWidth;
    root.classList.add(BUMP_CLASS);
  });
};
