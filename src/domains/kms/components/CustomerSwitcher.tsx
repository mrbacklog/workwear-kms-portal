import { useState, useEffect, useRef, useCallback } from 'react';
import { kmsAuthFetch } from '../lib/kms-auth-fetch';
import { kmsColors, kmsFont, kmsApiBase } from '../lib/kms-theme';
import type { KmsStaffCustomer } from '../types';

interface Props {
  currentCustomerId: string;
  onSelect: (customer: KmsStaffCustomer) => void;
  onClose: () => void;
}

export function CustomerSwitcher({ currentCustomerId, onSelect, onClose }: Props) {
  const [customers, setCustomers] = useState<KmsStaffCustomer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const url = search.trim()
        ? `${kmsApiBase}/api/v1/kms/staff/customers?search=${encodeURIComponent(search.trim())}`
        : `${kmsApiBase}/api/v1/kms/staff/customers`;
      const res = await kmsAuthFetch(url);
      if (!res.ok) return;
      const data: KmsStaffCustomer[] = await res.json();
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  // Auto-focus search input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 6,
        width: 280,
        background: kmsColors.surface,
        border: `1.5px solid ${kmsColors.borderHover}`,
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: `1px solid ${kmsColors.border}` }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Zoek klant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = kmsColors.cyan;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = kmsColors.border;
          }}
        />
      </div>

      {/* Customer list */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {loading && (
          <div style={{ padding: '16px 12px', textAlign: 'center' }}>
            <div
              style={{
                width: 20,
                height: 20,
                border: `2px solid ${kmsColors.border}`,
                borderTopColor: kmsColors.orange,
                borderRadius: '50%',
                animation: 'kms-spin 0.7s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
        )}

        {!loading && customers.length === 0 && (
          <div
            style={{
              padding: '16px 12px',
              textAlign: 'center',
              fontFamily: kmsFont,
              fontSize: 13,
              color: kmsColors.textMuted,
            }}
          >
            Geen klanten gevonden
          </div>
        )}

        {!loading &&
          customers.map((customer) => {
            const isCurrent = customer.id === currentCustomerId;
            return (
              <button
                key={customer.id}
                onClick={() => onSelect(customer)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  background: isCurrent ? 'rgba(241,142,0,0.08)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: kmsFont,
                  borderBottom: `1px solid ${kmsColors.border}`,
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = kmsColors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isCurrent ? 'rgba(241,142,0,0.08)' : 'transparent';
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCurrent ? kmsColors.orange : kmsColors.text,
                      marginBottom: customer.open_orders > 0 ? 2 : 0,
                    }}
                  >
                    {customer.company_name}
                  </div>
                  {customer.open_orders > 0 && (
                    <div style={{ fontSize: 11, color: kmsColors.textMuted }}>
                      {customer.open_orders} open {customer.open_orders === 1 ? 'bestelling' : 'bestellingen'}
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={kmsColors.orange}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
      </div>

      <style>{`
        @keyframes kms-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
