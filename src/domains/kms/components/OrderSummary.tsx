import { useState, useEffect } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import type { CartState, KmsOrderResponse } from '../types';
import { API_BASE } from '@/lib/api';

interface OrderSummaryProps {
  cart: CartState;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: KmsOrderResponse) => void;
  slug: string;
  authHeader: Record<string, string>;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}

export function OrderSummary({
  cart,
  isOpen,
  onClose,
  onOrderPlaced,
  slug,
  authHeader,
}: OrderSummaryProps) {
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset fields when panel reopens
  useEffect(() => {
    if (isOpen) {
      setReference('');
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  async function handleSubmit() {
    if (submitting || cart.items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const body = {
        lines: cart.items.map((item) => ({
          product_variant_id: item.variantId,
          quantity: item.quantity,
        })),
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch(`${API_BASE}/api/v1/kms/${slug}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const detail =
          data && typeof data === 'object' && 'detail' in data
            ? String((data as Record<string, unknown>).detail)
            : `HTTP ${res.status}`;
        throw new Error(detail);
      }

      const order = (await res.json()) as KmsOrderResponse;
      onOrderPlaced(order);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes kms-summary-in {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes kms-summary-out {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        @keyframes kms-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0,0,0,0.55)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
      />

      {/* Slide-up panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          background: kmsColors.white,
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.2)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 400ms cubic-bezier(0.34, 1.1, 0.64, 1)',
          fontFamily: kmsFont,
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 0 4px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: '#DDDDDD',
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px 16px',
            borderBottom: '1px solid #F0F0F0',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: kmsColors.black,
              fontFamily: kmsFont,
              margin: 0,
            }}
          >
            Bestelling bevestigen
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F5F5F5',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#666',
              flexShrink: 0,
            }}
            aria-label="Sluiten"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}
        >
          {/* Order lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {cart.items.map((item) => (
              <div
                key={item.variantId}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid #F5F5F5',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: kmsColors.black,
                      fontFamily: kmsFont,
                      marginBottom: 2,
                    }}
                  >
                    {item.modelName}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#888888',
                      fontFamily: kmsFont,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: kmsColors.cyan,
                        flexShrink: 0,
                      }}
                    />
                    {item.color} &middot; Maat {item.size}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: kmsColors.black,
                    fontFamily: kmsFont,
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#888', fontWeight: 400 }}>{item.quantity}&times; </span>
                  {formatPrice(item.priceCents)}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            style={{
              background: '#FFF4E0',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: kmsColors.black,
                fontFamily: kmsFont,
              }}
            >
              Totaalbedrag
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: kmsColors.orange,
                fontFamily: kmsFont,
              }}
            >
              {formatPrice(cart.totalCents)}
            </span>
          </div>

          {/* Reference field */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#444',
                marginBottom: 6,
                fontFamily: kmsFont,
              }}
            >
              Referentie (optioneel)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={255}
              placeholder="Bijv. afdeling, projectnummer..."
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #E8E8E8',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: kmsFont,
                background: '#FAFAFA',
                color: kmsColors.black,
                outline: 'none',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = kmsColors.cyan;
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,160,200,0.12)';
                e.currentTarget.style.background = kmsColors.white;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E8E8E8';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = '#FAFAFA';
              }}
            />
          </div>

          {/* Notes field */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#444',
                marginBottom: 6,
                fontFamily: kmsFont,
              }}
            >
              Opmerkingen (optioneel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Eventuele opmerkingen bij uw bestelling..."
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #E8E8E8',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: kmsFont,
                background: '#FAFAFA',
                color: kmsColors.black,
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = kmsColors.cyan;
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,160,200,0.12)';
                e.currentTarget.style.background = kmsColors.white;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E8E8E8';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = '#FAFAFA';
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: '12px 14px',
                background: '#FFF0F0',
                border: '1px solid #FFD0D0',
                borderRadius: 10,
                fontSize: 13,
                color: '#C0392B',
                fontFamily: kmsFont,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '16px 20px 24px',
            borderTop: '1px solid #F0F0F0',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting || cart.items.length === 0}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: submitting ? '#CCA060' : kmsColors.orange,
              color: kmsColors.white,
              border: 'none',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: kmsFont,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(241,142,0,0.35)',
              transition: 'background 150ms ease, transform 150ms ease',
              marginBottom: 12,
            }}
            onMouseEnter={(e) => {
              if (submitting) return;
              (e.currentTarget as HTMLButtonElement).style.background = '#D97E00';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              if (submitting) return;
              (e.currentTarget as HTMLButtonElement).style.background = kmsColors.orange;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            {submitting ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    animation: 'kms-spin 0.8s linear infinite',
                  }}
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Even geduld...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Bestelling plaatsen
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '10px',
              background: 'none',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: '#888888',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: kmsFont,
              textAlign: 'center',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            Annuleren, ga terug
          </button>
        </div>
      </div>

      <style>{`
        @keyframes kms-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
