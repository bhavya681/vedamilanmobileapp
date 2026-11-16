import { useRouter } from "expo-router";
import {
  BookHeart,
  CalendarHeart,
  ChevronRight,
  CreditCard,
  Eye,
  FileHeart,
  Heart,
  Images,
  LifeBuoy,
  Lock,
  LogOut,
  MapPinned,
  MessageCircle,
  PencilLine,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { LoadingState } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { useBilling } from "@/hooks/useBilling";
import { useProfileBundle } from "@/hooks/useProfile";
import { useSession } from "@/providers/SessionProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { heightLabel, titleCase } from "@/lib/format";
import { radii, spacing } from "@/theme/tokens";

export default function ProfileScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { user, signOut } = useSession();
  const bundle = useProfileBundle();
  const billing = useBilling();

  const profile = bundle.data?.profile;
  const completion = profile?.completion?.score ?? profile?.profileCompletion ?? 0;
  const photo = profile?.photos?.find((p) => p.isPrimary)?.secureUrl ?? profile?.photos?.[0]?.secureUrl;
  const subscription = billing.data?.subscription ?? null;
  const premium = Boolean(subscription);
  const plan =
    billing.data?.plans.find((p) => p.code === subscription?.planCode)?.name ??
    (subscription?.planCode ? titleCase(String(subscription.planCode)) : "Free member");

  const groups: Array<{
    title: string;
    icon: React.ReactNode;
    rows: Array<{ title: string; subtitle?: string; icon: React.ReactNode; route: string }>;
  }> = [
    {
      title: "Profile",
      icon: <UserRound size={16} color={palette.gold} />,
      rows: [
        { title: "Edit profile", subtitle: "About you, lifestyle, career", icon: <PencilLine size={17} color={palette.textMuted} />, route: "/(app)/edit-profile" },
        { title: "Photos", subtitle: "Add and reorder your gallery", icon: <Images size={17} color={palette.textMuted} />, route: "/(app)/photos" },
        { title: "Birth details", subtitle: "Date, time and place of birth", icon: <MapPinned size={17} color={palette.textMuted} />, route: "/(app)/birth-details" },
        { title: "Partner preferences", subtitle: "Who you would like to meet", icon: <SlidersHorizontal size={17} color={palette.textMuted} />, route: "/(app)/preferences" },
        { title: "Privacy", subtitle: "What others can see", icon: <Lock size={17} color={palette.textMuted} />, route: "/(app)/privacy" },
      ],
    },
    {
      title: "Activity",
      icon: <Heart size={16} color={palette.gold} />,
      rows: [
        { title: "Likes & interests", icon: <Heart size={17} color={palette.textMuted} />, route: "/(app)/likes" },
        { title: "Shortlist", icon: <Star size={17} color={palette.textMuted} />, route: "/(app)/shortlist" },
        { title: "Visitors", icon: <Eye size={17} color={palette.textMuted} />, route: "/(app)/visitors" },
        { title: "Connections", icon: <Heart size={17} color={palette.textMuted} />, route: "/(app)/connections" },
        { title: "Chats", icon: <MessageCircle size={17} color={palette.textMuted} />, route: "/(tabs)/chats" },
        { title: "Wisdom journal", icon: <BookHeart size={17} color={palette.textMuted} />, route: "/(app)/journal" },
        { title: "Consultations", icon: <Sparkles size={17} color={palette.textMuted} />, route: "/(app)/consultations" },
      ],
    },
    {
      title: "Membership",
      icon: <CreditCard size={16} color={palette.gold} />,
      rows: [
        { title: "Plan & billing", subtitle: premium ? plan : "Explore premium guidance", icon: <CreditCard size={17} color={palette.textMuted} />, route: "/(app)/billing" },
      ],
    },
  ];

  const onSignOut = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.giant, gap: spacing.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
          <Avatar uri={photo} name={profile?.name ?? user?.user.name} size={72} ring />
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="titleLg" numberOfLines={1}>
              {profile?.name ?? user?.user.name}
            </Text>
            <Text variant="small" tone="muted" numberOfLines={1}>
              {profile?.headline ?? ([profile?.profession, profile?.city].filter(Boolean).join(" · ") || "Complete your profile")}
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <Badge label={premium ? plan : "Free member"} tone={premium ? "gold" : "neutral"} size="sm" />
              {profile?.age ? <Badge label={`${profile.age} yrs`} tone="neutral" size="sm" /> : null}
              {profile?.heightCm ? <Badge label={heightLabel(profile.heightCm)} tone="neutral" size="sm" /> : null}
            </View>
          </View>
        </View>

        <Card style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text variant="label">Profile completion</Text>
            <Text variant="label" tone="gold">
              {Math.round(completion)}%
            </Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: palette.sunken, overflow: "hidden" }}>
            <View
              style={{
                width: `${Math.max(4, Math.min(100, completion))}%`,
                height: 6,
                borderRadius: 3,
                backgroundColor: palette.gold,
              }}
            />
          </View>
          {profile?.completion?.missing?.length ? (
            <Text variant="caption" tone="muted">
              Next: {profile.completion.missing.slice(0, 3).map(titleCase).join(", ")}
            </Text>
          ) : (
            <Text variant="caption" tone="muted">
              A complete profile receives more thoughtful introductions.
            </Text>
          )}
          <Button
            label="Improve profile"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/(app)/edit-profile")}
            style={{ alignSelf: "flex-start" }}
          />
        </Card>

        {bundle.isLoading ? <LoadingState variant="list" /> : null}

        <View style={{ gap: spacing.sm }}>
          {[
            { label: "Connection hub", icon: <Heart size={16} color={palette.gold} />, route: "/(app)/connections" },
            { label: "Compatibility reports", icon: <FileHeart size={16} color={palette.gold} />, route: "/(app)/compatibility" },
            { label: "Marriage timing", icon: <CalendarHeart size={16} color={palette.gold} />, route: "/(app)/marriage-timing" },
          ].map((item) => (
            <Card
              key={item.label}
              onPress={() => router.push(item.route as never)}
              padded
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                {item.icon}
                <Text variant="small" weight="semibold">
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={16} color={palette.textFaint} />
            </Card>
          ))}
        </View>

        {groups.map((group) => (
          <View key={group.title}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
              {group.icon}
              <Text variant="micro" tone="faint" style={{ letterSpacing: 1.5 }}>
                {group.title.toUpperCase()}
              </Text>
            </View>
            <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
              {group.rows.map((row, index) => (
                <View key={row.title} style={{ borderBottomWidth: index === group.rows.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: palette.border }}>
                  <ListRow
                    title={row.title}
                    subtitle={row.subtitle}
                    icon={row.icon}
                    onPress={() => router.push(row.route as never)}
                  />
                </View>
              ))}
            </Card>
          </View>
        ))}

        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          <ListRow
            title="Settings"
            subtitle="Theme, language, notifications"
            icon={<Settings size={17} color={palette.textMuted} />}
            onPress={() => router.push("/(app)/settings")}
          />
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: palette.border }} />
          <ListRow
            title="Help & support"
            subtitle="Reach the VedaMilan team"
            icon={<LifeBuoy size={17} color={palette.textMuted} />}
            onPress={() => router.push("/(app)/support")}
          />
        </Card>

        <Pressable
          onPress={() => void onSignOut()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            minHeight: 48,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <LogOut size={16} color={palette.ruby} />
          <Text variant="body" style={{ color: palette.ruby }}>
            Sign out
          </Text>
        </Pressable>

        <Text variant="micro" tone="faint" align="center">
          VedaMilan AI · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
