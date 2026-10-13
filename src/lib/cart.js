export const CART_MAX_QTY = 99;

const items = new Map();
const listeners = new Set();

export const getQty = (sku) => items.get(sku) ?? 0;

export const getTotal = () => [...items.values()].reduce((sum, qty) => sum + qty, 0);

export const setQty = (sku, qty) => {
  const next = Math.min(CART_MAX_QTY, Math.max(0, qty));
  if (next === getQty(sku)) return;

  if (next === 0) items.delete(sku);
  else items.set(sku, next);

  listeners.forEach((listener) => listener({ sku, qty: next, total: getTotal() }));
};

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
