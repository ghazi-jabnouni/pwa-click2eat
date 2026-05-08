import { useState, useEffect } from 'react';
import type { CartItem, FoodItem, SelectedOption } from '../types/food';

const CART_STORAGE_KEY = 'click2eat_cart';

export const useCart = () => {
  // Initialize from localStorage if available
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (foodItem: FoodItem, quantity: number = 1, selectedOptions?: SelectedOption[]) => {
    setItems(prevItems => {
      // Calculate total price with options
      const optionsPrice = selectedOptions?.reduce((sum, option) => sum + option.price, 0) || 0;
      const itemTotalPrice = foodItem.price + optionsPrice;
      
      const existingItem = prevItems.find(item => 
        item.id === foodItem.id && 
        JSON.stringify(item.selectedOptions?.map(opt => opt.optionId).sort() || []) === 
        JSON.stringify(selectedOptions?.map(opt => opt.optionId).sort() || [])
      );
      
      if (existingItem) {
        const updatedItems = prevItems.map(item =>
          item.id === foodItem.id && 
          JSON.stringify(item.selectedOptions?.map(opt => opt.optionId).sort() || []) === 
          JSON.stringify(selectedOptions?.map(opt => opt.optionId).sort() || [])
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        return updatedItems;
      }
      
      const newItems = [...prevItems, { 
        ...foodItem, 
        quantity, 
        selectedOptions, 
        totalPrice: itemTotalPrice 
      }];
      return newItems;
    });
  };

  const removeItem = (uniqueId: string) => {
    setItems(prevItems => prevItems.filter(item => {
      const optionsKey = item.selectedOptions?.map(opt => opt.optionId).sort().join(',') || '';
      const itemUniqueId = `${item.id}-${optionsKey}`;
      return itemUniqueId !== uniqueId;
    }));
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(uniqueId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item => {
        const optionsKey = item.selectedOptions?.map(opt => opt.optionId).sort().join(',') || '';
        const itemUniqueId = `${item.id}-${optionsKey}`;
        return itemUniqueId === uniqueId ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.totalPrice || item.price) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems,
  };
};
