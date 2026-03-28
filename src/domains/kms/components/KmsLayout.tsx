import { type ReactNode } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { useBolusModus } from '../hooks/useBolusModus';
import { BolusModeCountdown, BolusModeActiveBanner } from './BolusModus';
import { BolusModeContext } from '../lib/kms-bolus-context';

interface KmsLayoutProps {
  children: ReactNode;
  customerName?: string | null;
}

function VkLogoMark({
  handlers,
  pressProgress,
}: {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
  };
  pressProgress: number;
}) {
  return (
    <div
      {...handlers}
      aria-label="Houd 3 seconden ingedrukt voor Bolus Modus"
      style={{
        width: 44,
        height: 44,
        background: kmsColors.black,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Orange bottom accent bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: kmsColors.orange,
        }}
      />

      {/* Press progress ring */}
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

      {/* VK letters */}
      <span
        style={{
          fontFamily: kmsFont,
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: '-0.5px',
          color: kmsColors.white,
          lineHeight: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ color: kmsColors.orange }}>V</span>
        <span style={{ color: kmsColors.cyan }}>K</span>
      </span>
    </div>
  );
}

export function KmsLayout({ children, customerName }: KmsLayoutProps) {
  const { isActive, state, pressProgress, countdownNumber, flashActive, handlers, t, deactivate } =
    useBolusModus();

  return (
    <BolusModeContext.Provider value={{ t, bolusActive: isActive }}>
      {/* Load Poppins font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Bolus Modus overlays */}
      {(state === 'countdown' || flashActive) && (
        <BolusModeCountdown countdownNumber={countdownNumber} flashActive={flashActive} />
      )}
      {isActive && <BolusModeActiveBanner onDeactivate={deactivate} />}

      <div
        style={{
          minHeight: '100vh',
          background: kmsColors.white,
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
            padding: '0 16px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'top 300ms ease',
          }}
        >
          {/* Left: Logo + brand name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <VkLogoMark handlers={handlers} pressProgress={pressProgress} />
            <div>
              <div
                style={{
                  fontFamily: kmsFont,
                  fontWeight: 600,
                  fontSize: 14,
                  color: kmsColors.white,
                  lineHeight: 1.2,
                }}
              >
                Van Kruiningen Reklame
              </div>
              <div
                style={{
                  fontFamily: kmsFont,
                  fontSize: 11,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {isActive ? 'Bestelportaol' : 'Bestelportaal'}
              </div>
            </div>
          </div>

          {/* Right: Customer name */}
          {customerName && (
            <div
              style={{
                fontFamily: kmsFont,
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.8)',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {customerName}
            </div>
          )}
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
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </BolusModeContext.Provider>
  );
}
