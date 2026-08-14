export interface ProjectListItem {
  code: string;
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  items: ProjectListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ProjectDetail extends ProjectListItem {
  createdAt: string;
  description: string;
}
