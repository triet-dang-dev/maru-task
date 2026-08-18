"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FileText } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export function RequirementsPage() {
  return (
    <Stack spacing={0}>
      <Box sx={{ mb: 5 }}>
        <Typography component="h1" variant="h1">Requirements</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Define and track project requirements and acceptance criteria.
        </Typography>
      </Box>
      <EmptyState
        description="Requirements management coming soon. Link work packages to requirements to track coverage."
        icon={<FileText size={40} />}
        title="No requirements yet"
      />
    </Stack>
  );
}
