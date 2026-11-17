/**
 * VedaMilan curated appearance presets.
 *
 * Ported 1:1 from the production web design system
 * (`src/lib/appearance/presets.ts`, `src/styles/appearance-themes.css`).
 * Layout and typography stay constant; only semantic colour tokens change.
 */

import { colors, shade, withAlpha } from "./colors";
import { palettes, type ColorScheme, type Palette } from "./tokens";

export type AppearanceMode = "light" | "dark" | "system";
export type AppearanceExpression = "feminine" | "masculine" | "neutral";
export type AppearanceThemeId =
  | "veda-gold"
  | "rose-serenity"
  | "crimson-heritage"
  | "saffron-veda"
  | "emerald-harmony"
  | "midnight-veda";
export type BorderIntensity = "soft" | "medium" | "strong";
export type AccentOverrideId = "gold" | "saffron" | "rose" | "burgundy" | "emerald" | "temple";

export type AppearancePreferences = {
  mode: AppearanceMode;
  expression: AppearanceExpression;
  theme: AppearanceThemeId;
  accentOverride?: AccentOverrideId | null;
  borderIntensity?: BorderIntensity;
  reducedMotion?: boolean;
};

export const DEFAULT_APPEARANCE: Required<AppearancePreferences> = {
  mode: "system",
  expression: "neutral",
  theme: "veda-gold",
  accentOverride: null,
  borderIntensity: "medium",
  reducedMotion: false,
};

export const APPEARANCE_STORAGE_KEY = "vedamilan.appearance.v1";

export type ThemePresetMeta = {
  id: AppearanceThemeId;
  name: string;
  description: string;
  swatches: [string, string, string, string];
  recommendedExpression?: AppearanceExpression;
};

export const THEME_PRESETS: ThemePresetMeta[] = [
  {
    id: "veda-gold",
    name: "Veda Gold",
    description: "Classic VedaMilan — balanced, Vedic, and universal.",
    swatches: ["#F7F1E3", "#C47A1A", "#D4AF37", "#14110E"],
    recommendedExpression: "neutral",
  },
  {
    id: "rose-serenity",
    name: "Rose Serenity",
    description: "Soft, romantic, and elegant — muted rose with warm ivory.",
    swatches: ["#F7F1E3", "#B76E79", "#C9A27A", "#14110E"],
    recommendedExpression: "feminine",
  },
  {
    id: "crimson-heritage",
    name: "Crimson Heritage",
    description: "Rich burgundy warmth — mature, confident, sophisticated.",
    swatches: ["#F7F1E3", "#8B2942", "#C47A1A", "#14110E"],
    recommendedExpression: "masculine",
  },
  {
    id: "saffron-veda",
    name: "Saffron Veda",
    description: "Deep saffron and gold — traditional Vedic presence.",
    swatches: ["#F7F1E3", "#B86A12", "#D4AF37", "#1A120C"],
    recommendedExpression: "neutral",
  },
  {
    id: "emerald-harmony",
    name: "Emerald Harmony",
    description: "Calm emerald with muted gold — grounded and serene.",
    swatches: ["#F7F1E3", "#0F766E", "#C9A227", "#14110E"],
    recommendedExpression: "neutral",
  },
  {
    id: "midnight-veda",
    name: "Midnight Veda",
    description: "Cinematic charcoal and gold — premium for dark mode.",
    swatches: ["#0C0A08", "#D4AF37", "#C47A1A", "#F7F1E3"],
    recommendedExpression: "neutral",
  },
];

export const EXPRESSION_OPTIONS: {
  id: AppearanceExpression;
  name: string;
  description: string;
}[] = [
  {
    id: "neutral",
    name: "Neutral",
    description: "Balanced VedaMilan accents — recommended default.",
  },
  {
    id: "feminine",
    name: "Feminine",
    description: "Soft rose-gold accents. Visual preference only.",
  },
  {
    id: "masculine",
    name: "Masculine",
    description: "Deep burgundy accents. Visual preference only.",
  },
];

