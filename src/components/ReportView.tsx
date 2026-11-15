import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { ChevronDown } from "lucide-react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { titleCase } from "@/lib/format";

const HIDDEN_KEYS = new Set([
  "_id",
  "id",
  "userId",
  "candidateUserId",
  "createdAt",
  "updatedAt",
  "generatedAt",
  "__v",
  "meta",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function formatScalar(value: string | number | boolean): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return value;
}

function humanKey(key: string): string {
  return titleCase(key.replace(/([a-z])([A-Z])/g, "$1 $2"));
}

function ValueView({ value, depth }: { value: unknown; depth: number }) {
  const { palette } = useTheme();
  if (value === null || value === undefined) return null;
  if (isScalar(value)) {
    return (
      <Text variant="small" tone="muted">
        {formatScalar(value)}
      </Text>
    );
  }
  if (Array.isArray(value)) {
    if (!value.length) return null;
    if (value.every((v) => isScalar(v))) {
      return (
        <View style={{ gap: 3 }}>
          {value.map((v, i) => (
            <View key={i} style={{ flexDirection: "row", gap: spacing.sm }}>
              <Text variant="small" tone="gold">
                •
              </Text>
              <Text variant="small" tone="muted" style={{ flex: 1 }}>
                {formatScalar(v as string | number | boolean)}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={{ gap: spacing.sm }}>
        {value.map((item, i) => (
          <View
            key={i}
            style={{ paddingLeft: spacing.sm, borderLeftWidth: 2, borderLeftColor: palette.gold, gap: 4 }}
          >
            <ValueView value={item} depth={depth + 1} />
          </View>
        ))}
      </View>
    );
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([k, v]) => !HIDDEN_KEYS.has(k) && v !== null && v !== undefined);
    if (!entries.length) return null;
    return (
      <View style={{ gap: spacing.sm }}>
        {entries.map(([key, v]) => (
          <View key={key} style={{ gap: 2 }}>
            <Text variant="caption" tone="faint">
              {humanKey(key)}
            </Text>
            <ValueView value={v} depth={depth + 1} />
          </View>
        ))}
      </View>
    );
  }
  return null;
}

export function ReportView({
  data,
  title,
  defaultOpen = true,
  depth = 0,
}: {
  data: unknown;
  title?: string;
  defaultOpen?: boolean;
  depth?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { palette } = useTheme();

  const entries =
    isPlainObject(data) && !title
      ? Object.entries(data).filter(([k, v]) => !HIDDEN_KEYS.has(k) && v !== null && v !== undefined)
      : [];

  if (title) {
    return (
      <View style={{ borderTopWidth: depth === 0 ? 0 : 1, borderColor: palette.border, paddingTop: depth === 0 ? 0 : spacing.md }}>
        <Pressable
          onPress={() => setOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}
        >
          <Text variant="label">{title}</Text>
          <ChevronDown size={16} color={palette.textFaint} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
        </Pressable>
        {open ? (
          <View style={{ paddingTop: spacing.xs }}>
            <ValueView value={data} depth={depth + 1} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <Card>
      <View style={{ gap: spacing.md }}>
        {entries.length === 0 ? (
          <ValueView value={data} depth={depth + 1} />
        ) : (
          entries.map(([key, value]) => (
            <View key={key} style={{ gap: 3 }}>
              <Text variant="caption" tone="faint">
                {humanKey(key)}
              </Text>
              <ValueView value={value} depth={depth + 1} />
            </View>
          ))
        )}
      </View>
    </Card>
  );
}

export function ScalarGrid({ data, columns = 2 }: { data: Record<string, unknown>; columns?: number }) {
  const { palette } = useTheme();
  const entries = Object.entries(data).filter(([, v]) => isScalar(v) || v === null);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {entries.map(([key, value]) => (
        <View
          key={key}
          style={{
            width: `${100 / columns - 2}%`,
            backgroundColor: palette.raised,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: palette.border,
            padding: spacing.md,
            gap: 3,
          }}
        >
          <Text variant="micro" tone="faint" numberOfLines={1}>
            {humanKey(key).toUpperCase()}
          </Text>
          <Text variant="small">
            {value === null || value === undefined ? "—" : formatScalar(value as string | number | boolean)}
          </Text>
        </View>
      ))}
    </View>
  );
}
