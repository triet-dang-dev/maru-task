"use client";

import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Bell, Copy, ExternalLink, MoreHorizontal, Share2, Timer, Trash2 } from "lucide-react";
import { useState, type MouseEvent } from "react";

export interface WorkItemContextMenuProps {
  onCopy?: () => void;
  onDelete?: () => void;
  onOpenDetails?: () => void;
  onReminder?: () => void;
  onShare?: () => void;
  onTimer?: () => void;
  workItemId: string;
}

export function WorkItemContextMenu({
  onCopy,
  onDelete,
  onOpenDetails,
  onReminder,
  onShare,
  onTimer,
  workItemId,
}: WorkItemContextMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e?: MouseEvent) => {
    e?.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (callback?: () => void) => (event: MouseEvent) => {
    event.stopPropagation();
    handleClose(event);
    callback?.();
  };

  return (
    <>
      <IconButton
        aria-label={`Actions for work package #${workItemId}`}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <MoreHorizontal aria-hidden="true" size={16} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        aria-label={`Context menu #${workItemId}`}
        className="op-context-menu"
        onClose={() => handleClose()}
        open={open}
        slotProps={{
          paper: {
            sx: {
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
              minWidth: 180,
            },
          },
        }}
      >
        {onOpenDetails ? (
          <MenuItem onClick={handleAction(onOpenDetails)}>
            <ListItemIcon>
              <ExternalLink size={15} />
            </ListItemIcon>
            <ListItemText primary="Open details" />
          </MenuItem>
        ) : null}

        {onTimer ? (
          <MenuItem onClick={handleAction(onTimer)}>
            <ListItemIcon>
              <Timer size={15} />
            </ListItemIcon>
            <ListItemText primary="Log time / Timer" />
          </MenuItem>
        ) : null}

        {onReminder ? (
          <MenuItem onClick={handleAction(onReminder)}>
            <ListItemIcon>
              <Bell size={15} />
            </ListItemIcon>
            <ListItemText primary="Set reminder" />
          </MenuItem>
        ) : null}

        {onShare ? (
          <MenuItem onClick={handleAction(onShare)}>
            <ListItemIcon>
              <Share2 size={15} />
            </ListItemIcon>
            <ListItemText primary="Share..." />
          </MenuItem>
        ) : null}

        {onCopy ? (
          <MenuItem onClick={handleAction(onCopy)}>
            <ListItemIcon>
              <Copy size={15} />
            </ListItemIcon>
            <ListItemText primary="Duplicate" />
          </MenuItem>
        ) : null}

        {onDelete ? (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleAction(onDelete)} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <Trash2 size={15} />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </>
        ) : null}
      </Menu>
    </>
  );
}
