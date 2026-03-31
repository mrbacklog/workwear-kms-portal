import { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { kmsColors, kmsFont, KMS_DEFAULT_SLUG, isKmsPortal, kmsApiBase } from '../lib/kms-theme';
import { BolusModeContext } from '../lib/kms-bolus-context';
import type { KmsAuthResponse } from '../types';

export default function KmsVerifyPage() {
  const { slug: urlSlug, token } = useParams<{ slug: string; token: string }>();
  const slug = urlSlug || KMS_DEFAULT_SLUG;
  const navigate = useNavigate();
  const { login } = useKmsAuth();
  const { t } = useContext(BolusModeContext);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const verifyCalledRef = useRef(false);

  useEffect(() => {
    // Guard against double-invocation (StrictMode) and missing params
    if (verifyCalledRef.current) return;
    verifyCalledRef.current = true;

    const verify = async () => {
      if (!slug || !token) {
        setErrorMessage(t('verify.error_params'));
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`${kmsApiBase}/api/v1/kms/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setErrorMessage((data as { detail?: string }).detail ?? t('verify.error_default'));
          setStatus('error');
          return;
        }

        const data: KmsAuthResponse = await response.json();
        login(data);
        navigate(isKmsPortal ? '/bestellen' : `/kms/${slug}/bestellen`, { replace: true });
      } catch {
        setErrorMessage(t('verify.error_connection'));
        setStatus('error');
      }
    };

    void verify();
  }, [slug, token, navigate, login, t]);

  return (
    <KmsLayout>
      <div style={{ textAlign: 'center', paddingTop: 64 }}>
        {status === 'loading' && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                border: `3px solid ${kmsColors.border}`,
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
                color: kmsColors.textSecondary,
                marginTop: 20,
              }}
            >
              {t('verify.loading')}
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
                background: kmsColors.errorBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={kmsColors.error} strokeWidth="2">
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
                color: kmsColors.text,
                marginTop: 20,
              }}
            >
              {t('verify.error_title')}
            </h2>

            <p
              style={{
                fontFamily: kmsFont,
                fontSize: 15,
                color: kmsColors.textSecondary,
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              {errorMessage}
            </p>

            <Link
              to={isKmsPortal ? '/' : `/kms/${slug ?? ''}`}
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
              {t('verify.back')}
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
