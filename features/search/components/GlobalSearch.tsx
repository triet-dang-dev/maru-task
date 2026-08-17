"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Search, X } from "lucide-react";
import { useState } from "react";

export interface GlobalSearchResult {
  id: string;
  project: string;
  status: string;
  subject: string;
  type: string;
}

interface GlobalSearchProps {
  error?: string;
  isLoading?: boolean;
  onResultSelect?: (resultId: string) => void;
  results?: GlobalSearchResult[];
}

const defaultResults: GlobalSearchResult[] = [
  {
    id: "WP-142",
    project: "Migration",
    status: "In progress",
    subject: "Review the release checklist",
    type: "Task",
  },
  {
    id: "WP-138",
    project: "Migration",
    status: "Open",
    subject: "Confirm stakeholder access",
    type: "Task",
  },
];

export function GlobalSearch({
  error,
  isLoading = false,
  onResultSelect,
  results = defaultResults,
}: GlobalSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const isExpanded = isFocused || query.length > 0;
  const matchingResults = results.filter((result) =>
    `${result.id} ${result.project} ${result.status} ${result.subject} ${result.type}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  const closeSearch = () => {
    setIsFocused(false);
    setQuery("");
    setSelectedResultIndex(0);
  };

  return (
    <Box component="form" role="search" sx={{ position: "relative", width: { sm: 240, xs: 40 } }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          border: 1,
          borderColor: "primary.light",
          borderRadius: 1,
          px: 1,
        }}
      >
        <Search aria-hidden="true" size={18} strokeWidth={1.8} />
        <InputBase
          aria-label="Search work packages"
          onBlur={() => setIsFocused(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedResultIndex(0);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeSearch();
            }
            if (event.key === "ArrowDown" && matchingResults.length > 0) {
              event.preventDefault();
              setSelectedResultIndex((index) => Math.min(index + 1, matchingResults.length - 1));
            }
            if (event.key === "ArrowUp" && matchingResults.length > 0) {
              event.preventDefault();
              setSelectedResultIndex((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && query.trim() && matchingResults[selectedResultIndex]) {
              event.preventDefault();
              onResultSelect?.(matchingResults[selectedResultIndex].id);
            }
          }}
          placeholder="Search"
          sx={{ color: "inherit", flex: 1, fontSize: "0.875rem", minWidth: 0, px: 1 }}
          type="search"
          value={query}
        />
        {query ? (
          <IconButton aria-label="Clear search" color="inherit" onClick={closeSearch} size="small">
            <X aria-hidden="true" size={16} strokeWidth={1.8} />
          </IconButton>
        ) : null}
      </Stack>
      {isExpanded ? (
        <Paper
          elevation={4}
          sx={{ borderRadius: 1, left: 0, mt: 1, p: 2, position: "absolute", right: 0, zIndex: 2 }}
        >
          <Typography color="text.secondary" sx={{ fontWeight: 700 }} variant="caption">
            {query ? "Search is ready" : "Recent work packages"}
          </Typography>
          {query ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="search-scope-label">Search scope</InputLabel>
                <Select
                  label="Search scope"
                  labelId="search-scope-label"
                  onChange={(event) => setScope(event.target.value)}
                  value={scope}
                >
                  <MenuItem value="all">All projects</MenuItem>
                  <MenuItem value="current">Current project</MenuItem>
                </Select>
              </FormControl>
              {isLoading ? (
                <Stack aria-label="Loading search results" role="status" spacing={1}>
                  {[1, 2].map((item) => (
                    <Skeleton height={48} key={item} variant="rounded" />
                  ))}
                </Stack>
              ) : error ? (
                <Typography color="error" role="alert" variant="body2">
                  {error}
                </Typography>
              ) : matchingResults.length > 0 ? (
                <Stack aria-label="Search results" component="ul" role="listbox" spacing={0.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {matchingResults.map((result, index) => (
                    <Box
                      aria-selected={index === selectedResultIndex}
                      component="li"
                      key={result.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onResultSelect?.(result.id)}
                      role="option"
                      sx={{
                        bgcolor: index === selectedResultIndex ? "action.selected" : "transparent",
                        borderRadius: 1,
                        cursor: "pointer",
                        p: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                        <Typography color="primary.main" sx={{ fontWeight: 700 }} variant="caption">
                          {result.id}
                        </Typography>
                        <Chip label={result.status} size="small" variant="outlined" />
                        <Typography color="text.secondary" variant="caption">
                          {result.project}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 600, mt: 0.5 }} variant="body2">
                        {result.subject}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        {result.type}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" role="status" variant="body2">
                  No work packages found
                </Typography>
              )}
            </Stack>
          ) : (
            <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, mt: 1, p: 0 }}>
              {defaultResults.map((result) => (
                <Typography component="li" key={result.id} variant="body2">
                  {result.id} {result.subject}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>
      ) : null}
    </Box>
  );
}
