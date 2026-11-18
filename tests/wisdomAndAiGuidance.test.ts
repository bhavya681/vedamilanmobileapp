import { beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/api/client/http", () => ({ request: requestMock }));

import { aiApi } from "@/api/endpoints/ai";
import { wisdomApi } from "@/api/endpoints/wisdom";

describe("wisdom and AI guidance endpoints", () => {
  beforeEach(() => requestMock.mockReset());

  it("uses dedicated AI Guru and Marriage Guru bundle endpoints", async () => {
    requestMock.mockResolvedValueOnce({ openingMessage: "Your chart", hasChart: true });
    requestMock.mockResolvedValueOnce({ openingMessage: "Your marriage windows", hasChart: false });

    const insights = await aiApi.insights();
    const marriage = await aiApi.marriageGuru();

    expect(insights.openingMessage).toBe("Your chart");
    expect(marriage.openingMessage).toBe("Your marriage windows");
    expect(requestMock).toHaveBeenNthCalledWith(1, "/ai/insights", { timeoutMs: 45_000 });
    expect(requestMock).toHaveBeenNthCalledWith(2, "/ai/marriage-guru", { timeoutMs: 45_000 });
  });

  it("sends single-sage and council wisdom prompts with distinct payloads", async () => {
    requestMock.mockResolvedValue({ answer: "Guidance", conversationId: "conv-1" });

    await wisdomApi.chat({ guideId: "vasistha", message: "How do I act with dharma?" });
    await wisdomApi.council({ message: "How do I decide?", guideIds: ["vasistha", "vyasa"], need: "decision" });

    expect(requestMock).toHaveBeenNthCalledWith(1, "/wisdom", {
      method: "POST",
      body: { guideId: "vasistha", message: "How do I act with dharma?" },
      timeoutMs: 60_000,
    });
    expect(requestMock).toHaveBeenNthCalledWith(2, "/wisdom", {
      method: "POST",
      body: {
        mode: "council",
        message: "How do I decide?",
        guideIds: ["vasistha", "vyasa"],
        need: "decision",
      },
      timeoutMs: 60_000,
    });
  });

  it("uses the real backend catalog fields for guide details", async () => {
    requestMock.mockResolvedValue({
      guide: { id: "vasistha", displayName: "Sage Vasistha", shortPhilosophy: "Steady wisdom" },
      disclaimer: "Reflective guidance",
    });

    const result = await wisdomApi.getLibrary({ guideId: "vasistha" });

    expect(result).toMatchObject({
      guide: { displayName: "Sage Vasistha", shortPhilosophy: "Steady wisdom" },
      disclaimer: "Reflective guidance",
    });
    expect(requestMock).toHaveBeenCalledWith("/wisdom", { query: { guideId: "vasistha" } });
  });
});
