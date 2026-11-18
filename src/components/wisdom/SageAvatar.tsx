import { Image } from "expo-image";
import React, { useState } from "react";
import { View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/components/ui/Text";

type Props = {
  uri?: string | null;
  label: string;
  size?: number;
  rounded?: number;
};

export function SageAvatar({ uri, label, size = 46, rounded }: Props) {
  const { palette } = useTheme();
  const [failed, setFailed] = useState(false);
  const monogram = (label || "S").slice(0, 1).toUpperCase();
  const radius = rounded ?? size / 3.2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: `${palette.gold}1F`,
        borderWidth: 1,
        borderColor: `${palette.gold}55`,
        overflow: "hidden",
      }}
    >
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={180}
          onError={() => setFailed(true)}
          accessibilityLabel={label}
        />
      ) : (
        <Text variant={size >= 56 ? "serifLg" : "label"} tone="gold">
          {monogram}
        </Text>
      )}
    </View>
  );
}
