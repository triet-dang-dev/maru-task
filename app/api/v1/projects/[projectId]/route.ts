import { NextResponse } from "next/server";
import { z } from "zod";

import { getMockProject } from "@/app/api/mock-data";
import { backendUrl, createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ projectId: string }> };

const projectIdSchema = z.coerce.number().int().positive();
const projectDetailSchema = z.object({
  success: z.literal(true),
  data: z.object({
    code: z.string().nullable(),
    description: z.string().nullable(),
    name: z.string().nullable(),
    projectId: z.number().int(),
    status: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

function errorResponse(status: number, requestId: string) {
  return NextResponse.json(
    {
      error: status === 404 ? "not_found" : "upstream_projects_unavailable",
      message:
        status === 404 ? "The project was not found." : "The .NET API could not load the project.",
      requestId,
    },
    { headers: { "X-Request-ID": requestId }, status },
  );
}

export async function GET(request: Request, context: RouteContext) {
  const requestId = crypto.randomUUID();
  const { projectId: rawProjectId } = await context.params;
  const projectId = projectIdSchema.safeParse(rawProjectId);
  if (!projectId.success) return errorResponse(404, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    const project = getMockProject(String(projectId.data));
    if (!project) return errorResponse(404, requestId);
    return NextResponse.json(project, {
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
    });
  }

  const headers = createBackendHeaders(request, requestId);

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl(env.DOTNET_API_BASE_URL, `/projects/${projectId.data}`), {
      headers,
      method: "GET",
      next: { revalidate: 0 },
    });
  } catch {
    return errorResponse(502, requestId);
  }

  const payload = await upstream
    .text()
    .then(JSON.parse)
    .catch(() => null);
  if (!upstream.ok) return errorResponse(upstream.status, requestId);
  const parsed = projectDetailSchema.safeParse(payload);
  if (!parsed.success) return errorResponse(502, requestId);

  return NextResponse.json(
    {
      code: parsed.data.data.code ?? "",
      createdAt: parsed.data.data.createdAt,
      description: parsed.data.data.description ?? "",
      id: String(parsed.data.data.projectId),
      name: parsed.data.data.name ?? "",
      status: parsed.data.data.status ?? "",
      updatedAt: parsed.data.data.updatedAt,
    },
    { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}
