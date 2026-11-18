import React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

type Props = {
  content: string;
  color?: string;
};

function renderInline(text: string, keyPrefix: string, color?: string) {
  const parts: React.ReactNode[] = [];
  // bold **text**, italic *text* or _text_, inline code `code`
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      parts.push(
        <Text key={`${keyPrefix}-t-${i++}`} variant="small" style={{ color, lineHeight: 22 }}>
          {text.slice(last, m.index)}
        </Text>,
      );
    }
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(
        <Text key={`${keyPrefix}-b-${i++}`} variant="small" weight="semibold" style={{ color, lineHeight: 22 }}>
          {token.slice(2, -2)}
        </Text>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <Text key={`${keyPrefix}-c-${i++}`} variant="caption" tone="muted" style={{ color, lineHeight: 22 }}>
          {token.slice(1, -1)}
        </Text>,
      );
    } else {
      parts.push(
        <Text key={`${keyPrefix}-i-${i++}`} variant="small" style={{ color, fontStyle: "italic", lineHeight: 22 }}>
          {token.slice(1, -1)}
        </Text>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    parts.push(
      <Text key={`${keyPrefix}-t-${i++}`} variant="small" style={{ color, lineHeight: 22 }}>
        {text.slice(last)}
      </Text>,
    );
  }
  return parts.length ? parts : [<Text key={`${keyPrefix}-e`} variant="small" style={{ color, lineHeight: 22 }}>{text}</Text>];
}

export function MarkdownText({ content, color }: Props) {
  const { palette } = useTheme();
  const textColor = color ?? palette.text;
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  let listBuf: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!listBuf) return;
    const { ordered, items } = listBuf;
    nodes.push(
      <View key={`list-${key++}`} style={{ gap: 4, marginVertical: 2 }}>
        {items.map((item, idx) => (
          <View key={idx} style={{ flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" }}>
            <Text variant="small" tone="muted" style={{ width: ordered ? 18 : 12, lineHeight: 22 }}>
              {ordered ? `${idx + 1}.` : "•"}
            </Text>
            <Text variant="small" style={{ flex: 1, color: textColor, lineHeight: 22 }}>
              {renderInline(item, `li-${key}-${idx}`, textColor)}
            </Text>
          </View>
        ))}
      </View>,
    );
    listBuf = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const line = raw.trimEnd();
    const t = line.trim();

    const ul = /^[-*]\s+(.*)/.exec(t);
    const ol = /^\d+[.)]\s+(.*)/.exec(t);
    if (ul || ol) {
      const ordered = !!ol;
      const item = (ul ? ul[1] : ol![1]) ?? "";
      if (!listBuf || listBuf.ordered !== ordered) {
        flushList();
        listBuf = { ordered, items: [] };
      }
      listBuf.items.push(item);
      continue;
    } else {
      flushList();
    }

    if (!t) {
      nodes.push(<View key={`sp-${key++}`} style={{ height: 6 }} />);
      continue;
    }
    const h3 = /^###\s+(.*)/.exec(t);
    const h2 = /^##\s+(.*)/.exec(t);
    const h1 = /^#\s+(.*)/.exec(t);
    if (h1 || h2 || h3) {
      const text = (h1?.[1] ?? h2?.[1] ?? h3?.[1]) ?? "";
      nodes.push(
        <Text
          key={`h-${key++}`}
          variant={h1 ? "label" : "body"}
          weight="semibold"
          style={{ color: textColor, marginTop: 4, marginBottom: 2 }}
        >
          {text}
        </Text>,
      );
      continue;
    }
    nodes.push(
      <Text key={`p-${key++}`} variant="small" style={{ color: textColor, lineHeight: 22 }}>
        {renderInline(t, `p-${key}`, textColor)}
      </Text>,
    );
  }
  flushList();

  return <View style={{ gap: 2 }}>{nodes}</View>;
}
