import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { plannerViewOptions, type TeamPlannerView } from "./project-team-planner-model";

export function ProjectTeamPlannerToolbar({
  isAddPaneOpen,
  onNext,
  onPrevious,
  onToday,
  onToggleAddPane,
  onViewChange,
  view,
}: {
  isAddPaneOpen: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
  onToggleAddPane: () => void;
  onViewChange: (view: TeamPlannerView) => void;
  view: TeamPlannerView;
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{ alignItems: { md: "center" }, justifyContent: "space-between", mb: 3 }}
    >
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
        <Button
          aria-pressed={isAddPaneOpen}
          onClick={onToggleAddPane}
          startIcon={<Plus aria-hidden="true" size={16} />}
          variant={isAddPaneOpen ? "solid" : "outline"}
        >
          Add existing
        </Button>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            id="team-planner-range"
            inputProps={{ "aria-label": "Schedule range" }}
            name="scheduleRange"
            onChange={(event) => onViewChange(event.target.value as TeamPlannerView)}
            value={view}
          >
            {plannerViewOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button aria-label="Previous period" onClick={onPrevious} variant="outline">
          <ChevronLeft aria-hidden="true" size={17} />
        </Button>
        <Button onClick={onToday} variant="outline">
          Today
        </Button>
        <Button aria-label="Next period" onClick={onNext} variant="outline">
          <ChevronRight aria-hidden="true" size={17} />
        </Button>
      </Stack>
    </Stack>
  );
}
