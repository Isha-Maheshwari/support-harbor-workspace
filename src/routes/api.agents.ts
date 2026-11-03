import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/mock-api";
import { apiErrorResponse } from "@/lib/http-api";

// Postman: GET http://localhost:<dev-port>/api/agents
export const Route = createFileRoute("/api/agents")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await api.listAgents());
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
