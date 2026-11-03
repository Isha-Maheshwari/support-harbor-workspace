import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const voteSchema = z.object({ helpful: z.boolean() }).strict();

// Postman: POST http://localhost:<dev-port>/api/articles/:id/vote
// JSON body: {"helpful":true} (use false for a not-helpful vote)
export const Route = createFileRoute("/api/articles/$id/vote")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const parsedBody = await parseJsonBody(request, voteSchema);
        if (parsedBody.error) return parsedBody.error;
        try {
          return Response.json(await api.voteArticle(params.id, parsedBody.data.helpful));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
