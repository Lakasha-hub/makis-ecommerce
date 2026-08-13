import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  spec: string;
  price: number;
  image: string | null;
  stock: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'makis-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch { /* ignore corrupted cart */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const clampQty = (item: CartItem, qty: number) =>
      Math.max(1, Math.min(qty, item.stock > 0 ? item.stock : 1));
    return {
      items,
      count: items.reduce((acc, i) => acc + i.qty, 0),
      total: items.reduce((acc, i) => acc + i.qty * i.price, 0),
      add: (item, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.variantId === item.variantId);
          if (existing) {
            return prev.map((i) => i.variantId === item.variantId ? { ...i, qty: clampQty(i, i.qty + qty) } : i);
          }
          const next: CartItem = { ...item, qty };
          return [...prev, { ...next, qty: clampQty(next, qty) }];
        }),
      remove: (variantId) => setItems((prev) => prev.filter((i) => i.variantId !== variantId)),
      setQty: (variantId, qty) =>
        setItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, qty: clampQty(i, qty) } : i)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
