"use client";

import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useState } from "react";

import { LoadingState } from "@/components/ui/LoadingState";

import type { DataTableProps } from "./types";

export function DataTable<TData extends RowData>({
  columns,
  data,
  emptyMessage = "No records found.",
  error,
  globalFilterPlaceholder = "Search table",
  initialPageSize = 5,
  isLoading = false,
  pageSizeOptions = [5, 10, 25],
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // TanStack Table intentionally returns stateful table helpers; this hook is the required integration API.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      pagination,
      sorting,
    },
  });

  const visibleColumns = table.getAllLeafColumns().length || 1;
  const rowCount = table.getFilteredRowModel().rows.length;
  const resolvedPageSizeOptions = pageSizeOptions.includes(initialPageSize)
    ? pageSizeOptions
    : [initialPageSize, ...pageSizeOptions].sort((first, second) => first - second);

  return (
    <Paper className="overflow-hidden" variant="outlined">
      <div className="flex flex-col gap-3 border-b border-[var(--mui-palette-divider)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <TextField
          className="max-w-md"
          fullWidth
          label={globalFilterPlaceholder}
          onChange={(event) => {
            setPagination((current) => ({ ...current, pageIndex: 0 }));
            setGlobalFilter(event.target.value);
          }}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search aria-hidden="true" size={17} strokeWidth={1.8} />
                </InputAdornment>
              ),
            },
          }}
          placeholder={globalFilterPlaceholder}
          value={globalFilter}
        />
        <span className="text-xs font-medium text-[var(--mui-palette-text-secondary)]">
          {rowCount} {rowCount === 1 ? "record" : "records"}
        </span>
      </div>

      <TableContainer>
        <Table aria-busy={isLoading} size="small">
          <TableHead sx={{ bgcolor: "action.hover" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ? null : (
                        <TableSortLabel
                          active={Boolean(sortDirection)}
                          direction={sortDirection === "desc" ? "desc" : "asc"}
                          disabled={!header.column.getCanSort()}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns}>
                  <LoadingState className="py-3" label="Loading data..." />
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && error ? (
              <TableRow>
                <TableCell
                  className="py-10 text-center text-red-700"
                  colSpan={visibleColumns}
                  role="alert"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !error && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-10 text-center text-[var(--mui-palette-text-secondary)]"
                  colSpan={visibleColumns}
                  role="status"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !error
              ? table.getRowModel().rows.map((row) => (
                  <TableRow data-testid="data-table-row" hover key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rowCount}
        onPageChange={(_, pageIndex) => table.setPageIndex(pageIndex)}
        onRowsPerPageChange={(event) => {
          table.setPageSize(Number(event.target.value));
        }}
        page={pagination.pageIndex}
        rowsPerPage={pagination.pageSize}
        rowsPerPageOptions={resolvedPageSizeOptions}
      />
    </Paper>
  );
}
