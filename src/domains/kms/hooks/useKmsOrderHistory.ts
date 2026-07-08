import { useState, useEffect } from 'react';
import { kmsApiBase } from '../lib/kms-theme';
import { kmsAuthFetch } from '../lib/kms-auth-fetch';
import type { KmsPersonHistoryRecord, KmsPersonHistoryResponse } from '../types';

interface UseKmsOrderHistoryReturn {
  history: KmsPersonHistoryRecord[];
  loading: boolean;
}

/**
 * Laadt de (ean, maat, persoon)-bestelhistorie van de klant, één keer per mount.
 * Volgt het bestaande lokale KMS-patroon (useState + kmsAuthFetch), geen React Query.
 */
export function useKmsOrderHistory(): UseKmsOrderHistoryReturn {
  const [history, setHistory] = useState<KmsPersonHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await kmsAuthFetch(`${kmsApiBase}/api/v1/kms/persons/history`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as KmsPersonHistoryResponse;
        if (!cancelled) setHistory(data.history ?? []);
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { history, loading };
}
