import React from "react";
import { useNotificationStore } from "../stores/notificationStore";

const NotificationsPage = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <button
        onClick={markAllAsRead}
        className="mb-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
      >
        Mark All as Read
      </button>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications to show.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded ${
                notification.read ? "bg-gray-200" : "bg-white"
              }`}
            >
              <p className="text-sm text-gray-600">{notification.timestamp}</p>
              <p className="text-lg">{notification.message}</p>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
