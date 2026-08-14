import { NextResponse } from "next/server";
import { z } from "zod";

import { deleteMockWorkItem, getMockWorkItem, updateMockWorkItem } from "@/app/api/mock-data";
import { createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ workItemId: string }> };

const workItemIdSchema = z.coerce.number().int().positive();
const updateWorkItemSchema = z
  .object({
    assigneeUserId: z.coerce.number().int().positive().nullable().optional(),
    description: z.string().nullable().optional(),
    dueDate: z.string().datetime({ offset: true }).nullable().optional(),
    originalEstimateMinutes: z.coerce.number().int().nonnegative().nullable().optional(),
    parentWorkPackageId: z.coerce.number().int().positive().nullable().optional(),
    priorityId: z.coerce.number().int().positive().nullable().optional(),
    remainingEstimateMinutes: z.coerce.number().int().nonnegative().nullable().optional(),
    sprintId: z.coerce.number().int().positive().nullable().optional(),
    statusId: z.coerce.number().int().positive().nullable().optional(),
    storyPoint: z.coerce.number().nonnegative().nullable().optional(),
    subject: z.string().trim().min(1).max(500).nullable().optional(),
    timeSpentMinutes: z.coerce.number().int().nonnegative().nullable().optional(),
    typeId: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined));

const workPackageDetailSchema = z.object({
  success: z.literal(true),
  data: z.object({
    workPackageId: z.number().int(),
    projectId: z.number().int(),
    projectName: z.string().nullable(),
    subject: z.string().nullable(),
    description: z.string().nullable(),
    status: z.string().nullable(),
    priority: z.string().nullable(),
    type: z.string().nullable(),
    authorUserId: z.number().int().nullable(),
    author: z.string().nullable(),
    assigneeUserId: z.number().int().nullable(),
    assignee: z.string().nullable(),
    dueDate: z.string().nullable(),
    parentSummary: z.string().nullable(),
    relationCount: z.number().int(),
    commentCount: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const details =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to access work items." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to access work items." }
        : status === 409
          ? {
              error: "concurrency_conflict",
              message: "The work item changed before the request could be completed.",
            }
          : status === 422
            ? { error: "validation_failed", message: "The work item request is invalid." }
            : {
                error: "upstream_work_items_unavailable",
                message: "The .NET API could not process the work item request.",
              };

  return NextResponse.json(
    { ...details, requestId },
    { headers: { "X-Request-ID": requestId }, status },
  );
}

function toBrowserDetail(detail: z.infer<typeof workPackageDetailSchema>["data"]) {
  return {
    id: String(detail.workPackageId),
    projectId: String(detail.projectId),
    projectName: detail.projectName ?? "",
    subject: detail.subject ?? "",
    description: detail.description ?? "",
    status: detail.status ?? "",
    priority: detail.priority ?? "",
    type: detail.type ?? "",
    authorUserId: detail.authorUserId === null ? null : String(detail.authorUserId),
    author: detail.author ?? "",
    assigneeUserId: detail.assigneeUserId === null ? null : String(detail.assigneeUserId),
    assignee: detail.assignee ?? "",
    dueDate: detail.dueDate,
    parentSummary: detail.parentSummary,
    relationCount: detail.relationCount,
    commentCount: detail.commentCount,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}

async function getRouteInput(context: RouteContext) {
  const { workItemId } = await context.params;
  return workItemIdSchema.safeParse(workItemId);
}

export async function GET(request: Request, context: RouteContext) {
  const workItemId = await getRouteInput(context);
  const requestId = crypto.randomUUID();
  if (!workItemId.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    const detail = getMockWorkItem(String(workItemId.data));
    return detail
      ? NextResponse.json(detail, {
          headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
        })
      : errorResponse(404, requestId);
  }

  let response: Response;
  try {
    response = await fetch(new URL(`${env.DOTNET_API_BASE_URL}/work-packages/${workItemId.data}`), {
      headers: createBackendHeaders(request, requestId),
      method: "GET",
      next: { revalidate: 0 },
    });
  } catch {
    return errorResponse(502, requestId);
  }

  const payload = await response
    .text()
    .then((body) => JSON.parse(body))
    .catch(() => null);
  if (!response.ok) return errorResponse(response.status, requestId);

  const parsed = workPackageDetailSchema.safeParse(payload);
  if (!parsed.success) return errorResponse(502, requestId);

  return NextResponse.json(toBrowserDetail(parsed.data.data), {
    headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
  });
}

async function updateWorkItem(request: Request, context: RouteContext, method: "PATCH" | "PUT") {
  const workItemId = await getRouteInput(context);
  const requestId = crypto.randomUUID();
  if (!workItemId.success) return errorResponse(422, requestId);

  const input = updateWorkItemSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    const detail = updateMockWorkItem(String(workItemId.data), {
      assigneeUserId: input.data.assigneeUserId ?? undefined,
      description: input.data.description ?? undefined,
      dueDate: input.data.dueDate,
      priorityId: input.data.priorityId ?? undefined,
      subject: input.data.subject ?? undefined,
    });
    return detail
      ? NextResponse.json(detail, {
          headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
        })
      : errorResponse(404, requestId);
  }

  let response: Response;
  try {
    response = await fetch(new URL(`${env.DOTNET_API_BASE_URL}/work-packages/${workItemId.data}`), {
      body: JSON.stringify(input.data),
      headers: createBackendHeaders(request, requestId, { contentType: "application/json" }),
      method,
      next: { revalidate: 0 },
    });
  } catch {
    return errorResponse(502, requestId);
  }

  if (!response.ok) return errorResponse(response.status, requestId);

  return new NextResponse(null, { headers: { "X-Request-ID": requestId }, status: 200 });
}

export function PATCH(request: Request, context: RouteContext) {
  return updateWorkItem(request, context, "PATCH");
}

export function PUT(request: Request, context: RouteContext) {
  return updateWorkItem(request, context, "PUT");
}

export async function DELETE(request: Request, context: RouteContext) {
  const workItemId = await getRouteInput(context);
  const requestId = crypto.randomUUID();
  if (!workItemId.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    return deleteMockWorkItem(String(workItemId.data))
      ? new NextResponse(null, { headers: { "X-Request-ID": requestId }, status: 204 })
      : errorResponse(404, requestId);
  }

  let response: Response;
  try {
    response = await fetch(new URL(`${env.DOTNET_API_BASE_URL}/work-packages/${workItemId.data}`), {
      headers: createBackendHeaders(request, requestId),
      method: "DELETE",
      next: { revalidate: 0 },
    });
  } catch {
    return errorResponse(502, requestId);
  }

  if (!response.ok) return errorResponse(response.status, requestId);

  return new NextResponse(null, { headers: { "X-Request-ID": requestId }, status: 204 });
}
