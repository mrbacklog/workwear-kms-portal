/**
 * KMS ColorSwatch — inline-styles variant van @/shared/ui/ColorSwatch.
 * Identieke logica (primary/secondary/tertiary), zonder Tailwind afhankelijkheid
 * zodat het ook werkt in de standalone kms-portal (Cloudflare Pages).
 */

const RAINBOW_GRADIENT =
  'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)';

interface ColorSwatchProps {
  hexCode?: string | null;
  secondaryHex?: string | null;
  tertiaryHex?: string | null;
  size?: number;
}

function getBackground(hexCode?: string | null, secondaryHex?: string | null, tertiaryHex?: string | null): string {
  const primary = hexCode || '#CCCCCC';

  if (hexCode === '#RAINBOW') return RAINBOW_GRADIENT;

  if (tertiaryHex && secondaryHex) {
    return `linear-gradient(to right, ${primary} 33.33%, ${secondaryHex} 33.33% 66.66%, ${tertiaryHex} 66.66%)`;
  }

  if (secondaryHex) {
    return `linear-gradient(135deg, ${primary} 50%, ${secondaryHex} 50%)`;
  }

  return primary;
}

export function ColorSwatch({ hexCode, secondaryHex, tertiaryHex, size = 14 }: ColorSwatchProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.1)',
        background: getBackground(hexCode, secondaryHex, tertiaryHex),
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  );
}
