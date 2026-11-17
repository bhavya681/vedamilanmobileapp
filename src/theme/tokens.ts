/**
 * VedaMilan design tokens.
 *
 * `colors` (./colors.ts) is the single source of truth for brand hexes.
 * `presets.ts` layers the six web appearance themes on top of these base
 * palettes. Components should read the resolved palette from `useTheme()`.
 */

import { colors, heroGradients, withAlpha } from "./colors";

export { brand, colors, heroGradients, onDark, shade, withAlpha } from "./colors";
export {
  durations,
  fontSize,
  fontWeight,
  hitSlop,
  minTouchTarget,
  radii,
  spacing,
  type FontSize,
  type Radii,
  type Spacing,
} from "./spacing";

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
  canvas: colors.warmIvory,
  raised: colors.creamRing,
  sunken: "#EFE6D4",
  overlay: "rgba(12, 10, 8, 0.52)",
  border: "rgba(20, 17, 14, 0.08)",
  borderStrong: "rgba(20, 17, 14, 0.16)",
  text: colors.softCharcoal,
  textMuted: "#5C5348",
  textFaint: "#8A8072",
  inverse: colors.softWhite,
  inverseSurface: colors.softCharcoal,
  onInverseSurface: colors.warmIvory,
  gold: colors.deepAmber,
  goldSoft: colors.royalGold,
  saffron: colors.deepAmber,
  temple: colors.templeNavy,
  templeDeep: "#142A47",
  primaryGradient: [heroGradients.light[0], heroGradients.light[1]],
  goldGradient: [colors.brightGold, colors.deepAmber],
  emerald: colors.emerald,
  amber: colors.deepAmber,
  ruby: colors.ruby,
  rose: colors.roseGold,
  onAccent: colors.softWhite,
  onGold: colors.softCharcoal,
  tabBar: "rgba(250, 246, 238, 0.97)",
  tabBorder: "rgba(20, 17, 14, 0.07)",
  tabActive: withAlpha(colors.deepAmber, 0.12),
  shadow: "rgba(20, 17, 14, 0.10)",
  skeleton: "#E8DFC9",
  skeletonHighlight: "#F3EBDD",
  chartLine: colors.templeNavy,
  chartFill: withAlpha(colors.templeNavy, 0.06),
};

const dark: Palette = {
  canvas: colors.celestialDark,
  raised: colors.softCharcoal,
  sunken: "#080706",
  overlay: "rgba(0, 0, 0, 0.72)",
  border: "rgba(247, 241, 227, 0.10)",
  borderStrong: "rgba(247, 241, 227, 0.18)",
  text: colors.warmIvory,
  textMuted: "#B8AEA0",
  textFaint: "#8A8072",
  inverse: colors.celestialDark,
  inverseSurface: colors.warmIvory,
  onInverseSurface: colors.celestialDark,
  gold: colors.royalGold,
  goldSoft: colors.brightGold,
  saffron: "#E0A84A",
  temple: "#6E9BCB",
  templeDeep: colors.templeNavy,
  primaryGradient: [heroGradients.dark[0], heroGradients.dark[1]],
  goldGradient: [colors.brightGold, colors.royalGold],
  emerald: "#34D399",
  amber: "#FBBF24",
  ruby: "#F87171",
  rose: "#D4A0A8",
  onAccent: colors.softWhite,
  onGold: colors.softCharcoal,
  tabBar: "rgba(12, 10, 8, 0.96)",
  tabBorder: "rgba(247, 241, 227, 0.10)",
  tabActive: withAlpha(colors.royalGold, 0.16),
  shadow: "rgba(0, 0, 0, 0.8)",
  skeleton: "#1A1613",
  skeletonHighlight: "#24201B",
  chartLine: colors.royalGold,
  chartFill: withAlpha(colors.royalGold, 0.10),
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

export const palette = palettes.light;
