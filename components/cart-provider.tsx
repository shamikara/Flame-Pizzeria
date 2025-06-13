"use client"

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

// --- TYPES ---
// Note the new `cartItemId` and using `productId` for clarity
export interface CartItem {
  cartItemId: string; // A unique ID for this specific line item in the cart
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customizations: {
    id: number;
    name:string;
    price: number;
  }[];
}

// Type for the data passed when adding a new item
type NewItemData = Omit<CartItem, 'cartItemId' | 'quantity'>;

interface CartContextType {
  cart: CartItem[];
  addToCart: (itemData: NewItemData, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

// --- CONTEXT & PROVIDER ---
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("shopping-cart");
      if (storedCart) setCart(JSON.parse(storedCart));
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shopping-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItemData: NewItemData, quantity: number) => {
    setCart(prevCart => {
      // Sort customizations to ensure order doesn't matter for comparison
      const sortedCustomizations = [...newItemData.customizations].sort((a, b) => a.id - b.id);
      const customizationsString = JSON.stringify(sortedCustomizations);

      const existingItem = prevCart.find(
        item => item.productId === newItemData.productId && JSON.stringify([...item.customizations].sort((a,b) => a.id - b.id)) === customizationsString
      );

      if (existingItem) {
        // If an identical item (with same customizations) exists, just update its quantity
        return prevCart.map(item =>
          item.cartItemId === existingItem.cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // If it's a new item or has different customizations, add it as a new line item
        const newCartItem: CartItem = {
          ...newItemData,
          customizations: sortedCustomizations,
          quantity,
          cartItemId: `cart_item_${Date.now()}_${Math.random()}`, // Create a unique ID
        };
        return [...prevCart, newCartItem];
      }
    });
    toast({
      title: "Added to cart!",
      description: `${newItemData.name} is now in your cart.`,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.cartItemId !== cartItemId);
      }
      return prevCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate subtotal using useMemo for efficiency
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const customizationsPrice = item.customizations.reduce((sum, cust) => sum + cust.price, 0);
      return total + (item.price + customizationsPrice) * item.quantity;
    }, 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

// --- HOOK ---
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}