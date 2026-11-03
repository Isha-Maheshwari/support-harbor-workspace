import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api, type CustomerInput } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const customerSchema: z.ZodType<CustomerInput> = z.object({
  name: z.string().trim().min(1),
  company: z.string().trim().min(1),
  email: z.string().email(),
  phone: z.string(),
  tier: z.enum(["free", "pro", "enterprise"]),
  status: z.enum(["active", "churned", "trial"]),
  notes: z.string(),
}).strict();

// Postman: GET/POST http://localhost:<dev-port>/api/customers
// POST JSON body: {"name":"Alex Morgan","company":"Example Co","email":"alex@example.com","phone":"555-0100","tier":"pro","status":"active","notes":"New customer"}
export const Route = createFileRoute("/api/customers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return Response.json(await api.listCustomers(new URL(request.url).searchParams.get("q") ?? ""));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
      POST: async ({ request }) => {
        const parsedBody = await parseJsonBody(request, customerSchema);
        if (parsedBody.error) return parsedBody.error;
        try {
          return Response.json(await api.createCustomer(parsedBody.data), { status: 201 });
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
