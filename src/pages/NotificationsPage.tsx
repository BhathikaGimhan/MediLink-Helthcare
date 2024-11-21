import { useNotificationStore } from "../stores/notificationStore";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react"; // Add icons for better UI

const NotificationsPage = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4 text-white">Notifications</h1>
      <button
        onClick={markAllAsRead}
        className="mb-6 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
      >
        Mark All as Read
      </button>
      <div className="space-y-6">
        {notifications.length === 0 ? (
          <p className="text-gray-400">No notifications to show.</p>
        ) : (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 150 }}
              className={`p-6 border rounded-lg shadow-lg transition-all duration-300 ${
                notification.read ? "bg-gray-800" : "bg-gray-900"
              } ${!notification.read ? "border-l-4 border-cyan-400" : ""}`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {notification.timestamp}
                  </p>
                  <p className="text-lg font-medium text-white">
                    {notification.message}
                  </p>
                </div>
                {notification.read ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {!notification.read && (
                <div className="mt-4">
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="px-6 py-2 text-sm bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-colors"
                  >
                    Mark as Read
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
