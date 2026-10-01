import { useWindowDimensions } from 'react-native';

export const colors = {
  primary: '#7E2F72',
  primaryDark: '#5C1F53',
  primaryLight: '#F3E7EC',
  ink: '#2B1A2C',
  background: '#FBF6F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F2F0',
  surfaceSunken: '#F4ECEF',
  text: '#2B1A2C',
  textSoft: '#4D3A4B',
  textMuted: '#6E5968',
  textFaint: '#BBAAB5',
  textOnDark: '#E2CFDC',
  border: '#EFE3E6',
  borderStrong: '#EBDDE2',
  divider: '#F2E8EB',
  periodDay: '#CC2F62',
  periodDayDark: '#9E1F4A',
  periodSoft: '#FCEEF3',
  predictedPeriod: '#FCE6ED',
  predictedBorder: '#D9668C',
  fertileWindow: '#EDE7FA',
  fertileText: '#4A3794',
  fertileRing: '#B9A9EC',
  ovulation: '#5E48B0',
  ringTrack: '#F4ECEF',
  ringElapsed: '#E6D3DD',
  danger: '#A61E4D',
  white: '#FFFFFF',
};

export const moodColors = {
  happy: '#E8A23A',
  calm: '#5BA88A',
  energetic: '#E06A3C',
  sad: '#5A7BC6',
  irritable: '#CC2F62',
  anxious: '#8B6BC6',
} as const;

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  full: 999,
};

// Custom font families carry their own weight, so no fontWeight is set here.
export const typography = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: colors.text },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.4, color: colors.text },
  heading: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, color: colors.text },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.text },
  bodyMuted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  button: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
};

export const breakpoints = {
  medium: 720,
  wide: 1024,
};

/** Screen-size flags used to switch between phone, tablet and desktop layouts. */
export function useLayout() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMedium: width >= breakpoints.medium,
    isWide: width >= breakpoints.wide,
    gutter: width >= breakpoints.wide ? 40 : width >= breakpoints.medium ? 28 : 16,
  };
}
