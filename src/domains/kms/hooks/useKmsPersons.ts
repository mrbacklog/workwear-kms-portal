import { useState, useEffect, useCallback } from 'react';
import { kmsApiBase } from '../lib/kms-theme';
import { kmsAuthFetch } from '../lib/kms-auth-fetch';
import type { KmsPerson } from '../types';

interface UseKmsPersonsReturn {
  persons: KmsPerson[];
  loading: boolean;
  error: string | null;
  fetchPersons: () => Promise<void>;
  createPerson: (name: string) => Promise<KmsPerson | null>;
  deletePerson: (id: string) => Promise<boolean>;
}

/**
 * Beheert de per-klant herbruikbare personenlijst voor het taggen van bestelregels.
 * Volgt het bestaande lokale KMS-patroon (useState + kmsAuthFetch), geen React Query.
 */
export function useKmsPersons(): UseKmsPersonsReturn {
  const [persons, setPersons] = useState<KmsPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await kmsAuthFetch(`${kmsApiBase}/api/v1/kms/persons`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as KmsPerson[];
      setPersons(data ?? []);
    } catch {
      setError('Kon personen niet laden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPersons();
  }, [fetchPersons]);

  const createPerson = useCallback(async (name: string): Promise<KmsPerson | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    try {
      const res = await kmsAuthFetch(`${kmsApiBase}/api/v1/kms/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const person = (await res.json()) as KmsPerson;
      setPersons((prev) => [...prev, person]);
      return person;
    } catch {
      setError('Kon persoon niet aanmaken.');
      return null;
    }
  }, []);

  const deletePerson = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await kmsAuthFetch(`${kmsApiBase}/api/v1/kms/persons/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPersons((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      setError('Kon persoon niet verwijderen.');
      return false;
    }
  }, []);

  return { persons, loading, error, fetchPersons, createPerson, deletePerson };
}
