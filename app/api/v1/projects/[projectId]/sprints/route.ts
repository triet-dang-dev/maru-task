import { NextResponse } from "next/server";
import { z } from "zod";

import { createMockSprint, getMockSprints } from "@/app/api/mock-data";
import { createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ projectId: string }> };

const positiveIntegerSchema = z.coerce.number().int().positive();
const sprintListSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z
      .array(
        z.object({
          sprintId: z.number().int(),
          projectId: z.number().int(),
          name: z.string().nullable(),
          statusId: z.number().int(),
          status: z.string().nullable(),
          startDate: z.string().nullable(),
          endDate: z.string().nullable(),
          createdAt: z.string(),
        }),
      )
      .nullable()
      .transform((items) => items ?? []),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalCount: z.number().int().nonnegative(),
  }),
});

const sprintCreateInputSchema = z
  .object({
    endDate: z.string().datetime({ offset: true }).nullable().optional(),
    name: z.string().trim().min(1),
    startDate: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine(
    (input) => {
      if (!input.startDate || !input.endDate) return true;
      return new Date(input.startDate).getTime() < new Date(input.endDate).getTime();
    },
    {
      message: "Sprint end date must be after the start date.",
      path: ["endDate"],
    },
  );

const sprintCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    endDate: z.string().nullable(),
    name: z.string().nullable(),
    sprintId: z.number().int(),
    startDate: z.string().nullable(),
    status: z.string().nullable(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const details =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to access sprints." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to access sprints." }
        : status === 422
          ? { error: "validation_failed", message: "The sprint request is invalid." }
          : {
              error: "upstream_sprints_unavailable",
              message: "The .NET API could not load sprints.",
            };

  return NextResponse.json(
    { ...details, requestId },
    { headers: { "X-Request-ID": requestId }, status },
  );
}

export async function GET(request: Request, context: RouteContext) {
  const requestId = crypto.randomUUID();
  const { projectId: rawProjectId } = await context.params;
  const projectId = positiveIntegerSchema.safeParse(rawProjectId);
  const { searchParams } = new URL(request.url);
  const take = positiveIntegerSchema.safeParse(searchParams.get("take") ?? "20");
  const lastSprintId = searchParams.has("lastSprintId")
    ? positiveIntegerSchema.safeParse(searchParams.get("lastSprintId"))
    : null;
  const cursorAction = z
    .enum(["next", "previous"])
    .optional()
    .safeParse(searchParams.get("cursorAction") ?? undefined);
  if (
    !projectId.success ||
    !take.success ||
    take.data > 100 ||
    (lastSprintId !== null && !lastSprintId.success) ||
    !cursorAction.success
  )
    return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    return NextResponse.json(
      getMockSprints({
        page: 1,
        pageSize: take.data,
        projectId: String(projectId.data),
      }),
      { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
    );
  }

  const upstreamUrl = new URL(`${env.DOTNET_API_BASE_URL}/projects/${projectId.data}/sprints`);
  upstreamUrl.searchParams.set("Take", String(take.data));
  if (lastSprintId?.success)
    upstreamUrl.searchParams.set("LastSprintId", String(lastSprintId.data));
  if (cursorAction.data) upstreamUrl.searchParams.set("CursorAction", cursorAction.data);

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

  const parsed = sprintListSchema.safeParse(payload);
  if (!parsed.success) return errorResponse(502, requestId);

  return NextResponse.json(
    {
      items: parsed.data.data.items.map((sprint) => ({
        endDate: sprint.endDate,
        createdAt: sprint.createdAt,
        id: String(sprint.sprintId),
        name: sprint.name ?? "",
        projectId: String(sprint.projectId),
        startDate: sprint.startDate,
        status: sprint.status ?? "",
        statusId: sprint.statusId,
      })),
      page: parsed.data.data.page,
      pageSize: parsed.data.data.pageSize,
      total: parsed.data.data.totalCount,
    },
    { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}

export async function POST(request: Request, context: RouteContext) {
  const requestId = crypto.randomUUID();
  const { projectId: rawProjectId } = await context.params;
  const projectId = positiveIntegerSchema.safeParse(rawProjectId);
  const input = sprintCreateInputSchema.safeParse(await request.json().catch(() => null));

  if (!projectId.success || !input.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    createMockSprint({
      endDate: input.data.endDate ?? null,
      name: input.data.name,
      projectId: String(projectId.data),
      startDate: input.data.startDate ?? null,
    });

    return new NextResponse(null, {
      headers: { "X-Request-ID": requestId },
      status: 200,
    });
  }

  const upstreamUrl = new URL(`${env.DOTNET_API_BASE_URL}/projects/${projectId.data}/sprints`);

  let response: Response;
  try {
    response = await fetch(upstreamUrl, {
      body: JSON.stringify({
        endDate: input.data.endDate ?? null,
        name: input.data.name,
        startDate: input.data.startDate ?? null,
      }),
      headers: createBackendHeaders(request, requestId, { contentType: "application/json" }),
      method: "POST",
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

  const parsed = sprintCreateResponseSchema.safeParse(payload);
  if (!parsed.success) return errorResponse(502, requestId);

  return new NextResponse(null, {
    headers: { "X-Request-ID": requestId },
    status: 200,
  });
}
