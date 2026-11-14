import { AlertCircle, Inbox, WifiOff } from "lucide-react-native";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { errorMessage } from "@/api/client/errors";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { Button } from "./Button";
import { Card } from "./Card";
import { Skeleton, SkeletonCard } from "./Skeleton";
import { Text } from "./Text";

export function LoadingState({ variant = "detail" }: { variant?: "detail" | "list" }) {
  return (
    <View accessibilityLabel="Loading" style={{ gap: spacing.md }}>
      {variant === "detail" ? (
        <>
          <Skeleton style={{ height: 28, width: "58%" } as ViewStyle} />
          <Skeleton style={{ height: 15, width: "80%" } as ViewStyle} />
          <Skeleton style={{ height: 168, borderRadius: 18, marginTop: spacing.sm } as ViewStyle} />
          <SkeletonCard />
          <SkeletonCard height={72} />
        </>
      ) : (
        <>
          <SkeletonCard height={112} />
          <SkeletonCard height={112} />
          <SkeletonCard height={112} />
          <SkeletonCard height={112} />
        </>
      )}
    </View>
  );
}

export function ErrorState({
  error,
  onRetry,
  title,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const { palette } = useTheme();
  const offline = error instanceof Error && "isNetwork" in error && Boolean((error as { isNetwork?: boolean }).isNetwork);
  return (
    <Card tone="outlined" style={{ alignItems: "center", gap: spacing.md }}>
      {offline ? <WifiOff size={30} color={palette.textMuted} /> : <AlertCircle size={30} color={palette.ruby} />}
      <Text variant="title" align="center">
        {title ?? (offline ? "You are offline" : "Something went wrong")}
      </Text>
      <Text variant="small" tone="muted" align="center">
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </Card>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.empty}>
      {icon ?? <Inbox size={30} color={palette.textFaint} />}
      <Text variant="title" align="center" style={{ marginTop: spacing.md }}>
        {title}
      </Text>
      {body ? (
        <Text variant="small" tone="muted" align="center" style={{ marginTop: spacing.xs }}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
          style={{ marginTop: spacing.lg }}
        />
      ) : null}
    </View>
  );
}

export function InlineNotice({
  title,
  body,
  tone = "muted",
}: {
  title?: string;
  body: string;
  tone?: "muted" | "warning" | "info";
}) {
  const { palette } = useTheme();
  const border = tone === "warning" ? palette.amber : tone === "info" ? palette.temple : palette.border;
  return (
    <View
      style={{
        borderLeftWidth: 3,
        borderLeftColor: border,
        paddingLeft: spacing.md,
        gap: 2,
      }}
    >
      {title ? (
        <Text variant="caption" tone="muted">
          {title.toUpperCase()}
        </Text>
      ) : null}
      <Text variant="small" tone="muted">
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    paddingVertical: spacing.giant,
    paddingHorizontal: spacing.xl,
  },
});
