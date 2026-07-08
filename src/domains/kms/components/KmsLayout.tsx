import { type ReactNode, useEffect, useState } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { useBolusModus } from '../hooks/useBolusModus';
import { BolusModeCountdown, BolusModeActiveBanner } from './BolusModus';
import { BolusModeContext } from '../lib/kms-bolus-context';
import { CustomerSwitcher } from './CustomerSwitcher';
import { FeedbackDrawer } from './FeedbackDrawer';
import { AccessRequestDialog } from './AccessRequestDialog';
import type { KmsStaffCustomer } from '../types';

interface KmsLayoutProps {
  children: ReactNode;
  customerName?: string | null;
  isStaff?: boolean;
  selectedCustomer?: { id: string; company_name: string } | null;
  onCustomerSwitch?: (customer: KmsStaffCustomer) => void;
  onLogout?: () => void;
}

export function KmsLayout({ children, customerName, isStaff, selectedCustomer, onCustomerSwitch, onLogout }: KmsLayoutProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [accessRequestOpen, setAccessRequestOpen] = useState(false);
  const { isActive, state, pressProgress, countdownNumber, flashActive, handlers, t, deactivate } =
    useBolusModus();

  useEffect(() => {
    document.title = 'KMS Bestelportaal — Van Kruiningen Reklame';
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <BolusModeContext.Provider value={{ t, bolusActive: isActive }}>
      {/* Load Poppins font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Gradient bar keyframe + body reset (KMS portal repo heeft geen index.css) */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: ${kmsColors.bg};
        }
        @keyframes kms-gradient-flow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* Bolus Modus overlays */}
      {(state === 'countdown' || flashActive) && (
        <BolusModeCountdown countdownNumber={countdownNumber} flashActive={flashActive} />
      )}
      {isActive && <BolusModeActiveBanner onDeactivate={deactivate} />}

      <div
        style={{
          minHeight: '100vh',
          background: kmsColors.bg,
          fontFamily: kmsFont,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: isActive ? 32 : 0,
        }}
      >
        {/* Sticky header */}
        <header
          style={{
            position: 'sticky',
            top: isActive ? 32 : 0,
            zIndex: 50,
            background: kmsColors.black,
            transition: 'top 300ms ease',
          }}
        >
          <div
            style={{
              padding: '0 16px',
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: Logo with bolus long-press handler */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                {...handlers}
                aria-label="Houd 3 seconden ingedrukt voor Bolus Modus"
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none',
                  borderRadius: 6,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {pressProgress > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `conic-gradient(${kmsColors.orange} ${pressProgress * 360}deg, transparent 0deg)`,
                      opacity: 0.3,
                      borderRadius: 6,
                    }}
                  />
                )}
                <img
                  src="/logo-vankruiningen.png"
                  alt="Van Kruiningen"
                  style={{ height: 28, width: 'auto', position: 'relative', zIndex: 1, display: 'block' }}
                />
              </div>
            </div>

            {/* Right: Customer name + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isStaff && selectedCustomer ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setSwitcherOpen((prev) => !prev)}
                    style={{
                      fontFamily: kmsFont,
                      fontSize: 13,
                      fontWeight: 500,
                      color: kmsColors.textSecondary,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      maxWidth: 200,
                      transition: 'color 150ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = kmsColors.text; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = kmsColors.textSecondary; }}
                    aria-label={t('layout.switch_customer')}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {selectedCustomer.company_name}
                    </span>
                    <span style={{ flexShrink: 0, fontSize: 10 }}>▾</span>
                  </button>
                  {switcherOpen && onCustomerSwitch && (
                    <CustomerSwitcher
                      currentCustomerId={selectedCustomer.id}
                      onSelect={(customer) => {
                        setSwitcherOpen(false);
                        onCustomerSwitch(customer);
                      }}
                      onClose={() => setSwitcherOpen(false)}
                    />
                  )}
                </div>
              ) : customerName ? (
                <div
                  style={{
                    fontFamily: kmsFont,
                    fontSize: 13,
                    fontWeight: 500,
                    color: kmsColors.textSecondary,
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {customerName}
                </div>
              ) : null}
              {!isStaff && (
                <button
                  onClick={() => setAccessRequestOpen(true)}
                  style={{
                    fontFamily: kmsFont,
                    fontSize: 12,
                    color: kmsColors.textMuted,
                    background: 'none',
                    border: `1px solid ${kmsColors.textMuted}`,
                    borderRadius: 6,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'color 150ms ease, border-color 150ms ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = kmsColors.text; e.currentTarget.style.borderColor = kmsColors.text; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = kmsColors.textMuted; e.currentTarget.style.borderColor = kmsColors.textMuted; }}
                >
                  {t('layout.request_access')}
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    fontFamily: kmsFont,
                    fontSize: 12,
                    color: kmsColors.textMuted,
                    background: 'none',
                    border: `1px solid ${kmsColors.textMuted}`,
                    borderRadius: 6,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'color 150ms ease, border-color 150ms ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = kmsColors.text; e.currentTarget.style.borderColor = kmsColors.text; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = kmsColors.textMuted; e.currentTarget.style.borderColor = kmsColors.textMuted; }}
                >
                  {t('layout.logout')}
                </button>
              )}
            </div>
          </div>

          {/* Animated gradient bar */}
          <div
            style={{
              height: 3,
              background: 'linear-gradient(90deg, #F18E00, #00A0C8, #008838, #F18E00)',
              backgroundSize: '200% 100%',
              animation: 'kms-gradient-flow 4s linear infinite',
            }}
          />
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 640,
              padding: '24px 16px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </div>
        </main>
      </div>
      {/* Feedback drawer — alleen voor staff */}
      {isStaff && <FeedbackDrawer />}

      {accessRequestOpen && (
        <AccessRequestDialog t={t} onClose={() => setAccessRequestOpen(false)} />
      )}
    </BolusModeContext.Provider>
  );
}
