import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { TeamPlannerWorkPackage } from "./project-team-planner-model";

export function ProjectTeamPlannerAddPane({
  projectId,
  workPackages,
}: {
  projectId: string;
  workPackages: TeamPlannerWorkPackage[];
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase());
  const results = deferredSearch
    ? workPackages.filter(
        (workPackage) =>
          workPackage.subject.toLocaleLowerCase().includes(deferredSearch) ||
          workPackage.id.toLocaleLowerCase().includes(deferredSearch),
      )
    : [];

  return (
    <Box
      aria-label="Available work packages"
      component="aside"
      role="region"
      sx={{
        bgcolor: "action.hover",
        border: 1,
        borderColor: "divider",
        flex: { md: "0 0 264px" },
        minHeight: 420,
        p: 2,
      }}
    >
      <TextField
        fullWidth
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search..."
        size="small"
        slotProps={{
          htmlInput: {
            "aria-label": "Search existing work packages",
            type: "search",
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search aria-hidden="true" size={16} />
              </InputAdornment>
            ),
          },
        }}
        value={search}
      />

      {!deferredSearch ? (
        <Stack spacing={2} sx={{ alignItems: "center", px: 3, py: 10, textAlign: "center" }}>
          <Box
            aria-hidden="true"
            sx={{
              alignItems: "center",
              bgcolor: "primary.light",
              borderRadius: "50%",
              color: "primary.dark",
              display: "flex",
              height: 64,
              justifyContent: "center",
              width: 64,
            }}
          >
            <Search size={26} strokeWidth={1.5} />
          </Box>
          <Typography color="text.secondary" variant="body2">
            Search for work packages to add them to the planner.
          </Typography>
        </Stack>
      ) : results.length > 0 ? (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {results.map((workPackage) => (
            <Paper
              component={Link}
              href={`/projects/${projectId}/work-items/${workPackage.id}`}
              key={workPackage.id}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 0.5,
                boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.12)",
                display: "block",
                p: 2.5,
                position: "relative",
                "&::before": {
                  bgcolor: "primary.main",
                  content: '\"\"',
                  height: 2,
                  left: 0,
                  position: "absolute",
                  right: 0,
                  top: 0,
                },
                "&:hover": { borderColor: "primary.main" },
              }}
              variant="outlined"
            >
              <Stack direction="row" spacing={1}>
                <Typography color="text.secondary" variant="caption">
                  WP-{workPackage.id}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {workPackage.type}
                </Typography>
              </Stack>
              <Typography sx={{ fontWeight: 650, mt: 1 }} variant="body2">
                {workPackage.subject}
              </Typography>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Typography
          color="text.secondary"
          sx={{ px: 2, py: 8, textAlign: "center" }}
          variant="body2"
        >
          No work packages found.
        </Typography>
      )}
    </Box>
  );
}
