import type { CreateExampleRecordInput, ExampleRecord } from "../types";

let exampleRecords: ExampleRecord[] = [
  {
    createdAt: "2026-07-08T08:00:00.000Z",
    id: "rec-001",
    name: "Foundation setup",
    owner: "platform@example.com",
    status: "ACTIVE",
  },
  {
    createdAt: "2026-07-08T08:10:00.000Z",
    id: "rec-002",
    name: "Form primitives",
    owner: "forms@example.com",
    status: "DRAFT",
  },
  {
    createdAt: "2026-07-08T08:20:00.000Z",
    id: "rec-003",
    name: "Data table",
    owner: "tables@example.com",
    status: "ACTIVE",
  },
  {
    createdAt: "2026-07-08T08:30:00.000Z",
    id: "rec-004",
    name: "Fallback states",
    owner: "platform@example.com",
    status: "PAUSED",
  },
];

function waitForDemoLatency() {
  return new Promise((resolve) => setTimeout(resolve, 80));
}

export async function listExampleRecords() {
  await waitForDemoLatency();
  return [...exampleRecords];
}

export async function createExampleRecord(input: CreateExampleRecordInput) {
  await waitForDemoLatency();

  const record: ExampleRecord = {
    createdAt: new Date().toISOString(),
    id: `rec-${Date.now().toString(36)}`,
    name: input.name,
    owner: input.owner,
    status: input.status,
  };

  exampleRecords = [record, ...exampleRecords];

  return record;
}
