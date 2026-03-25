import React, { createContext, useContext, useState } from "react";
import type { Notification } from "../data/types/notification";
import {
  notificationsList as fetchNotifications,
  invalidateNotificationsCache,
} from "../data/api/client";

type NotificationsContextType = {
  notifications: Notification[];
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined,
);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  async function openNotifications() {
    invalidateNotificationsCache();
    try {
      const items = await fetchNotifications();
      setNotifications(items);
    } catch {
      setNotifications([]);
    }
    setIsOpen(true);
  }

  function closeNotifications() {
    setIsOpen(false);
  }

  return (
    <NotificationsContext.Provider
      value={{ notifications, isOpen, openNotifications, closeNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
