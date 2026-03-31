import { useContext } from 'react';
import type { CartState } from '../types';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { BolusModeContext } from '../lib/kms-bolus-context';

interface CartBarProps {
  cart: CartState;
  onClick: () => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}

export function CartBar({ cart, onClick }: CartBarProps) {
  const { t } = useContext(BolusModeContext);
  const hasItems = cart.totalItems > 0;

  return (
    <>
      <style>{`
        @keyframes kms-total-update {
          0% { transform: scale(1); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes kms-pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(241,142,0,0.25); }
          50% { box-shadow: 0 4px 28px rgba(241,142,0,0.45); }
        }
        @keyframes kms-cart-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: '16px 20px',
          paddingTop: 32,
          background: `linear-gradient(0deg, ${kmsColors.bg} 70%, transparent)`,
          transform: hasItems ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: hasItems ? 'auto' : 'none',
          animation: hasItems
            ? 'kms-cart-slide-up 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
            : undefined,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <button
            onClick={onClick}
            disabled={!hasItems}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: kmsColors.orange,
              color: '#FFFFFF',
              padding: '16px 20px',
              borderRadius: 18,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              fontFamily: kmsFont,
              width: '100%',
              transition: 'background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
              animation: 'kms-pulse-glow 3s ease-in-out infinite',
            }}
            onMouseEnter={(e) => {
              if (!hasItems) return;
              (e.currentTarget as HTMLButtonElement).style.background = kmsColors.orangeHover;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 6px 28px rgba(241,142,0,0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = kmsColors.orange;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 16px rgba(241,142,0,0.4)';
            }}
          >
            {/* Left: cart icon + item count label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: '#000000',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 700,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: kmsFont,
                  }}
                >
                  {cart.totalItems}
                </div>
              </div>
              <span style={{ fontFamily: kmsFont, fontSize: 14, fontWeight: 600 }}>
                {cart.totalItems}{' '}
                {cart.totalItems === 1 ? t('cart.item') : t('cart.items')}
              </span>
            </div>

            {/* Right: total + arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                key={cart.totalCents}
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  fontFamily: kmsFont,
                  animation: 'kms-total-update 200ms ease-out',
                }}
              >
                {formatPrice(cart.totalCents)}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
