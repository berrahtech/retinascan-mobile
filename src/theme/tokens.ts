/**
 * Jetons de design de RetinaScan.
 *
 * Tout ce qui est visuel passe par ce fichier : aucune couleur ni valeur
 * d'espacement ne doit être écrite en dur dans un composant.
 */
import { Platform } from 'react-native';

/* ------------------------------------------------------------------ *
 * Palette
 * ------------------------------------------------------------------ */

const palette = {
  // Famille violette de la marque RetinaScan (reprise du logo).
  violet200: '#E9D5FF',
  violet300: '#D8B4FE',
  violet400: '#C084FC',
  violet500: '#A855F7',
  violet600: '#9333EA',
  violet700: '#7C3AED',
  violet800: '#6D28D9',
  violet900: '#5B21B6',

  // Indigo profond du mot « Retina » du logo.
  indigo700: '#4C1D95',
  indigo900: '#2E1065',

  // Lilas lumineux : reflets des vaisseaux de l'iris, halo de scan.
  glow: '#C4B5FD',

  emerald400: '#34D399',
  emerald500: '#10B981',

  lime400: '#A3E635',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  orange500: '#F97316',
  red400: '#F87171',
  red500: '#EF4444',

  // Noir-aubergine : fonds sombres teintés de violet plutôt que de bleu.
  ink950: '#070512',
  ink900: '#0B0718',
  ink850: '#120B24',
  ink800: '#191033',
  ink700: '#251A40',
  ink600: '#342552',

  slate400: '#94A3B8',
  slate500: '#64748B',

  white: '#FFFFFF',
  paper: '#F7F4FC',
  paperAlt: '#EFE9F9',
};

/** Les cinq stades de la classification internationale (ICDR). */
export const severityScale = [
  palette.emerald500,
  palette.lime400,
  palette.amber500,
  palette.orange500,
  palette.red500,
] as const;

/* ------------------------------------------------------------------ *
 * Thèmes
 * ------------------------------------------------------------------ */

export type ColorScheme = 'light' | 'dark';

/** Dégradé à deux ou trois arrêts, tel qu'attendu par `LinearGradient`. */
type Gradient = readonly [string, string, ...string[]];

export type ThemeColors = {
  background: string;
  backgroundElevated: string;
  backgroundGradient: Gradient;

  surface: string;
  surfaceSolid: string;
  surfaceStrong: string;
  surfacePressed: string;

  border: string;
  borderStrong: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;

  primary: string;
  primaryHover: string;
  primaryText: string;
  primarySoft: string;
  primaryGradient: Gradient;

  accent: string;
  accentSoft: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;

  scrim: string;
  shimmer: string;
  tabBar: string;

  blurTint: ColorScheme;
  statusBar: ColorScheme;
};

const dark: ThemeColors = {
  /** Fond de l'application, du plus profond au plus clair. */
  background: palette.ink900,
  backgroundElevated: palette.ink850,
  /** Dégradé de fond appliqué par `<Screen />`. */
  backgroundGradient: [palette.ink900, '#0E0A1F', palette.ink950] as const,

  surface: 'rgba(255,255,255,0.045)',
  surfaceSolid: palette.ink800,
  surfaceStrong: palette.ink700,
  surfacePressed: 'rgba(255,255,255,0.09)',

  border: 'rgba(196,181,253,0.12)',
  borderStrong: 'rgba(196,181,253,0.22)',

  text: '#F3F0FA',
  textSecondary: '#B6ACD0',
  textMuted: '#786C96',
  textInverted: palette.ink900,

  primary: palette.violet700,
  primaryHover: palette.violet500,
  primaryText: palette.white,
  primarySoft: 'rgba(124,58,237,0.18)',
  primaryGradient: [palette.violet500, palette.violet800] as const,

  accent: palette.violet400,
  accentSoft: 'rgba(192,132,252,0.16)',

  success: palette.emerald400,
  successSoft: 'rgba(52,211,153,0.14)',
  warning: palette.amber400,
  warningSoft: 'rgba(251,191,36,0.14)',
  danger: palette.red400,
  dangerSoft: 'rgba(248,113,113,0.14)',
  info: palette.violet300,

  scrim: 'rgba(7,5,18,0.74)',
  shimmer: 'rgba(255,255,255,0.07)',
  tabBar: 'rgba(18,11,36,0.92)',

  blurTint: 'dark' as const,
  statusBar: 'light' as const,
};

const light: ThemeColors = {
  background: palette.paper,
  backgroundElevated: palette.white,
  backgroundGradient: [palette.white, palette.paper, palette.paperAlt] as const,

  surface: palette.white,
  surfaceSolid: palette.white,
  surfaceStrong: '#EDE7F8',
  surfacePressed: '#F1EBFB',

  border: 'rgba(76,29,149,0.10)',
  borderStrong: 'rgba(76,29,149,0.18)',

  text: '#1A0F2E',
  textSecondary: '#544B66',
  textMuted: '#8479A0',
  textInverted: palette.white,

  primary: palette.violet700,
  primaryHover: palette.violet800,
  primaryText: palette.white,
  primarySoft: 'rgba(124,58,237,0.10)',
  primaryGradient: [palette.violet500, palette.violet800] as const,

  accent: palette.violet600,
  accentSoft: 'rgba(147,51,234,0.12)',

  success: palette.emerald500,
  successSoft: 'rgba(16,185,129,0.12)',
  warning: palette.amber500,
  warningSoft: 'rgba(245,158,11,0.14)',
  danger: palette.red500,
  dangerSoft: 'rgba(239,68,68,0.12)',
  info: palette.violet700,

  scrim: 'rgba(23,16,46,0.45)',
  shimmer: 'rgba(76,29,149,0.05)',
  tabBar: 'rgba(255,255,255,0.94)',

  blurTint: 'light' as const,
  statusBar: 'dark' as const,
};

export const themes: Record<ColorScheme, ThemeColors> = { dark, light };

/* ------------------------------------------------------------------ *
 * Échelles
 * ------------------------------------------------------------------ */

/** Échelle d'espacement de base 4. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 34,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subheading: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  micro: { fontSize: 11, lineHeight: 15, fontWeight: '600' },
  /** Étiquettes en capitales, pour les en-têtes de section. */
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.1 },
  /** Chiffres de mesure : tabulaires pour éviter les sauts pendant l'animation. */
  metric: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Durées et courbes partagées, pour que toutes les animations respirent pareil. */
export const motion = {
  fast: 160,
  base: 260,
  slow: 420,
  lazy: 700,
  /** Ressort « posé », sans rebond parasite. */
  spring: { damping: 18, stiffness: 180, mass: 0.9 },
  springSoft: { damping: 22, stiffness: 120, mass: 1 },
  springBouncy: { damping: 12, stiffness: 220, mass: 0.8 },
} as const;

export const elevation = (scheme: ColorScheme, level: 1 | 2 | 3) => {
  if (scheme === 'dark') {
    // En sombre, l'ombre portée ne se voit pas : on s'appuie sur les bordures.
    const opacity = [0.35, 0.45, 0.55][level - 1];
    return Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: opacity,
        shadowRadius: [10, 18, 28][level - 1],
        shadowOffset: { width: 0, height: [4, 8, 14][level - 1] },
      },
      default: { elevation: 0 },
    })!;
  }
  return Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOpacity: [0.06, 0.1, 0.14][level - 1],
      shadowRadius: [12, 20, 30][level - 1],
      shadowOffset: { width: 0, height: [4, 8, 14][level - 1] },
    },
    default: { elevation: [2, 5, 9][level - 1] },
  })!;
};

export { palette };
