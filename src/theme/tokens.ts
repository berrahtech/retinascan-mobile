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
  blue100: '#DBEAFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  cyan300: '#67E8F9',
  cyan400: '#22D3EE',
  cyan500: '#06B6D4',

  emerald400: '#34D399',
  emerald500: '#10B981',

  lime400: '#A3E635',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  orange500: '#F97316',
  red400: '#F87171',
  red500: '#EF4444',
  violet400: '#A78BFA',

  ink950: '#04060E',
  ink900: '#070B16',
  ink850: '#0B1020',
  ink800: '#101729',
  ink700: '#1A2338',
  ink600: '#26304A',

  slate400: '#94A3B8',
  slate500: '#64748B',

  white: '#FFFFFF',
  paper: '#F4F7FC',
  paperAlt: '#EAF0F9',
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
  backgroundGradient: [palette.ink900, '#080D1C', palette.ink950] as const,

  surface: 'rgba(255,255,255,0.045)',
  surfaceSolid: palette.ink800,
  surfaceStrong: palette.ink700,
  surfacePressed: 'rgba(255,255,255,0.09)',

  border: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.16)',

  text: '#F1F5F9',
  textSecondary: '#A7B4CB',
  textMuted: '#6C7A94',
  textInverted: palette.ink900,

  primary: palette.blue500,
  primaryHover: palette.blue400,
  primaryText: palette.white,
  primarySoft: 'rgba(59,130,246,0.16)',
  primaryGradient: [palette.blue500, palette.blue700] as const,

  accent: palette.cyan400,
  accentSoft: 'rgba(34,211,238,0.14)',

  success: palette.emerald400,
  successSoft: 'rgba(52,211,153,0.14)',
  warning: palette.amber400,
  warningSoft: 'rgba(251,191,36,0.14)',
  danger: palette.red400,
  dangerSoft: 'rgba(248,113,113,0.14)',
  info: palette.violet400,

  scrim: 'rgba(4,6,14,0.72)',
  shimmer: 'rgba(255,255,255,0.07)',
  tabBar: 'rgba(11,16,32,0.92)',

  blurTint: 'dark' as const,
  statusBar: 'light' as const,
};

const light: ThemeColors = {
  background: palette.paper,
  backgroundElevated: palette.white,
  backgroundGradient: [palette.white, palette.paper, palette.paperAlt] as const,

  surface: palette.white,
  surfaceSolid: palette.white,
  surfaceStrong: '#E7EDF7',
  surfacePressed: '#EDF2FA',

  border: 'rgba(15,23,42,0.09)',
  borderStrong: 'rgba(15,23,42,0.16)',

  text: '#0B1220',
  textSecondary: '#475569',
  textMuted: palette.slate500,
  textInverted: palette.white,

  primary: palette.blue600,
  primaryHover: palette.blue700,
  primaryText: palette.white,
  primarySoft: 'rgba(37,99,235,0.10)',
  primaryGradient: [palette.blue500, palette.blue700] as const,

  accent: palette.cyan500,
  accentSoft: 'rgba(6,182,212,0.12)',

  success: palette.emerald500,
  successSoft: 'rgba(16,185,129,0.12)',
  warning: palette.amber500,
  warningSoft: 'rgba(245,158,11,0.14)',
  danger: palette.red500,
  dangerSoft: 'rgba(239,68,68,0.12)',
  info: '#7C3AED',

  scrim: 'rgba(15,23,42,0.45)',
  shimmer: 'rgba(15,23,42,0.05)',
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
