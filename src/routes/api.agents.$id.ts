import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/mock-api";
import { apiErrorResponse } from "@/lib/http-api";

// Postman: GET http://localhost:<dev-port>/api/agents/:id
export const Route = createFileRoute("/api/agents/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          return Response.json(await api.getAgent(params.id));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
