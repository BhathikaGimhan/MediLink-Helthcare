import { create } from "zustand";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  bookingId?: string;
}

interface NotificationStore {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  markAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
  addNotification: (notification: Notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),
  fetchNotifications: async (userId: string) => {
    try {
      // console.log("Fetching notifications for userId:", userId); // Debug log
      const q = query(collection(db, "bookings"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      // console.log("Query snapshot size:", querySnapshot.size); // Debug log
      const notifications: Notification[] = [];

      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        // console.log("Booking data:", booking); // Debug log
        notifications.push({
          id: doc.id,
          message: `Appointment booked with Dr. ${booking.doctorName} on ${new Date(booking.dateTime).toLocaleString()} at Medical Center ID: ${booking.medicalCenterId}. Booking Number: ${booking.bookingNumber}`,
          timestamp: new Date(booking.createdAt).toLocaleString(),
          read: booking.read || false, // Use read status from Firebase if available
          bookingId: doc.id,
        });
      });

      // console.log("Notifications:", notifications); // Debug log
      set({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },
}));