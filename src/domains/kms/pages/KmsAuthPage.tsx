import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { PasskeyLoginSection } from '../components/PasskeyLoginSection';
import { kmsColors, kmsFont, KMS_DEFAULT_SLUG, kmsApiBase, isKmsPortal } from '../lib/kms-theme';
import { BolusModeContext } from '../lib/kms-bolus-context';
import { useKmsAuth } from '../hooks/useKmsAuth';
import type { KmsAuthResponse } from '../types';

export default function KmsAuthPage() {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const slug = urlSlug || KMS_DEFAULT_SLUG;
  const { t } = useContext(BolusModeContext);
  const { login } = useKmsAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePasskeySuccess(authResponse: KmsAuthResponse) {
    login(authResponse);
    navigate(isKmsPortal ? '/bestellen' : `/kms/${slug}/bestellen`, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${kmsApiBase}/api/v1/kms/auth/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Er is een fout opgetreden. Probeer het opnieuw.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KmsLayout>
      <div style={{
        textAlign: 'center',
        paddingTop: 32,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: 440,
        margin: '0 auto',
        width: '100%',
      }}>
        <p
          style={{
            fontFamily: kmsFont,
            fontSize: 13,
            fontWeight: 500,
            color: kmsColors.textMuted,
            marginTop: 0,
            marginBottom: 4,
            animation: 'kms-fade-up 400ms ease 200ms both',
          }}
        >
          {t('auth.welcome_prefix')}
        </p>

        <h1
          style={{
            fontFamily: kmsFont,
            fontSize: 26,
            fontWeight: 800,
            color: kmsColors.text,
            marginTop: 0,
            marginBottom: 0,
            lineHeight: 1.2,
            animation: 'kms-fade-up 400ms ease 350ms both',
          }}
        >
          {t('auth.welcome_title')}
        </h1>

        {!submitted ? (
          <>
            <p
              style={{
                fontFamily: kmsFont,
                fontSize: 15,
                color: kmsColors.textMuted,
                marginTop: 12,
                marginBottom: 32,
                lineHeight: 1.6,
                animation: 'kms-fade-up 400ms ease 500ms both',
              }}
            >
              {t('auth.description')}
            </p>

            <div
              style={{
                textAlign: 'left',
                maxWidth: 400,
                margin: '0 auto',
                animation: 'kms-fade-up 400ms ease 650ms both',
              }}
            >
              <PasskeyLoginSection onSuccess={handlePasskeySuccess} />
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                textAlign: 'left',
                maxWidth: 400,
                margin: '0 auto',
                animation: 'kms-fade-up 400ms ease 650ms both',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="email"
                  style={{
                    fontFamily: kmsFont,
                    fontSize: 13,
                    fontWeight: 600,
                    color: kmsColors.textSecondary,
                    letterSpacing: '0.3px',
                  }}
                >
                  {t('auth.email_label')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="uw@email.nl"
                  required
                  disabled={loading}
                  style={{
                    padding: '14px 16px',
                    border: `1.5px solid ${error ? kmsColors.error : kmsColors.border}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: kmsFont,
                    color: kmsColors.text,
                    background: kmsColors.surface,
                    outline: 'none',
                    width: '100%',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = kmsColors.cyan;
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,160,200,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? kmsColors.error : kmsColors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {error && (
                <p
                  style={{
                    fontFamily: kmsFont,
                    fontSize: 13,
                    color: kmsColors.error,
                    marginTop: 8,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  marginTop: 20,
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: kmsFont,
                  background: loading || !email.trim() ? 'rgba(255,255,255,0.12)' : kmsColors.orange,
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: loading || !email.trim() ? 'none' : '0 4px 12px rgba(241,142,0,0.35)',
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
                    {t('auth.submitting')}
                  </>
                ) : (
                  t('auth.submit')
                )}
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              marginTop: 32,
              padding: '24px 20px',
              background: kmsColors.successBg,
              borderRadius: 12,
              textAlign: 'left',
              maxWidth: 400,
              margin: '32px auto 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
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
                  marginTop: 1,
                }}
              >
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: kmsFont,
                  fontSize: 15,
                  color: kmsColors.text,
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                {t('auth.success')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes kms-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes kms-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </KmsLayout>
  );
}
