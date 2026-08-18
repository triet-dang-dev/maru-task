"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";

interface ProjectScopeSelectorProps {
  onChange: (projectId: string | null) => void;
  projects: Array<{ id: string; name: string }>;
  value: string | null;
}

export function ProjectScopeSelector({ onChange, projects, value }: ProjectScopeSelectorProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value || null);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="project-scope-label" shrink>
        Project scope
      </InputLabel>
      <Select
        aria-label="Project scope"
        displayEmpty
        label="Project scope"
        labelId="project-scope-label"
        onChange={handleChange}
        renderValue={(selected) =>
          selected ? projects.find((project) => project.id === selected)?.name : "All projects"
        }
        value={value ?? ""}
      >
        <MenuItem value="">All projects</MenuItem>
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
