import type { RowData, TableOptions } from "@tanstack/react-table";
import type { ReactNode } from "react";

export interface DataTableProps<TData extends RowData> {
  columns: TableOptions<TData>["columns"];
  data: TData[];
  emptyMessage?: ReactNode;
  error?: ReactNode;
  globalFilterPlaceholder?: string;
  initialPageSize?: number;
  isLoading?: boolean;
  pageSizeOptions?: number[];
}
