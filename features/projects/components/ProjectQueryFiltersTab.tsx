import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

import type { ProjectQueryConfiguration, QueryFilterField } from "./project-query-settings-model";

const filterValues: Record<QueryFilterField, { label: string; value: string }[]> = {
  assignee: [
    { label: "Me", value: "me" },
    { label: "Unassigned", value: "unassigned" },
  ],
  priority: [
    { label: "High", value: "high" },
    { label: "Normal", value: "normal" },
    { label: "Low", value: "low" },
  ],
  status: [
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
  ],
};

export function ProjectQueryFiltersTab({
  configuration,
  onChange,
}: {
  configuration: ProjectQueryConfiguration;
  onChange: (configuration: ProjectQueryConfiguration) => void;
}) {
  const [filterField, setFilterField] = useState<QueryFilterField>("status");
  const [filterValue, setFilterValue] = useState("open");

  const updateField = (field: QueryFilterField) => {
    setFilterField(field);
    setFilterValue(filterValues[field][0].value);
  };

  return (
    <Stack spacing={3}>
      {configuration.filters.map((filter, index) => (
        <Stack
          direction="row"
          key={`${filter.field}-${filter.value}-${index}`}
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography sx={{ textTransform: "capitalize" }} variant="body2">
            {filter.field} {filter.operator === "is" ? "is" : "is not"} {filter.value}
          </Typography>
          <IconButton
            aria-label={`Remove ${filter.field} filter`}
            onClick={() =>
              onChange({
                ...configuration,
                filters: configuration.filters.filter((_, filterIndex) => filterIndex !== index),
              })
            }
            size="small"
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      ))}
      <Stack direction={{ sm: "row" }} spacing={2} sx={{ alignItems: { sm: "end" } }}>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Filter field
          <select
            className="h-10 rounded border border-[var(--mui-palette-divider)] bg-transparent px-3"
            id="project-query-filter-field"
            name="projectQueryFilterField"
            onChange={(event) => updateField(event.target.value as QueryFilterField)}
            value={filterField}
          >
            <option value="status">Status</option>
            <option value="assignee">Assignee</option>
            <option value="priority">Priority</option>
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Filter value
          <select
            className="h-10 rounded border border-[var(--mui-palette-divider)] bg-transparent px-3"
            id="project-query-filter-value"
            name="projectQueryFilterValue"
            onChange={(event) => setFilterValue(event.target.value)}
            value={filterValue}
          >
            {filterValues[filterField].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          onClick={() =>
            onChange({
              ...configuration,
              filters: [
                ...configuration.filters,
                { field: filterField, operator: "is", value: filterValue },
              ],
            })
          }
          variant="outline"
        >
          Add filter
        </Button>
      </Stack>
    </Stack>
  );
}
