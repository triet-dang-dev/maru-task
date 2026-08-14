import { NextResponse } from "next/server";
import { z } from "zod";

import { createMockWorkItemRelation } from "@/app/api/mock-data";
import { createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ workItemId: string }> };

const workItemIdSchema = z.coerce.number().int().positive();
const createRelationSchema = z.object({
  relatedWorkItemId: z.coerce.number().int().positive(),
  relationType: z.string().trim().min(1),
});
const relationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    createdAt: z.string(),
    relationId: z.number().int(),
    relationType: z.string().nullable(),
    sourceWorkPackageId: z.number().int(),
    targetWorkPackageId: z.number().int(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const details =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to add relations." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to add relations." }
        : status === 422
          ? { error: "validation_failed", message: "The relation request is invalid." }
          : {
              error: "upstream_work_items_unavailable",
              message: "The .NET API could not process the relation request.",
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

  const input = createRelationSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    const relation = createMockWorkItemRelation({
      relatedWorkItemId: String(input.data.relatedWorkItemId),
      relationType: input.data.relationType,
      workItemId: String(parsedWorkItemId.data),
    });
    return relation
      ? NextResponse.json(relation, {
          headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
          status: 201,
        })
      : errorResponse(404, requestId);
  }

  const upstreamInput = {
    relatedWorkPackageId: input.data.relatedWorkItemId,
    relationType: input.data.relationType,
  };
  let response: Response;
  try {
    response = await fetch(
      new URL(`${env.DOTNET_API_BASE_URL}/work-packages/${parsedWorkItemId.data}/relations`),
      {
        body: JSON.stringify(upstreamInput),
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

  const parsedResponse = relationResponseSchema.safeParse(payload);
  if (!parsedResponse.success) return errorResponse(502, requestId);

  const relation = parsedResponse.data.data;
  return NextResponse.json(
    {
      createdAt: relation.createdAt,
      id: String(relation.relationId),
      relationType: relation.relationType,
      sourceWorkItemId: String(relation.sourceWorkPackageId),
      targetWorkItemId: String(relation.targetWorkPackageId),
    },
    { headers: { "X-Request-ID": requestId }, status: 201 },
  );
}
