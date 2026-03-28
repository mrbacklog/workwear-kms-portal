import type { KmsPortalProduct, CartState } from '../types';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { SizeSelector } from './SizeSelector';

interface ProductCardProps {
  product: KmsPortalProduct;
  isExpanded: boolean;
  onToggle: () => void;
  onDetailClick: () => void;
  cart: CartState;
  onQuantityChange: (variantId: string, quantity: number) => void;
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
  // Fallback: derive color from string hash
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 45%)`;
}

export function ProductCard({
  product,
  isExpanded,
  onToggle,
  onDetailClick,
  cart,
  onQuantityChange,
}: ProductCardProps) {
  const selectedQuantity = product.variants.reduce((sum, variant) => {
    return sum + (cart.items.find((item) => item.variantId === variant.id)?.quantity ?? 0);
  }, 0);

  const hasSelection = selectedQuantity > 0;
  const colorHex = colorNameToHex(product.color);

  return (
    <div
      style={{
        background: kmsColors.white,
        borderRadius: 18,
        border: `1.5px solid ${hasSelection ? kmsColors.orange : 'transparent'}`,
        boxShadow: hasSelection
          ? `0 0 0 3px rgba(241,142,0,0.08), 0 1px 3px rgba(0,0,0,0.08)`
          : '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
      }}
    >
      {/* Card header — tap to expand */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px',
          cursor: 'pointer',
          userSelect: 'none',
          background: 'none',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          fontFamily: kmsFont,
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#FAFAFA';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'none';
        }}
      >
        {/* Thumbnail */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.model_name}
            style={{
              width: 64,
              height: 64,
              borderRadius: 6,
              objectFit: 'cover',
              flexShrink: 0,
              background: '#F5F5F5',
            }}
          />
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 6,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              background: `${colorHex}22`,
              color: colorHex,
              fontWeight: 700,
              fontFamily: kmsFont,
            }}
          >
            {product.brand_name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: kmsColors.black,
              lineHeight: 1.3,
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.brand_name} {product.model_name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#888888',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: '1px solid rgba(0,0,0,0.1)',
                background: colorHex,
                flexShrink: 0,
              }}
            />
            {product.color}
          </div>
          {product.price_from_cents != null && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#444444',
                marginTop: 6,
                fontFamily: kmsFont,
              }}
            >
              vanaf {formatPrice(product.price_from_cents)}
            </div>
          )}
        </div>

        {/* Right side: badge + chevron */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {hasSelection && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: kmsColors.orange,
                color: kmsColors.white,
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 999,
                fontFamily: kmsFont,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {selectedQuantity}x
            </div>
          )}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#AAAAAA"
            strokeWidth="2"
            style={{
              transition: 'transform 250ms ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      <div
        style={{
          maxHeight: isExpanded ? 500 : 0,
          overflow: 'hidden',
          transition: 'max-height 300ms ease-out',
        }}
      >
        <div
          style={{
            padding: '0 16px 16px',
            borderTop: '1px solid #F0F0F0',
          }}
        >
          <SizeSelector
            variants={product.variants}
            cart={cart}
            onQuantityChange={onQuantityChange}
            onDetailClick={onDetailClick}
          />
        </div>
      </div>
    </div>
  );
}
