import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/mock-api";
import { apiErrorResponse } from "@/lib/http-api";

// Postman: GET http://localhost:<dev-port>/api/stats
export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await api.stats());
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
