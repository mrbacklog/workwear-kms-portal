import { useState } from 'react';
import { kmsColors, kmsFont, kmsApiBase } from '../lib/kms-theme';
import { kmsAuthFetch } from '../lib/kms-auth-fetch';
import type { TranslationKey } from '../lib/kms-translations';

interface AccessRequestDialogProps {
  t: (key: TranslationKey) => string;
  onClose: () => void;
}

export function AccessRequestDialog({ t, onClose }: AccessRequestDialogProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await kmsAuthFetch(`${kmsApiBase}/api/v1/kms/access-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        setError(t('access_request.error'));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t('access_request.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: kmsColors.surface,
          border: `1.5px solid ${kmsColors.borderHover}`,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          padding: 20,
          fontFamily: kmsFont,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: kmsColors.text,
            marginBottom: 12,
          }}
        >
          {t('access_request.title')}
        </div>

        {success ? (
          <>
            <div
              style={{
                fontSize: 13,
                color: kmsColors.textSecondary,
                marginBottom: 16,
              }}
            >
              {t('access_request.success')}
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: kmsColors.orange,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontFamily: kmsFont,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('access_request.close')}
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                color: kmsColors.textSecondary,
                marginBottom: 6,
              }}
            >
              {t('access_request.email_label')}
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('access_request.email_placeholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${kmsColors.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontFamily: kmsFont,
                background: kmsColors.surfaceHover,
                color: kmsColors.text,
                outline: 'none',
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <div
                style={{
                  fontSize: 12,
                  color: kmsColors.error,
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'none',
                  color: kmsColors.textMuted,
                  border: `1px solid ${kmsColors.textMuted}`,
                  borderRadius: 8,
                  fontFamily: kmsFont,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {t('access_request.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: kmsColors.orange,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: kmsFont,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: submitting ? 'default' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? t('access_request.submitting') : t('access_request.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
