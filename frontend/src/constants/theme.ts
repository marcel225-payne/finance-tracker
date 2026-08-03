import { Platform } from 'react-native';

// -----------------------------------------------------------------------------
// 1. PALETTE DE COULEURS (LIGHT & DARK MODE)
// -----------------------------------------------------------------------------
export const Colors = {
  light: {
    // Éléments de structure & arrière-plans
    background: '#FFFFFF',
    card: '#FFFFFF',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    inputBg: '#EFEEEB',
    chipBg: '#F2F1EE',
    border: '#ECECEC',

    // Textes
    textPrimary: '#111111',
    textSecondary: '#8A8A8E',
    textMuted: '#B4B4B8',

    // Raccourcis génériques
    text: '#111111',
    white: '#FFFFFF',
    black: '#111111',

    // Statuts & Finances
    danger: '#E0483E',
    success: '#1F9254',
    income: '#1F9254',
    expense: '#E0483E',

    // Couleurs récurrentes pour les badges/catégories
    categoryColors: ['#1F9254', '#E0483E', '#3E7BFA', '#F5A524', '#C24EAB'],
    overlay: 'rgba(0,0,0,0.35)',
  },
  dark: {
    // Éléments de structure & arrière-plans
    background: '#09090B',
    card: '#18181B',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    inputBg: '#27272A',
    chipBg: '#27272A',
    border: '#27272A',

    // Textes
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    // Raccourcis génériques
    text: '#FFFFFF',
    white: '#FFFFFF',
    black: '#111111',

    // Statuts & Finances (adaptés au mode sombre pour une bonne lisibilité)
    danger: '#EF4444',
    success: '#22C55E',
    income: '#22C55E',
    expense: '#EF4444',

    // Couleurs récurrentes pour les badges/catégories
    categoryColors: ['#22C55E', '#EF4444', '#3B82F6', '#F59E0B', '#EC4899'],
    overlay: 'rgba(0,0,0,0.6)',
  },
} as const;

export type ThemeMode = keyof typeof Colors; // 'light' | 'dark'
export type ThemeColor = keyof typeof Colors.light;

// Exporter la version 'light' par défaut pour un accès rapide si pas de gestion de dark mode
export const colors = Colors.light;

// -----------------------------------------------------------------------------
// 2. TYPOGRAPHIE ET POLICES
// -----------------------------------------------------------------------------
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  h1: { fontSize: 26, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 15 },
  caption: { fontSize: 13 },
  amount: { fontSize: 40, fontWeight: '700' as const },
};

// -----------------------------------------------------------------------------
// 3. ESPACEMENTS & RAYONS DE BORDURE (SPACING & RADIUS)
// -----------------------------------------------------------------------------
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  // Raccourcis nommés (alias)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

// -----------------------------------------------------------------------------
// 4. VALEURS DE LAYOUT PLATFORME
// -----------------------------------------------------------------------------
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// -----------------------------------------------------------------------------
// 5. FONCTIONS UTILITAIRES DE Saisie / AFFICHAGE
// -----------------------------------------------------------------------------
export function formatFCFA(value: number | string): string {
  const n = Math.round(Number(value) || 0);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${abs} FCFA`;
}
// À ajouter à la fin de src/constants/theme.ts
export const spacing = Spacing;
export const radius = Radius;
export const typography = Typography;