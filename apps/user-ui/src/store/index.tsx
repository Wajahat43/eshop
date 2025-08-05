import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Product = {
  id: string;
  title: string;
  quantity: number;
  shopId: string;
  image: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];

  addToCart: (Product: Product, user: any, location: any, deviceInfo: string) => void;
  removeFromCart: (id: string, user: any, location: any, deviceInfo: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product, user: any, location: any, deviceInfo: string) => void;
  removeFromWishlist: (id: string, user: any, location: any, deviceInfo: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const cart = get().cart;
          const existingProduct = cart.find((p) => p.id === product.id);

          if (existingProduct) {
            return {
              cart: state.cart.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)),
            };
          } else {
            return {
              cart: [...state.cart, { ...product, quantity: 1 }],
            };
          }
        });
      },

      setCartQuantity: (productId, quantity) => {
        set((state) => ({
          cart: state.cart.map((p) => (p.id === productId ? { ...p, quantity } : p)),
        }));
      },

      removeFromCart: (id, user, location, deviceInfo) => {
        const toRemove = get().cart.find((p) => p.id === id);
        if (toRemove) {
          set((state) => ({
            cart: state.cart?.filter((p) => p.id !== id) || [],
          }));
        }
      },

      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => {
          if (state.wishlist.find((p) => p.id === product.id)) {
            return state;
          } else {
            return {
              wishlist: [...state.wishlist, { ...product }],
            };
          }
        });
      },

      removeFromWishlist: (id, user, location, deviceInfo) => {
        const toRemove = get().wishlist.find((p) => p.id === id);
        set((state) => ({
          wishlist: state.wishlist.filter((p) => p.id !== id),
        }));
      },
    }),
    { name: 'cart-store' },
  ),
);
