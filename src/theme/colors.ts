/**
 * Official VedaMilan brand colours.
 *
 * These values mirror the production web design system. Keep this file as the
 * single source of truth for brand hexes; palettes and presets derive from it.
 */

export const colors = {
  royalGold: "#D4AF37",
  brightGold: "#F0C14B",
  deepAmber: "#C47A1A",
  warmIvory: "#F7F1E3",
  creamRing: "#FAF6EE",
  templeNavy: "#1F3A5F",
  softCharcoal: "#14110E",
  celestialDark: "#0C0A08",
  softWhite: "#FFFFFF",
  roseGold: "#B76E79",
  emerald: "#059669",
  ruby: "#C41E3A",
} as const;

/**
 * Legacy aliases. Some older modules referenced these names; they now resolve
 * to the official brand values instead of the previous approximations.
 */
export const brand = {
  ...colors,
  templeBlue: colors.templeNavy,
  sacredSaffron: colors.deepAmber,
  midnightNavy: colors.celestialDark,
  amber: colors.deepAmber,
} as const;

export const onDark = {
  text: colors.warmIvory,
  muted: "#C9BFB0",
  faint: "#8F8678",
  gold: colors.royalGold,
  danger: "#FCA5A5",
  border: `${colors.royalGold}33`,
} as const;

export const heroGradients = {
  light: [colors.templeNavy, "#142A47"],
  dark: [colors.celestialDark, "#000000"],
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return hex;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function shade(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return hex;
  const clamp = (channel: number) => Math.max(0, Math.min(255, Math.round(channel)));
  const r = clamp(parseInt(value.slice(0, 2), 16) + amount);
  const g = clamp(parseInt(value.slice(2, 4), 16) + amount);
  const b = clamp(parseInt(value.slice(4, 6), 16) + amount);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
