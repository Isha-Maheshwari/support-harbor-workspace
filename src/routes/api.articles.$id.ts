import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const articlePatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  body: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one article field to update.");

// Postman: GET/PATCH http://localhost:<dev-port>/api/articles/:id
// PATCH JSON body (send only fields to change): {"status":"published","tags":["api","guide"]}
export const Route = createFileRoute("/api/articles/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          return Response.json(await api.getArticle(params.id));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
      PATCH: async ({ params, request }) => {
        const parsedBody = await parseJsonBody(request, articlePatchSchema);
        if (parsedBody.error) return parsedBody.error;
        const patch = Object.fromEntries(
          Object.entries(parsedBody.data).filter(([, value]) => value !== undefined),
        );
        try {
          return Response.json(await api.updateArticle(params.id, patch));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
