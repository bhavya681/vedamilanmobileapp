export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 24,
  pill: 999,
} as const;

export const fontSize = {
  micro: 10,
  caption: 11,
  small: 12,
  body: 14,
  bodyLg: 15,
  title: 17,
  titleLg: 20,
  heading: 24,
  display: 30,
  hero: 38,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const durations = {
  fast: 120,
  base: 220,
  slow: 380,
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export const minTouchTarget = 44;

export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type FontSize = typeof fontSize;
