import { createContext, useContext, useState } from 'react';
import type { MenuItem } from '@shared/schema';

interface CartProviderProps {
  children: React.ReactNode;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations?: string;
  selectedSize?: string; // Selected size variant (e.g., "Small", "Medium", "Large")
}

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number, customizations?: string, selectedSize?: string) => void;
  removeItem: (menuItemId: number, selectedSize?: string) => void;
  updateQuantity: (menuItemId: number, quantity: number, selectedSize?: string) => void;
  updateCustomizations: (menuItemId: number, customizations: string, selectedSize?: string) => void;
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

  const addItem = (menuItem: MenuItem, quantity: number = 1, customizations?: string, selectedSize?: string) => {
    setItems(prev => {
      const existing = prev.find(item => 
        item.menuItem.id === menuItem.id && 
        item.customizations === customizations &&
        item.selectedSize === selectedSize
      );
      if (existing) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id && 
          item.customizations === customizations &&
          item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { menuItem, quantity, customizations, selectedSize }];
    });
  };

  const removeItem = (menuItemId: number, selectedSize?: string) => {
    setItems(prev => prev.filter(item => 
      !(item.menuItem.id === menuItemId && item.selectedSize === selectedSize)
    ));
  };

  const updateQuantity = (menuItemId: number, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeItem(menuItemId, selectedSize);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.menuItem.id === menuItemId && item.selectedSize === selectedSize 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const updateCustomizations = (menuItemId: number, customizations: string, selectedSize?: string) => {
    setItems(prev =>
      prev.map(item =>
        item.menuItem.id === menuItemId && item.selectedSize === selectedSize 
          ? { ...item, customizations } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Helper function to calculate price with size modifier
  const getItemPrice = (item: CartItem): number => {
    const basePrice = parseFloat(item.menuItem.price);
    
    // If no size selected or no size variants available, return base price
    if (!item.selectedSize || !item.menuItem.sizeVariants) {
      return basePrice;
    }

    // Find the price modifier for the selected size
    const sizeVariants = item.menuItem.sizeVariants as Array<{ name: string; priceModifier: string }>;
    const selectedVariant = sizeVariants.find(v => v.name === item.selectedSize);
    
    if (selectedVariant) {
      const priceModifier = parseFloat(selectedVariant.priceModifier);
      return basePrice + priceModifier;
    }

    return basePrice;
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = getItemPrice(item);
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
