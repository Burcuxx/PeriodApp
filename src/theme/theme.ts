export const colors = {
  primary: '#B565A7',
  primaryDark: '#8C4A85',
  primaryLight: '#E8C7E0',
  secondary: '#F7A8C4',
  secondaryLight: '#FDE2EC',
  background: '#FFF7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#FBEEF5',
  text: '#3D2C3E',
  textMuted: '#8C7B8E',
  border: '#F0DDEB',
  success: '#8FC1A9',
  periodDay: '#E0578C',
  predictedPeriod: '#F3B4CB',
  ovulation: '#8E7CC3',
  fertileWindow: '#DED2F5',
  danger: '#D64550',
  white: '#FFFFFF',
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
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
};

export const typography = {
  title: { fontSize: 26, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textMuted },
  button: { fontSize: 16, fontWeight: '600' as const, color: colors.white },
};

export const shadow = {
  card: {
    shadowColor: '#B565A7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
};
