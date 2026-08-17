import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TabPanel } from "@/components/ui/Tabs";

import { queryColumnOptions, type ProjectQueryConfiguration } from "./project-query-settings-model";

export function ProjectQueryConfigurationTabs({
  configuration,
  onChange,
}: {
  configuration: ProjectQueryConfiguration;
  onChange: (configuration: ProjectQueryConfiguration) => void;
}) {
  return (
    <>
      <TabPanel value="columns">
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
          Choose the columns shown in the work package table.
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          {queryColumnOptions.map((column) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={configuration.columns.includes(column.value)}
                  onChange={(_, checked) =>
                    onChange({
                      ...configuration,
                      columns: checked
                        ? [...configuration.columns, column.value]
                        : configuration.columns.filter((value) => value !== column.value),
                    })
                  }
                />
              }
              key={column.value}
              label={column.label}
            />
          ))}
        </Box>
      </TabPanel>

      <TabPanel value="sort">
        <Stack spacing={3}>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Sort field
            <select
              className="h-10 rounded border border-[var(--mui-palette-divider)] bg-transparent px-3"
              id="project-query-sort-field"
              name="projectQuerySortField"
              onChange={(event) =>
                onChange({
                  ...configuration,
                  sortBy: { ...configuration.sortBy, field: event.target.value },
                })
              }
              value={configuration.sortBy.field}
            >
              {queryColumnOptions.map((column) => (
                <option key={column.value} value={column.value}>
                  {column.label}
                </option>
              ))}
            </select>
          </label>
          <RadioGroup
            aria-label="Sort direction"
            onChange={(_, direction) =>
              onChange({
                ...configuration,
                sortBy: {
                  ...configuration.sortBy,
                  direction: direction as "asc" | "desc",
                },
              })
            }
            value={configuration.sortBy.direction}
          >
            <FormControlLabel control={<Radio />} label="Ascending" value="asc" />
            <FormControlLabel control={<Radio />} label="Descending" value="desc" />
          </RadioGroup>
        </Stack>
      </TabPanel>

      <TabPanel value="display">
        <RadioGroup
          aria-label="Display mode"
          onChange={(_, displayMode) =>
            onChange({
              ...configuration,
              displayMode: displayMode as ProjectQueryConfiguration["displayMode"],
            })
          }
          value={configuration.displayMode}
        >
          <FormControlLabel control={<Radio />} label="Flat list" value="flat" />
          <FormControlLabel control={<Radio />} label="Hierarchy" value="hierarchy" />
          <FormControlLabel control={<Radio />} label="Grouped" value="grouped" />
        </RadioGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={configuration.showSums}
              onChange={(_, showSums) => onChange({ ...configuration, showSums })}
            />
          }
          label="Display sums"
        />
      </TabPanel>
    </>
  );
}
