import { useState, useMemo, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { useKmsStaffContext } from '../hooks/useKmsStaffContext';
import { useCart } from '../hooks/useCart';
import { ProductCard } from '../components/ProductCard';
import { GrippProductCard } from '../components/GrippProductCard';
import { CartBar } from '../components/CartBar';
import { ProductDetail } from '../components/ProductDetail';
import { OrderSummary } from '../components/OrderSummary';
import { kmsColors, kmsFont, KMS_DEFAULT_SLUG, isKmsPortal, kmsApiBase, groupIdToColor } from '../lib/kms-theme';
import { kmsAuthFetch } from '../lib/kms-auth-fetch';
import { BolusModeContext } from '../lib/kms-bolus-context';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useKmsPersons } from '../hooks/useKmsPersons';
import { useKmsOrderHistory } from '../hooks/useKmsOrderHistory';
import { KmsPersonSheet } from '../components/KmsPersonSheet';
import { formatShortName } from '../lib/kms-theme';
import type { KmsPortalProduct, KmsPortalProductList, KmsOrderResponse, KmsPerson, KmsPersonHistoryRecord } from '../types';

// Skeleton loader for a single product card
function CardSkeleton() {
  return (
    <div
      style={{
        background: kmsColors.surface,
        borderRadius: 18,
        border: `1.5px solid ${kmsColors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 6,
          background: kmsColors.surfaceHover,
          flexShrink: 0,
          animation: 'kms-shimmer 1.4s ease-in-out infinite',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            height: 14,
            borderRadius: 6,
            background: kmsColors.surfaceHover,
            width: '65%',
            animation: 'kms-shimmer 1.4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: kmsColors.surfaceHover,
            width: '40%',
            animation: 'kms-shimmer 1.4s ease-in-out infinite 0.1s',
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: kmsColors.surfaceHover,
            width: '30%',
            animation: 'kms-shimmer 1.4s ease-in-out infinite 0.2s',
          }}
        />
      </div>
    </div>
  );
}

export default function KmsOrderPage() {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { customerName, isAuthenticated, customerSlug, isStaff, logout } = useKmsAuth();
  const { selectedCustomer, selectCustomer } = useKmsStaffContext();
  const slug = urlSlug || customerSlug || KMS_DEFAULT_SLUG;
  const { t } = useContext(BolusModeContext);
  const { canInstall, promptInstall, isIos, dismiss: dismissPwa } = usePwaInstall();

  // Redirect to auth if not authenticated; staff without customer goes to picker
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(isKmsPortal ? '/' : `/kms/${slug}`, { replace: true });
    } else if (isStaff && !selectedCustomer) {
      navigate(isKmsPortal ? '/klanten' : `/kms/${slug}/klanten`, { replace: true });
    }
  }, [isAuthenticated, isStaff, selectedCustomer, navigate, slug]);

  const [products, setProducts] = useState<KmsPortalProduct[]>([]);
  const [customerHasGrippId, setCustomerHasGrippId] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroupTab, setActiveGroupTab] = useState<string>('all');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<KmsPortalProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [personFilterSheetOpen, setPersonFilterSheetOpen] = useState(false);
  const { persons, createPerson } = useKmsPersons();
  const { history } = useKmsOrderHistory();

  const { cart, setQuantity, setGrippQuantity, setPersonsForItem, addPersonToLine, clearCart } = useCart();
  const [showSummary, setShowSummary] = useState(false);

  async function fetchProducts() {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await kmsAuthFetch(`${kmsApiBase}/api/v1/kms/products`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate(isKmsPortal ? '/' : `/kms/${slug}`, { replace: true });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data: KmsPortalProductList = await res.json();
      setProducts(data.products ?? []);
      setCustomerHasGrippId(data.customer_has_gripp_id ?? true);
    } catch {
      setError(t('order.error_loading'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      void fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isAuthenticated]);

  // Canonieke groepenlijst afgeleid uit de unie van product.groups (geen apart
  // endpoint nodig — de portal-API stuurt de groepen al mee per product),
  // gededupliceerd op id en gesorteerd op sort_order.
  const availableGroups = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; sort_order: number }>();
    for (const product of products) {
      for (const group of product.groups ?? []) {
        if (!byId.has(group.id)) byId.set(group.id, group);
      }
    }
    return Array.from(byId.values()).sort((a, b) => a.sort_order - b.sort_order);
  }, [products]);

  const allGroupIds = useMemo(() => availableGroups.map((g) => g.id), [availableGroups]);

  const historyByEan = useMemo(() => {
    const map = new Map<string, KmsPersonHistoryRecord[]>();
    for (const record of history) {
      const list = map.get(record.ean) ?? [];
      list.push(record);
      map.set(record.ean, list);
    }
    return map;
  }, [history]);

  const selectedFilterPerson = useMemo(
    () => (personFilter ? persons.find((p) => p.id === personFilter) ?? null : null),
    [personFilter, persons],
  );

  const filteredProducts = useMemo(() => {
    const byGroup =
      activeGroupTab === 'all'
        ? products
        : products.filter((p) => (p.groups ?? []).some((g) => g.id === activeGroupTab));

    const byPerson = personFilter
      ? byGroup.filter((p) =>
          p.variants.some((v) => (historyByEan.get(v.ean) ?? []).some((h) => h.person_id === personFilter)),
        )
      : byGroup;

    if (!searchQuery.trim()) return byPerson;
    const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return byPerson.filter((p) => {
      const text = `${p.brand_name} ${p.model_name} ${p.color}`.toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }, [products, searchQuery, activeGroupTab, personFilter, historyByEan]);

  /**
   * Bundelt de (per model+kleur aangeleverde) portal-producten tot één kaart per
   * model. Groeperen gebeurt op product_model_id — NOOIT op de modelnaam-tekst:
   * dezelfde merk+modelnaam kan naar verschillende modellen wijzen (met eigen
   * EAN's), en de modelnaam-opmaak is aan verandering onderhevig.
   *
   * Losse kaart blijft losse kaart bij: Gripp-regels (geen model), producten
   * zonder product_model_id, en modellen met maar één kleur.
   */
  const productGroups = useMemo(() => {
    const groups: { key: string; products: KmsPortalProduct[] }[] = [];
    const byModel = new Map<string, { key: string; products: KmsPortalProduct[] }>();

    filteredProducts.forEach((product, index) => {
      const modelId = product.source !== 'gripp' ? product.product_model_id : null;
      if (!modelId) {
        // Geen model om op te bundelen — eigen kaart, sleutel op eigen identiteit.
        const ownKey = product.gripp_product_id
          ? `gripp:${product.gripp_product_id}`
          : `los:${product.color_variant_id ?? `${product.brand_name}|${product.model_name}|${product.color}|${index}`}`;
        groups.push({ key: ownKey, products: [product] });
        return;
      }
      const existing = byModel.get(modelId);
      if (existing) {
        existing.products.push(product);
        return;
      }
      const entry = { key: `model:${modelId}`, products: [product] };
      byModel.set(modelId, entry);
      groups.push(entry);
    });

    return groups;
  }, [filteredProducts]);

  function handleToggle(key: string) {
    setExpandedKey((prev) => (prev === key ? null : key));
  }

  function handleOpenDetail(product: KmsPortalProduct) {
    setDetailProduct(product);
    setDetailOpen(true);
  }

  function handleCloseDetail() {
    setDetailOpen(false);
  }

  function handleCartClick() {
    setShowSummary(true);
  }

  function handleOrderPlaced(order: KmsOrderResponse) {
    clearCart();
    navigate(isKmsPortal ? '/bevestiging' : `/kms/${slug}/bevestiging`, {
      state: { order },
    });
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes kms-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <KmsLayout
        customerName={customerName}
        isStaff={isStaff}
        selectedCustomer={selectedCustomer}
        onCustomerSwitch={(customer) => {
          selectCustomer(customer);
          window.location.reload();
        }}
        onLogout={() => { logout(); navigate('/'); }}
      >
        {/* Search bar */}
        <div
          style={{
            position: 'sticky',
            top: 59,
            zIndex: 40,
            background: kmsColors.bg,
            padding: '12px 0 16px',
            borderBottom: `1px solid ${kmsColors.border}`,
            marginBottom: 16,
          }}
        >
          <div style={{ position: 'relative' }}>
            {/* Search icon */}
            <svg
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: kmsColors.textFaint,
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>

            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExpandedKey(null);
              }}
              style={{
                width: '100%',
                padding: '14px 44px 14px 48px',
                border: `1.5px solid ${kmsColors.border}`,
                borderRadius: 24,
                fontSize: 15,
                fontFamily: kmsFont,
                background: kmsColors.surface,
                outline: 'none',
                color: kmsColors.text,
                transition: 'all 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = kmsColors.surface;
                e.currentTarget.style.borderColor = kmsColors.borderHover;
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.04)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = kmsColors.surface;
                e.currentTarget.style.borderColor = kmsColors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: kmsColors.surfaceHover,
                  border: 'none',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: kmsColors.textSecondary,
                  fontSize: 12,
                  fontFamily: kmsFont,
                }}
                aria-label={t('order.clear_search')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Persoonsfilter-pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setPersonFilterSheetOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              fontFamily: kmsFont, cursor: 'pointer',
              background: selectedFilterPerson ? 'rgba(0,160,200,0.12)' : kmsColors.surface,
              border: `1.5px solid ${selectedFilterPerson ? kmsColors.cyan : 'rgba(255,255,255,0.1)'}`,
              color: selectedFilterPerson ? kmsColors.cyan : kmsColors.textSecondary,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {selectedFilterPerson ? formatShortName(selectedFilterPerson.name) : 'Filter op medewerker'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {selectedFilterPerson && (
            <button
              onClick={() => setPersonFilter(null)}
              aria-label="Filter wissen"
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: kmsColors.surfaceHover, border: 'none',
                color: kmsColors.textSecondary, fontSize: 13, cursor: 'pointer',
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Indeling-tabs — alleen tonen als er tenminste 1 indeling bestaat */}
        {availableGroups.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              paddingBottom: 12,
              marginBottom: 4,
              scrollbarWidth: 'none',
            }}
          >
            {[{ id: 'all', name: t('catalog.all_tab') }, ...availableGroups].map((group) => {
              const isActive = activeGroupTab === group.id;
              const activeColor = group.id === 'all' ? kmsColors.orange : groupIdToColor(group.id, allGroupIds);
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveGroupTab(group.id);
                    setExpandedKey(null);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: `1.5px solid ${isActive ? activeColor : kmsColors.border}`,
                    background: isActive ? `${activeColor}22` : kmsColors.surface,
                    color: isActive ? activeColor : kmsColors.textSecondary,
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: kmsFont,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Subtiele PWA install hint */}
        {canInstall && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: kmsColors.surface,
              borderRadius: 10,
              marginBottom: 12,
              fontFamily: kmsFont,
              fontSize: 13,
              color: kmsColors.textSecondary,
              border: `1px solid ${kmsColors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={kmsColors.cyan} strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>{isIos ? 'Voeg toe aan uw startscherm via Delen-icoon' : 'Voeg portaal toe aan startscherm'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isIos && (
                <button
                  onClick={() => void promptInstall()}
                  style={{
                    padding: '4px 12px',
                    background: kmsColors.cyan,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: kmsFont,
                  }}
                >
                  Toevoegen
                </button>
              )}
              <button
                onClick={dismissPwa}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: kmsColors.textMuted,
                  fontSize: 16,
                  lineHeight: 1,
                }}
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Section label */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: kmsColors.textMuted,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            padding: '4px 0',
            marginBottom: 12,
            fontFamily: kmsFont,
          }}
        >
          {selectedFilterPerson
            ? `EERDER BESTELD VOOR ${formatShortName(selectedFilterPerson.name).toUpperCase()}`
            : t('products.title')}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: kmsColors.errorBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={kmsColors.error}
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: kmsColors.text,
                  marginBottom: 4,
                  fontFamily: kmsFont,
                }}
              >
                {t('order.error_title')}
              </div>
              <div style={{ fontSize: 14, color: kmsColors.textMuted, fontFamily: kmsFont }}>
                {error}
              </div>
            </div>
            <button
              onClick={() => void fetchProducts()}
              style={{
                padding: '12px 24px',
                background: kmsColors.orange,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: kmsFont,
              }}
            >
              {t('order.retry')}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 40,
                marginBottom: 16,
              }}
            >
              🔍
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: kmsColors.text,
                marginBottom: 4,
                fontFamily: kmsFont,
              }}
            >
              {searchQuery ? t('order.no_results') : t('order.no_products')}
            </div>
            <div style={{ fontSize: 14, color: kmsColors.textMuted, fontFamily: kmsFont }}>
              {selectedFilterPerson && !searchQuery
                ? `Nog niets besteld voor ${formatShortName(selectedFilterPerson.name)}`
                : searchQuery
                ? `${t('order.no_results_for')} "${searchQuery}"`
                : t('order.no_products_assigned')}
            </div>
            {(searchQuery || selectedFilterPerson) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPersonFilter(null);
                }}
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  background: 'none',
                  color: kmsColors.cyan,
                  border: `1.5px solid ${kmsColors.cyan}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: kmsFont,
                }}
              >
                {t('order.clear_filter')}
              </button>
            )}
          </div>
        )}

        {/* Product list */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              paddingBottom: 140,
            }}
          >
            {productGroups.map((group, index) => {
              const product = group.products[0];

              if (product.source === 'gripp' && product.gripp_product_id) {
                return (
                  <GrippProductCard
                    key={group.key}
                    product={product}
                    index={index}
                    cart={cart}
                    allGroupIds={allGroupIds}
                    onQuantityChange={(grippProductId, quantity) => {
                      setGrippQuantity(grippProductId, quantity, {
                        modelName: product.model_name,
                        priceCents: product.price_from_cents ?? 0,
                      });
                    }}
                  />
                );
              }

              // Zoek de variant op over ALLE kleuren van dit model, zodat de
              // winkelwagenregel de kleur krijgt waar de variant echt bij hoort.
              function findVariant(variantId: string) {
                for (const color of group.products) {
                  const variant = color.variants.find((v) => v.id === variantId);
                  if (variant) return { variant, color };
                }
                return null;
              }

              return (
                <ProductCard
                  key={group.key}
                  product={product}
                  colors={group.products}
                  index={index}
                  isExpanded={expandedKey === group.key}
                  onToggle={() => handleToggle(group.key)}
                  onDetailClick={(shownColor) => handleOpenDetail(shownColor)}
                  cart={cart}
                  allGroupIds={allGroupIds}
                  history={group.products.flatMap((c) =>
                    c.variants.flatMap((v) => historyByEan.get(v.ean) ?? []),
                  )}
                  personFilter={personFilter}
                  onQuantityChange={(variantId, quantity) => {
                    const found = findVariant(variantId);
                    setQuantity(variantId, quantity, found ? {
                      modelName: `${found.color.brand_name} ${found.color.model_name}`,
                      color: found.color.color,
                      size: found.variant.size,
                      ean: found.variant.ean ?? '',
                      priceCents: found.variant.price_cents ?? 0,
                    } : undefined);
                  }}
                  onRepeatHistoryTag={(variantId, qty, person: KmsPerson) => {
                    const found = findVariant(variantId);
                    if (!found) return;
                    addPersonToLine(variantId, qty, person, {
                      modelName: `${found.color.brand_name} ${found.color.model_name}`,
                      color: found.color.color,
                      size: found.variant.size,
                      ean: found.variant.ean ?? '',
                      priceCents: found.variant.price_cents ?? 0,
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </KmsLayout>

      {/* Sticky cart bar */}
      <CartBar cart={cart} onClick={handleCartClick} />

      {/* Product detail panel */}
      <ProductDetail
        product={detailProduct}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
      />

      {/* Order summary slide-up */}
      <OrderSummary
        cart={cart}
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        onOrderPlaced={handleOrderPlaced}
        customerHasGrippId={customerHasGrippId}
        onPersonsChange={setPersonsForItem}
        history={history}
      />

      <KmsPersonSheet
        mode="filter"
        isOpen={personFilterSheetOpen}
        onClose={() => setPersonFilterSheetOpen(false)}
        persons={persons}
        history={history}
        onCreatePerson={createPerson}
        selectedPersonId={personFilter}
        onSelectFilter={(id) => {
          setPersonFilter(id);
          setExpandedKey(null);
        }}
      />
    </>
  );
}
