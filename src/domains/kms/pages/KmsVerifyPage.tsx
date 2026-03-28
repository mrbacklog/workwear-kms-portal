import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import type { KmsAuthResponse } from '../types';
import { API_BASE } from '@/lib/api';

export default function KmsVerifyPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useKmsAuth();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('Link is ongeldig of verlopen.');
  const verifyCalledRef = useRef(false);

  useEffect(() => {
    // Guard against double-invocation (StrictMode) and missing params
    if (verifyCalledRef.current) return;
    verifyCalledRef.current = true;

    const verify = async () => {
      if (!token) {
        setErrorMessage('Ongeldige URL parameters.');
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/v1/kms/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setErrorMessage((data as { detail?: string }).detail ?? 'Link is ongeldig of verlopen.');
          setStatus('error');
          return;
        }

        const data: KmsAuthResponse = await response.json();
        login(data);
        navigate('/bestellen', { replace: true });
      } catch {
        setErrorMessage('Er is een verbindingsfout opgetreden. Probeer het opnieuw.');
        setStatus('error');
      }
    };

    void verify();
  }, [token, navigate, login]);

  return (
    <KmsLayout>
      <div style={{ textAlign: 'center', paddingTop: 64 }}>
        {status === 'loading' && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                border: `3px solid ${kmsColors.lightGray}`,
                borderTopColor: kmsColors.orange,
                borderRadius: '50%',
                animation: 'kms-spin 0.7s linear infinite',
                margin: '0 auto',
              }}
            />
            <p
              style={{
                fontFamily: kmsFont,
                fontSize: 15,
                color: '#666666',
                marginTop: 20,
              }}
            >
              Link wordt gecontroleerd...
            </p>
          </>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>

            <h2
              style={{
                fontFamily: kmsFont,
                fontSize: 20,
                fontWeight: 700,
                color: kmsColors.black,
                marginTop: 20,
              }}
            >
              Link ongeldig
            </h2>

            <p
              style={{
                fontFamily: kmsFont,
                fontSize: 15,
                color: '#666666',
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              {errorMessage}
            </p>

            <Link
              to="/"
              style={{
                display: 'inline-block',
                marginTop: 28,
                fontFamily: kmsFont,
                fontSize: 15,
                fontWeight: 600,
                color: kmsColors.cyan,
                textDecoration: 'none',
              }}
            >
              Terug naar aanmelden
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes kms-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </KmsLayout>
  );
}
