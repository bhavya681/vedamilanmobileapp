/**
 * VedaMilan design tokens.
 *
 * Values mirror the live web product's CSS custom properties (light + dark) so
 * the native app reads as the same brand. The brief's hex values are aliased in
 * `brand` for reference; `palette` is the authoritative set used by components.
 */

export const brand = {
  royalGold: "#C89B3C",
  templeBlue: "#1D4ED8",
  sacredSaffron: "#E88A14",
  warmIvory: "#FAF8F4",
  midnightNavy: "#071120",
  emerald: "#059669",
  amber: "#C47A1A",
  ruby: "#C41E3A",
} as const;

export type ColorScheme = "light" | "dark";

export type Palette = {
  canvas: string;
  raised: string;
  sunken: string;
  overlay: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  inverse: string;
  inverseSurface: string;
  onInverseSurface: string;
  gold: string;
  goldSoft: string;
  saffron: string;
  temple: string;
  emerald: string;
  amber: string;
  ruby: string;
  rose: string;
  onAccent: string;
  tabBar: string;
  tabBorder: string;
  skeleton: string;
  skeletonHighlight: string;
  chartLine: string;
  chartFill: string;
};

const light: Palette = {
  canvas: "#F7F1E3",
  raised: "#FAF6EE",
  sunken: "#EFE6D4",
  overlay: "rgba(12, 10, 8, 0.46)",
  border: "rgba(20, 17, 14, 0.10)",
  borderStrong: "rgba(20, 17, 14, 0.18)",
  text: "#14110E",
  textMuted: "#5C5348",
  textFaint: "#8A8072",
  inverse: "#FAF6EE",
  inverseSurface: "#241E17",
  onInverseSurface: "#FAF6EE",
  gold: "#B98A2C",
  goldSoft: "#D4AF37",
  saffron: "#C47A1A",
  temple: "#1F3A5F",
  emerald: "#047857",
  amber: "#B45309",
  ruby: "#BE123C",
  rose: "#B76E79",
  onAccent: "#FFFFFF",
  tabBar: "rgba(250, 246, 238, 0.94)",
  tabBorder: "rgba(20, 17, 14, 0.08)",
  skeleton: "#E6DCC8",
  skeletonHighlight: "#F2EADA",
  chartLine: "#1F3A5F",
  chartFill: "rgba(31, 58, 95, 0.06)",
};

const dark: Palette = {
  canvas: "#0C0A08",
  raised: "#16120E",
  sunken: "#100D0A",
  overlay: "rgba(0, 0, 0, 0.62)",
  border: "rgba(247, 241, 227, 0.10)",
  borderStrong: "rgba(247, 241, 227, 0.20)",
  text: "#F7F1E3",
  textMuted: "#B8AEA0",
  textFaint: "#8C8377",
  inverse: "#14110E",
  inverseSurface: "#F2EADA",
  onInverseSurface: "#14110E",
  gold: "#D4AF37",
  goldSoft: "#E0C264",
  saffron: "#E0A84A",
  temple: "#5A7FA8",
  emerald: "#34D399",
  amber: "#FBBF24",
  ruby: "#FB7185",
  rose: "#D4A0A8",
  onAccent: "#14110E",
  tabBar: "rgba(18, 15, 12, 0.94)",
  tabBorder: "rgba(247, 241, 227, 0.08)",
  skeleton: "#221C16",
  skeletonHighlight: "#2C251D",
  chartLine: "#D4AF37",
  chartFill: "rgba(212, 175, 55, 0.08)",
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

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
