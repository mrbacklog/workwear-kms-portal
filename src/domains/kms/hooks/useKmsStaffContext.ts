import { useState, useCallback } from 'react';
import type { KmsStaffCustomer } from '../types';

const STORAGE_KEY = 'kms_staff_selected_customer';

export function useKmsStaffContext() {
  const [selectedCustomer, setSelectedCustomer] = useState<KmsStaffCustomer | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as KmsStaffCustomer;
    } catch {
      return null;
    }
  });

  const selectCustomer = useCallback((customer: KmsStaffCustomer) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
    setSelectedCustomer(customer);
  }, []);

  const clearCustomer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedCustomer(null);
  }, []);

  return { selectedCustomer, selectCustomer, clearCustomer };
}
