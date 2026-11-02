import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const commentSchema = z.object({
  body: z.string().trim().min(1),
  internal: z.boolean(),
}).strict();

// Postman: POST http://localhost:<dev-port>/api/tickets/:id/comments
// JSON body: {"body":"I am looking into this issue.","internal":false}
export const Route = createFileRoute("/api/tickets/$id/comments")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const parsedBody = await parseJsonBody(request, commentSchema);
        if (parsedBody.error) return parsedBody.error;
        try {
          const { body, internal } = parsedBody.data;
          return Response.json(await api.addComment(params.id, body, internal));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
