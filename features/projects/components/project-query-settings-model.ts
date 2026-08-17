export type QueryFilterField = "assignee" | "priority" | "status";

export interface ProjectQueryFilter {
  field: QueryFilterField;
  operator: "is" | "isNot";
  value: string;
}

export interface ProjectQueryConfiguration {
  columns: string[];
  displayMode: "flat" | "grouped" | "hierarchy";
  filters: ProjectQueryFilter[];
  showSums: boolean;
  sortBy: { direction: "asc" | "desc"; field: string };
}

export const queryColumnOptions = [
  { label: "ID", value: "id" },
  { label: "Subject", value: "subject" },
  { label: "Type", value: "type" },
  { label: "Status", value: "status" },
  { label: "Assignee", value: "assignee" },
  { label: "Priority", value: "priority" },
  { label: "Updated at", value: "updatedAt" },
];

export const defaultProjectQueryConfiguration: ProjectQueryConfiguration = {
  columns: ["id", "subject", "type", "status", "assignee", "updatedAt"],
  displayMode: "flat",
  filters: [{ field: "status", operator: "is", value: "open" }],
  showSums: false,
  sortBy: { direction: "desc", field: "updatedAt" },
};
