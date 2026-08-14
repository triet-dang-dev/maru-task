import MuiBreadcrumbs, {
  type BreadcrumbsProps as MuiBreadcrumbsProps,
} from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  href?: string;
  label: ReactNode;
}

export interface BreadcrumbsProps extends Omit<MuiBreadcrumbsProps, "children"> {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({
  "aria-label": ariaLabel = "Breadcrumbs",
  items,
  ...props
}: BreadcrumbsProps) {
  return (
    <MuiBreadcrumbs aria-label={ariaLabel} {...props}>
      {items.map((item, index) => {
        const isCurrentPage = index === items.length - 1;

        if (!isCurrentPage && item.href) {
          return (
            <Link
              color="text.secondary"
              href={item.href}
              key={`${item.href}-${index}`}
              underline="hover"
            >
              {item.label}
            </Link>
          );
        }

        return (
          <Typography
            aria-current={isCurrentPage ? "page" : undefined}
            color="text.primary"
            key={index}
          >
            {item.label}
          </Typography>
        );
      })}
    </MuiBreadcrumbs>
  );
}
