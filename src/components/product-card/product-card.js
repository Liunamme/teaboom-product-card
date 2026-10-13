import { PackPicker } from '../pack-picker/pack-picker.js';
import { Price, discountPercent } from '../price/price.js';
import { BuyBox } from '../buy-box/buy-box.js';
import { ProductGallery } from '../product-gallery/product-gallery.js';

export class ProductCard {
  constructor(root) {
    this.sku = root.querySelector('[data-product-sku]');
    this.badge = root.querySelector('[data-discount-badge]');
    this.badgeValue = root.querySelector('[data-discount]');
    this.favorite = root.querySelector('[data-favorite]');

    new ProductGallery(root.querySelector('[data-gallery]'));

    this.price = new Price(root.querySelector('[data-price-panel]'));
    this.picker = new PackPicker(root.querySelector('[data-pack-picker]'), {
      onChange: (pack) => this.render(pack),
    });
    this.buyBox = new BuyBox(root.querySelector('[data-buy-box]'), {
      getPack: () => this.picker.current,
    });

    this.favorite?.addEventListener('click', () => this.toggleFavorite());

    this.render(this.picker.current);
  }

  render(pack) {
    const discount = discountPercent(pack);

    this.sku.textContent = pack.sku;
    this.badge.hidden = discount === 0;
    this.badgeValue.textContent = `−${discount}%`;

    this.price.render(pack);
    this.buyBox.render(pack);
  }

  toggleFavorite() {
    const pressed = this.favorite.getAttribute('aria-pressed') === 'true';
    this.favorite.setAttribute('aria-pressed', String(!pressed));
    this.favorite.setAttribute('aria-label', pressed ? 'Добавить в избранное' : 'Убрать из избранного');
  }
}
