/**
 * Карточка товара: фасовка, цена, добавление в корзину и количество в ней.
 *
 * Все данные берём из разметки (data-* на radio фасовок), так их отдаст
 * Django-шаблон. JS ничего не знает о конкретном товаре и подойдёт
 * для любой карточки с такой же разметкой.
 */

import { Gallery } from './gallery.js';

const QTY_MAX = 99;

// Копейки показываем, только если они есть: «326,40 ₽», но «1 432 ₽»
const formatRub = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

const readPack = (input) => {
  const price = Number(input.dataset.price);
  const oldPrice = Number(input.dataset.oldPrice) || null;

  return {
    sku: input.value,
    weight: Number(input.dataset.weight),
    price,
    // Старая цена имеет смысл, только если она правда больше текущей
    oldPrice: oldPrice > price ? oldPrice : null,
    label: input.closest('label').querySelector('.pack-picker__weight').textContent.trim(),
  };
};

/**
 * Корзина. Настоящей нет, храним количество по артикулу в памяти
 * и показываем общий счётчик в плавающей кнопке.
 */
class Cart {
  constructor() {
    this.items = new Map();
    this.fab = document.querySelector('[data-cart-fab]');
    this.count = this.fab?.querySelector('[data-cart-count]');
    this.status = document.querySelector('[data-cart-status]');
  }

  get(sku) {
    return this.items.get(sku) ?? 0;
  }

  get total() {
    let sum = 0;
    this.items.forEach((qty) => { sum += qty; });
    return sum;
  }

  set(sku, qty, label) {
    const next = Math.min(QTY_MAX, Math.max(0, qty));
    const prev = this.get(sku);
    if (next === prev) return;

    if (next === 0) {
      this.items.delete(sku);
    } else {
      this.items.set(sku, next);
    }

    this.renderFab();
    this.announce(next === 0
      ? `${label} убран из корзины`
      : `${label}: в корзине ${next} шт`);
  }

  renderFab() {
    if (!this.fab) return;

    const total = this.total;
    this.fab.hidden = total === 0;
    this.count.textContent = total > 99 ? '99+' : String(total);

    // Перезапуск анимации: снять класс, дать браузеру перерисовать, вернуть
    this.fab.classList.remove('cart-fab--bump');
    void this.fab.offsetWidth;
    this.fab.classList.add('cart-fab--bump');
  }

  announce(text) {
    if (this.status) this.status.textContent = `${text}. Всего товаров: ${this.total}.`;
  }
}

class ProductCard {
  constructor(root, cart) {
    this.root = root;
    this.cart = cart;
    this.form = root.querySelector('[data-purchase]');
    this.packs = [...root.querySelectorAll('.pack-picker__input')];

    this.el = {
      sku: root.querySelector('[data-sku]'),
      price: root.querySelector('[data-price-value]'),
      oldPrice: root.querySelector('[data-old-price-value]'),
      oldPriceWrap: root.querySelector('[data-old-price-wrap]'),
      saving: root.querySelector('[data-saving]'),
      savingWrap: root.querySelector('[data-saving-wrap]'),
      unitPrice: root.querySelector('[data-unit-price]'),
      discount: root.querySelector('[data-discount]'),
      discountBadge: root.querySelector('[data-discount-badge]'),
      addToCart: root.querySelector('[data-add-to-cart]'),
      inCart: root.querySelector('[data-in-cart]'),
      qtyValue: root.querySelector('[data-qty-value]'),
      qtyDec: root.querySelector('[data-qty-dec]'),
      qtyInc: root.querySelector('[data-qty-inc]'),
      favorite: root.querySelector('[data-favorite]'),
    };

    const gallery = root.querySelector('[data-gallery]');
    if (gallery) new Gallery(gallery);

    this.bind();
    this.render();
  }

  get currentPack() {
    return readPack(this.packs.find((input) => input.checked) ?? this.packs[0]);
  }

  bind() {
    this.form.addEventListener('change', (event) => {
      if (!event.target.matches('.pack-picker__input')) return;

      this.render();
      // На телефоне лента фасовок прокручивается, выбранная плитка не должна оставаться за краем
      event.target.closest('.pack-picker__item').scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });

    // Без JS форма честно отправится на сервер, с JS кладём в корзину на месте
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.changeQty(1);
      // Кнопка спряталась, фокус переносим на «+», иначе он потеряется
      this.el.qtyInc.focus();
    });

    this.el.qtyInc.addEventListener('click', () => this.changeQty(1));
    this.el.qtyDec.addEventListener('click', () => {
      const removed = this.cart.get(this.currentPack.sku) === 1;
      this.changeQty(-1);
      if (removed) this.el.addToCart.focus();
    });

    this.el.favorite?.addEventListener('click', () => {
      const pressed = this.el.favorite.getAttribute('aria-pressed') === 'true';
      this.el.favorite.setAttribute('aria-pressed', String(!pressed));
      this.el.favorite.setAttribute('aria-label', pressed ? 'Добавить в избранное' : 'Убрать из избранного');
    });
  }

  changeQty(delta) {
    const pack = this.currentPack;
    this.cart.set(pack.sku, this.cart.get(pack.sku) + delta, pack.label);
    this.renderCartControls();
  }

  render() {
    const pack = this.currentPack;
    const hasDiscount = pack.oldPrice !== null;

    this.packs.forEach((input) => {
      input.closest('.pack-picker__item').classList.toggle('pack-picker__item--active', input.checked);
    });

    this.el.sku.textContent = pack.sku;
    this.el.price.value = pack.price.toFixed(2);
    this.el.price.textContent = formatRub(pack.price);
    this.el.unitPrice.textContent = `${formatRub((pack.price / pack.weight) * 100)} за 100 г`;

    // Если у фасовки нет скидки, всё, что про скидку, просто прячем
    this.el.oldPriceWrap.hidden = !hasDiscount;
    this.el.savingWrap.hidden = !hasDiscount;
    this.el.discountBadge.hidden = !hasDiscount;

    if (hasDiscount) {
      const saving = pack.oldPrice - pack.price;
      this.el.oldPrice.textContent = formatRub(pack.oldPrice);
      this.el.saving.textContent = formatRub(Math.round(saving * 100) / 100);
      this.el.discount.textContent = `−${Math.round((saving / pack.oldPrice) * 100)}%`;
    }

    this.renderCartControls();
  }

  // У каждой фасовки своё количество: переключились, показали её состояние
  renderCartControls() {
    const qty = this.cart.get(this.currentPack.sku);

    this.el.addToCart.hidden = qty > 0;
    this.el.inCart.hidden = qty === 0;
    this.el.qtyValue.textContent = qty;
    this.el.qtyInc.disabled = qty >= QTY_MAX;
    this.el.qtyDec.setAttribute('aria-label', qty === 1 ? 'Убрать из корзины' : 'Убрать одну упаковку');
  }
}

const cart = new Cart();
document.querySelectorAll('[data-product]').forEach((root) => new ProductCard(root, cart));
