import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/mock-api";
import { apiErrorResponse } from "@/lib/http-api";

// Postman: GET http://localhost:<dev-port>/api/activity
export const Route = createFileRoute("/api/activity")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await api.listActivity());
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
