"use client";

import MuiPagination, {
  type PaginationProps as MuiPaginationProps,
} from "@mui/material/Pagination";

import { cn } from "@/utils/cn";

export type PaginationProps = MuiPaginationProps;

export function Pagination({
  "aria-label": ariaLabel = "Pagination",
  className,
  color = "primary",
  shape = "rounded",
  ...props
}: PaginationProps) {
  return (
    <MuiPagination
      {...props}
      aria-label={ariaLabel}
      className={cn("max-w-full overflow-x-auto", className)}
      color={color}
      shape={shape}
    />
  );
}
