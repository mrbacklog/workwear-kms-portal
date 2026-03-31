import { kmsColors, kmsFont } from '../lib/kms-theme';
import { usePwaInstall } from '../hooks/usePwaInstall';

export function PwaInstallPrompt() {
  const { canInstall, promptInstall, isIos, dismiss } = usePwaInstall();

  if (!canInstall) return null;

  if (isIos) {
    return (
      <div
        style={{
          marginTop: 16,
          padding: '20px',
          background: kmsColors.surface,
          border: `1.5px solid ${kmsColors.border}`,
          borderRadius: 14,
          fontFamily: kmsFont,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(0,160,200,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={kmsColors.cyan} strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: kmsColors.text,
                marginBottom: 4,
              }}
            >
              Voeg toe aan startscherm
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: kmsColors.textSecondary,
                lineHeight: 1.6,
              }}
            >
              Tik op het Delen-icoon en kies &ldquo;Zet op beginscherm&rdquo;
            </p>
          </div>
        </div>

        <button
          onClick={dismiss}
          style={{
            padding: '10px 20px',
            background: kmsColors.cyan,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: kmsFont,
            transition: 'background 150ms ease',
          }}
        >
          Begrepen
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 16,
        padding: '20px',
        background: kmsColors.surface,
        border: `1.5px solid ${kmsColors.border}`,
        borderRadius: 14,
        fontFamily: kmsFont,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(0,160,200,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={kmsColors.cyan} strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: kmsColors.text,
              marginBottom: 4,
            }}
          >
            Voeg toe aan startscherm
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: kmsColors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            Open het bestelportaal direct vanaf uw startscherm.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => void promptInstall()}
          style={{
            padding: '10px 20px',
            background: kmsColors.cyan,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: kmsFont,
            transition: 'background 150ms ease',
          }}
        >
          Toevoegen
        </button>

        <button
          onClick={dismiss}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 13,
            color: kmsColors.textMuted,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: kmsFont,
          }}
        >
          Misschien later
        </button>
      </div>
    </div>
  );
}
