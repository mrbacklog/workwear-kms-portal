import type { KmsAuthResponse } from '../types';

export function useKmsAuth() {
  const token = localStorage.getItem('kms_token');
  const customerName = localStorage.getItem('kms_customer_name');
  const customerSlug = localStorage.getItem('kms_customer_slug');

  const isAuthenticated = !!token;

  const login = (authResponse: KmsAuthResponse) => {
    localStorage.setItem('kms_token', authResponse.access_token);
    localStorage.setItem('kms_customer_name', authResponse.customer_name);
    localStorage.setItem('kms_customer_slug', authResponse.customer_slug);
  };

  const logout = () => {
    localStorage.removeItem('kms_token');
    localStorage.removeItem('kms_customer_name');
    localStorage.removeItem('kms_customer_slug');
  };

  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  return { isAuthenticated, token, customerName, customerSlug, login, logout, authHeader };
}
