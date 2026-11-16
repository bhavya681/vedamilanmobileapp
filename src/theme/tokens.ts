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

export const onDark = {
  text: "#FAF6EE",
  muted: "#C9BFB0",
  faint: "#8F8678",
  gold: "#D4AF37",
  danger: "#FCA5A5",
  border: "#D4AF3733",
} as const;

export const heroGradients = {
  light: ["#1E3A5F", "#12243C"],
  dark: ["#161616", "#000000"],
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
  templeDeep: string;
  primaryGradient: [string, string];
  goldGradient: [string, string];
  emerald: string;
  amber: string;
  ruby: string;
  rose: string;
  onAccent: string;
  onGold: string;
  tabBar: string;
  tabBorder: string;
  tabActive: string;
  shadow: string;
  skeleton: string;
  skeletonHighlight: string;
  chartLine: string;
  chartFill: string;
};

const light: Palette = {
  canvas: "#F6F4EF",
  raised: "#FFFFFF",
  sunken: "#EEEAE1",
  overlay: "rgba(11, 15, 22, 0.52)",
  border: "rgba(20, 26, 38, 0.08)",
  borderStrong: "rgba(20, 26, 38, 0.16)",
  text: "#141A26",
  textMuted: "#5A6270",
  textFaint: "#8A909B",
  inverse: "#FFFFFF",
  inverseSurface: "#162033",
  onInverseSurface: "#F7F5EF",
  gold: "#A87B27",
  goldSoft: "#C9A24B",
  saffron: "#C0701B",
  temple: "#1F3A5F",
  templeDeep: "#142A47",
  primaryGradient: ["#274A75", "#162F52"],
  goldGradient: ["#D9BC72", "#B98A2C"],
  emerald: "#0F7A5A",
  amber: "#B45309",
  ruby: "#B4233C",
  rose: "#B76E79",
  onAccent: "#FFFFFF",
  onGold: "#1B1408",
  tabBar: "rgba(255, 255, 255, 0.97)",
  tabBorder: "rgba(20, 26, 38, 0.07)",
  tabActive: "rgba(168, 123, 39, 0.12)",
  shadow: "rgba(20, 26, 38, 0.10)",
  skeleton: "#E8E3D9",
  skeletonHighlight: "#F3EFE6",
  chartLine: "#1F3A5F",
  chartFill: "rgba(31, 58, 95, 0.06)",
};

const dark: Palette = {
  canvas: "#000000",
  raised: "#121212",
  sunken: "#0A0A0A",
  overlay: "rgba(0, 0, 0, 0.72)",
  border: "rgba(255, 255, 255, 0.10)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  text: "#F5F3EE",
  textMuted: "#A8A8A8",
  textFaint: "#737373",
  inverse: "#000000",
  inverseSurface: "#F5F3EE",
  onInverseSurface: "#0A0A0A",
  gold: "#D8B45A",
  goldSoft: "#E6CB84",
  saffron: "#E0A84A",
  temple: "#6EA8FF",
  templeDeep: "#1C3A66",
  primaryGradient: ["#1A1A1A", "#000000"],
  goldGradient: ["#E8CF8C", "#C79A3E"],
  emerald: "#34D399",
  amber: "#FBBF24",
  ruby: "#FB7185",
  rose: "#D4A0A8",
  onAccent: "#FFFFFF",
  onGold: "#14110A",
  tabBar: "rgba(0, 0, 0, 0.96)",
  tabBorder: "rgba(255, 255, 255, 0.10)",
  tabActive: "rgba(216, 180, 90, 0.16)",
  shadow: "rgba(0, 0, 0, 0.8)",
  skeleton: "#1A1A1A",
  skeletonHighlight: "#242424",
  chartLine: "#D8B45A",
  chartFill: "rgba(216, 180, 90, 0.10)",
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
