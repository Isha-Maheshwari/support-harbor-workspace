import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/mock-api";
import { apiErrorResponse } from "@/lib/http-api";

// Postman: GET http://localhost:<dev-port>/api/sla/policies
export const Route = createFileRoute("/api/sla/policies")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await api.listSlaPolicies());
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