export const ACCENT_OVERRIDES: { id: AccentOverrideId; name: string; color: string }[] = [
  { id: "gold", name: "Royal Gold", color: colors.royalGold },
  { id: "saffron", name: "Deep Saffron", color: colors.deepAmber },
  { id: "rose", name: "Rose Gold", color: colors.roseGold },
  { id: "burgundy", name: "Burgundy", color: "#8B2942" },
  { id: "emerald", name: "Emerald", color: "#0F766E" },
  { id: "temple", name: "Temple Blue", color: colors.templeNavy },
];

export const BORDER_INTENSITIES: { id: BorderIntensity; name: string }[] = [
  { id: "soft", name: "Soft" },
  { id: "medium", name: "Medium" },
  { id: "strong", name: "Strong" },
];

type PresetTokens = {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  muted?: string;
  mutedForeground?: string;
  primary: string;
  primaryForeground?: string;
  ring: string;
  gold: string;
  saffron: string;
  ai?: string;
  rose?: string;
  crimson?: string;
  emerald?: string;
  secondary?: string;
  accent?: string;
};

const lightThemes: Record<AppearanceThemeId, PresetTokens> = {
  "veda-gold": {
    primary: "#C47A1A",
    primaryForeground: "#FFFFFF",
    ring: "#D4AF37",
    gold: "#D4AF37",
    saffron: "#C47A1A",
    ai: "#B8860B",
    rose: "#B76E79",
  },
  "rose-serenity": {
    primary: "#B76E79",
    primaryForeground: "#FFFFFF",
    ring: "#C9A0A8",
    gold: "#C9A27A",
    saffron: "#B76E79",
    ai: "#B76E79",
    rose: "#A85D6A",
    accent: "#F3E8E6",
    muted: "#F0E6E2",
  },
  "crimson-heritage": {
    primary: "#8B2942",
    primaryForeground: "#FFFFFF",
    ring: "#A33B55",
    gold: "#C9A27A",
    saffron: "#A33B55",
    ai: "#8B2942",
    rose: "#8B2942",
    crimson: "#8B2942",
  },
  "saffron-veda": {
    primary: "#B86A12",
    primaryForeground: "#FFFFFF",
    ring: "#D4AF37",
    gold: "#D4AF37",
    saffron: "#B86A12",
    ai: "#B86A12",
    secondary: "#3D2A14",
  },
  "emerald-harmony": {
    primary: "#0F766E",
    primaryForeground: "#FFFFFF",
    ring: "#C9A227",
    gold: "#C9A227",
    saffron: "#0F766E",
    ai: "#0F766E",
    emerald: "#0F766E",
    secondary: "#1F3A5F",
  },
  "midnight-veda": {
    primary: "#B8860B",
    primaryForeground: "#FFFFFF",
    ring: "#D4AF37",
    gold: "#D4AF37",
    saffron: "#C47A1A",
    ai: "#D4AF37",
    background: "#F3EEE4",
    card: "#FAF6EE",
    muted: "#EBE4D6",
  },
};

const darkThemes: Record<AppearanceThemeId, PresetTokens> = {
  "veda-gold": {
    primary: "#D4AF37",
    primaryForeground: "#14110E",
    ring: "#D4AF37",
    gold: "#D4AF37",
    saffron: "#E0A84A",
    ai: "#E0A84A",
  },
  "rose-serenity": {
    primary: "#D4A0A8",
    primaryForeground: "#14110E",
    ring: "#D4A0A8",
    gold: "#D4B896",
    saffron: "#D4A0A8",
    ai: "#D4A0A8",
    rose: "#D4A0A8",
    accent: "#2A1E1F",
    muted: "#22181A",
  },
  "crimson-heritage": {
    primary: "#C45A72",
    primaryForeground: "#14110E",
    ring: "#C45A72",
    gold: "#D4B896",
    saffron: "#C45A72",
    ai: "#C45A72",
    crimson: "#C45A72",
    background: "#0A0808",
    card: "#161012",
  },
  "saffron-veda": {
    primary: "#E0A84A",
    primaryForeground: "#14110E",
    ring: "#D4AF37",
    gold: "#D4AF37",
    saffron: "#E0A84A",
    ai: "#E0A84A",
    background: "#100C08",
    card: "#18120C",
  },
  "emerald-harmony": {
    primary: "#2DD4BF",
    primaryForeground: "#0C0A08",
    ring: "#D4AF37",
    gold: "#D4AF37",
    saffron: "#2DD4BF",
    ai: "#2DD4BF",
    emerald: "#2DD4BF",
  },
  "midnight-veda": {
    background: "#080706",
    foreground: "#F7F1E3",
    card: "#12100E",
    cardForeground: "#F7F1E3",
    muted: "#181512",
    mutedForeground: "#B8AEA0",
    primary: "#D4AF37",
    primaryForeground: "#0C0A08",
    ring: "#D4AF37",
    gold: "#D4AF37",
    saffron: "#E0A84A",
    ai: "#D4AF37",
    secondary: "#2A4A6F",
  },
};

