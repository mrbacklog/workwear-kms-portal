
import { useState, useRef, useEffect, useContext } from 'react';
import type { KmsPortalProduct, CartState, KmsPersonHistoryRecord, KmsPerson } from '../types';
import { kmsColors, kmsFont, colorNameToHex, groupIdToColor, formatShortName, personInitials } from '../lib/kms-theme';
import { BolusModeContext } from '../lib/kms-bolus-context';
import { SizeSelector } from './SizeSelector';
import { ColorSwatch } from './ColorSwatch';

interface ProductCardProps {
  /** Representatieve kleur van het model (eerste kleur in de lijst). */
  product: KmsPortalProduct;
  /**
   * Alle kleuren van hetzelfde model die na filteren zichtbaar zijn.
   * Eén kleur = de kaart gedraagt zich als voorheen (geen kleurkiezer).
   */
  colors?: KmsPortalProduct[];
  isExpanded: boolean;
  onToggle: () => void;
  onDetailClick: (product: KmsPortalProduct) => void;
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

/**
 * Stabiele sleutel per kleur binnen een model. color_variant_id is de
 * betrouwbare bron; alleen als die ontbreekt vallen we terug op de kleurnaam.
 */
function colorKey(product: KmsPortalProduct): string {
  return product.color_variant_id ?? `naam:${product.color}`;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  );
}


export function ProductCard({
  product,
  colors,
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
  const { t } = useContext(BolusModeContext);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colorOptions = colors && colors.length > 0 ? colors : [product];
  const isMultiColor = colorOptions.length > 1;
  const [activeColorKey, setActiveColorKey] = useState<string>(() => colorKey(colorOptions[0]));
  // Valt de gekozen kleur weg uit de zichtbare set (zoek-/groepsfilter), dan
  // toont de kaart de eerste kleur die er nog wél is. Bewust tijdens render
  // afgeleid en niet in state gecorrigeerd: komt de kleur terug, dan staat hij
  // weer geselecteerd.
  const activeColor =
    colorOptions.find((c) => colorKey(c) === activeColorKey) ?? colorOptions[0];

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  function quantityForColor(color: KmsPortalProduct): number {
    return color.variants.reduce((sum, variant) => {
      return sum + (cart.items.find((item) => item.variantId === variant.id)?.quantity ?? 0);
    }, 0);
  }

  // Telt over ALLE kleuren van het model — de badge hoort de hele kaart te dekken,
  // niet alleen de kleur die toevallig openstaat.
  const selectedQuantity = colorOptions.reduce((sum, c) => sum + quantityForColor(c), 0);

  const hasSelection = selectedQuantity > 0;
  // colorHex als fallback voor de thumbnail placeholder
  const colorHex = activeColor.color_primary_hex ?? colorNameToHex(activeColor.color);

  const priceFromCents = colorOptions.reduce<number | null>((min, c) => {
    if (c.price_from_cents == null) return min;
    return min == null || c.price_from_cents < min ? c.price_from_cents : min;
  }, null);

  // Unie van de indelingen over alle kleuren, gededupliceerd op id.
  const cardGroups = Array.from(
    new Map(colorOptions.flatMap((c) => c.groups ?? []).map((g) => [g.id, g])).values(),
  ).sort((a, b) => a.sort_order - b.sort_order);

  // Historie is per model aangeleverd; toon in de kaartbody alleen wat bij de
  // geopende kleur hoort.
  const activeEans = new Set(activeColor.variants.map((v) => v.ean));
  const colorHistory = history.filter((h) => activeEans.has(h.ean));

  const visibleHistory = personFilter
    ? colorHistory.filter((h) => h.person_id === personFilter)
    : colorHistory;
  const sortedHistory = [...visibleHistory].sort((a, b) =>
    b.last_ordered_at.localeCompare(a.last_ordered_at),
  );
  const shownHistory = tagsExpanded ? sortedHistory : sortedHistory.slice(0, TAG_LIMIT);
  const hiddenCount = sortedHistory.length - TAG_LIMIT;

  const filterHint = personFilter
    ? [...colorHistory]
        .filter((h) => h.person_id === personFilter)
        .sort((a, b) => b.last_ordered_at.localeCompare(a.last_ordered_at))[0]
    : null;

  function handleTagTap(record: KmsPersonHistoryRecord) {
    const variant = activeColor.variants.find((v) => v.ean === record.ean);
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
          {activeColor.image ? (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={activeColor.image.url}
                alt={`${product.model_name} ${activeColor.color}`}
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
              {isMultiColor ? (
                <>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {colorOptions.slice(0, 4).map((c) => (
                      <ColorSwatch
                        key={colorKey(c)}
                        hexCode={c.color_primary_hex}
                        secondaryHex={c.color_secondary_hex}
                        tertiaryHex={c.color_tertiary_hex}
                        size={10}
                      />
                    ))}
                  </span>
                  {colorOptions.length} {t('product.colors')}
                </>
              ) : (
                <>
                  <ColorSwatch
                    hexCode={activeColor.color_primary_hex}
                    secondaryHex={activeColor.color_secondary_hex}
                    tertiaryHex={activeColor.color_tertiary_hex}
                    size={10}
                  />
                  {activeColor.color}
                </>
              )}
            </div>
            {priceFromCents != null && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: kmsColors.textSecondary,
                  marginTop: 6,
                  fontFamily: kmsFont,
                }}
              >
                {formatPrice(priceFromCents)}
              </div>
            )}
            {cardGroups.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {cardGroups.map((group) => {
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
            maxHeight: isExpanded
              ? (tagsExpanded ? 900 : 620) + (isMultiColor ? 72 : 0)
              : 0,
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
            {isMultiColor && (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontSize: 10, fontWeight: 600, color: kmsColors.textMuted,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    marginBottom: 6, fontFamily: kmsFont,
                  }}
                >
                  {t('product.choose_color')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {colorOptions.map((c) => {
                    const key = colorKey(c);
                    const isActive = key === colorKey(activeColor);
                    const qty = quantityForColor(c);
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveColorKey(key)}
                        aria-pressed={isActive}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 999,
                          fontSize: 12, fontWeight: 600, fontFamily: kmsFont, cursor: 'pointer',
                          border: `1.5px solid ${isActive ? kmsColors.borderSelected : kmsColors.border}`,
                          background: isActive ? 'rgba(241,142,0,0.12)' : 'transparent',
                          color: isActive ? kmsColors.text : kmsColors.textSecondary,
                          transition: 'all 150ms ease',
                        }}
                      >
                        <ColorSwatch
                          hexCode={c.color_primary_hex}
                          secondaryHex={c.color_secondary_hex}
                          tertiaryHex={c.color_tertiary_hex}
                          size={12}
                        />
                        {c.color}
                        {qty > 0 && (
                          <span
                            style={{
                              background: kmsColors.orange,
                              color: kmsColors.white,
                              fontSize: 10, fontWeight: 700,
                              padding: '1px 6px', borderRadius: 999,
                            }}
                          >
                            {qty}x
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
              variants={activeColor.variants}
              cart={cart}
              onQuantityChange={onQuantityChange}
              onDetailClick={() => onDetailClick(activeColor)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
