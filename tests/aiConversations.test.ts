import { beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/api/client/http", () => ({ request: requestMock }));

import { aiApi } from "@/api/endpoints/ai";

describe("AI conversation list", () => {
  beforeEach(() => requestMock.mockReset());

  it("normalizes backend _id to id and preserves stored messages", async () => {
    requestMock.mockResolvedValue({
      conversations: [
        {
          _id: "conv-1",
          agent: "HOROSCOPE",
          title: "My chart",
          messages: [
            { role: "user", content: "Tell me about my Moon sign", createdAt: "2026-01-01T00:00:00.000Z" },
            { role: "assistant", content: "Your Moon sign shapes how you nurture.", createdAt: "2026-01-01T00:00:01.000Z" },
          ],
        },
      ],
    });

    const result = await aiApi.listConversations();

    expect(result.conversations[0]?.id).toBe("conv-1");
    expect(result.conversations[0]?.messages).toHaveLength(2);
    expect(requestMock).toHaveBeenCalledWith("/ai/chat", { query: { agent: undefined } });
  });
});
