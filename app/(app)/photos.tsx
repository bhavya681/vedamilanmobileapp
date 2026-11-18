import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Plus, Star, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

import { errorMessage } from "@/api/client/errors";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import {
  useDeletePhoto,
  useProfileBundle,
  useUploadPhoto,
} from "@/hooks/useProfile";
import { useToast } from "@/components/feedback/ToastProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function PhotosScreen() {
  const { palette } = useTheme();
  const toast = useToast();
  const bundle = useProfileBundle();
  const upload = useUploadPhoto();
  const remove = useDeletePhoto();
  const photos = bundle.data?.profile.photos ?? [];

  const pick = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.show("Photo library access is needed to upload pictures.", "error");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.75,
        allowsEditing: true,
        aspect: [4, 5],
        base64: true,
      });
      if (result.canceled || !result.assets[0]?.base64) return;
      const asset = result.assets[0];
      await upload.mutateAsync({
        dataUrl: `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`,
        makePrimary: photos.length === 0,
      });
      toast.show("Photo uploaded.", "success");
    } catch (error) {
      toast.show(errorMessage(error), "error");
    }
  };

  const photoUrl = (photo: { url?: string; secureUrl?: string }) => photo.secureUrl ?? photo.url;

  return (
    <Screen title="Photos" subtitle="Add up to six clear, recent pictures" showBack>
      {bundle.isLoading ? (
        <LoadingState variant="list" />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
            {photos.length === 0 ? (
              <EmptyState title="No photos yet" body="Your first photo becomes your primary picture." />
            ) : (
              photos.map((photo, index) => (
                <Card key={photo.publicId ?? index} style={{ width: "47.5%", padding: 0, overflow: "hidden" }}>
                  <Image
                    source={photoUrl(photo)}
                    style={{ width: "100%", aspectRatio: 4 / 5, backgroundColor: palette.raised }}
                    contentFit="cover"
                  />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", padding: spacing.sm }}>
                    <Pressable
                      onPress={async () => {
                        const url = photoUrl(photo);
                        if (!url) return;
                        try {
                          await upload.mutateAsync({ imageUrl: url, makePrimary: true });
                          toast.show("Primary photo updated.", "success");
                        } catch (error) {
                          toast.show(errorMessage(error), "error");
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Set as primary photo"
                      hitSlop={8}
                      style={{ padding: spacing.sm }}
                    >
                      <Star size={18} color={photo.isPrimary ? palette.gold : palette.textMuted} fill={photo.isPrimary ? palette.gold : "transparent"} />
                    </Pressable>
                    <Pressable
                      onPress={async () => {
                        if (!photo.publicId) return;
                        try {
                          await remove.mutateAsync(photo.publicId);
                          toast.show("Photo removed.", "success");
                        } catch (error) {
                          toast.show(errorMessage(error), "error");
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Delete photo"
                      hitSlop={8}
                      style={{ padding: spacing.sm }}
                    >
                      <Trash2 size={18} color={palette.ruby} />
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
          </View>
          <Button
            label={upload.isPending ? "Uploading…" : "Add photo"}
            variant="gold"
            loading={upload.isPending}
            icon={<Plus size={18} color={palette.onAccent} />}
            onPress={pick}
            disabled={photos.length >= 6}
          />
          <Text variant="caption" tone="faint">
            Photos are reviewed for authenticity. Avoid group photos, filters, and contact details.
          </Text>
        </View>
      )}
    </Screen>
  );
}
