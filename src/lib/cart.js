export const CART_MAX_QTY = 99;

class Cart {
  #items = new Map();
  #listeners = new Set();

  get(sku) {
    return this.#items.get(sku) ?? 0;
  }

  get total() {
    let total = 0;
    this.#items.forEach((qty) => { total += qty; });
    return total;
  }

  set(sku, qty) {
    const next = Math.min(CART_MAX_QTY, Math.max(0, qty));
    if (next === this.get(sku)) return;

    if (next === 0) this.#items.delete(sku);
    else this.#items.set(sku, next);

    this.#listeners.forEach((listener) => listener({ sku, qty: next, total: this.total }));
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}

export const cart = new Cart();
