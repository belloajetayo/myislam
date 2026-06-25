// Light theme — default for all screens except Qiblah
export const Colors = {
  bg: '#FDFBF8',
  bgCard: '#FFFFFF',
  bgMuted: '#F5F1EB',

  surface: '#FFFFFF',
  surfaceElevated: '#FAFAF8',
  surfaceActive: '#F5F1EB',
  surfaceCard: '#FFFFFF',

  gold: '#F59E0B',
  goldMuted: 'rgba(245,158,11,0.12)',
  goldBorder: 'rgba(245,158,11,0.35)',
  goldDim: '#D97706',
  goldGlow: 'rgba(245,158,11,0.06)',

  green: '#059669',
  greenMuted: '#ECFDF5',
  greenBorder: '#A7F3D0',

  purple: '#7C3AED',
  purpleMuted: '#F5F3FF',
  purpleBorder: '#DDD6FE',

  blue: '#0284C7',
  blueMuted: '#F0F9FF',
  blueBorder: '#BAE6FD',

  red: '#DC2626',
  orange: '#EA580C',
  orangeMuted: '#FFF7ED',

  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  borderStrong: '#D1D5DB',

  text: '#111827',
  textSub: '#6B7280',
  textMuted: '#9CA3AF',
  white: '#FFFFFF',
} as const;

// Dark theme — used only for the Qiblah screen
export const QiblahColors = {
  bg: '#0B2635',
  surface: 'rgba(255,255,255,0.07)',
  surfaceElevated: 'rgba(255,255,255,0.12)',
  gold: '#F59E0B',
  goldMuted: 'rgba(245,158,11,0.15)',
  goldBorder: 'rgba(245,158,11,0.3)',
  goldDim: 'rgba(245,158,11,0.7)',
  green: '#10B981',
  greenMuted: 'rgba(16,185,129,0.14)',
  greenBorder: 'rgba(16,185,129,0.3)',
  border: 'rgba(255,255,255,0.12)',
  borderSubtle: 'rgba(255,255,255,0.07)',
  text: 'rgba(255,255,255,0.95)',
  textSub: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.4)',
  blue: '#38BDF8',
  white: '#FFFFFF',
} as const;

export const Font = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;

export const Weight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
