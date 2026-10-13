import { formatRub } from '../../lib/format.js';

export const discountPercent = ({ price, oldPrice }) =>
  oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

export class Price {
  constructor(root) {
    this.current = root.querySelector('[data-price-current]');
    this.oldWrap = root.querySelector('[data-price-old-wrap]');
    this.old = root.querySelector('[data-price-old]');
    this.savingWrap = root.querySelector('[data-price-saving-wrap]');
    this.saving = root.querySelector('[data-price-saving]');
    this.unit = root.querySelector('[data-price-unit]');
  }

  render(pack) {
    const hasDiscount = pack.oldPrice !== null;

    this.current.value = pack.price.toFixed(2);
    this.current.textContent = formatRub(pack.price);
    this.unit.textContent = `${formatRub((pack.price / pack.weight) * 100)} за 100 г`;

    this.oldWrap.hidden = !hasDiscount;
    this.savingWrap.hidden = !hasDiscount;
    if (!hasDiscount) return;

    this.old.textContent = formatRub(pack.oldPrice);
    this.saving.textContent = formatRub(Math.round((pack.oldPrice - pack.price) * 100) / 100);
  }
}
