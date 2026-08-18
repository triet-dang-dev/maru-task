"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FolderKanban } from "lucide-react";
import Link from "next/link";

const portfolios = [
  { id: "1", name: "Q3 Delivery", progress: 68, projectCount: 5, status: "On track" },
  { id: "2", name: "Infrastructure Modernization", progress: 35, projectCount: 3, status: "At risk" },
  { id: "3", name: "Customer Growth", progress: 90, projectCount: 8, status: "On track" },
];

const statusColors: Record<string, "success" | "warning" | "error"> = {
  "On track": "success",
  "At risk": "warning",
  "Off track": "error",
};

export function PortfoliosPage() {
  return (
    <Stack spacing={0}>
      <Box sx={{ mb: 5 }}>
        <Typography component="h1" variant="h1">Portfolios</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Strategic view of all project portfolios and their progress.
        </Typography>
      </Box>

      <Stack spacing={2}>
        {portfolios.map((portfolio) => (
          <Box key={portfolio.id} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 3, "&:hover": { bgcolor: "action.hover" } }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <FolderKanban aria-hidden="true" size={20} />
                <Typography component={Link} href={`/portfolios/${portfolio.id}`} sx={{ color: "primary.main", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }} variant="h6">
                  {portfolio.name}
                </Typography>
              </Stack>
              <Chip color={statusColors[portfolio.status]} label={portfolio.status} size="small" />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <LinearProgress value={portfolio.progress} variant="determinate" sx={{ flex: 1, height: 6, borderRadius: 3 }} />
              <Typography sx={{ flexShrink: 0, fontWeight: 600 }} variant="body2">{portfolio.progress}%</Typography>
              <Typography color="text.secondary" variant="body2">{portfolio.projectCount} projects</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
