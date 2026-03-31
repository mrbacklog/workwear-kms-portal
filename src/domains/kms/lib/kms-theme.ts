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
} as const;

export const kmsFont = "'Poppins', sans-serif";

/** Default slug when running on kms.databiz.app (no slug in URL) */
export const KMS_DEFAULT_SLUG = 'vankruiningen';

/** True when running on the KMS portal domain */
export const isKmsPortal = window.location.hostname === 'kms.databiz.app';

/** API base URL — on portal domain, calls go to api.databiz.app */
export const kmsApiBase = isKmsPortal ? 'https://api.databiz.app' : '';
