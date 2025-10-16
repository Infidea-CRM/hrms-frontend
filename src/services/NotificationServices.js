import requests from "@/services/httpService";

const NotificationServices = {
  /**
   * Get all notifications for the current employee
   * @returns {Promise} - Promise with notifications data
   */
  getMyNotifications: async () => {
    return requests.get("/notifications");
  },

  /**
   * Get unread notification count for the current employee
   * @returns {Promise} - Promise with unread count
   */
  getUnreadCount: async () => {
    return requests.get("/notifications/unread-count");
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise} - Promise with updated notification
   */
  markAsRead: async (notificationId) => {
    return requests.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read for the current employee
   * @returns {Promise} - Promise with success message
   */
  markAllAsRead: async () => {
    return requests.patch("/notifications/mark-all-read");
  },

  /**
   * Delete a notification
   * @param {string} notificationId - ID of the notification to delete
   * @returns {Promise} - Promise with success message
   */
  deleteNotification: async (notificationId) => {
    return requests.delete(`/notifications/${notificationId}`);
  },

  addNotification: async (body) => {
    return requests.post("/notification/add", body);
  },

  getAllNotification: async (page) => {
    return requests.get(`/notification?page=${page}`);
  },

  updateStatusNotification: async (id, body) => {
    return requests.put(`/notification/${id}`, body);
  },

  updateManyStatusNotification: async (body) => {
    return requests.patch("/notification/update/many", body);
  },

  deleteNotificationByProductId: async (id) => {
    return requests.delete(`/notification/product-id/${id}`);
  },

  deleteManyNotification: async (body) => {
    return requests.patch(`/notification/delete/many`, body);
  },
};

export default NotificationServices;
