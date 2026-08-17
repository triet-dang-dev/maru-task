"use client";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Bell } from "lucide-react";
import { useId, useState } from "react";

export interface NotificationItem {
  actor: string;
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const panelId = useId();
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const visibleNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.read,
  );
  const isOpen = Boolean(anchorElement);
  const badgeContent = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <>
      <IconButton
        aria-controls={isOpen ? panelId : undefined}
        aria-expanded={isOpen || undefined}
        aria-haspopup="dialog"
        aria-label={`Notifications (${unreadCount} unread)`}
        color="inherit"
        onClick={(event) => setAnchorElement(event.currentTarget)}
        size="small"
      >
        <Badge badgeContent={badgeContent} color="error" invisible={unreadCount === 0} max={99}>
          <Bell aria-hidden="true" size={19} strokeWidth={1.8} />
        </Badge>
      </IconButton>
      <Popover
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        id={panelId}
        onClose={() => setAnchorElement(null)}
        open={isOpen}
        slotProps={{ paper: { sx: { borderRadius: 1, overflow: "hidden", width: 360 } } }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <Box aria-label="Notifications" role="dialog">
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", p: 3 }}
          >
            <Typography component="h2" variant="h3">
              Notifications
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {unreadCount} unread
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ px: 3, pb: 2 }}>
            <Button
              aria-pressed={filter === "unread"}
              onClick={() => setFilter("unread")}
              size="small"
              variant={filter === "unread" ? "contained" : "text"}
            >
              Unread
            </Button>
            <Button
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              size="small"
              variant={filter === "all" ? "contained" : "text"}
            >
              All
            </Button>
          </Stack>
          <Divider />
          {visibleNotifications.length > 0 ? (
            <Stack divider={<Divider flexItem />} role="list">
              {visibleNotifications.map((notification) => (
                <Box
                  key={notification.id}
                  role="listitem"
                  sx={{
                    bgcolor: notification.read ? "background.paper" : "action.hover",
                    px: 3,
                    py: 2.5,
                  }}
                >
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {notification.actor}
                    </Box>{" "}
                    {notification.message}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                    variant="caption"
                  >
                    {notification.timestamp}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box role="status" sx={{ px: 3, py: 6, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 600 }}>You&apos;re all caught up</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                No notifications match this filter.
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
