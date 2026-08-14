"use client";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { getProject } from "../service";
import type { ProjectDetail } from "../types";

export function ProjectWorkspaceSummary({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    void getProject(projectId)
      .then(setProject)
      .catch(() => setProject(null));
  }, [projectId]);

  if (!project) return null;

  return (
    <Stack spacing={1} sx={{ mb: 6 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Typography color="primary.main" sx={{ fontWeight: 750 }} variant="body2">
          {project.code}
        </Typography>
        <Chip label={project.status} size="small" variant="outlined" />
      </Stack>
      <Typography component="h1" variant="h1">
        {project.name}
      </Typography>
      {project.description ? (
        <Typography color="text.secondary">{project.description}</Typography>
      ) : null}
    </Stack>
  );
}
