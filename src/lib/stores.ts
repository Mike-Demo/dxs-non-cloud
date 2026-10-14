import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/lib/data/schemas";

interface CartState {
  lines: CartLine[];
  add: (variantId: string, quantity: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (variantId, quantity) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === variantId);
          if (existing) return { lines: s.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l)) };
          return { lines: [...s.lines, { variantId, quantity }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({ lines: s.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(1, Math.min(99, quantity)) } : l)) })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "dxs:cart", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      productIds: [],
      toggle: (id) => set((s) => ({ productIds: s.productIds.includes(id) ? s.productIds.filter((x) => x !== id) : [...s.productIds, id] })),
      remove: (id) => set((s) => ({ productIds: s.productIds.filter((x) => x !== id) })),
    }),
    { name: "dxs:wishlist", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export const rehydrateStores = (): void => {
  void useCart.persist.rehydrate();
  void useWishlist.persist.rehydrate();
};
