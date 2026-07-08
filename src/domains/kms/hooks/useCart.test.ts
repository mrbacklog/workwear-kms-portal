// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';

const META = { modelName: 'Testmodel', color: 'Zwart', size: '52', ean: '111', priceCents: 1000 };
const PERSON_A = { id: 'p1', name: 'Kees' };
const PERSON_B = { id: 'p2', name: 'Bram' };

describe('useCart.addPersonToLine', () => {
  it('maakt een nieuwe regel aan met de persoon getagd als de variant nog niet in de mand zit', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addPersonToLine('v1', 2, PERSON_A, META));
    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].quantity).toBe(2);
    expect(result.current.cart.items[0].persons).toEqual([PERSON_A]);
  });

  it('telt qty cumulatief op en voegt een tweede persoon toe naast de eerste', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addPersonToLine('v1', 2, PERSON_A, META));
    act(() => result.current.addPersonToLine('v1', 3, PERSON_B, META));
    const item = result.current.cart.items[0];
    expect(item.quantity).toBe(5);
    expect(item.persons).toEqual([PERSON_A, PERSON_B]);
  });

  it('voegt dezelfde persoon niet dubbel toe, maar telt qty wel op', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addPersonToLine('v1', 2, PERSON_A, META));
    act(() => result.current.addPersonToLine('v1', 1, PERSON_A, META));
    const item = result.current.cart.items[0];
    expect(item.quantity).toBe(3);
    expect(item.persons).toEqual([PERSON_A]);
  });
});
