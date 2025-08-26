import { useEffect, useState } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { useUserStore } from "../stores/userStore";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import BookingDetailsPopup from "../components/BookingDetailsPopup";
import Loader from "../components/Loader";

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();
  const { user } = useUserStore();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchNotifications(user.id);
      setLoading(false);
    } else {
      console.log("No user logged in");
    }
  }, [user, fetchNotifications]);
if(loading){
  return <Loader/>;
}
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
          <p className="text-gray-400">
            No notifications to show. {user ? "Check if you have bookings." : "Please log in."}
          </p>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.2 }}
              className={`p-6 border rounded-lg shadow-lg cursor-pointer ${
                notification.read ? "bg-gray-800" : "bg-gray-900"
              } ${!notification.read ? "border-l-4 border-cyan-400" : ""}`}
              onClick={() => notification.bookingId && setSelectedBookingId(notification.bookingId)}
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-400">{notification.timestamp}</p>
                  <p className="text-lg font-medium text-white">{notification.message}</p>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
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
      {selectedBookingId && (
        <BookingDetailsPopup
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
        />
      )}
    </div>
  );
};

export default NotificationsPage;