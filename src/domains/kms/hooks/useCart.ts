import { useState, useCallback } from 'react';
import type { CartItem, CartState } from '../types';

function computeTotals(items: CartItem[]): { totalItems: number; totalCents: number } {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0),
  };
}

interface AddItemParams {
  variantId: string;
  modelName: string;
  color: string;
  size: string;
  ean: string;
  priceCents: number;
}

interface AddGrippItemParams {
  grippProductId: string;
  modelName: string;
  priceCents: number;
}

interface UseCartReturn {
  cart: CartState;
  addItem: (params: AddItemParams) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number, meta?: Omit<AddItemParams, 'variantId'>) => void;
  setGrippQuantity: (grippProductId: string, quantity: number, meta?: Omit<AddGrippItemParams, 'grippProductId'>) => void;
  clearCart: () => void;
  getQuantityForVariant: (variantId: string) => number;
  getQuantityForGripp: (grippProductId: string) => number;
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((params: AddItemParams) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === params.variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === params.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          variantId: params.variantId,
          modelName: params.modelName,
          color: params.color,
          size: params.size,
          ean: params.ean,
          quantity: 1,
          priceCents: params.priceCents,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.variantId !== variantId);
      }
      return prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity: item.quantity - 1 } : item,
      );
    });
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number, meta?: Omit<AddItemParams, 'variantId'>) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.variantId !== variantId);
      }
      const existing = prev.find((item) => item.variantId === variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item,
        );
      }
      // Item not in cart yet — add it with provided metadata
      if (meta) {
        return [...prev, { variantId, quantity, ...meta }];
      }
      return prev;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const setGrippQuantity = useCallback((grippProductId: string, quantity: number, meta?: Omit<AddGrippItemParams, 'grippProductId'>) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.grippProductId !== grippProductId);
      }
      const existing = prev.find((item) => item.grippProductId === grippProductId);
      if (existing) {
        return prev.map((item) =>
          item.grippProductId === grippProductId ? { ...item, quantity } : item,
        );
      }
      if (meta) {
        return [
          ...prev,
          {
            variantId: `gripp:${grippProductId}`,
            grippProductId,
            modelName: meta.modelName,
            color: '',
            size: '',
            ean: '',
            quantity,
            priceCents: meta.priceCents,
          },
        ];
      }
      return prev;
    });
  }, []);

  const getQuantityForVariant = useCallback(
    (variantId: string): number => {
      return items.find((item) => item.variantId === variantId)?.quantity ?? 0;
    },
    [items],
  );

  const getQuantityForGripp = useCallback(
    (grippProductId: string): number => {
      return items.find((item) => item.grippProductId === grippProductId)?.quantity ?? 0;
    },
    [items],
  );

  const totals = computeTotals(items);

  const cart: CartState = {
    items,
    totalItems: totals.totalItems,
    totalCents: totals.totalCents,
  };

  return { cart, addItem, removeItem, setQuantity, setGrippQuantity, clearCart, getQuantityForVariant, getQuantityForGripp };
}
