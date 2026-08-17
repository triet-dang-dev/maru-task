"use client";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Bell, Check } from "lucide-react";
import { useId, useState } from "react";

import { notificationsApiService } from "@/services/api/backend-services/notifications";

export interface NotificationItem {
  actor: string;
  id: string;
  message: string;
  project?: string;
  read: boolean;
  reason?: "Assigned" | "Date alert" | "Mentioned" | "Reminder" | "Status changed" | "Watched";
  status?: string;
  timestamp: string;
  workItemId?: string;
}

interface NotificationCenterProps {
  isLoading?: boolean;
  notifications: NotificationItem[];
}

export function NotificationCenter({ isLoading = false, notifications }: NotificationCenterProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => new Set());
  const [visibleCount, setVisibleCount] = useState(3);
  const panelId = useId();
  const displayedNotifications = notifications.map((notification) => ({
    ...notification,
    read: notification.read || readNotificationIds.has(notification.id),
  }));
  const unreadCount = displayedNotifications.filter((notification) => !notification.read).length;
  const filteredNotifications = displayedNotifications.filter(
    (notification) => filter === "all" || !notification.read,
  );
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);
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
          {isLoading ? (
            <Stack aria-label="Loading notifications" role="status" spacing={2} sx={{ p: 3 }}>
              {[1, 2, 3].map((item) => (
                <Skeleton height={54} key={item} variant="rounded" />
              ))}
            </Stack>
          ) : visibleNotifications.length > 0 ? (
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
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      {notification.workItemId || notification.project || notification.reason ? (
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ alignItems: "center", flexWrap: "wrap" }}
                        >
                          {notification.status ? (
                            <Chip label={notification.status} size="small" variant="outlined" />
                          ) : null}
                          {notification.workItemId ? (
                            <Typography
                              color="primary.main"
                              sx={{ fontWeight: 700 }}
                              variant="caption"
                            >
                              {notification.workItemId}
                            </Typography>
                          ) : null}
                          {notification.project ? (
                            <Typography color="text.secondary" variant="caption">
                              {notification.project}
                            </Typography>
                          ) : null}
                          {notification.reason ? (
                            <Chip label={notification.reason} size="small" />
                          ) : null}
                        </Stack>
                      ) : null}
                      <Typography
                        sx={{
                          mt:
                            notification.workItemId || notification.project || notification.reason
                              ? 1
                              : 0,
                        }}
                        variant="body2"
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          {notification.actor}
                        </Box>{" "}
                        {notification.message}
                      </Typography>
                    </Box>
                    {!notification.read ? (
                      <IconButton
                        aria-label="Mark notification as read"
                        onClick={() => {
                          setReadNotificationIds((ids) => new Set(ids).add(notification.id));
                          notificationsApiService
                            .markRead({ pathParams: { notificationId: notification.id } })
                            .catch(() => {});
                        }}
                        size="small"
                      >
                        <Check aria-hidden="true" size={16} />
                      </IconButton>
                    ) : null}
                  </Stack>
                  <Typography
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                    variant="caption"
                  >
                    {notification.timestamp}
                  </Typography>
                </Box>
              ))}
              {visibleNotifications.length < filteredNotifications.length ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Button
                    aria-label="Load more notifications"
                    onClick={() => setVisibleCount((count) => count + 3)}
                    size="small"
                  >
                    Load more
                  </Button>
                </Box>
              ) : null}
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
