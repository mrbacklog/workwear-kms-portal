import type { CartState } from '../types';
import { kmsColors, kmsFont } from '../lib/kms-theme';

interface CartBarProps {
  cart: CartState;
  onClick: () => void;
  onClear: () => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}

export function CartBar({ cart, onClick, onClear }: CartBarProps) {
  const hasItems = cart.totalItems > 0;

  return (
    <>
      <style>{`
        @keyframes kms-total-update {
          0% { transform: scale(1); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1); }
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
          background: kmsColors.white,
          borderTop: '1px solid #F0F0F0',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.10)',
          transform: hasItems ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: hasItems ? 'auto' : 'none',
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
              color: kmsColors.white,
              padding: '16px 20px',
              borderRadius: 18,
              fontSize: 15,
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(241,142,0,0.4)',
              cursor: 'pointer',
              border: 'none',
              fontFamily: kmsFont,
              width: '100%',
              transition: 'background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (!hasItems) return;
              (e.currentTarget as HTMLButtonElement).style.background = '#D97E00';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 6px 24px rgba(241,142,0,0.5)';
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
                    background: kmsColors.black,
                    color: kmsColors.white,
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
                {cart.totalItems === 1 ? 'artikel' : 'artikelen'}
              </span>
            </div>

            {/* Right: total + arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <span
                  key={cart.totalCents}
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    fontFamily: kmsFont,
                    animation: 'kms-total-update 200ms ease-out',
                    display: 'block',
                  }}
                >
                  {formatPrice(cart.totalCents)}
                </span>
                <span style={{ fontSize: 9, fontWeight: 400, opacity: 0.75 }}>excl. BTW</span>
              </div>
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

          {/* Clear cart link */}
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{
              display: 'block',
              margin: '8px auto 0',
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: 12,
              fontFamily: kmsFont,
              cursor: 'pointer',
              padding: '4px 8px',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Winkelwagen legen
          </button>
        </div>
      </div>
    </>
  );
}
