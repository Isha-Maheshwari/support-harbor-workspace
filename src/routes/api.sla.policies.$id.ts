import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const slaPatchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  firstResponseMins: z.number().int().positive().optional(),
  resolutionHours: z.number().positive().optional(),
  active: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one SLA field to update.");

// Postman: PATCH http://localhost:<dev-port>/api/sla/policies/:id
// PATCH JSON body (send only fields to change): {"firstResponseMins":30,"active":true}
export const Route = createFileRoute("/api/sla/policies/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        const parsedBody = await parseJsonBody(request, slaPatchSchema);
        if (parsedBody.error) return parsedBody.error;
        const patch = Object.fromEntries(
          Object.entries(parsedBody.data).filter(([, value]) => value !== undefined),
        );
        try {
          return Response.json(await api.updateSlaPolicy(params.id, patch));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
