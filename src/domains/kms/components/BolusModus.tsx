import { kmsColors, kmsFont } from '../lib/kms-theme';

interface BolusModeCountdownProps {
  countdownNumber: number | null;
  flashActive: boolean;
}

export function BolusModeCountdown({ countdownNumber, flashActive }: BolusModeCountdownProps) {
  const isVisible = countdownNumber !== null || flashActive;
  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes kms-bolus-number-in {
          from { opacity: 0; transform: scale(1.4); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes kms-bolus-flash {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Flash overlay */}
      {flashActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#FFFFFF',
            animation: 'kms-bolus-flash 150ms ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main countdown overlay */}
      {!flashActive && countdownNumber !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            key={countdownNumber}
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: kmsColors.orange,
              fontFamily: kmsFont,
              lineHeight: 1,
              animation: 'kms-bolus-number-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              userSelect: 'none',
            }}
          >
            {countdownNumber}
          </div>
        </div>
      )}
    </>
  );
}

interface BolusModeActiveBannerProps {
  onDeactivate: () => void;
}

export function BolusModeActiveBanner({ onDeactivate }: BolusModeActiveBannerProps) {
  return (
    <>
      <style>{`
        @keyframes kms-bolus-banner-in {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 8000,
          background: kmsColors.orange,
          color: '#FFFFFF',
          fontFamily: kmsFont,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'kms-bolus-banner-in 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      >
        <span>BOLUS MODUS ACTIEF — ZEEUWS DIALECT</span>
        <button
          onClick={onDeactivate}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            color: '#FFFFFF',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: kmsFont,
            letterSpacing: '0.5px',
          }}
        >
          Uitzetten
        </button>
      </div>
    </>
  );
}
