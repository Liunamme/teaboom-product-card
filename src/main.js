import { initProductCard } from './components/product-card/product-card.js';
import { initCartFab } from './components/cart-fab/cart-fab.js';

document.querySelectorAll('[data-product-card]').forEach(initProductCard);
document.querySelectorAll('[data-cart-fab]').forEach(initCartFab);
