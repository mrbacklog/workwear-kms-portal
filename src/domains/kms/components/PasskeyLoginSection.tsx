import { useState, useEffect } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { isPasskeyAvailable, authenticateWithPasskey } from '../lib/kms-passkey';
import type { KmsAuthResponse } from '../types';

interface PasskeyLoginSectionProps {
  onSuccess: (response: KmsAuthResponse) => void;
}

export function PasskeyLoginSection({ onSuccess }: PasskeyLoginSectionProps) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void isPasskeyAvailable().then(setAvailable);
  }, []);

  if (!available) return null;

  async function handlePasskeyLogin() {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticateWithPasskey();
      if (result) {
        onSuccess({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          customer_name: result.customer_name,
          customer_slug: result.customer_slug,
          expires_in: result.expires_in,
        });
      } else {
        setError('Inloggen met vingerafdruk mislukt. Gebruik uw e-mailadres.');
      }
    } catch {
      setError('Inloggen met vingerafdruk mislukt. Gebruik uw e-mailadres.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: kmsFont }}>
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: kmsColors.textSecondary,
          marginTop: 0,
          marginBottom: 10,
          letterSpacing: '0.3px',
        }}
      >
        Inloggen met vingerafdruk
      </p>

      <button
        onClick={() => void handlePasskeyLogin()}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: loading ? 'rgba(255,255,255,0.12)' : kmsColors.orange,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: kmsFont,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: loading ? 'none' : '0 4px 12px rgba(241,142,0,0.35)',
          transition: 'background 150ms ease, box-shadow 150ms ease',
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'kms-spin 0.7s linear infinite',
              }}
            />
            Even geduld...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2c0 .74.4 1.38 1 1.72V17h2v-4.28c.6-.34 1-.98 1-1.72z" />
              <path d="M12 2C7.58 2 4 5.58 4 10c0 2.03.76 3.87 2 5.28V20h2v-2h8v2h2v-4.72c1.24-1.41 2-3.25 2-5.28 0-4.42-3.58-8-8-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Vingerafdruk gebruiken
          </>
        )}
      </button>

      {error && (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 13,
            color: kmsColors.error,
            fontFamily: kmsFont,
          }}
        >
          {error}
        </p>
      )}

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '24px 0',
        }}
      >
        <div style={{ flex: 1, height: 1, background: kmsColors.border }} />
        <span
          style={{
            fontSize: 12,
            color: kmsColors.textMuted,
            fontFamily: kmsFont,
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}
        >
          of
        </span>
        <div style={{ flex: 1, height: 1, background: kmsColors.border }} />
      </div>

      <style>{`
        @keyframes kms-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
