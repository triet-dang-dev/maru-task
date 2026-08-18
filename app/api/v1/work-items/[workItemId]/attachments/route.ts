import { NextResponse } from "next/server";
import { z } from "zod";

import { createMockWorkItemAttachment } from "@/app/api/mock-data";
import { backendUrl, createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ workItemId: string }> };

const workItemIdSchema = z.coerce.number().int().positive();
const createAttachmentSchema = z.object({
  contentType: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  sizeInBytes: z.coerce.number().int().positive(),
  storagePath: z.string().trim().min(1),
});
const attachmentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    attachmentId: z.number().int(),
    contentType: z.string().nullable(),
    fileName: z.string().nullable(),
    linkedAt: z.string(),
    linkedByUserId: z.number().int(),
    sizeInBytes: z.number().int(),
    storagePath: z.string().nullable(),
    workPackageId: z.number().int(),
  }),
});

function errorResponse(status: number, requestId: string) {
  const details =
    status === 401
      ? { error: "unauthorized", message: "Your session is not authorized to add attachments." }
      : status === 403
        ? { error: "forbidden", message: "You do not have permission to add attachments." }
        : status === 422
          ? { error: "validation_failed", message: "The attachment request is invalid." }
          : {
              error: "upstream_work_items_unavailable",
              message: "The .NET API could not process the attachment request.",
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

  const input = createAttachmentSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse(422, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) {
    const attachment = createMockWorkItemAttachment({
      ...input.data,
      workItemId: String(parsedWorkItemId.data),
    });
    return attachment
      ? NextResponse.json(attachment, {
          headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
          status: 201,
        })
      : errorResponse(404, requestId);
  }

  const upstreamInput = {
    contentType: input.data.contentType,
    fileName: input.data.fileName,
    sizeInBytes: input.data.sizeInBytes,
    storagePath: input.data.storagePath,
  };
  let response: Response;
  try {
    response = await fetch(
      new URL(
        backendUrl(env.DOTNET_API_BASE_URL, `/work-packages/${parsedWorkItemId.data}/attachments`),
      ),
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

  const parsedResponse = attachmentResponseSchema.safeParse(payload);
  if (!parsedResponse.success) return errorResponse(502, requestId);

  const attachment = parsedResponse.data.data;
  return NextResponse.json(
    {
      contentType: attachment.contentType ?? "",
      fileName: attachment.fileName ?? "",
      id: String(attachment.attachmentId),
      linkedAt: attachment.linkedAt,
      linkedByUserId: String(attachment.linkedByUserId),
      sizeInBytes: attachment.sizeInBytes,
      storagePath: attachment.storagePath ?? "",
      workItemId: String(attachment.workPackageId),
    },
    { headers: { "X-Request-ID": requestId }, status: 201 },
  );
}
