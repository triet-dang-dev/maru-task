"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Search, X } from "lucide-react";
import { useState } from "react";

const recentWorkPackages = [
  "WP-142 Review the release checklist",
  "WP-138 Confirm stakeholder access",
];

export function GlobalSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const isExpanded = isFocused || query.length > 0;

  const closeSearch = () => {
    setIsFocused(false);
    setQuery("");
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
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeSearch();
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
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              Results will appear here.
            </Typography>
          ) : (
            <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, mt: 1, p: 0 }}>
              {recentWorkPackages.map((item) => (
                <Typography component="li" key={item} variant="body2">
                  {item}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>
      ) : null}
    </Box>
  );
}
