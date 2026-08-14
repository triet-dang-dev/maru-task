export interface SprintListItem {
  createdAt?: string;
  endDate: string | null;
  id: string;
  name: string;
  projectId?: string;
  startDate: string | null;
  status: string;
  statusId?: number;
}

export interface SprintsResponse {
  items: SprintListItem[];
  page: number;
  pageSize: number;
  total: number;
}
