import Box, { type BoxProps } from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface LoadingStateProps extends Omit<BoxProps, "children"> {
  children?: ReactNode;
  label?: string;
  lines?: number;
}

export function LoadingState({
  children,
  className,
  label = "Loading content",
  lines = 3,
  ...props
}: LoadingStateProps) {
  return (
    <Box
      {...props}
      aria-busy="true"
      aria-label={label}
      className={cn("grid gap-3", className)}
      role="status"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="contents">
        {children ??
          Array.from({ length: lines }, (_, index) => (
            <Skeleton
              data-testid="loading-state-skeleton"
              height={18}
              key={index}
              variant="rounded"
              width={index % 2 === 0 ? "88%" : "72%"}
            />
          ))}
      </div>
    </Box>
  );
}
