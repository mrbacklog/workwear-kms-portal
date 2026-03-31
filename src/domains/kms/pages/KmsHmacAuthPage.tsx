/**
 * HMAC Auth Page — Verwerkt HMAC-gesignde links uit e-mails.
 *
 * Haalt query params op, stuurt naar backend ter validatie,
 * slaat tokens op bij succes en redirect naar bestemming.
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { kmsColors, kmsFont, kmsApiBase, KMS_DEFAULT_SLUG, isKmsPortal } from '../lib/kms-theme';

export default function KmsHmacAuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useKmsAuth();

  const slug = KMS_DEFAULT_SLUG;

  const initialError = (() => {
    const c = searchParams.get('c');
    const e = searchParams.get('e');
    const exp = searchParams.get('exp');
    const sig = searchParams.get('sig');
    if (!c || !e || !exp || !sig) return 'Ongeldige link.';
    return null;
  })();

  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(initialError === null);

  useEffect(() => {
    if (initialError) return;

    const c = searchParams.get('c')!;
    const e = searchParams.get('e')!;
    const d = searchParams.get('d') || '/bestellen';
    const exp = searchParams.get('exp')!;
    const sig = searchParams.get('sig')!;

    (async () => {
      try {
        const res = await fetch(
          `${kmsApiBase}/api/v1/kms/auth/hmac?c=${encodeURIComponent(c)}&e=${encodeURIComponent(e)}&d=${encodeURIComponent(d)}&exp=${encodeURIComponent(exp)}&sig=${encodeURIComponent(sig)}`,
        );

        if (!res.ok) {
          setError('Deze link is verlopen of ongeldig. Vraag een nieuwe aan.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        login(data);

        // Redirect naar bestemming
        const dest = isKmsPortal ? d : `/kms/${slug}${d === '/' ? '' : d}`;
        navigate(dest, { replace: true });
      } catch {
        setError('Er is een fout opgetreden. Probeer het opnieuw.');
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: kmsColors.bg, fontFamily: kmsFont,
      }}>
        <p style={{ color: kmsColors.text }}>Inloggen...</p>
      </div>
    );
  }

  if (error) {
    const loginPath = isKmsPortal ? '/' : `/kms/${slug}`;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', background: kmsColors.bg,
        fontFamily: kmsFont, padding: 32,
      }}>
        <p style={{ color: kmsColors.error, marginBottom: 16 }}>{error}</p>
        <a href={loginPath} style={{ color: kmsColors.orange, textDecoration: 'none' }}>
          Terug naar inloggen
        </a>
      </div>
    );
  }

  return null;
}
