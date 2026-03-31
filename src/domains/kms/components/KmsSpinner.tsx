import { kmsColors } from '../lib/kms-theme';

export function KmsSpinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: kmsColors.bg,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: `3px solid ${kmsColors.border}`,
          borderTopColor: kmsColors.orange,
          borderRadius: '50%',
          animation: 'kms-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes kms-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
