import { useEffect, useContext } from 'react';
import type { KmsPortalProduct } from '../types';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { BolusModeContext } from '../lib/kms-bolus-context';

interface ProductDetailProps {
  product: KmsPortalProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}

function colorNameToHex(colorName: string): string {
  const map: Record<string, string> = {
    zwart: '#1A1A1A',
    black: '#1A1A1A',
    wit: '#F5F5F5',
    white: '#F5F5F5',
    navy: '#1B2A4A',
    grijs: '#888888',
    grey: '#888888',
    gray: '#888888',
    blauw: '#1E5FA3',
    blue: '#1E5FA3',
    rood: '#C0392B',
    red: '#C0392B',
    groen: '#27AE60',
    green: '#27AE60',
    geel: '#F1C40F',
    yellow: '#F1C40F',
    oranje: '#E67E22',
    orange: '#E67E22',
    bruin: '#7B5A3A',
    brown: '#7B5A3A',
    beige: '#D4C5A9',
  };
  const key = colorName.toLowerCase();
  for (const [name, hex] of Object.entries(map)) {
    if (key.includes(name)) return hex;
  }
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 45%)`;
}

export function ProductDetail({ product, isOpen, onClose }: ProductDetailProps) {
  const { t } = useContext(BolusModeContext);

  // Lock body scroll when panel open
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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const colorHex = product ? colorNameToHex(product.color) : '#888';

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .kms-panel-sheet {
            left: auto !important;
            top: 0 !important;
            bottom: 0 !important;
            right: 0 !important;
            width: 440px !important;
            border-radius: 18px 0 0 18px !important;
            max-height: 100vh !important;
            transform: translateX(100%) !important;
            background: ${kmsColors.surface} !important;
          }
          .kms-panel-sheet.open {
            transform: translateX(0) !important;
          }
          .kms-panel-drag { display: none !important; }
        }
        .kms-panel-sheet {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: ${kmsColors.surface};
          border-radius: 18px 18px 0 0;
          max-height: 92vh;
          overflow-y: auto;
          transform: translateY(100%);
          transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
          scrollbar-width: none;
        }
        .kms-panel-sheet::-webkit-scrollbar { display: none; }
        .kms-panel-sheet.open { transform: translateY(0); }
      `}</style>

      {/* Full-screen overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: isOpen ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
            transition: 'background 350ms ease',
          }}
        />

        {/* Panel sheet */}
        <div className={`kms-panel-sheet${isOpen ? ' open' : ''}`}>
          {/* Drag handle (mobile only) */}
          <div
            className="kms-panel-drag"
            style={{
              width: 40,
              height: 4,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 999,
              margin: '14px auto 0',
            }}
          />

          {/* Panel header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              position: 'sticky',
              top: 0,
              background: kmsColors.surface,
              zIndex: 1,
              borderBottom: `1px solid ${kmsColors.border}`,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: kmsColors.text,
                fontFamily: kmsFont,
              }}
            >
              {t('detail.title')}
            </span>
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: kmsColors.surfaceHover,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 16,
                cursor: 'pointer',
                border: 'none',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = kmsColors.surfaceHover;
              }}
              aria-label={t('detail.close')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Panel content */}
          {product && (
            <>
              {/* Product image */}
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.model_name}
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    background: kmsColors.surfaceHover,
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 80,
                    background: `${colorHex}12`,
                    color: colorHex,
                    fontFamily: kmsFont,
                    fontWeight: 700,
                  }}
                >
                  {product.brand_name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Panel body */}
              <div
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Brand */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: kmsColors.cyan,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontFamily: kmsFont,
                  }}
                >
                  {product.brand_name}
                </div>

                {/* Model name */}
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: kmsColors.text,
                    lineHeight: 1.2,
                    fontFamily: kmsFont,
                    marginTop: -8,
                  }}
                >
                  {product.model_name}
                </div>

                {/* Color */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: kmsFont,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                      background: colorHex,
                      flexShrink: 0,
                    }}
                  />
                  {product.color}
                </div>

                {/* Price */}
                {product.price_from_cents != null && (
                  <div
                    style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: kmsColors.textMuted,
                        fontWeight: 500,
                        fontFamily: kmsFont,
                      }}
                    >
                      {t('detail.price_from')}
                    </span>
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: kmsColors.orange,
                        fontFamily: kmsFont,
                      }}
                    >
                      {formatPrice(product.price_from_cents)}
                    </span>
                  </div>
                )}

                {/* Available sizes */}
                {product.variants.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: kmsColors.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 8,
                        fontFamily: kmsFont,
                      }}
                    >
                      {t('detail.available_sizes')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {product.variants.map((variant) => (
                        <div
                          key={variant.id}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 999,
                            background: kmsColors.surfaceHover,
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: kmsFont,
                          }}
                        >
                          {variant.size}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EAN info if available */}
                {product.variants.some((v) => v.ean) && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background: kmsColors.surfaceHover,
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: kmsColors.textMuted,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: 4,
                          fontFamily: kmsFont,
                        }}
                      >
                        {t('detail.variants')}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: kmsColors.text,
                          fontFamily: kmsFont,
                        }}
                      >
                        {product.variants.length} {t('detail.sizes_count')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
