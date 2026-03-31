import { useState, useMemo, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { useCart } from '../hooks/useCart';
import { ProductCard } from '../components/ProductCard';
import { CartBar } from '../components/CartBar';
import { ProductDetail } from '../components/ProductDetail';
import { OrderSummary } from '../components/OrderSummary';
import { kmsColors, kmsFont, KMS_DEFAULT_SLUG, isKmsPortal, kmsApiBase } from '../lib/kms-theme';
import { kmsAuthFetch } from '../lib/kms-auth-fetch';
import { BolusModeContext } from '../lib/kms-bolus-context';
import { usePwaInstall } from '../hooks/usePwaInstall';
import type { KmsPortalProduct, KmsPortalProductList, KmsOrderResponse } from '../types';

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
  const { customerName, isAuthenticated, customerSlug } = useKmsAuth();
  const slug = urlSlug || customerSlug || KMS_DEFAULT_SLUG;
  const { t } = useContext(BolusModeContext);
  const { canInstall, promptInstall, isIos, dismiss: dismissPwa } = usePwaInstall();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(isKmsPortal ? '/' : `/kms/${slug}`, { replace: true });
    }
  }, [isAuthenticated, navigate, slug]);

  const [products, setProducts] = useState<KmsPortalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [detailProduct, setDetailProduct] = useState<KmsPortalProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { cart, setQuantity, clearCart } = useCart();
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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.model_name.toLowerCase().includes(q) ||
        p.brand_name.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  function handleToggle(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index));
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

      <KmsLayout customerName={customerName}>
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
                setExpandedIndex(null);
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
          {t('products.title')}
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
              {searchQuery
                ? `${t('order.no_results_for')} "${searchQuery}"`
                : t('order.no_products_assigned')}
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
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
            {filteredProducts.map((product, index) => {
              // Use a stable key combining brand+model+color
              const key = `${product.brand_name}-${product.model_name}-${product.color}-${index}`;
              return (
                <ProductCard
                  key={key}
                  product={product}
                  index={index}
                  isExpanded={expandedIndex === index}
                  onToggle={() => handleToggle(index)}
                  onDetailClick={() => handleOpenDetail(product)}
                  cart={cart}
                  onQuantityChange={(variantId, quantity) => {
                    const variant = product.variants.find(v => v.id === variantId);
                    setQuantity(variantId, quantity, variant ? {
                      modelName: `${product.brand_name} ${product.model_name}`,
                      color: product.color,
                      size: variant.size,
                      ean: variant.ean ?? '',
                      priceCents: variant.price_cents ?? 0,
                    } : undefined);
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
      />
    </>
  );
}