export const THEME_TOKENS: Record<AppearanceThemeId, Record<ColorScheme, PresetTokens>> = {
  "veda-gold": { light: lightThemes["veda-gold"], dark: darkThemes["veda-gold"] },
  "rose-serenity": { light: lightThemes["rose-serenity"], dark: darkThemes["rose-serenity"] },
  "crimson-heritage": {
    light: lightThemes["crimson-heritage"],
    dark: darkThemes["crimson-heritage"],
  },
  "saffron-veda": { light: lightThemes["saffron-veda"], dark: darkThemes["saffron-veda"] },
  "emerald-harmony": {
    light: lightThemes["emerald-harmony"],
    dark: darkThemes["emerald-harmony"],
  },
  "midnight-veda": { light: lightThemes["midnight-veda"], dark: darkThemes["midnight-veda"] },
};

const expressions: Record<
  AppearanceExpression,
  Record<ColorScheme, Partial<PresetTokens>>
> = {
  neutral: { light: {}, dark: {} },
  feminine: {
    light: {
      primary: "#B76E79",
      primaryForeground: "#FFFFFF",
      ring: "#C9A0A8",
      ai: "#B76E79",
    },
    dark: {
      primary: "#D4A0A8",
      primaryForeground: "#14110E",
      ring: "#D4A0A8",
      ai: "#D4A0A8",
    },
  },
  masculine: {
    light: {
      primary: "#8B2942",
      primaryForeground: "#FFFFFF",
      ring: "#A33B55",
      ai: "#8B2942",
    },
    dark: {
      primary: "#C45A72",
      primaryForeground: "#14110E",
      ring: "#C45A72",
      ai: "#C45A72",
    },
  },
};

const accents: Record<AccentOverrideId, Record<ColorScheme, Partial<PresetTokens>>> = {
  gold: {
    light: { primary: "#C47A1A", ring: "#D4AF37", ai: "#B8860B" },
    dark: { primary: "#D4AF37", primaryForeground: "#14110E", ring: "#D4AF37", ai: "#E0A84A" },
  },
  saffron: {
    light: { primary: "#B86A12", ring: "#D4AF37", ai: "#B86A12" },
    dark: { primary: "#E0A84A", primaryForeground: "#14110E" },
  },
  rose: {
    light: { primary: "#B76E79", ring: "#C9A0A8", ai: "#B76E79" },
    dark: { primary: "#D4A0A8", primaryForeground: "#14110E" },
  },
  burgundy: {
    light: { primary: "#8B2942", ring: "#A33B55", ai: "#8B2942" },
    dark: { primary: "#C45A72", primaryForeground: "#14110E" },
  },
  emerald: {
    light: { primary: "#0F766E", ring: "#C9A227", ai: "#0F766E" },
    dark: { primary: "#2DD4BF", primaryForeground: "#0C0A08" },
  },
  temple: {
    light: { primary: "#1F3A5F", ring: "#D4AF37", ai: "#1F3A5F" },
    dark: { primary: "#5A7FA8", primaryForeground: "#0C0A08" },
  },
};

const borderAlpha: Record<BorderIntensity, number> = {
  soft: 0.07,
  medium: 0.10,
  strong: 0.155,
};

