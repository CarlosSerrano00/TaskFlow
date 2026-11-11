import { useColorScheme } from 'react-native';

export const Palette = {
  light: {
    background: '#F5F6FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF0F7',
    foreground: '#17172B',
    foregroundMuted: '#6B7080',
    border: '#E4E6EF',
    primary: '#5B5BD6',
    primarySoft: '#EEF0FF',
    accent: '#14B8A6',
    success: '#059669',
    danger: '#DC2626',
    warning: '#B45309',
    white: '#FFFFFF',
  },
  dark: {
    background: '#0C0D16',
    surface: '#151725',
    surfaceMuted: '#1D2032',
    foreground: '#F4F5FB',
    foregroundMuted: '#9BA1B5',
    border: '#282C40',
    primary: '#8B8CF7',
    primarySoft: '#232449',
    accent: '#2DD4BF',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    white: '#FFFFFF',
  },
} as const;

export function usePalette() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Palette.dark : Palette.light;
}
