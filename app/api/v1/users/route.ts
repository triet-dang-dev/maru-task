import { NextResponse } from "next/server";
import { z } from "zod";

import { getMockUsers } from "@/app/api/mock-data";
import { backendUrl, createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

const querySchema = z.object({
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  role: z.coerce.number().int().optional(),
  search: z.string().trim().max(200).optional(),
});

const usersListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z
      .array(
        z.object({
          userId: z.number().int(),
          displayName: z.string().nullable(),
          email: z.string().nullable(),
          role: z.number().int(),
          roleName: z.string().nullable(),
          isActive: z.boolean(),
          isEmailConfirmed: z.boolean(),
          lastLoginAt: z.string().nullable(),
          createdAt: z.string(),
        }),
      )
      .nullable()
      .transform((items) => items ?? []),
    totalCount: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const detail =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to access users." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to access users." }
        : status === 422
          ? { error: "validation_failed", message: "The user query is invalid." }
          : {
              error: "upstream_users_unavailable",
              message: "The .NET API could not process the user request.",
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
    return NextResponse.json(getMockUsers({ search: query.data.search }), {
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
    });
  }

  const upstreamUrl = new URL(backendUrl(env.DOTNET_API_BASE_URL, "/users"));
  upstreamUrl.searchParams.set("page", String(query.data.page));
  upstreamUrl.searchParams.set("pageSize", String(query.data.pageSize));
  if (query.data.search) upstreamUrl.searchParams.set("search", query.data.search);
  if (query.data.role !== undefined) upstreamUrl.searchParams.set("role", String(query.data.role));
  if (query.data.isActive !== undefined)
    upstreamUrl.searchParams.set("isActive", String(query.data.isActive));

  const headers = createBackendHeaders(request, requestId);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl.toString(), { headers });
  } catch {
    return errorResponse(502, requestId);
  }

  if (!upstream.ok) return errorResponse(upstream.status, requestId);

  const text = await upstream.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return errorResponse(502, requestId);
  }

  const parsed = usersListResponseSchema.safeParse(raw);
  if (!parsed.success) return errorResponse(502, requestId);

  return NextResponse.json(
    {
      items: parsed.data.data.items.map((u) => ({
        email: u.email ?? "",
        id: String(u.userId),
        isActive: u.isActive,
        name: u.displayName ?? "",
        role: u.role,
        roleName: u.roleName ?? "",
        isEmailConfirmed: u.isEmailConfirmed,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
      page: parsed.data.data.page,
      pageSize: parsed.data.data.pageSize,
      total: parsed.data.data.totalCount,
    },
    { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId }, status: 200 },
  );
}
