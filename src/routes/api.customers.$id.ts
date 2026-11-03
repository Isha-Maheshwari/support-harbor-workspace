import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const customerPatchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  company: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  tier: z.enum(["free", "pro", "enterprise"]).optional(),
  status: z.enum(["active", "churned", "trial"]).optional(),
  notes: z.string().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one customer field to update.");

// Postman: GET/PATCH http://localhost:<dev-port>/api/customers/:id
// PATCH JSON body (send only fields to change): {"tier":"enterprise","notes":"Priority account"}
export const Route = createFileRoute("/api/customers/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          return Response.json(await api.getCustomer(params.id));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
      PATCH: async ({ params, request }) => {
        const parsedBody = await parseJsonBody(request, customerPatchSchema);
        if (parsedBody.error) return parsedBody.error;
        const patch = Object.fromEntries(
          Object.entries(parsedBody.data).filter(([, value]) => value !== undefined),
        );
        try {
          return Response.json(await api.updateCustomer(params.id, patch));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
