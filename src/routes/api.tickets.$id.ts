import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api, type TicketInput } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const ticketPatchSchema = z.object({
  subject: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["open", "pending", "on_hold", "solved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  channel: z.enum(["email", "chat", "phone", "web"]).optional(),
  customerId: z.string().min(1).optional(),
  assigneeId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one ticket field to update.");

// Postman: GET/PATCH/DELETE http://localhost:<dev-port>/api/tickets/:id
// PATCH JSON body (send only fields to change): {"status":"pending","priority":"high"}
export const Route = createFileRoute("/api/tickets/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          return Response.json(await api.getTicket(params.id));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
      PATCH: async ({ params, request }) => {
        const parsedBody = await parseJsonBody(request, ticketPatchSchema);
        if (parsedBody.error) return parsedBody.error;
        const patch = Object.fromEntries(
          Object.entries(parsedBody.data).filter(([, value]) => value !== undefined),
        ) as Partial<TicketInput>;

        try {
          return Response.json(await api.updateTicket(params.id, patch));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
      DELETE: async ({ params }) => {
        try {
          await api.deleteTicket(params.id);
          return new Response(null, { status: 204 });
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
