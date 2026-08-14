export interface ApiMeta {
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiSuccessResponse<TData, TMeta extends ApiMeta = ApiMeta> {
  data: TData;
  meta?: TMeta;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export type PaginatedResponse<TData> = ApiSuccessResponse<TData[], ApiMeta & PaginationMeta>;
