/**
 * Карточка товара: фасовка, цена, количество, добавление в корзину.
 *
 * Все данные берём из разметки (data-* на radio фасовок), так их отдаст
 * Django-шаблон. JS ничего не знает о конкретном товаре и подойдёт
 * для любой карточки с такой же разметкой.
 */

const QTY_MIN = 1;
const QTY_MAX = 99;
const DONE_TIMEOUT = 2000;

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
  const weight = Number(input.dataset.weight);

  return {
    sku: input.value,
    weight,
    price,
    // Старая цена имеет смысл, только если она правда больше текущей
    oldPrice: oldPrice > price ? oldPrice : null,
    label: input.closest('label').querySelector('.pack-picker__weight').textContent.trim(),
  };
};

class ProductCard {
  constructor(root) {
    this.root = root;
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
      qtyInput: root.querySelector('[data-qty-input]'),
      qtyDec: root.querySelector('[data-qty-dec]'),
      qtyInc: root.querySelector('[data-qty-inc]'),
      submit: root.querySelector('[data-add-to-cart]'),
      submitText: root.querySelector('[data-add-to-cart-text]'),
      favorite: root.querySelector('[data-favorite]'),
      zoom: root.querySelector('[data-lightbox-open]'),
    };

    this.cart = new CartWidget();
    this.lightbox = document.querySelector('[data-lightbox]');
    this.doneTimer = null;

    this.bind();
    this.render();
  }

  get currentPack() {
    return readPack(this.packs.find((input) => input.checked) ?? this.packs[0]);
  }

  get qty() {
    return Number(this.el.qtyInput.value);
  }

  bind() {
    this.form.addEventListener('change', (event) => {
      if (event.target.matches('.pack-picker__input')) {
        this.resetSubmit();
        this.render();
        // На телефоне лента фасовок прокручивается, выбранная плитка не должна оставаться за краем
        event.target.closest('.pack-picker__item').scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });

    this.el.qtyDec.addEventListener('click', () => this.setQty(this.qty - 1));
    this.el.qtyInc.addEventListener('click', () => this.setQty(this.qty + 1));
    // Ручной ввод чиним, когда пользователь ушёл из поля, а не на каждую цифру
    this.el.qtyInput.addEventListener('change', () => this.setQty(this.qty));

    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.addToCart();
    });

    this.el.favorite?.addEventListener('click', () => {
      const pressed = this.el.favorite.getAttribute('aria-pressed') === 'true';
      this.el.favorite.setAttribute('aria-pressed', String(!pressed));
      this.el.favorite.setAttribute('aria-label', pressed ? 'Добавить в избранное' : 'Убрать из избранного');
    });

    if (this.lightbox && typeof this.lightbox.showModal === 'function') {
      this.el.zoom?.addEventListener('click', () => this.lightbox.showModal());
      // Клик по затемнению вокруг фото тоже закрывает
      this.lightbox.addEventListener('click', (event) => {
        if (event.target === this.lightbox) this.lightbox.close();
      });
    } else {
      this.el.zoom?.setAttribute('hidden', '');
    }
  }

  setQty(value) {
    const safe = Number.isFinite(value) ? Math.round(value) : QTY_MIN;
    const qty = Math.min(QTY_MAX, Math.max(QTY_MIN, safe));

    this.el.qtyInput.value = qty;
    this.el.qtyDec.disabled = qty <= QTY_MIN;
    this.el.qtyInc.disabled = qty >= QTY_MAX;
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
  }

  addToCart() {
    const pack = this.currentPack;
    const qty = this.qty;

    this.cart.add(qty, `${pack.label}, ${qty} шт`);

    this.el.submit.classList.add('btn--done');
    this.el.submitText.textContent = 'Добавлено';

    clearTimeout(this.doneTimer);
    this.doneTimer = setTimeout(() => this.resetSubmit(), DONE_TIMEOUT);
  }

  resetSubmit() {
    clearTimeout(this.doneTimer);
    this.el.submit.classList.remove('btn--done');
    this.el.submitText.textContent = 'В корзину';
  }
}

// Счётчик корзины. Настоящей корзины нет, просто считаем штуки.
class CartWidget {
  constructor() {
    this.fab = document.querySelector('[data-cart-fab]');
    this.count = this.fab?.querySelector('[data-cart-count]');
    this.status = document.querySelector('[data-cart-status]');
    this.total = 0;
  }

  add(qty, description) {
    this.total += qty;

    if (this.fab) {
      this.fab.hidden = false;
      this.count.textContent = this.total > 99 ? '99+' : String(this.total);

      // Перезапуск анимации: снять класс, дать браузеру перерисовать, вернуть
      this.fab.classList.remove('cart-fab--bump');
      void this.fab.offsetWidth;
      this.fab.classList.add('cart-fab--bump');
    }

    if (this.status) {
      this.status.textContent = `Добавлено в корзину: ${description}. Всего товаров: ${this.total}.`;
    }
  }
}

document.querySelectorAll('[data-product]').forEach((root) => new ProductCard(root));
