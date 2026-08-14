import Box, { type BoxProps } from "@mui/material/Box";
import Paper, { type PaperProps } from "@mui/material/Paper";
import Typography, { type TypographyProps } from "@mui/material/Typography";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function SectionCard({ className, ...props }: PaperProps) {
  return <Paper className={cn("overflow-hidden", className)} variant="outlined" {...props} />;
}

export interface SectionCardHeaderProps extends BoxProps {
  action?: ReactNode;
}

export function SectionCardHeader({
  action,
  children,
  className,
  ...props
}: SectionCardHeaderProps) {
  return (
    <Box
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[var(--mui-palette-divider)] px-5 py-4 sm:px-6",
        className,
      )}
      {...props}
    >
      {children}
      {action ? <div className="shrink-0">{action}</div> : null}
    </Box>
  );
}

export function SectionCardTitle({ component = "h2", variant = "h4", ...props }: TypographyProps) {
  return <Typography component={component} variant={variant} {...props} />;
}

export function SectionCardDescription({
  color = "text.secondary",
  sx,
  ...props
}: TypographyProps) {
  return (
    <Typography
      color={color}
      sx={[{ mt: 1 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      variant="body2"
      {...props}
    />
  );
}

export function SectionCardContent({ className, ...props }: BoxProps) {
  return <Box className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}

export function SectionCardFooter({ className, ...props }: BoxProps) {
  return (
    <Box
      className={cn(
        "border-t border-[var(--mui-palette-divider)] bg-[var(--mui-palette-action-hover)] px-5 py-4 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}
