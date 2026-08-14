// @vitest-environment node
import { NextResponse } from "next/server";

import { getMockPriorities } from "@/app/api/mock-data";
import { getServerEnv } from "@/utils/env.server";

// The .NET API does not yet expose a priority catalog endpoint.
// The static list is authoritative until a versioned endpoint is available.
const STATIC_PRIORITIES = [
  { id: 1, name: "Low" },
  { id: 2, name: "Normal" },
  { id: 3, name: "High" },
  { id: 4, name: "Urgent" },
];

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const env = getServerEnv();

  if (env.USE_MOCK_API) {
    return NextResponse.json(getMockPriorities(), {
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
    });
  }

  // Forward cookies so the .NET API can authorize the request.
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Request-ID": requestId,
  };
  const cookie = request.headers.get("cookie");
  if (cookie) headers.Cookie = cookie;

  // Return static catalog until .NET exposes a priority endpoint.
  return NextResponse.json(
    { items: STATIC_PRIORITIES, total: STATIC_PRIORITIES.length },
    { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId }, status: 200 },
  );
}
