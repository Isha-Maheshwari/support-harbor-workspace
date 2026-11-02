import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { api, type ArticleInput } from "@/lib/mock-api";
import { apiErrorResponse, parseJsonBody } from "@/lib/http-api";

const articleSchema: z.ZodType<ArticleInput> = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  body: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  tags: z.array(z.string()),
}).strict();

// Postman: GET/POST http://localhost:<dev-port>/api/articles
// POST JSON body: {"title":"Postman API guide","category":"API","body":"Article content","status":"draft","tags":["api"]}
export const Route = createFileRoute("/api/articles")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return Response.json(await api.listArticles(new URL(request.url).searchParams.get("q") ?? ""));
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
      POST: async ({ request }) => {
        const parsedBody = await parseJsonBody(request, articleSchema);
        if (parsedBody.error) return parsedBody.error;
        try {
          return Response.json(await api.createArticle(parsedBody.data), { status: 201 });
        } catch (error) {
          return apiErrorResponse(error);
        }
      },
    },
  },
});
