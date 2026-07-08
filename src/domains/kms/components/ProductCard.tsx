
import { useState, useRef, useEffect } from 'react';
import type { KmsPortalProduct, CartState, KmsPersonHistoryRecord, KmsPerson } from '../types';
import { kmsColors, kmsFont, colorNameToHex, groupIdToColor, formatShortName, personInitials } from '../lib/kms-theme';
import { SizeSelector } from './SizeSelector';
import { ColorSwatch } from './ColorSwatch';

interface ProductCardProps {
  product: KmsPortalProduct;
  isExpanded: boolean;
  onToggle: () => void;
  onDetailClick: () => void;
  cart: CartState;
  onQuantityChange: (variantId: string, quantity: number) => void;
  index?: number;
  /** Alle groep-ID's die momenteel zichtbaar zijn (voor consistente badge-kleuren). */
  allGroupIds?: string[];
  /** Bestelhistorie voor de EAN's van dit product (al vooraf gescoped door KmsOrderPage). */
  history?: KmsPersonHistoryRecord[];
  /** Actief persoonsfilter — beperkt de getoonde tags en toont de maat-hint. */
  personFilter?: string | null;
  /** Herhaal-tag getikt: verhoog qty van deze variant + tag de persoon aan de regel. */
  onRepeatHistoryTag?: (variantId: string, qty: number, person: KmsPerson) => void;
}

const TAG_LIMIT = 4;

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}


export function ProductCard({
  product,
  isExpanded,
  onToggle,
  onDetailClick,
  cart,
  onQuantityChange,
  index,
  allGroupIds = [],
  history = [],
  personFilter = null,
  onRepeatHistoryTag,
}: ProductCardProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const selectedQuantity = product.variants.reduce((sum, variant) => {
    return sum + (cart.items.find((item) => item.variantId === variant.id)?.quantity ?? 0);
  }, 0);

  const hasSelection = selectedQuantity > 0;
  // colorHex als fallback voor de thumbnail placeholder
  const colorHex = product.color_primary_hex ?? colorNameToHex(product.color);

  const visibleHistory = personFilter
    ? history.filter((h) => h.person_id === personFilter)
    : history;
  const sortedHistory = [...visibleHistory].sort((a, b) =>
    b.last_ordered_at.localeCompare(a.last_ordered_at),
  );
  const shownHistory = tagsExpanded ? sortedHistory : sortedHistory.slice(0, TAG_LIMIT);
  const hiddenCount = sortedHistory.length - TAG_LIMIT;

  const filterHint = personFilter
    ? [...history]
        .filter((h) => h.person_id === personFilter)
        .sort((a, b) => b.last_ordered_at.localeCompare(a.last_ordered_at))[0]
    : null;

  function handleTagTap(record: KmsPersonHistoryRecord) {
    const variant = product.variants.find((v) => v.ean === record.ean);
    if (!variant || !onRepeatHistoryTag) return;
    const key = `${record.ean}-${record.size}-${record.person_id}`;
    onRepeatHistoryTag(variant.id, record.qty, { id: record.person_id, name: record.person_name });
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    setAddedKey(key);
    addedTimerRef.current = setTimeout(() => setAddedKey(null), 1600);
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
          border: `1.5px solid ${hasSelection ? kmsColors.borderSelected : kmsColors.border}`,
          boxShadow: hasSelection
            ? `0 0 0 3px rgba(241,142,0,0.08), 0 1px 3px rgba(0,0,0,0.2)`
            : '0 1px 3px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          animation: `kms-spring-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${(index ?? 0) * 80}ms both`,
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
            (e.currentTarget as HTMLButtonElement).style.background = kmsColors.surfaceHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
          }}
        >
          {/* Thumbnail */}
          {product.image ? (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={product.image.url}
                alt={product.model_name}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 6,
                  objectFit: 'cover',
                  background: '#ffffff',
                  display: 'block',
                }}
              />
            </div>
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
                color: kmsColors.text,
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
                color: kmsColors.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ColorSwatch
                hexCode={product.color_primary_hex}
                secondaryHex={product.color_secondary_hex}
                tertiaryHex={product.color_tertiary_hex}
                size={10}
              />
              {product.color}
            </div>
            {product.price_from_cents != null && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: kmsColors.textSecondary,
                  marginTop: 6,
                  fontFamily: kmsFont,
                }}
              >
                {formatPrice(product.price_from_cents)}
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
            {filterHint && (
              <div style={{ fontSize: 11, fontWeight: 600, color: kmsColors.cyan, marginTop: 4, fontFamily: kmsFont }}>
                {formatShortName(filterHint.person_name)} · vorige keer maat {filterHint.size}
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
              stroke="rgba(255,255,255,0.25)"
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
            maxHeight: isExpanded ? (tagsExpanded ? 900 : 620) : 0,
            overflow: 'hidden',
            transition: 'max-height 300ms ease-out',
          }}
        >
          <div
            style={{
              padding: '0 16px 16px',
              borderTop: `1px solid ${kmsColors.border}`,
            }}
          >
            {shownHistory.length > 0 && (
              <div style={{ marginTop: 12, marginBottom: 4 }}>
                <div
                  style={{
                    fontSize: 10, fontWeight: 600, color: kmsColors.textMuted,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    marginBottom: 6, fontFamily: kmsFont,
                  }}
                >
                  Eerder besteld voor
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {shownHistory.map((record) => {
                    const key = `${record.ean}-${record.size}-${record.person_id}`;
                    const added = addedKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleTagTap(record)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px 4px 4px', borderRadius: 999,
                          fontSize: 12, fontWeight: 600, fontFamily: kmsFont, cursor: 'pointer',
                          border: `1.5px solid ${added ? 'rgba(0,136,56,0.5)' : 'rgba(0,160,200,0.3)'}`,
                          background: added ? 'rgba(0,136,56,0.15)' : 'rgba(0,160,200,0.08)',
                          color: added ? '#3DDC84' : kmsColors.cyan,
                          transition: 'all 150ms ease',
                        }}
                      >
                        <span
                          style={{
                            width: 20, height: 20, borderRadius: '50%',
                            background: 'rgba(0,160,200,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 700,
                          }}
                        >
                          {personInitials(record.person_name)}
                        </span>
                        {formatShortName(record.person_name)} · {record.size}
                        <span style={{ fontWeight: 800 }}>{added ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setTagsExpanded((v) => !v)}
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '4px 12px', borderRadius: 999,
                        background: 'transparent', border: '1.5px dashed rgba(255,255,255,0.2)',
                        color: kmsColors.textMuted, fontSize: 12, fontWeight: 600,
                        fontFamily: kmsFont, cursor: 'pointer',
                      }}
                    >
                      {tagsExpanded ? 'Toon minder' : `+${hiddenCount} meer`}
                    </button>
                  )}
                </div>
              </div>
            )}
            <SizeSelector
              variants={product.variants}
              cart={cart}
              onQuantityChange={onQuantityChange}
              onDetailClick={onDetailClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}
