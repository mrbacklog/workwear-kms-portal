import { kmsColors, kmsFont } from '../lib/kms-theme';

interface KmsConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Lokale, KMS-eigen confirm-dialoog (inline dark-theme stijl, geen Tailwind/Radix).
 *
 * De KMS-portaal-frontend wordt ALS APARTE, KMS-only build gedeployd naar Cloudflare
 * Pages (zie scripts/kms_sync_deploy.py) — die build bevat geen `domains/shared/`-boom,
 * dus een import uit `@/shared` breekt daar met "Cannot find module" ook al werkt het
 * lokaal in de monorepo-dev-server prima. Vandaar een eigen, lichte implementatie i.p.v.
 * de gedeelde shadcn/Radix `ConfirmDialog`.
 */
export function KmsConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Bevestigen',
  cancelLabel = 'Annuleren',
  variant = 'default',
  onConfirm,
  onCancel,
}: KmsConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: kmsColors.surface,
          border: `1px solid ${kmsColors.border}`,
          borderRadius: 14,
          padding: 24,
          maxWidth: 380,
          width: '100%',
          fontFamily: kmsFont,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: kmsColors.text, marginBottom: 8 }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 13, color: kmsColors.textMuted, marginBottom: 20, lineHeight: 1.5 }}>
            {description}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${kmsColors.border}`,
              background: 'transparent',
              color: kmsColors.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: kmsFont,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: variant === 'destructive' ? kmsColors.error : kmsColors.orange,
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: kmsFont,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
