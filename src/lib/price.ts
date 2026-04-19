// Tiny pricing helper used by the /boom demo route. The planted bug is a
// single-line substitution on the `line` function below. Both `plant-bug.ts`
// and `reset-bug.ts` target the `HEALTHY: do not remove` marker so the swap
// is unambiguous.

export interface CartItem {
  readonly id: string;
  readonly qty: number;
  readonly price: number;
}

// HEALTHY: do not remove
const line = (item: CartItem) => item.price * item.qty;

export function computeTotal(cart: ReadonlyArray<CartItem>): number {
  return cart.reduce((sum, item) => sum + line(item), 0);
}

export function demoCart(): ReadonlyArray<CartItem> {
  return [
    { id: "sku-1", qty: 2, price: 9.99 },
    { id: "sku-2", qty: 1, price: 24.5 },
    { id: "sku-3", qty: 3, price: 4.25 },
  ];
}
