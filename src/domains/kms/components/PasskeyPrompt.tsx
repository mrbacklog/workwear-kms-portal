import { useState, useEffect } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { isPasskeyAvailable, registerPasskey } from '../lib/kms-passkey';

const DISMISSED_KEY = 'kms_passkey_dismissed';

interface PasskeyPromptProps {
  authToken: string;
  onDismiss?: () => void;
}

export function PasskeyPrompt({ authToken, onDismiss }: PasskeyPromptProps) {
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISSED_KEY));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dismissed) return;
    void isPasskeyAvailable().then(setAvailable);
  }, [dismissed]);

  if (!available || dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
    onDismiss?.();
  }

  async function handleSetup() {
    setLoading(true);
    setError(null);
    const ok = await registerPasskey(authToken);
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        localStorage.setItem(DISMISSED_KEY, '1');
        setDismissed(true);
      }, 2000);
    } else {
      setError('Instellen mislukt. Probeer het later opnieuw.');
    }
  }

  if (success) {
    return (
      <div
        style={{
          marginTop: 24,
          padding: '16px 20px',
          background: kmsColors.successBg,
          border: `1.5px solid rgba(0,136,56,0.3)`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: kmsFont,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: kmsColors.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontSize: 14, color: kmsColors.green, fontWeight: 500 }}>
          Vingerafdruk ingesteld!
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 24,
        padding: '20px',
        background: kmsColors.surface,
        border: `1.5px solid rgba(241,142,0,0.3)`,
        borderRadius: 14,
        fontFamily: kmsFont,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(241,142,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={kmsColors.orange} strokeWidth="2">
            <path d="M12 2C9.79 2 8 3.79 8 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v2h-4V6c0-1.1.9-2 2-2zm0 8a2 2 0 110 4 2 2 0 010-4z" />
          </svg>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: kmsColors.text,
              marginBottom: 4,
            }}
          >
            Sneller inloggen?
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: kmsColors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            Stel vingerafdruk of Face ID in zodat u volgende keer direct kunt bestellen.
          </p>
        </div>
      </div>

      {error && (
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 13,
            color: kmsColors.error,
            fontFamily: kmsFont,
          }}
        >
          {error}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => void handleSetup()}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? 'rgba(255,255,255,0.12)' : kmsColors.orange,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: kmsFont,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 150ms ease',
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#FFFFFF',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'kms-spin 0.7s linear infinite',
                }}
              />
              Instellen...
            </>
          ) : (
            'Instellen'
          )}
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 13,
            color: kmsColors.textMuted,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: kmsFont,
          }}
        >
          Nee bedankt
        </button>
      </div>

      <style>{`
        @keyframes kms-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
