import { colors } from '@/theme/colors';

export const theme = {
  colors: {
    primary: colors.primary.DEFAULT,
    primaryDark: colors.primary.dark,
    primaryLight: colors.primary.light,
    primaryMuted: colors.primary.muted,
    secondary: colors.secondary.DEFAULT,
    secondaryDark: colors.secondary.dark,
    secondaryLight: colors.secondary.light,
    accent: colors.accent.DEFAULT,
    accentDark: colors.accent.dark,
    accentLight: colors.accent.light,
    accentMuted: colors.accent.muted,
    backgroundColor: colors.background.light,
    backgroundDark: colors.background.dark,
    borderColor: colors.border.DEFAULT,
    borderDark: colors.border.dark,
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textMuted: colors.text.muted,
    textInverse: colors.text.inverse,
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.status.info,
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.125rem',
    DEFAULT: '0.375rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
};

export type Theme = typeof theme;
