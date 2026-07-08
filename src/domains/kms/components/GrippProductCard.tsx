import type { KmsPortalProduct, CartState } from '../types';
import { kmsColors, kmsFont, groupIdToColor } from '../lib/kms-theme';

interface GrippProductCardProps {
  product: KmsPortalProduct;
  cart: CartState;
  onQuantityChange: (grippProductId: string, quantity: number) => void;
  index?: number;
  /** Alle groep-ID's die momenteel zichtbaar zijn (voor consistente badge-kleuren). */
  allGroupIds?: string[];
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}

/**
 * Portaal-kaart voor een Gripp-catalogusproduct (EAN-loos of EAN-houdend maar
 * als Gripp-item geplaatst). Geen maat/kleur-selector — alleen een per-stuk
 * aantal-teller. Geen interne labels ("Gripp", "EAN-loos") zichtbaar voor klant.
 */
export function GrippProductCard({
  product,
  cart,
  onQuantityChange,
  index = 0,
  allGroupIds = [],
}: GrippProductCardProps) {
  const grippProductId = product.gripp_product_id ?? '';
  const quantity =
    cart.items.find((item) => item.grippProductId === grippProductId)?.quantity ?? 0;
  const priceCents = product.price_from_cents ?? 0;
  const imageUrl = product.image?.url ?? null;

  function decrement() {
    onQuantityChange(grippProductId, Math.max(0, quantity - 1));
  }

  function increment() {
    onQuantityChange(grippProductId, quantity + 1);
  }

  function addToCart() {
    if (quantity === 0) {
      onQuantityChange(grippProductId, 1);
    }
  }

  return (
    <>
      <style>{`
        @keyframes kms-spring-in {
          0% { opacity: 0; transform: scale(0.95) translateY(8px); }
          60% { transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div
        style={{
          background: kmsColors.surface,
          borderRadius: 18,
          border: `1.5px solid ${quantity > 0 ? kmsColors.borderSelected : kmsColors.border}`,
          boxShadow:
            quantity > 0
              ? `0 0 0 3px rgba(241,142,0,0.08), 0 1px 3px rgba(0,0,0,0.2)`
              : '0 1px 3px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          animation: `kms-spring-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 80}ms both`,
          fontFamily: kmsFont,
        }}
      >
        {/* Card header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 16px',
          }}
        >
          {/* Thumbnail or placeholder */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.model_name}
              style={{
                width: 64,
                height: 64,
                borderRadius: 6,
                objectFit: 'cover',
                background: '#ffffff',
                display: 'block',
                flexShrink: 0,
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
                background: 'rgba(241,142,0,0.08)',
                border: `1px solid rgba(241,142,0,0.12)`,
              }}
            >
              {/* Shopping-bag placeholder icon */}
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke={kmsColors.orange}
                strokeWidth="1.5"
                style={{ opacity: 0.7 }}
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: kmsColors.text,
                lineHeight: 1.3,
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {product.model_name}
            </div>
            {priceCents > 0 && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: kmsColors.orange,
                  fontFamily: kmsFont,
                }}
              >
                {formatPrice(priceCents)}
              </div>
            )}
            {product.groups && product.groups.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {product.groups.map((group) => {
                  const color = groupIdToColor(group.id, allGroupIds);
                  return (
                    <span
                      key={group.id}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: `${color}22`,
                        color,
                        fontFamily: kmsFont,
                      }}
                    >
                      {group.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity badge (when in cart) */}
          {quantity > 0 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: kmsColors.orange,
                color: kmsColors.text,
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 999,
                fontFamily: kmsFont,
                flexShrink: 0,
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {quantity}x
            </div>
          )}
        </div>

        {/* Quantity counter — always visible (no maat/kleur matrix) */}
        <div
          style={{
            padding: '12px 16px 16px',
            borderTop: `1px solid ${kmsColors.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontSize: 13,
                color: kmsColors.textSecondary,
                flex: 1,
                fontFamily: kmsFont,
              }}
            >
              Aantal
            </span>

            {/* − / count / + stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={decrement}
                disabled={quantity === 0}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: kmsColors.surfaceHover,
                  border: `1px solid ${kmsColors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: quantity === 0 ? 'not-allowed' : 'pointer',
                  opacity: quantity === 0 ? 0.35 : 1,
                  color: kmsColors.text,
                  transition: 'background 150ms ease',
                  fontFamily: kmsFont,
                }}
                aria-label="Minder"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: kmsColors.text,
                  minWidth: 28,
                  textAlign: 'center',
                  fontFamily: kmsFont,
                }}
              >
                {quantity}
              </span>

              <button
                onClick={increment}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: kmsColors.surfaceHover,
                  border: `1px solid ${kmsColors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: kmsColors.text,
                  transition: 'background 150ms ease',
                  fontFamily: kmsFont,
                }}
                aria-label="Meer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Add to cart button */}
            <button
              onClick={addToCart}
              disabled={quantity > 0}
              style={{
                padding: '8px 16px',
                background: quantity > 0 ? kmsColors.surfaceHover : kmsColors.orange,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: quantity > 0 ? 'default' : 'pointer',
                fontFamily: kmsFont,
                opacity: quantity > 0 ? 0.6 : 1,
                transition: 'background 150ms ease, opacity 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {quantity > 0 ? 'Toegevoegd' : 'In winkelmand'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
