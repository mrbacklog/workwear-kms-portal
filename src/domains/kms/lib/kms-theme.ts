export const kmsColors = {
  // Brand accent colors (from VK logo)
  orange: '#F18E00',
  cyan: '#00A0C8',
  green: '#008838',
  orangeHover: '#D97E00',

  // Legacy keys (remapped for dark mode)
  black: '#000000',
  white: '#0D1117',
  lightGray: 'rgba(255,255,255,0.06)',

  // Backgrounds
  bg: '#0D1117',
  surface: '#161B22',
  surfaceHover: '#1C2333',
  headerBg: '#000000',

  // Text
  text: '#E8E8E8',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.35)',
  textFaint: 'rgba(255,255,255,0.2)',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',
  borderSelected: 'rgba(241,142,0,0.4)',

  // Semantic
  error: '#DC2626',
  errorBg: 'rgba(220,38,38,0.1)',
  successBg: 'rgba(0,136,56,0.12)',
  warningBg: '#fffbeb',
  warningBorder: '#fcd34d',
  warningText: '#92400e',
} as const;

export const kmsFont = "'Poppins', sans-serif";

/**
 * Vertaalt een kleur-naam (color_raw) naar een hex kleurcode voor de swatch.
 * - Composite kleuren ("Bosgroen/Zwart") → gebruik de eerste component
 * - Bekende sleutelwoorden worden gematcht (ook als onderdeel van de naam)
 * - Hash-fallback voor volledig onbekende kleuren
 */
export function colorNameToHex(colorName: string): string {
  // Composite kleuren: neem de primaire (eerste) kleur
  const primary = colorName.split('/')[0].trim();
  const key = primary.toLowerCase();

  const map: [string, string][] = [
    // Nederlands
    ['zwart', '#1A1A1A'],
    ['wit', '#F5F5F5'],
    ['navy', '#1B2A4A'],
    ['marine', '#1B2A4A'],
    ['grijs', '#888888'],
    ['blauw', '#1E5FA3'],
    ['denim', '#2C5F8A'],
    ['kobalt', '#0047AB'],
    ['rood', '#C0392B'],
    ['bordeaux', '#6D1A2A'],
    ['wijn', '#6D1A2A'],
    ['groen', '#2D7A3A'],
    ['bosgroen', '#2D5A1B'],
    ['olijf', '#6B7A2A'],
    ['khaki', '#7D7A45'],
    ['geel', '#E6C219'],
    ['oranje', '#E67E22'],
    ['bruin', '#7B5A3A'],
    ['camel', '#C19A6B'],
    ['beige', '#D4C5A9'],
    ['sahara', '#C8A96E'],
    ['zand', '#C2A97A'],
    ['lichtblauw', '#5C9BD4'],
    ['paars', '#7B2D8B'],
    ['lila', '#9B59B6'],
    ['roze', '#E06090'],
    ['creme', '#F5F0DC'],
    ['ivoor', '#F5F0DC'],
    ['zilver', '#B0B0B0'],
    ['goud', '#C9A84C'],
    // Engels
    ['black', '#1A1A1A'],
    ['white', '#F5F5F5'],
    ['grey', '#888888'],
    ['gray', '#888888'],
    ['blue', '#1E5FA3'],
    ['cobalt', '#0047AB'],
    ['red', '#C0392B'],
    ['burgundy', '#6D1A2A'],
    ['green', '#2D7A3A'],
    ['forest', '#2D5A1B'],
    ['olive', '#6B7A2A'],
    ['yellow', '#E6C219'],
    ['orange', '#E67E22'],
    ['brown', '#7B5A3A'],
    ['tan', '#C19A6B'],
    ['sand', '#C2A97A'],
    ['purple', '#7B2D8B'],
    ['pink', '#E06090'],
    ['cream', '#F5F0DC'],
    ['silver', '#B0B0B0'],
    ['gold', '#C9A84C'],
    ['teal', '#1A8F8F'],
    ['turquoise', '#1ABC9C'],
    ['coral', '#E05C4B'],
    ['lime', '#7DC242'],
  ];

  for (const [name, hex] of map) {
    if (key.includes(name)) return hex;
  }

  // Hash-fallback voor volledig onbekende kleuren
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = (colorName.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 40%, 40%)`;
}

/** Default slug when running on a portal host (no slug in URL) */
export const KMS_DEFAULT_SLUG = 'vankruiningen';

/** Hostnames that serve the dedicated KMS portal bundle (geen slug in URL). */
const KMS_PORTAL_HOSTS: ReadonlySet<string> = new Set([
  'bestellen.vankruiningen.nl',
]);

/** True when running on a KMS portal hostname (one of {@link KMS_PORTAL_HOSTS}). */
export const isKmsPortal = KMS_PORTAL_HOSTS.has(window.location.hostname);

/** API base URL — on portal domain, calls go to api.databiz.app */
export const kmsApiBase = isKmsPortal ? 'https://api.databiz.app' : '';
