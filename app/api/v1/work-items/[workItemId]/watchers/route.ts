import { NextResponse } from "next/server";
import { z } from "zod";

import { createMockWorkItemWatcher } from "@/app/api/mock-data";
import { backendUrl, createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ workItemId: string }> };

const workItemIdSchema = z.coerce.number().int().positive();
const createWatcherSchema = z.object({ userId: z.coerce.number().int().positive() });
const watcherResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    subscribedAt: z.string(),
    userId: z.number().int(),
    watcherId: z.number().int(),
    workPackageId: z.number().int(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const details =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to add watchers." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to add watchers." }
        : status === 422
          ? { error: "validation_failed", message: "The watcher request is invalid." }
          : {
              error: "upstream_work_items_unavailable",
              message: "The .NET API could not process the watcher request.",
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

  const input = createWatcherSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    const watcher = createMockWorkItemWatcher({
      userId: String(input.data.userId),
      workItemId: String(parsedWorkItemId.data),
    });
    return watcher
      ? NextResponse.json(watcher, {
          headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
          status: 201,
        })
      : errorResponse(404, requestId);
  }

  let response: Response;
  try {
    response = await fetch(
      new URL(
        backendUrl(env.DOTNET_API_BASE_URL, `/work-packages/${parsedWorkItemId.data}/watchers`),
      ),
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

  const parsedResponse = watcherResponseSchema.safeParse(payload);
  if (!parsedResponse.success) return errorResponse(502, requestId);

  const watcher = parsedResponse.data.data;
  return NextResponse.json(
    {
      id: String(watcher.watcherId),
      subscribedAt: watcher.subscribedAt,
      userId: String(watcher.userId),
      workItemId: String(watcher.workPackageId),
    },
    { headers: { "X-Request-ID": requestId }, status: 201 },
  );
}
