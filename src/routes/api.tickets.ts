import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api, type TicketInput } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const ticketInputSchema: z.ZodType<TicketInput> = z.object({
  subject: z.string().trim().min(1),
  description: z.string(),
  status: z.enum(["open", "pending", "on_hold", "solved", "closed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  channel: z.enum(["email", "chat", "phone", "web"]),
  customerId: z.string().min(1),
  assigneeId: z.string().nullable(),
  tags: z.array(z.string()),
}).strict();

const filtersSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["all", "open", "pending", "on_hold", "solved", "closed"]).optional(),
  priority: z.enum(["all", "low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().optional(),
  escalated: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  customerId: z.string().optional(),
});

// Postman: GET/POST http://localhost:<dev-port>/api/tickets
// POST JSON body: {"subject":"Test ticket","description":"Created from Postman","status":"open","priority":"medium","channel":"web","customerId":"c1","assigneeId":null,"tags":[]}
export const Route = createFileRoute("/api/tickets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsedFilters = filtersSchema.safeParse(Object.fromEntries(url.searchParams));
        if (!parsedFilters.success) {
          return Response.json(
            { error: "Invalid ticket filters.", details: parsedFilters.error.flatten() },
            { status: 400 },
          );
        }

        try {
          return Response.json(await api.listTickets(parsedFilters.data));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
      POST: async ({ request }) => {
        const parsedBody = await parseJsonBody(request, ticketInputSchema);
        if (parsedBody.error) return parsedBody.error;

        try {
          const ticket = await api.createTicket(parsedBody.data);
          return Response.json(ticket, { status: 201 });
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
