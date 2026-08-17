import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";

import { Button } from "@/components/ui/Button";

import type { TeamPlannerAssignee } from "./project-team-planner-model";

export function ProjectTeamPlannerAssigneePicker({
  candidates,
  onAdd,
  onCancel,
  onSelectionChange,
  selectedAssigneeId,
}: {
  candidates: TeamPlannerAssignee[];
  onAdd: () => void;
  onCancel: () => void;
  onSelectionChange: (assigneeId: string) => void;
  selectedAssigneeId: string;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" }, borderTop: 1, borderColor: "divider", p: 3 }}
    >
      <FormControl fullWidth size="small">
        <InputLabel id="team-planner-assignee-label">Assignee</InputLabel>
        <Select
          id="team-planner-assignee"
          inputProps={{ "aria-label": "Assignee" }}
          label="Assignee"
          labelId="team-planner-assignee-label"
          name="assignee"
          onChange={(event) => onSelectionChange(event.target.value)}
          value={selectedAssigneeId}
        >
          {candidates.map((assignee) => (
            <MenuItem key={assignee.id} value={assignee.id}>
              {assignee.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack direction="row" spacing={1}>
        <Button onClick={onCancel} variant="ghost">
          Cancel
        </Button>
        <Button disabled={!selectedAssigneeId} onClick={onAdd}>
          Add to planner
        </Button>
      </Stack>
    </Stack>
  );
}
