"use client";

import Stack from "@mui/material/Stack";
import { FolderPlus, ListPlus, FolderKanban, CheckSquare } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

export interface HomeQuickActionsProps {
  onCreateProject: () => void;
  onCreateWorkItem: () => void;
}

export function HomeQuickActions({
  onCreateProject,
  onCreateWorkItem,
}: HomeQuickActionsProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ alignItems: { sm: "center" }, flexWrap: "wrap" }}
    >
      <Button
        onClick={onCreateProject}
        startIcon={<FolderPlus aria-hidden="true" className="h-4 w-4" />}
        variant="solid"
      >
        New project
      </Button>
      <Button
        onClick={onCreateWorkItem}
        startIcon={<ListPlus aria-hidden="true" className="h-4 w-4" />}
        variant="outline"
      >
        New work item
      </Button>
      <Button
        component={Link}
        href="/projects"
        startIcon={<FolderKanban aria-hidden="true" className="h-4 w-4" />}
        variant="ghost"
      >
        Projects
      </Button>
      <Button
        component={Link}
        href="/my/page"
        startIcon={<CheckSquare aria-hidden="true" className="h-4 w-4" />}
        variant="ghost"
      >
        My page
      </Button>
    </Stack>
  );
}
