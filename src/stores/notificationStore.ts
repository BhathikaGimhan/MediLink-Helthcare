// stores/notificationStore.ts

import create from "zustand";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: "1",
      message:
        "Your appointment with Dr. Smith is confirmed for tomorrow at 3:00 PM.",
      timestamp: "2024-11-20 10:00 AM",
      read: false,
    },
    {
      id: "2",
      message:
        "New message from your health coach: 'Reminder to complete your daily exercise.'",
      timestamp: "2024-11-19 09:30 AM",
      read: true,
    },
    {
      id: "3",
      message:
        "Your recent health check results are now available in your profile.",
      timestamp: "2024-11-18 08:00 PM",
      read: false,
    },
  ],
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
}));