export function normalizeAppearance(raw?: Partial<AppearancePreferences> | null): Required<AppearancePreferences> {
  const mode = raw?.mode === "light" || raw?.mode === "dark" || raw?.mode === "system" ? raw.mode : DEFAULT_APPEARANCE.mode;
  const expression =
    raw?.expression === "feminine" || raw?.expression === "masculine" || raw?.expression === "neutral"
      ? raw.expression
      : DEFAULT_APPEARANCE.expression;
  const theme = THEME_PRESETS.some((preset) => preset.id === raw?.theme)
    ? (raw?.theme as AppearanceThemeId)
    : DEFAULT_APPEARANCE.theme;
  const accentOverride = ACCENT_OVERRIDES.some((accent) => accent.id === raw?.accentOverride)
    ? (raw?.accentOverride as AccentOverrideId)
    : null;
  const borderIntensity =
    raw?.borderIntensity === "soft" || raw?.borderIntensity === "medium" || raw?.borderIntensity === "strong"
      ? raw.borderIntensity
      : DEFAULT_APPEARANCE.borderIntensity;

  return {
    mode,
    expression,
    theme,
    accentOverride,
    borderIntensity,
    reducedMotion: Boolean(raw?.reducedMotion),
  };
}

export function resolvePresetPalette(
  scheme: ColorScheme,
  prefs: Pick<AppearancePreferences, "theme" | "expression" | "accentOverride" | "borderIntensity">,
): Palette {
  const base = palettes[scheme];
  const theme = THEME_TOKENS[prefs.theme]?.[scheme] ?? THEME_TOKENS["veda-gold"][scheme];

  const expressionTokens =
    prefs.theme === "veda-gold" ? expressions[prefs.expression ?? "neutral"][scheme] : undefined;
  const accentTokens = prefs.accentOverride ? accents[prefs.accentOverride]?.[scheme] : undefined;

  const tokens: PresetTokens = {
    ...theme,
    ...expressionTokens,
    ...accentTokens,
  };

  const primary = tokens.primary;
  const ring = tokens.ring;
  const secondary = tokens.secondary ?? base.temple;
  const alpha = borderAlpha[prefs.borderIntensity ?? "medium"];
  const borderBase = scheme === "dark" ? "247, 241, 227" : "20, 17, 14";
  const background = tokens.background ?? base.canvas;
  const card = tokens.card ?? base.raised;

  return {
    ...base,
    canvas: background,
    raised: card,
    sunken: tokens.muted ?? base.sunken,
    border: `rgba(${borderBase}, ${alpha})`,
    borderStrong: `rgba(${borderBase}, ${Math.min(0.35, alpha * 1.7)})`,
    text: tokens.foreground ?? tokens.cardForeground ?? base.text,
    textMuted: tokens.mutedForeground ?? base.textMuted,
    inverseSurface: scheme === "dark" ? colors.warmIvory : colors.softCharcoal,
    onInverseSurface: scheme === "dark" ? colors.celestialDark : colors.warmIvory,
    gold: primary,
    goldSoft: ring,
    saffron: tokens.saffron ?? primary,
    temple: secondary,
    templeDeep: shade(secondary, scheme === "dark" ? -10 : -24),
    primaryGradient: [secondary, shade(secondary, scheme === "dark" ? -18 : -24)],
    goldGradient: [ring, primary],
    emerald: tokens.emerald ?? base.emerald,
    amber: primary,
    ruby: tokens.crimson ?? base.ruby,
    rose: tokens.rose ?? tokens.ai ?? base.rose,
    onAccent: colors.softWhite,
    onGold: tokens.primaryForeground ?? base.onGold,
    tabBar: scheme === "dark" ? "rgba(12, 10, 8, 0.96)" : "rgba(250, 246, 238, 0.97)",
    tabBorder: `rgba(${borderBase}, ${alpha * 0.7})`,
    tabActive: withAlpha(primary, scheme === "dark" ? 0.18 : 0.12),
    shadow:
      scheme === "dark"
        ? "rgba(0, 0, 0, 0.8)"
        : withAlpha(colors.softCharcoal, prefs.borderIntensity === "strong" ? 0.16 : 0.1),
    skeleton: scheme === "dark" ? "#1A1613" : "#E8DFC9",
    skeletonHighlight: scheme === "dark" ? "#24201B" : "#F3EBDD",
    chartLine: primary,
    chartFill: withAlpha(primary, scheme === "dark" ? 0.12 : 0.07),
  };
}
