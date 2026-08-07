import api from "./api";

export const fetchNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const createNotificationRequest = async (notification) => {
  const res = await api.post("/notifications", notification);
  return res.data;
};

export const markNotificationAsReadRequest = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsAsReadRequest = async () => {
  const res = await api.patch("/notifications/read-all");
  return res.data;
};

export const deleteNotificationRequest = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
};

export const clearAllNotificationsRequest = async () => {
  const res = await api.delete("/notifications");
  return res.data;
};