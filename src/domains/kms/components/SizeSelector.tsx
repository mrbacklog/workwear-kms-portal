import { useState, useRef, useContext } from 'react';
import type { KmsPortalVariant, CartState } from '../types';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { BolusModeContext } from '../lib/kms-bolus-context';

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
          background: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.4)',
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
          color: value > 0 ? kmsColors.orange : kmsColors.text,
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
          background: kmsColors.cyan,
          color: kmsColors.white,
          boxShadow: '0 2px 8px rgba(0,160,200,0.3)',
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
  const { t } = useContext(BolusModeContext);
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
        @keyframes kms-swipe-hint {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(6px); opacity: 1; }
        }
      `}</style>

      {/* Swipeable size cards */}
      <div style={{ position: 'relative' }}>
        {/* Swipe hint text */}
        <div style={{
          fontSize: 10,
          color: kmsColors.textFaint,
          textAlign: 'right',
          padding: '12px 0 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 4,
          fontFamily: kmsFont,
        }}>
          {t('sizes.swipe_hint')}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: 'kms-swipe-hint 2s ease-in-out infinite' }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Scrollable size cards */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '0 0 8px',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {variants.map((variant) => {
            const qty = cart.items.find(item => item.variantId === variant.id)?.quantity ?? 0;
            const hasQty = qty > 0;
            return (
              <div
                key={variant.id}
                style={{
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  background: hasQty ? 'rgba(241,142,0,0.06)' : kmsColors.surfaceHover,
                  borderRadius: 12,
                  padding: '10px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 68,
                  border: `1.5px solid ${hasQty ? kmsColors.borderSelected : 'transparent'}`,
                  transition: 'border-color 200ms ease, background 200ms ease',
                }}
              >
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.5px',
                  fontFamily: kmsFont,
                }}>
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

        {/* Fade hint overlay on right side */}
        <div style={{
          position: 'absolute',
          top: 28,
          right: 0,
          bottom: 8,
          width: 48,
          background: `linear-gradient(90deg, transparent, ${kmsColors.surface})`,
          pointerEvents: 'none',
          borderRadius: '0 16px 0 0',
        }} />
      </div>

      {/* Subtotal */}
      {totalQty > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0 2px',
            borderTop: `1px dashed ${kmsColors.border}`,
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 12, color: kmsColors.textMuted, fontFamily: kmsFont }}>
            {t('sizes.subtotal')}
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
          opacity: 0.8,
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
        {t('sizes.detail_link')}
      </button>
    </div>
  );
}
