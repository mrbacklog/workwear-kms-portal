import type { KmsAuthResponse } from '../types';

// Eenmalige migratie van sessionStorage naar localStorage
const STORAGE_KEYS = ['kms_token', 'kms_customer_name', 'kms_customer_slug'] as const;
STORAGE_KEYS.forEach(key => {
  if (sessionStorage.getItem(key) && !localStorage.getItem(key)) {
    localStorage.setItem(key, sessionStorage.getItem(key)!);
  }
  sessionStorage.removeItem(key);
});

export function useKmsAuth() {
  const token = localStorage.getItem('kms_token');
  const customerName = localStorage.getItem('kms_customer_name');
  const customerSlug = localStorage.getItem('kms_customer_slug');

  const isAuthenticated = !!token;

  const login = (authResponse: KmsAuthResponse) => {
    localStorage.setItem('kms_token', authResponse.access_token);
    localStorage.setItem('kms_customer_name', authResponse.customer_name);
    localStorage.setItem('kms_customer_slug', authResponse.customer_slug);
    if (authResponse.refresh_token) {
      localStorage.setItem('kms_refresh_token', authResponse.refresh_token);
    }
    if (authResponse.expires_in !== undefined) {
      localStorage.setItem('kms_token_expiry', String(Date.now() + authResponse.expires_in * 1000));
    }
  };

  const logout = () => {
    localStorage.removeItem('kms_token');
    localStorage.removeItem('kms_customer_name');
    localStorage.removeItem('kms_customer_slug');
    localStorage.removeItem('kms_refresh_token');
    localStorage.removeItem('kms_token_expiry');
  };

  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  return { isAuthenticated, token, customerName, customerSlug, login, logout, authHeader };
}
