import type { ExampleRecordStatus } from "../types";

export const statusTone: Record<ExampleRecordStatus, "info" | "success" | "warning"> = {
  ACTIVE: "success",
  DRAFT: "info",
  PAUSED: "warning",
};

export const statusLabel: Record<ExampleRecordStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  PAUSED: "Paused",
};
