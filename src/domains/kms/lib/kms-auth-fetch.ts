/**
 * KMS auth-aware fetch wrapper met automatische token refresh.
 *
 * - Voegt Authorization header toe
 * - Bij 401: probeert refresh via refresh token, dan retry
 * - Singleton pattern voorkomt concurrent refreshes
 * - Bij refresh failure: clear auth, redirect naar login
 */

import { kmsApiBase } from './kms-theme';

// Storage keys (matchen met useKmsAuth)
const TOKEN_KEY = 'kms_token';
const REFRESH_KEY = 'kms_refresh_token';
const EXPIRY_KEY = 'kms_token_expiry';
const NAME_KEY = 'kms_customer_name';
const SLUG_KEY = 'kms_customer_slug';

// Singleton voor concurrent refresh
let refreshPromise: Promise<boolean> | null = null;

/**
 * Probeer het access token te vernieuwen via het refresh token.
 * Returns true bij succes, false bij failure.
 */
async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${kmsApiBase}/api/v1/kms/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return false;
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
    }
    if (data.expires_in !== undefined) {
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + data.expires_in * 1000));
    }
    if (data.customer_name) {
      localStorage.setItem(NAME_KEY, data.customer_name);
    }
    if (data.customer_slug) {
      localStorage.setItem(SLUG_KEY, data.customer_slug);
    }
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

function clearAuth(): void {
  [TOKEN_KEY, REFRESH_KEY, EXPIRY_KEY, NAME_KEY, SLUG_KEY].forEach(k =>
    localStorage.removeItem(k),
  );
}

/**
 * Auth-aware fetch voor KMS endpoints.
 * Voegt Bearer token toe, probeert refresh bij 401.
 */
export async function kmsAuthFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...init, headers });

  // Bij 401: probeer refresh (singleton)
  if (response.status === 401 && localStorage.getItem(REFRESH_KEY)) {
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const success = await refreshPromise;
    if (success) {
      // Retry met nieuw token
      const newToken = localStorage.getItem(TOKEN_KEY);
      const retryHeaders = new Headers(init?.headers);
      if (newToken) {
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
      }
      return fetch(url, { ...init, headers: retryHeaders });
    }
  }

  return response;
}
