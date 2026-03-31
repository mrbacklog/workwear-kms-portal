import { type ReactNode, useEffect } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { useBolusModus } from '../hooks/useBolusModus';
import { BolusModeCountdown, BolusModeActiveBanner } from './BolusModus';
import { BolusModeContext } from '../lib/kms-bolus-context';

interface KmsLayoutProps {
  children: ReactNode;
  customerName?: string | null;
}

export function KmsLayout({ children, customerName }: KmsLayoutProps) {
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

      {/* Gradient bar keyframe */}
      <style>{`
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

            {/* Right: Customer name */}
            {customerName && (
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
            )}
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
    </BolusModeContext.Provider>
  );
}
