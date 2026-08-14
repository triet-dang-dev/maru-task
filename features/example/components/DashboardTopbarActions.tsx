"use client";

import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Bell } from "lucide-react";

export function DashboardTopbarActions() {
  return (
    <>
      <Tooltip title="Notifications">
        <IconButton aria-label="Notifications">
          <Badge color="primary" variant="dot">
            <Bell aria-hidden="true" size={19} strokeWidth={1.8} />
          </Badge>
        </IconButton>
      </Tooltip>
      <Avatar
        alt="Minh Tran"
        sx={{ bgcolor: "secondary.main", fontSize: 13, fontWeight: 750, height: 34, width: 34 }}
      >
        MT
      </Avatar>
    </>
  );
}
