import { NextResponse } from "next/server";
import { z } from "zod";

import { getMockProjects } from "@/app/api/mock-data";
import { createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

const querySchema = z
  .object({
    cursorAction: z.enum(["next", "previous"]).optional(),
    lastProjectId: z.coerce.number().int().positive().optional(),
    search: z.string().trim().max(200).optional(),
    sortBy: z.enum(["name", "code", "createdAt", "updatedAt", "status"]).optional(),
    sortDir: z.enum(["asc", "desc"]).optional(),
    take: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine((query) => query.cursorAction !== "previous" || query.lastProjectId !== undefined, {
    message: "Previous cursor navigation requires lastProjectId.",
    path: ["lastProjectId"],
  });

const projectListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z
      .array(
        z.object({
          code: z.string().nullable(),
          name: z.string().nullable(),
          projectId: z.number().int(),
          status: z.string().nullable(),
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
  const detail =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to access projects." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to access projects." }
        : status === 422
          ? { error: "validation_failed", message: "The project request is invalid." }
          : {
              error: "upstream_projects_unavailable",
              message: "The .NET API could not process the project request.",
            };

  return NextResponse.json(
    { ...detail, requestId },
    { headers: { "X-Request-ID": requestId }, status },
  );
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const { searchParams } = new URL(request.url);
  const query = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!query.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    return NextResponse.json(
      getMockProjects({
        page: 1,
        pageSize: query.data.take,
        search: query.data.search,
        sortBy: query.data.sortBy,
        sortDir: query.data.sortDir,
      }),
      { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
    );
  }

  const upstreamUrl = new URL(`${env.DOTNET_API_BASE_URL}/projects`);
  upstreamUrl.searchParams.set("Take", String(query.data.take));
  if (query.data.lastProjectId)
    upstreamUrl.searchParams.set("LastProjectId", String(query.data.lastProjectId));
  if (query.data.cursorAction)
    upstreamUrl.searchParams.set("CursorAction", query.data.cursorAction);
  if (query.data.search) upstreamUrl.searchParams.set("Search", query.data.search);
  if (query.data.sortBy) upstreamUrl.searchParams.set("SortBy", query.data.sortBy);
  if (query.data.sortDir) upstreamUrl.searchParams.set("SortDir", query.data.sortDir);

  const headers = createBackendHeaders(request, requestId);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers,
      method: "GET",
      next: { revalidate: 0 },
    });
  } catch {
    return errorResponse(502, requestId);
  }

  const payload = await upstream
    .text()
    .then((body) => JSON.parse(body))
    .catch(() => null);

  if (!upstream.ok) return errorResponse(upstream.status, requestId);
  const parsed = projectListResponseSchema.safeParse(payload);
  if (!parsed.success) return errorResponse(502, requestId);

  return NextResponse.json(
    {
      items: parsed.data.data.items.map((item) => ({
        code: item.code ?? "",
        id: String(item.projectId),
        name: item.name ?? "",
        status: item.status ?? "",
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
