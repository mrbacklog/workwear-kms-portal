import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { API_BASE } from '@/lib/api';

function VkLogoLarge() {
  return (
    <div
      style={{
        width: 72,
        height: 72,
        background: kmsColors.black,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: kmsColors.orange,
        }}
      />
      <span
        style={{
          fontFamily: kmsFont,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: '-0.5px',
          color: kmsColors.white,
          lineHeight: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ color: kmsColors.orange }}>V</span>
        <span style={{ color: kmsColors.cyan }}>K</span>
      </span>
    </div>
  );
}

export default function KmsAuthPage() {
  const { slug } = useParams<{ slug: string }>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/kms/${slug}/auth/request`, {
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
      <div style={{ textAlign: 'center', paddingTop: 32 }}>
        <VkLogoLarge />

        <p
          style={{
            fontFamily: kmsFont,
            fontSize: 13,
            fontWeight: 500,
            color: kmsColors.cyan,
            marginTop: 16,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Van Kruiningen Reklame
        </p>

        <h1
          style={{
            fontFamily: kmsFont,
            fontSize: 24,
            fontWeight: 700,
            color: kmsColors.black,
            marginTop: 8,
            lineHeight: 1.3,
          }}
        >
          Welkom bij uw bestelportaal
        </h1>

        {!submitted ? (
          <>
            <p
              style={{
                fontFamily: kmsFont,
                fontSize: 15,
                color: '#666666',
                marginTop: 12,
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              Voer uw e-mailadres in en we sturen u een toegangslink.
            </p>

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="email"
                  style={{
                    fontFamily: kmsFont,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#444444',
                    letterSpacing: '0.3px',
                  }}
                >
                  E-mailadres
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
                    border: `1.5px solid ${error ? '#DC2626' : '#CCCCCC'}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: kmsFont,
                    color: kmsColors.black,
                    background: kmsColors.white,
                    outline: 'none',
                    width: '100%',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = kmsColors.cyan;
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,160,200,0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? '#DC2626' : '#CCCCCC';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {error && (
                <p
                  style={{
                    fontFamily: kmsFont,
                    fontSize: 13,
                    color: '#DC2626',
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
                  background: loading || !email.trim() ? '#CCCCCC' : kmsColors.orange,
                  color: kmsColors.white,
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
                        borderTopColor: kmsColors.white,
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'kms-spin 0.7s linear infinite',
                      }}
                    />
                    Versturen...
                  </>
                ) : (
                  'Verstuur link'
                )}
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              marginTop: 32,
              padding: '24px 20px',
              background: '#E0F5EC',
              borderRadius: 12,
              textAlign: 'left',
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
                  color: '#00542B',
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                Check uw inbox — u ontvangt binnen enkele minuten een link.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes kms-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </KmsLayout>
  );
}
