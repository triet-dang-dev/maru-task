import { NextResponse } from "next/server";
import { z } from "zod";

import { createMockWorkItemComment } from "@/app/api/mock-data";
import { createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ workItemId: string }> };

const workItemIdSchema = z.coerce.number().int().positive();
const createCommentSchema = z.object({ body: z.string().trim().min(1) });
const commentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    authorUserId: z.number().int(),
    body: z.string().nullable(),
    commentId: z.number().int(),
    createdAt: z.string(),
    isDeleted: z.boolean(),
    updatedAt: z.string().nullable(),
    workPackageId: z.number().int(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const details =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to add comments." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to add comments." }
        : status === 422
          ? { error: "validation_failed", message: "The comment request is invalid." }
          : {
              error: "upstream_work_items_unavailable",
              message: "The .NET API could not process the comment request.",
            };

  return NextResponse.json(
    { ...details, requestId },
    { headers: { "X-Request-ID": requestId }, status },
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { workItemId } = await context.params;
  const parsedWorkItemId = workItemIdSchema.safeParse(workItemId);
  const requestId = crypto.randomUUID();
  if (!parsedWorkItemId.success) return errorResponse(422, requestId);

  const input = createCommentSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    const comment = createMockWorkItemComment({
      body: input.data.body,
      workItemId: String(parsedWorkItemId.data),
    });
    return comment
      ? NextResponse.json(comment, {
          headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
          status: 201,
        })
      : errorResponse(404, requestId);
  }

  let response: Response;
  try {
    response = await fetch(
      new URL(`${env.DOTNET_API_BASE_URL}/work-packages/${parsedWorkItemId.data}/comments`),
      {
        body: JSON.stringify(input.data),
        headers: createBackendHeaders(request, requestId, { contentType: "application/json" }),
        method: "POST",
        next: { revalidate: 0 },
      },
    );
  } catch {
    return errorResponse(502, requestId);
  }

  const payload = await response
    .text()
    .then((body) => JSON.parse(body))
    .catch(() => null);
  if (!response.ok) return errorResponse(response.status, requestId);

  const parsedResponse = commentResponseSchema.safeParse(payload);
  if (!parsedResponse.success) return errorResponse(502, requestId);

  const comment = parsedResponse.data.data;
  return NextResponse.json(
    {
      authorUserId: String(comment.authorUserId),
      body: comment.body ?? "",
      createdAt: comment.createdAt,
      id: String(comment.commentId),
      isDeleted: comment.isDeleted,
      updatedAt: comment.updatedAt,
      workItemId: String(comment.workPackageId),
    },
    { headers: { "X-Request-ID": requestId }, status: 201 },
  );
}
