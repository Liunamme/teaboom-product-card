import { initPackPicker } from '../pack-picker/pack-picker.js';
import { initPrice, discountPercent } from '../price/price.js';
import { initBuyBox } from '../buy-box/buy-box.js';
import { initProductGallery } from '../product-gallery/product-gallery.js';

const initFavorite = (button) => {
  button?.addEventListener('click', () => {
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!pressed));
    button.setAttribute('aria-label', pressed ? 'Добавить в избранное' : 'Убрать из избранного');
  });
};

export const initProductCard = (root) => {
  const sku = root.querySelector('[data-product-sku]');
  const badge = root.querySelector('[data-discount-badge]');
  const badgeValue = root.querySelector('[data-discount]');

  initProductGallery(root.querySelector('[data-gallery]'));
  initFavorite(root.querySelector('[data-favorite]'));

  const price = initPrice(root.querySelector('[data-price-panel]'));

  const render = (pack) => {
    const discount = discountPercent(pack);

    sku.textContent = pack.sku;
    badge.hidden = discount === 0;
    badgeValue.textContent = `−${discount}%`;

    price.render(pack);
    buyBox.render(pack);
  };

  const picker = initPackPicker(root.querySelector('[data-pack-picker]'), { onChange: render });
  const buyBox = initBuyBox(root.querySelector('[data-buy-box]'), { getPack: picker.getCurrent });

  render(picker.getCurrent());
};
