import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Notification } from "../data/types/notification";
import {
  notificationsList as fetchNotificationsApi,
  invalidateCache,
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

  const openNotifications = useCallback(async () => {
    invalidateCache("/notifications");
    try {
      const items = await fetchNotificationsApi();
      setNotifications(items);
    } catch {
      setNotifications([]);
    }
    setIsOpen(true);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ notifications, isOpen, openNotifications, closeNotifications }),
    [notifications, isOpen, openNotifications, closeNotifications],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
