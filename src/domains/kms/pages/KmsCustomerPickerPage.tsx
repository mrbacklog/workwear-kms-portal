import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { useKmsStaffContext } from '../hooks/useKmsStaffContext';
import { kmsAuthFetch } from '../lib/kms-auth-fetch';
import { kmsColors, kmsFont, kmsApiBase, isKmsPortal } from '../lib/kms-theme';
import { BolusModeContext } from '../lib/kms-bolus-context';
import type { KmsStaffCustomer } from '../types';

export default function KmsCustomerPickerPage() {
  const navigate = useNavigate();
  const { t } = useContext(BolusModeContext);
  const { isAuthenticated, isStaff, logout } = useKmsAuth();
  const { selectCustomer } = useKmsStaffContext();

  const [customers, setCustomers] = useState<KmsStaffCustomer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: redirect if not authenticated or not staff
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(isKmsPortal ? '/' : '/kms', { replace: true });
    } else if (!isStaff) {
      navigate(isKmsPortal ? '/bestellen' : '/kms', { replace: true });
    }
  }, [isAuthenticated, isStaff, navigate]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = search.trim()
        ? `${kmsApiBase}/api/v1/kms/staff/customers?search=${encodeURIComponent(search.trim())}`
        : `${kmsApiBase}/api/v1/kms/staff/customers`;
      const res = await kmsAuthFetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: KmsStaffCustomer[] = await res.json();
      setCustomers(data);
    } catch {
      setError(t('picker.error'));
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    if (isAuthenticated && isStaff) {
      void fetchCustomers();
    }
  }, [isAuthenticated, isStaff, fetchCustomers]);

  function handleSelectCustomer(customer: KmsStaffCustomer) {
    selectCustomer(customer);
    navigate(isKmsPortal ? '/bestellen' : '/kms', { replace: true });
  }

  if (!isAuthenticated || !isStaff) {
    return null;
  }

  return (
    <KmsLayout onLogout={() => { logout(); navigate('/'); }}>
      <div style={{ paddingTop: 8 }}>
        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontFamily: kmsFont,
              fontSize: 22,
              fontWeight: 700,
              color: kmsColors.text,
              margin: 0,
              marginBottom: 4,
            }}
          >
            {t('picker.title')}
          </h1>
          <p
            style={{
              fontFamily: kmsFont,
              fontSize: 14,
              color: kmsColors.textMuted,
              margin: 0,
            }}
          >
            {t('picker.description')}
          </p>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <svg
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: kmsColors.textFaint,
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder={t('picker.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '13px 40px 13px 44px',
              border: `1.5px solid ${kmsColors.border}`,
              borderRadius: 12,
              fontSize: 15,
              fontFamily: kmsFont,
              background: kmsColors.surface,
              outline: 'none',
              color: kmsColors.text,
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = kmsColors.cyan;
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,160,200,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = kmsColors.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: kmsColors.surfaceHover,
                border: 'none',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: kmsColors.textSecondary,
                fontSize: 14,
                fontFamily: kmsFont,
              }}
              aria-label="Zoekopdracht wissen"
            >
              ×
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  background: kmsColors.surface,
                  borderRadius: 12,
                  border: `1px solid ${kmsColors.border}`,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 14,
                      width: '55%',
                      borderRadius: 6,
                      background: kmsColors.surfaceHover,
                      animation: 'kms-shimmer 1.4s ease-in-out infinite',
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      width: '25%',
                      borderRadius: 6,
                      background: kmsColors.surfaceHover,
                      animation: `kms-shimmer 1.4s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontFamily: kmsFont, fontSize: 14, color: kmsColors.error, marginBottom: 16 }}>
              {error}
            </p>
            <button
              onClick={() => void fetchCustomers()}
              style={{
                padding: '10px 20px',
                background: kmsColors.orange,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: kmsFont,
              }}
            >
              {t('picker.retry')}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && customers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p
              style={{
                fontFamily: kmsFont,
                fontSize: 15,
                fontWeight: 600,
                color: kmsColors.text,
                marginBottom: 4,
              }}
            >
              {t('picker.empty')}
            </p>
            <p style={{ fontFamily: kmsFont, fontSize: 14, color: kmsColors.textMuted }}>
              {search ? `${t('order.no_results_for')} "${search}"` : t('picker.no_customers')}
            </p>
          </div>
        )}

        {/* Customer list */}
        {!loading && !error && customers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: kmsColors.surface,
                  border: `1.5px solid ${kmsColors.border}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'border-color 150ms ease, background 150ms ease',
                  fontFamily: kmsFont,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = kmsColors.borderHover;
                  e.currentTarget.style.background = kmsColors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = kmsColors.border;
                  e.currentTarget.style.background = kmsColors.surface;
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: kmsColors.text,
                      marginBottom: 2,
                    }}
                  >
                    {customer.company_name}
                  </div>
                  {customer.open_orders > 0 && (
                    <div style={{ fontSize: 12, color: kmsColors.orange, fontWeight: 500 }}>
                      {customer.open_orders} open {customer.open_orders === 1 ? 'bestelling' : 'bestellingen'}
                    </div>
                  )}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={kmsColors.textMuted}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes kms-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </KmsLayout>
  );
}
