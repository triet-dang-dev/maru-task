export type ExampleRecordStatus = "ACTIVE" | "DRAFT" | "PAUSED";

export interface ExampleRecord {
  createdAt: string;
  id: string;
  name: string;
  owner: string;
  status: ExampleRecordStatus;
}

export interface CreateExampleRecordInput {
  name: string;
  notifyOwner: boolean;
  owner: string;
  status: ExampleRecordStatus;
}
