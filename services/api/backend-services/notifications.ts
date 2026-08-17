import { createBackendApiOperation } from "./client";

export const notificationsApiService = {
  list: createBackendApiOperation("GET", "/api/v1/notifications"),
  markAllRead: createBackendApiOperation("PATCH", "/api/v1/notifications/read-all"),
  markRead: createBackendApiOperation("PATCH", "/api/v1/notifications/{notificationId}/read"),
};
