import { useState, useRef } from 'react';
import type { KmsPortalVariant, CartState } from '../types';
import { kmsColors, kmsFont } from '../lib/kms-theme';

interface SizeSelectorProps {
  variants: KmsPortalVariant[];
  cart: CartState;
  onQuantityChange: (variantId: string, quantity: number) => void;
  onDetailClick: () => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}

interface CounterProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function Counter({ value, onIncrement, onDecrement }: CounterProps) {
  const [bounce, setBounce] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function triggerBounce() {
    setBounce(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Force re-render then re-enable
    requestAnimationFrame(() => {
      setBounce(true);
      timeoutRef.current = setTimeout(() => setBounce(false), 160);
    });
  }

  function handleIncrement() {
    triggerBounce();
    onIncrement();
  }

  function handleDecrement() {
    if (value <= 0) return;
    triggerBounce();
    onDecrement();
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={handleDecrement}
        disabled={value <= 0}
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
          border: 'none',
          cursor: value <= 0 ? 'not-allowed' : 'pointer',
          background: '#F5F5F5',
          color: '#444444',
          opacity: value <= 0 ? 0.3 : 1,
          transition: 'all 150ms ease',
          fontFamily: kmsFont,
          flexShrink: 0,
        }}
        aria-label="Verminder"
      >
        −
      </button>

      <div
        style={{
          width: 28,
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 700,
          color: kmsColors.black,
          fontFamily: kmsFont,
          animation: bounce ? 'kms-counter-bounce 150ms ease-out' : 'none',
        }}
      >
        {value}
      </div>

      <button
        onClick={handleIncrement}
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
          border: 'none',
          cursor: 'pointer',
          background: kmsColors.orange,
          color: kmsColors.white,
          boxShadow: '0 2px 8px rgba(241,142,0,0.35)',
          transition: 'all 150ms ease',
          fontFamily: kmsFont,
          flexShrink: 0,
        }}
        aria-label="Verhoog"
      >
        +
      </button>
    </div>
  );
}

export function SizeSelector({ variants, cart, onQuantityChange, onDetailClick }: SizeSelectorProps) {
  const subtotalCents = variants.reduce((sum, variant) => {
    const qty = cart.items.find((item) => item.variantId === variant.id)?.quantity ?? 0;
    return sum + qty * (variant.price_cents ?? 0);
  }, 0);

  const totalQty = variants.reduce((sum, variant) => {
    const qty = cart.items.find((item) => item.variantId === variant.id)?.quantity ?? 0;
    return sum + qty;
  }, 0);

  return (
    <div>
      <style>{`
        @keyframes kms-counter-bounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Size pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '14px 0 8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {variants.map((variant) => {
          const qty =
            cart.items.find((item) => item.variantId === variant.id)?.quantity ?? 0;

          return (
            <div
              key={variant.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#444444',
                  minWidth: 44,
                  textAlign: 'center',
                  padding: '6px',
                  background: '#F5F5F5',
                  borderRadius: 6,
                  fontFamily: kmsFont,
                }}
              >
                {variant.size}
              </div>
              <Counter
                value={qty}
                onIncrement={() => onQuantityChange(variant.id, qty + 1)}
                onDecrement={() => onQuantityChange(variant.id, Math.max(0, qty - 1))}
              />
            </div>
          );
        })}
      </div>

      {/* Subtotal */}
      {totalQty > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0 2px',
            borderTop: '1px dashed #F0F0F0',
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 12, color: '#888888', fontFamily: kmsFont }}>
            Subtotaal
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: kmsColors.orange,
              fontFamily: kmsFont,
            }}
          >
            {formatPrice(subtotalCents)}
          </span>
        </div>
      )}

      {/* Detail link */}
      <button
        onClick={onDetailClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: kmsColors.cyan,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '10px 0 0',
          fontFamily: kmsFont,
          fontWeight: 500,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Productdetails bekijken
      </button>
    </div>
  );
}
