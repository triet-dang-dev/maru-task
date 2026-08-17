"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { ProjectQueryConfigurationModal } from "./ProjectQueryConfigurationModal";
import { defaultProjectQueryConfiguration } from "./project-query-settings-model";

export function ProjectQuerySettings() {
  const [configuration, setConfiguration] = useState(defaultProjectQueryConfiguration);
  const [isEditing, setIsEditing] = useState(false);
  const filterCount = configuration.filters.length;

  return (
    <Box>
      <Typography component="h2" sx={{ fontWeight: 700, mb: 2 }} variant="h3">
        Work package query
      </Typography>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }} variant="outlined">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            <Box
              sx={{
                alignItems: "center",
                bgcolor: "action.hover",
                borderRadius: 1,
                display: "flex",
                height: 36,
                justifyContent: "center",
                width: 36,
              }}
            >
              <SlidersHorizontal aria-hidden="true" size={18} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>Default work package view</Typography>
              <Typography color="text.secondary" variant="body2">
                {filterCount} active {filterCount === 1 ? "filter" : "filters"} ·{" "}
                {configuration.columns.length} columns
              </Typography>
            </Box>
          </Stack>
          <Button onClick={() => setIsEditing(true)} variant="text">
            Edit query
          </Button>
        </Stack>
      </Paper>
      <input name="defaultWorkPackageQuery" type="hidden" value={JSON.stringify(configuration)} />

      {isEditing ? (
        <ProjectQueryConfigurationModal
          configuration={configuration}
          onApply={(nextConfiguration) => {
            setConfiguration(nextConfiguration);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : null}
    </Box>
  );
}
