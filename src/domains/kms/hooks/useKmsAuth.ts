import type { KmsAuthResponse } from '../types';

export function useKmsAuth() {
  const token = sessionStorage.getItem('kms_token');
  const customerName = sessionStorage.getItem('kms_customer_name');
  const customerSlug = sessionStorage.getItem('kms_customer_slug');

  const isAuthenticated = !!token;

  const login = (authResponse: KmsAuthResponse) => {
    sessionStorage.setItem('kms_token', authResponse.access_token);
    sessionStorage.setItem('kms_customer_name', authResponse.customer_name);
    sessionStorage.setItem('kms_customer_slug', authResponse.customer_slug);
  };

  const logout = () => {
    sessionStorage.removeItem('kms_token');
    sessionStorage.removeItem('kms_customer_name');
    sessionStorage.removeItem('kms_customer_slug');
  };

  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  return { isAuthenticated, token, customerName, customerSlug, login, logout, authHeader };
}
