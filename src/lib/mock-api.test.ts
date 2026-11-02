import { afterEach, describe, expect, it } from "vitest";

import { api, setServiceSettings, type TicketInput } from "./mock-api";

describe("mock ticket IDs", () => {
  afterEach(() => {
    setServiceSettings({ latency: 450, failureRate: 0, forceError: false });
  });

  describe("mock article votes", () => {
    afterEach(() => {
      setServiceSettings({ latency: 450, failureRate: 0, forceError: false });
    });

    it("counts one vote per user and updates counts when switching", async () => {
      setServiceSettings({ latency: 0, failureRate: 0, forceError: false });
      const articleId = "kb1";
      const initial = await api.getArticle(articleId);
      const afterHelpful = await api.voteArticle(articleId, true);

      expect(afterHelpful.helpful).toBe(initial.helpful + (initial.currentUserVote === true ? 0 : 1));
      expect(afterHelpful.notHelpful).toBe(initial.notHelpful - (initial.currentUserVote === false ? 1 : 0));
      expect(afterHelpful.currentUserVote).toBe(true);

      const repeatedHelpful = await api.voteArticle(articleId, true);
      expect(repeatedHelpful.helpful).toBe(afterHelpful.helpful);
      expect(repeatedHelpful.notHelpful).toBe(afterHelpful.notHelpful);

      const afterSwitch = await api.voteArticle(articleId, false);
      expect(afterSwitch.helpful).toBe(afterHelpful.helpful - 1);
      expect(afterSwitch.notHelpful).toBe(afterHelpful.notHelpful + 1);
      expect(afterSwitch.currentUserVote).toBe(false);

      const repeatedNotHelpful = await api.voteArticle(articleId, false);
      expect(repeatedNotHelpful.helpful).toBe(afterSwitch.helpful);
      expect(repeatedNotHelpful.notHelpful).toBe(afterSwitch.notHelpful);
    });
  });

  it("does not reuse a ticket ID after deleting a ticket", async () => {
    setServiceSettings({ latency: 0, failureRate: 0, forceError: false });
    const input: TicketInput = {
      subject: "ID reuse regression test",
      description: "Test ticket",
      status: "open",
      priority: "medium",
      channel: "web",
      customerId: "c1",
      assigneeId: null,
      tags: [],
    };
    const createdIds: string[] = [];

    try {
      const first = await api.createTicket(input);
      createdIds.push(first.id);
      await api.deleteTicket(first.id);
      createdIds.pop();

      const second = await api.createTicket(input);
      createdIds.push(second.id);
      expect(second.id).not.toBe(first.id);
    } finally {
      for (const id of createdIds) await api.deleteTicket(id);
    }
  });
});
