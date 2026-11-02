import { z } from "zod";
import { ServiceError } from "./mock-api";

export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ data: z.output<T>; error?: never } | { data?: never; error: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: Response.json({ error: "Request body must be valid JSON." }, { status: 400 }) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      error: Response.json(
        { error: "Invalid request body.", details: parsed.error.flatten() },
        { status: 400 },
      ),
    };
  }
  return { data: parsed.data };
}

export function apiErrorResponse(error: unknown): Response {
  if (error instanceof ServiceError) {
    const status = error.message.includes("not found") ? 404 : 503;
    return Response.json({ error: error.message }, { status });
  }

  console.error("API request failed", error);
  return Response.json({ error: "Internal server error." }, { status: 500 });
}
