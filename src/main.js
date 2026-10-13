import { ProductCard } from './components/product-card/product-card.js';
import { CartFab } from './components/cart-fab/cart-fab.js';

document.querySelectorAll('[data-product-card]').forEach((root) => new ProductCard(root));
document.querySelectorAll('[data-cart-fab]').forEach((root) => new CartFab(root));
