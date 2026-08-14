"use client";

import Box from "@mui/material/Box";
import Link from "next/link";

const navigationItems = [
  { href: "", label: "Overview" },
  { href: "/work-items", label: "Work packages" },
  { href: "/boards", label: "Boards" },
  { href: "/backlogs", label: "Backlogs" },
  { href: "/gantt", label: "Gantt" },
  { href: "/calendar", label: "Calendar" },
  { href: "/settings", label: "Settings" },
];

interface ProjectWorkspaceNavigationProps {
  activeItem?: (typeof navigationItems)[number]["href"];
  projectId: string;
}

export function ProjectWorkspaceNavigation({
  activeItem = "",
  projectId,
}: ProjectWorkspaceNavigationProps) {
  const projectPath = `/projects/${projectId}`;

  return (
    <Box
      aria-label="Project navigation"
      component="nav"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        gap: { xs: 3, sm: 5 },
        mb: 6,
        overflowX: "auto",
      }}
    >
      {navigationItems.map((item) => (
        <Box
          aria-current={item.href === activeItem ? "page" : undefined}
          component={Link}
          href={`${projectPath}${item.href}`}
          key={item.href}
          sx={{
            color: item.href === activeItem ? "primary.main" : "text.secondary",
            flex: "0 0 auto",
            fontSize: "0.875rem",
            fontWeight: item.href === activeItem ? 700 : 600,
            pb: 3,
            pt: 1,
            position: "relative",
            "&::after":
              item.href === activeItem
                ? {
                    backgroundColor: "primary.main",
                    bottom: 0,
                    content: '""',
                    height: 2,
                    left: 0,
                    position: "absolute",
                    right: 0,
                  }
                : undefined,
            "&:focus-visible": {
              borderRadius: 1,
              boxShadow: "0 0 0 3px rgba(26, 103, 163, 0.25)",
              outline: "none",
            },
            "&:hover": { color: "primary.main" },
          }}
        >
          {item.label}
        </Box>
      ))}
    </Box>
  );
}
