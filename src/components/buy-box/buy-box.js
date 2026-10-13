import { getQty, getTotal, setQty, CART_MAX_QTY } from '../../lib/cart.js';
import { announce } from '../../lib/announcer.js';

export const initBuyBox = (root, { getPack }) => {
  const addButton = root.querySelector('[data-buy-add]');
  const inCart = root.querySelector('[data-buy-in-cart]');
  const value = root.querySelector('[data-qty-value]');
  const dec = root.querySelector('[data-qty-dec]');
  const inc = root.querySelector('[data-qty-inc]');

  const render = (pack) => {
    const qty = getQty(pack.sku);

    addButton.hidden = qty > 0;
    inCart.hidden = qty === 0;
    value.textContent = qty;
    inc.disabled = qty >= CART_MAX_QTY;
    dec.setAttribute('aria-label', qty === 1 ? 'Убрать из корзины' : 'Убрать одну упаковку');
  };

  const change = (delta) => {
    const pack = getPack();
    const qty = getQty(pack.sku) + delta;

    setQty(pack.sku, qty);
    render(pack);

    announce(qty > 0
      ? `${pack.label}: в корзине ${qty} шт. Всего товаров: ${getTotal()}.`
      : `${pack.label} убран из корзины. Всего товаров: ${getTotal()}.`);
  };

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    change(1);
    inc.focus();
  });

  inc.addEventListener('click', () => change(1));

  dec.addEventListener('click', () => {
    const willBeEmpty = getQty(getPack().sku) === 1;
    change(-1);
    if (willBeEmpty) addButton.focus();
  });

  return { render };
};
