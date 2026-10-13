import { formatRub } from '../../lib/format.js';

export const discountPercent = ({ price, oldPrice }) =>
  oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

export const initPrice = (root) => {
  const current = root.querySelector('[data-price-current]');
  const oldWrap = root.querySelector('[data-price-old-wrap]');
  const old = root.querySelector('[data-price-old]');
  const savingWrap = root.querySelector('[data-price-saving-wrap]');
  const saving = root.querySelector('[data-price-saving]');
  const unit = root.querySelector('[data-price-unit]');

  const render = (pack) => {
    const hasDiscount = pack.oldPrice !== null;

    current.value = pack.price.toFixed(2);
    current.textContent = formatRub(pack.price);
    unit.textContent = `${formatRub((pack.price / pack.weight) * 100)} за 100 г`;

    oldWrap.hidden = !hasDiscount;
    savingWrap.hidden = !hasDiscount;
    if (!hasDiscount) return;

    old.textContent = formatRub(pack.oldPrice);
    saving.textContent = formatRub(Math.round((pack.oldPrice - pack.price) * 100) / 100);
  };

  return { render };
};
