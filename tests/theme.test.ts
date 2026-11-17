import { describe, expect, it } from "vitest";

import { isApiFailure, isApiSuccess, readApiFailure } from "@/api/client/envelope";
import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  resolvePresetPalette,
} from "@/theme/presets";

describe("appearance presets", () => {
  it("uses the web default border intensity", () => {
    expect(DEFAULT_APPEARANCE.borderIntensity).toBe("medium");
  });

  it("resolves the Veda Gold primary and ring tokens", () => {
    const palette = resolvePresetPalette("light", DEFAULT_APPEARANCE);
    expect(palette.canvas).toBe("#F7F1E3");
    expect(palette.gold).toBe("#C47A1A");
    expect(palette.goldSoft).toBe("#D4AF37");
  });

  it("applies accent overrides over theme tokens", () => {
    const palette = resolvePresetPalette("light", {
      ...DEFAULT_APPEARANCE,
      accentOverride: "rose",
    });
    expect(palette.gold).toBe("#B76E79");
  });

  it("only applies expression tints to the Veda Gold theme", () => {
    const veda = resolvePresetPalette("light", {
      ...DEFAULT_APPEARANCE,
      expression: "masculine",
    });
    const rose = resolvePresetPalette("light", {
      ...DEFAULT_APPEARANCE,
      theme: "rose-serenity",
      expression: "masculine",
    });
    expect(veda.gold).toBe("#8B2942");
    expect(rose.gold).toBe("#B76E79");
  });

  it("normalizes invalid values back to defaults", () => {
    const appearance = normalizeAppearance({
      mode: "neon" as never,
      theme: "unknown" as never,
      borderIntensity: "heavy" as never,
      accentOverride: "purple" as never,
    });
    expect(appearance.mode).toBe("system");
    expect(appearance.theme).toBe("veda-gold");
    expect(appearance.borderIntensity).toBe("medium");
    expect(appearance.accentOverride).toBeNull();
  });

  it("resolves the Midnight Veda dark canvas", () => {
    const palette = resolvePresetPalette("dark", {
      ...DEFAULT_APPEARANCE,
      theme: "midnight-veda",
    });
    expect(palette.canvas).toBe("#080706");
    expect(palette.raised).toBe("#12100E");
    expect(palette.text).toBe("#F7F1E3");
  });
});

describe("API envelopes", () => {
  it("discriminates success and failure envelopes", () => {
    expect(isApiSuccess({ success: true, data: { ok: true } })).toBe(true);
    expect(isApiFailure({ success: false, error: { message: "Nope" } })).toBe(true);
    expect(readApiFailure({ success: false, error: { message: "Nope" } })?.message).toBe("Nope");
  });

  it("returns no error for success envelopes", () => {
    expect(readApiFailure({ success: true, data: { ok: true } })).toBeUndefined();
  });
});
