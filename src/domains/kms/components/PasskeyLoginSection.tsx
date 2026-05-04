import { useState, useEffect, useContext } from 'react';
import { kmsColors, kmsFont, isPasskeyHost } from '../lib/kms-theme';
import { isPasskeyAvailable, authenticateWithPasskey } from '../lib/kms-passkey';
import { BolusModeContext } from '../lib/kms-bolus-context';
import type { KmsAuthResponse } from '../types';

interface PasskeyLoginSectionProps {
  onSuccess: (response: KmsAuthResponse) => void;
}

export function PasskeyLoginSection({ onSuccess }: PasskeyLoginSectionProps) {
  const { t } = useContext(BolusModeContext);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPasskeyHost) return;
    void isPasskeyAvailable().then(setAvailable);
  }, []);

  // Passkeys zijn gebonden aan WebAuthn RP_ID (zie kms-theme.ts). Op andere
  // portal-hosts (bijv. kleding.vankruiningen.nl) zou registratie/login direct
  // falen, dus tonen we de UI niet.
  if (!isPasskeyHost || !available) return null;

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
        setError(t('passkey.error'));
      }
    } catch {
      setError(t('passkey.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: kmsFont }}>
      <button
        onClick={() => void handlePasskeyLogin()}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: loading ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: loading ? kmsColors.textMuted : kmsColors.text,
          border: `1.5px solid ${loading ? kmsColors.textMuted : kmsColors.textSecondary}`,
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: kmsFont,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'border-color 150ms ease, color 150ms ease',
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
            {t('passkey.loading')}
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 7.5C15.5 9.433 13.933 11 12 11S8.5 9.433 8.5 7.5 10.067 4 12 4s3.5 1.567 3.5 3.5z" />
              <path d="M12 14c-3 0-5 1.5-5 3.5V20h10v-2.5c0-2-2-3.5-5-3.5z" />
              <path d="M18 8l2 2 4-4" />
            </svg>
            {t('passkey.button')}
          </>
        )}
      </button>

      {!error && (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 12,
            color: kmsColors.textMuted,
            fontFamily: kmsFont,
            textAlign: 'center',
          }}
        >
          {t('passkey.hint')}
        </p>
      )}

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
          {t('passkey.divider')}
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
