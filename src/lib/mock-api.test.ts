import { afterEach, describe, expect, it } from "vitest";

import { api, setServiceSettings, type TicketInput } from "./mock-api";

describe("mock ticket IDs", () => {
  afterEach(() => {
    setServiceSettings({ latency: 450, failureRate: 0, forceError: false });
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
