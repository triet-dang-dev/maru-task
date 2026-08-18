import { NextResponse } from "next/server";
import { z } from "zod";

import { createMockWorkItem, getMockWorkItems } from "@/app/api/mock-data";
import { backendUrl, createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

const errorDetails = {
  401: {
    error: "unauthorized",
    message: "Your session is not authorized to access work items.",
  },
  403: {
    error: "forbidden",
    message: "You do not have permission to access work items.",
  },
  409: {
    error: "concurrency_conflict",
    message: "The work item changed before the request could be completed.",
  },
  422: {
    error: "validation_failed",
    message: "The work item request is invalid.",
  },
} as const;

const projectIdSchema = z.coerce.number().int().positive();
const positiveIntegerSchema = z.coerce.number().int().positive();
const optionalPositiveIntegerSchema = positiveIntegerSchema.nullable().optional();
const optionalNonnegativeIntegerSchema = z.coerce
  .number()
  .int()
  .nonnegative()
  .nullable()
  .optional();

const createWorkItemSchema = z
  .object({
    assigneeUserId: optionalPositiveIntegerSchema,
    description: z.string().nullable().optional(),
    dueDate: z.string().datetime({ offset: true }).nullable().optional(),
    originalEstimateMinutes: optionalNonnegativeIntegerSchema,
    parentWorkPackageId: optionalPositiveIntegerSchema,
    priorityId: optionalPositiveIntegerSchema,
    projectId: projectIdSchema,
    remainingEstimateMinutes: optionalNonnegativeIntegerSchema,
    sprintId: optionalPositiveIntegerSchema,
    statusId: optionalPositiveIntegerSchema,
    storyPoint: z.coerce.number().nonnegative().nullable().optional(),
    subject: z.string().trim().min(1).max(500).optional(),
    timeSpentMinutes: optionalNonnegativeIntegerSchema,
    title: z.string().trim().min(1).max(500).optional(),
    typeId: optionalPositiveIntegerSchema,
  })
  .refine((input) => input.subject !== undefined || input.title !== undefined, {
    message: "A subject is required.",
    path: ["subject"],
  });

const workPackageQuerySchema = z
  .object({
    assignee: positiveIntegerSchema.optional(),
    cursorAction: z.enum(["next", "previous"]).optional(),
    lastWorkPackageId: positiveIntegerSchema.optional(),
    projectId: projectIdSchema.optional(),
    sortBy: z.enum(["updatedAt", "createdAt", "priority", "status"]).optional(),
    sortDir: z.enum(["asc", "desc"]).optional(),
    status: z.string().trim().min(1).optional(),
    take: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine((query) => query.cursorAction !== "previous" || query.lastWorkPackageId !== undefined, {
    message: "Previous cursor navigation requires lastWorkPackageId.",
    path: ["lastWorkPackageId"],
  });

const workPackageListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z
      .array(
        z.object({
          workPackageId: z.number().int(),
          projectId: z.number().int(),
          projectName: z.string().nullable(),
          subject: z.string().nullable(),
          status: z.string().nullable(),
          priority: z.string().nullable(),
          assigneeUserId: z.number().int().nullable(),
          assignee: z.string().nullable(),
          updatedAt: z.string(),
        }),
      )
      .nullable()
      .transform((items) => items ?? []),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalCount: z.number().int().nonnegative(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const detail = errorDetails[status as keyof typeof errorDetails] ?? {
    error: "upstream_work_items_unavailable",
    message: "The .NET API could not process the work item request.",
  };

  return NextResponse.json(
    { ...detail, requestId },
    {
      headers: { "X-Request-ID": requestId },
      status,
    },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = workPackageQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!query.success) return errorResponse(422, crypto.randomUUID());

  const env = getServerEnv();
  const requestId = crypto.randomUUID();

  if (env.USE_MOCK_API) {
    return NextResponse.json(
      getMockWorkItems({
        page: 1,
        pageSize: query.data.take,
        projectId: query.data.projectId === undefined ? undefined : String(query.data.projectId),
      }),
      { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
    );
  }

  const upstreamUrl = new URL(backendUrl(env.DOTNET_API_BASE_URL, "/work-packages"));
  upstreamUrl.searchParams.set("Take", String(query.data.take));
  if (query.data.lastWorkPackageId)
    upstreamUrl.searchParams.set("LastWorkPackageId", String(query.data.lastWorkPackageId));
  if (query.data.cursorAction)
    upstreamUrl.searchParams.set("CursorAction", query.data.cursorAction);
  if (query.data.projectId) upstreamUrl.searchParams.set("ProjectId", String(query.data.projectId));
  if (query.data.status) upstreamUrl.searchParams.set("Status", query.data.status);
  if (query.data.assignee) upstreamUrl.searchParams.set("Assignee", String(query.data.assignee));
  if (query.data.sortBy) upstreamUrl.searchParams.set("SortBy", query.data.sortBy);
  if (query.data.sortDir) upstreamUrl.searchParams.set("SortDir", query.data.sortDir);

  let response: Response;

  try {
    response = await fetch(upstreamUrl, {
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

  const parsed = workPackageListResponseSchema.safeParse(payload);

  if (!parsed.success) return errorResponse(502, requestId);

  return NextResponse.json(
    {
      items: parsed.data.data.items.map((item) => ({
        assignee: item.assignee ?? "",
        assigneeUserId: item.assigneeUserId === null ? null : String(item.assigneeUserId),
        id: String(item.workPackageId),
        priority: item.priority ?? "",
        projectId: String(item.projectId),
        projectName: item.projectName ?? "",
        status: item.status ?? "",
        subject: item.subject ?? "",
        updatedAt: item.updatedAt,
      })),
      page: parsed.data.data.page,
      pageSize: parsed.data.data.pageSize,
      total: parsed.data.data.totalCount,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Request-ID": requestId,
      },
      status: 200,
    },
  );
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const input = createWorkItemSchema.safeParse(await request.json().catch(() => null));

  if (!input.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    createMockWorkItem({
      projectId: String(input.data.projectId),
      title: input.data.subject ?? input.data.title!,
    });
    return new NextResponse(null, {
      headers: { "X-Request-ID": requestId },
      status: 200,
    });
  }

  const upstreamUrl = new URL(backendUrl(env.DOTNET_API_BASE_URL, "/work-packages"));

  let response: Response;

  try {
    const { title, ...backendInput } = input.data;
    response = await fetch(upstreamUrl, {
      body: JSON.stringify({ ...backendInput, subject: backendInput.subject ?? title }),
      headers: createBackendHeaders(request, requestId, { contentType: "application/json" }),
      method: "POST",
      next: { revalidate: 0 },
    });
  } catch {
    return errorResponse(502, requestId);
  }

  if (!response.ok) return errorResponse(response.status, requestId);

  return new NextResponse(null, {
    headers: { "X-Request-ID": requestId },
    status: 200,
  });
}
