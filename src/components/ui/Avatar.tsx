import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

type Props = {
  uri?: string | null;
  name?: string;
  size?: number;
  ring?: boolean;
};

export function Avatar({ uri, name, size = 44, ring = false }: Props) {
  const { palette } = useTheme();
  const initials =
    (name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "VM";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.sunken,
        borderWidth: ring ? 1.5 : 0,
        borderColor: palette.goldSoft,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={180}
          accessibilityLabel={name ? `${name} profile photo` : "Profile photo"}
        />
      ) : (
        <Text
          weight="semibold"
          style={{ fontSize: Math.max(11, size * 0.32), color: palette.textMuted }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}
