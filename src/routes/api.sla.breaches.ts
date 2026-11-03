import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/mock-api";
import { apiErrorResponse } from "@/lib/http-api";

// Postman: GET http://localhost:<dev-port>/api/sla/breaches
export const Route = createFileRoute("/api/sla/breaches")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await api.listBreaches());
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
