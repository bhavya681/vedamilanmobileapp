import { Platform } from "react-native";

export const fontFamily = {
  body: "PlusJakartaSans_400Regular",
  bodyMedium: "PlusJakartaSans_500Medium",
  bodySemibold: "PlusJakartaSans_600SemiBold",
  bodyBold: "PlusJakartaSans_700Bold",
  display: "CormorantGaramond_600SemiBold",
  displayMedium: "CormorantGaramond_500Medium",
  devanagari: "NotoSansDevanagari_400Regular",
} as const;

/** Loaded with expo-font in app/_layout.tsx. */
export const fontAssets = {
  PlusJakartaSans_400Regular: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
  PlusJakartaSans_500Medium: require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
  PlusJakartaSans_600SemiBold: require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  PlusJakartaSans_700Bold: require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
  CormorantGaramond_500Medium: require("../../assets/fonts/CormorantGaramond-Medium.ttf"),
  CormorantGaramond_600SemiBold: require("../../assets/fonts/CormorantGaramond-SemiBold.ttf"),
  NotoSansDevanagari_400Regular: require("../../assets/fonts/NotoSansDevanagari-Regular.ttf"),
};

export const mono = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });
