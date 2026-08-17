"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";

export interface UserProfileData {
  avatarUrl?: string;
  email?: string;
  id?: string;
  name: string;
  role?: string;
}

interface UserProfilePopoverProps {
  children?: ReactNode;
  projectId?: string;
  user: UserProfileData;
}

export function UserProfilePopover({
  children,
  projectId,
  user,
}: UserProfilePopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <>
      <Box
        className="op-principal--trigger inline-flex items-center cursor-pointer"
        component="span"
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen(e as unknown as MouseEvent<HTMLElement>);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children ?? (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Avatar
              alt={user.name}
              src={user.avatarUrl}
              sx={{
                bgcolor: "primary.main",
                fontSize: "0.75rem",
                fontWeight: 700,
                height: 24,
                width: 24,
              }}
            >
              {initials}
            </Avatar>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                "&:hover": { color: "primary.main", textDecoration: "underline" },
              }}
            >
              {user.name}
            </Typography>
          </Stack>
        )}
      </Box>

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        className="op-principal--popover"
        onClose={handleClose}
        open={open}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "6px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
              maxWidth: 300,
              minWidth: 260,
              p: 2.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar
              alt={user.name}
              src={user.avatarUrl}
              sx={{
                bgcolor: "primary.main",
                fontSize: "1rem",
                fontWeight: 700,
                height: 44,
                width: 44,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
                {user.name}
              </Typography>
              <Chip
                label={user.role || "Project Member"}
                size="small"
                sx={{
                  bgcolor: "grey.100",
                  color: "text.secondary",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  height: 20,
                  mt: 0.5,
                }}
              />
            </Box>
          </Stack>

          <Divider />

          {user.email ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "text.secondary" }}>
              <Mail aria-hidden="true" size={15} />
              <Typography sx={{ fontSize: "0.8125rem" }} variant="body2">
                {user.email}
              </Typography>
            </Stack>
          ) : null}

          {projectId ? (
            <Typography
              component={Link}
              href={`/projects/${projectId}/work-items?assignee=${encodeURIComponent(user.name)}`}
              onClick={handleClose}
              sx={{
                color: "primary.main",
                fontSize: "0.8125rem",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View work packages assigned to {user.name}
            </Typography>
          ) : null}
        </Stack>
      </Popover>
    </>
  );
}
