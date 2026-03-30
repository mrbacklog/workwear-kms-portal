import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { useCart } from '../hooks/useCart';
import { ProductCard } from '../components/ProductCard';
import { CartBar } from '../components/CartBar';
import { ProductDetail } from '../components/ProductDetail';
import { OrderSummary } from '../components/OrderSummary';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import type { KmsPortalProduct, KmsPortalProductList, KmsOrderResponse } from '../types';
import { API_BASE } from '@/lib/api';

// Skeleton loader for a single product card
function CardSkeleton() {
  return (
    <div
      style={{
        background: kmsColors.white,
        borderRadius: 18,
        border: '1.5px solid transparent',
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
          background: '#F0F0F0',
          flexShrink: 0,
          animation: 'kms-shimmer 1.4s ease-in-out infinite',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            height: 14,
            borderRadius: 6,
            background: '#F0F0F0',
            width: '65%',
            animation: 'kms-shimmer 1.4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: '#F0F0F0',
            width: '40%',
            animation: 'kms-shimmer 1.4s ease-in-out infinite 0.1s',
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: '#F0F0F0',
            width: '30%',
            animation: 'kms-shimmer 1.4s ease-in-out infinite 0.2s',
          }}
        />
      </div>
    </div>
  );
}

export default function KmsOrderPage() {
  const navigate = useNavigate();
  const { customerName, isAuthenticated, authHeader } = useKmsAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [products, setProducts] = useState<KmsPortalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [detailProduct, setDetailProduct] = useState<KmsPortalProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { cart, addItem, setQuantity, clearCart } = useCart();
  const [showSummary, setShowSummary] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/kms/products`, {
        headers: authHeader,
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate('/', { replace: true });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data: KmsPortalProductList = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setError('Er ging iets mis bij het laden van de producten.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      void fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
    navigate('/bevestiging', {
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
            top: 64,
            zIndex: 40,
            background: kmsColors.white,
            padding: '12px 0 16px',
            borderBottom: '1px solid #F0F0F0',
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
                color: '#AAAAAA',
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
              placeholder="Zoek op merk, model of kleur..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExpandedIndex(null);
              }}
              style={{
                width: '100%',
                padding: '14px 44px 14px 48px',
                border: '1.5px solid #E8E8E8',
                borderRadius: 24,
                fontSize: 15,
                fontFamily: kmsFont,
                background: '#FAFAFA',
                outline: 'none',
                color: kmsColors.black,
                transition: 'all 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = kmsColors.white;
                e.currentTarget.style.borderColor = kmsColors.cyan;
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,160,200,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = '#FAFAFA';
                e.currentTarget.style.borderColor = '#E8E8E8';
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
                  background: '#CCCCCC',
                  border: 'none',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#444',
                  fontSize: 12,
                  fontFamily: kmsFont,
                }}
                aria-label="Zoekopdracht wissen"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Section label */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#888888',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            padding: '4px 0',
            marginBottom: 12,
            fontFamily: kmsFont,
          }}
        >
          Uw assortiment
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
                background: '#FFF0F0',
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
                stroke="#C0392B"
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
                  color: kmsColors.black,
                  marginBottom: 4,
                  fontFamily: kmsFont,
                }}
              >
                Er ging iets mis
              </div>
              <div style={{ fontSize: 14, color: '#888', fontFamily: kmsFont }}>
                {error}
              </div>
            </div>
            <button
              onClick={() => void fetchProducts()}
              style={{
                padding: '12px 24px',
                background: kmsColors.orange,
                color: kmsColors.white,
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: kmsFont,
              }}
            >
              Opnieuw proberen
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
                color: kmsColors.black,
                marginBottom: 4,
                fontFamily: kmsFont,
              }}
            >
              {searchQuery ? 'Geen producten gevonden' : 'Geen producten beschikbaar'}
            </div>
            <div style={{ fontSize: 14, color: '#888', fontFamily: kmsFont }}>
              {searchQuery
                ? `Geen resultaten voor "${searchQuery}"`
                : 'Er zijn nog geen producten toegewezen aan uw assortiment.'}
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
                Zoekfilter verwijderen
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
                  isExpanded={expandedIndex === index}
                  onToggle={() => handleToggle(index)}
                  onDetailClick={() => handleOpenDetail(product)}
                  cart={cart}
                  onQuantityChange={(variantId, quantity) => {
                    const existing = cart.items.find(i => i.variantId === variantId);
                    if (!existing && quantity > 0) {
                      const variant = product.variants.find(v => v.id === variantId);
                      if (variant) {
                        addItem({
                          variantId: variant.id,
                          modelName: product.model_name,
                          color: product.color,
                          size: variant.size,
                          ean: variant.ean,
                          priceCents: variant.price_cents ?? 0,
                        });
                      }
                    } else {
                      setQuantity(variantId, quantity);
                    }
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
        authHeader={authHeader}
      />
    </>
  );
}
