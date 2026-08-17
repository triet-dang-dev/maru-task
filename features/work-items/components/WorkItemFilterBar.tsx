"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Filter, Plus, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/Button";

export type FilterField = "assignee" | "priority" | "status" | "subject";
export type FilterOperator = "contains" | "is" | "is_not";

export interface FilterCriteria {
  field: FilterField;
  id: string;
  operator: FilterOperator;
  value: string;
}

interface WorkItemFilterBarProps {
  assigneeOptions?: string[];
  filters: FilterCriteria[];
  onFiltersChange: (filters: FilterCriteria[]) => void;
  priorityOptions?: string[];
  statusOptions?: string[];
}

const fieldLabels: Record<FilterField, string> = {
  assignee: "Assignee",
  priority: "Priority",
  status: "Status",
  subject: "Subject",
};

export function WorkItemFilterBar({
  assigneeOptions = ["Riley Park", "Dana Chen", "Morgan Tate", "Unassigned"],
  filters,
  onFiltersChange,
  priorityOptions = ["Immediate", "High", "Normal", "Low"],
  statusOptions = ["Open", "In progress", "Done", "Closed"],
}: WorkItemFilterBarProps) {
  const availableFields: FilterField[] = (["status", "priority", "assignee", "subject"] as FilterField[]);

  const handleAddCriteria = (field: FilterField) => {
    let defaultValue = "";
    if (field === "status") defaultValue = statusOptions[0] ?? "Open";
    else if (field === "priority") defaultValue = priorityOptions[0] ?? "Normal";
    else if (field === "assignee") defaultValue = assigneeOptions[0] ?? "Riley Park";

    const newCriterion: FilterCriteria = {
      field,
      id: `filter-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      operator: field === "subject" ? "contains" : "is",
      value: defaultValue,
    };

    onFiltersChange([...filters, newCriterion]);
  };

  const handleUpdateCriterion = (id: string, updates: Partial<FilterCriteria>) => {
    onFiltersChange(
      filters.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, ...updates };
        if (updates.field && updates.field !== f.field) {
          if (updated.field === "subject") {
            updated.operator = "contains";
            updated.value = "";
          } else if (updated.field === "status") {
            updated.operator = "is";
            updated.value = statusOptions[0] ?? "";
          } else if (updated.field === "priority") {
            updated.operator = "is";
            updated.value = priorityOptions[0] ?? "";
          } else if (updated.field === "assignee") {
            updated.operator = "is";
            updated.value = assigneeOptions[0] ?? "";
          }
        }
        return updated;
      }),
    );
  };

  const handleRemoveCriterion = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    onFiltersChange([]);
  };

  return (
    <Box
      aria-label="Advanced query filters"
      className="advanced-filters--container"
      sx={{
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "6px",
        p: 2.5,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Filter aria-hidden="true" size={16} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }} variant="subtitle2">
            Active Filters
          </Typography>
          {filters.length > 0 ? (
            <Chip
              label={`${filters.length} active`}
              size="small"
              sx={{ bgcolor: "primary.main", color: "white", fontWeight: 700, height: 20 }}
            />
          ) : (
            <Typography color="text.secondary" variant="caption">
              (No filters applied)
            </Typography>
          )}
        </Stack>

        {filters.length > 0 ? (
          <Button
            onClick={handleClearAll}
            size="small"
            startIcon={<RotateCcw aria-hidden="true" size={13} />}
            variant="ghost"
          >
            Clear all
          </Button>
        ) : null}
      </Stack>

      <Stack spacing={1.5}>
        {filters.map((filter, idx) => (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            key={filter.id}
            spacing={1}
            sx={{ alignItems: { sm: "center" } }}
          >
            {/* Field selector */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                aria-label={`Filter field ${idx + 1}`}
                onChange={(e) => handleUpdateCriterion(filter.id, { field: e.target.value as FilterField })}
                value={filter.field}
              >
                {availableFields.map((f) => (
                  <MenuItem key={f} value={f}>
                    {fieldLabels[f]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Operator selector */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                aria-label={`Filter operator ${idx + 1}`}
                onChange={(e) => handleUpdateCriterion(filter.id, { operator: e.target.value as FilterOperator })}
                value={filter.operator}
              >
                {filter.field === "subject" ? (
                  <MenuItem key="contains" value="contains">
                    contains
                  </MenuItem>
                ) : (
                  [
                    <MenuItem key="is" value="is">
                      is
                    </MenuItem>,
                    <MenuItem key="is_not" value="is_not">
                      is not
                    </MenuItem>,
                  ]
                )}
              </Select>
            </FormControl>

            {/* Value input or select */}
            <Box sx={{ flexGrow: 1 }}>
              {filter.field === "status" ? (
                <FormControl fullWidth size="small">
                  <Select
                    aria-label={`Filter value ${idx + 1}`}
                    onChange={(e) => handleUpdateCriterion(filter.id, { value: e.target.value })}
                    value={filter.value}
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : filter.field === "priority" ? (
                <FormControl fullWidth size="small">
                  <Select
                    aria-label={`Filter value ${idx + 1}`}
                    onChange={(e) => handleUpdateCriterion(filter.id, { value: e.target.value })}
                    value={filter.value}
                  >
                    {priorityOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : filter.field === "assignee" ? (
                <FormControl fullWidth size="small">
                  <Select
                    aria-label={`Filter value ${idx + 1}`}
                    onChange={(e) => handleUpdateCriterion(filter.id, { value: e.target.value })}
                    value={filter.value}
                  >
                    {assigneeOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  onChange={(e) => handleUpdateCriterion(filter.id, { value: e.target.value })}
                  placeholder="Enter keyword..."
                  size="small"
                  slotProps={{ htmlInput: { "aria-label": `Filter value ${idx + 1}` } }}
                  value={filter.value}
                />
              )}
            </Box>

            {/* Remove button */}
            <IconButton
              aria-label={`Remove filter ${fieldLabels[filter.field]}`}
              onClick={() => handleRemoveCriterion(filter.id)}
              size="small"
            >
              <X aria-hidden="true" size={16} />
            </IconButton>
          </Stack>
        ))}

        {/* Add filter button row */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", pt: 0.5 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              aria-label="Add filter criteria"
              displayEmpty
              onChange={(e) => {
                const val = e.target.value as FilterField;
                if (val) handleAddCriteria(val);
              }}
              renderValue={() => (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "primary.main", fontWeight: 600 }}>
                  <Plus size={14} />
                  <span>+ Add filter...</span>
                </Stack>
              )}
              value=""
            >
              <MenuItem disabled value="">
                <em>Select an attribute to filter</em>
              </MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="assignee">Assignee</MenuItem>
              <MenuItem value="subject">Subject keyword</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
}
