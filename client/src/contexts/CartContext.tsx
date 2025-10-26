import { createContext, useContext, useState } from 'react';
import type { MenuItem } from '@shared/schema';

interface CartProviderProps {
  children: React.ReactNode;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number, customizations?: string) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateCustomizations: (menuItemId: number, customizations: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08; // 8% tax

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (menuItem: MenuItem, quantity: number = 1, customizations?: string) => {
    setItems(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id && item.customizations === customizations);
      if (existing) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id && item.customizations === customizations
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { menuItem, quantity, customizations }];
    });
  };

  const removeItem = (menuItemId: number) => {
    setItems(prev => prev.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateCustomizations = (menuItemId: number, customizations: string) => {
    setItems(prev =>
      prev.map(item =>
        item.menuItem.id === menuItemId ? { ...item, customizations } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.menuItem.price);
      return sum + price * item.quantity;
    }, 0);
  };

  const getTax = () => {
    return getSubtotal() * TAX_RATE;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateCustomizations,
        clearCart,
        getItemCount,
        getSubtotal,
        getTax,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
