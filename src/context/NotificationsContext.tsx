import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import type { Notification } from "../data/types/notification";
import {
  notificationsCount as fetchCount,
  notificationsList as fetchNotifications,
  invalidateNotificationsCache,
} from "../data/api/client";
import { useIdentity } from "./IdentityContext";

type NotificationsContextType = {
  count: number;
  notifications: Notification[];
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined,
);

const POLL_INTERVAL = 30_000;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useIdentity();
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollCount = useCallback(async () => {
    if (!user) return;
    try {
      invalidateNotificationsCache();
      const c = await fetchCount();
      setCount(c);
    } catch {
      // silently ignore polling errors
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCount(0);
      setNotifications([]);
      return;
    }

    pollCount();
    intervalRef.current = setInterval(pollCount, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, pollCount]);

  async function openNotifications() {
    invalidateNotificationsCache();
    try {
      const items = await fetchNotifications();
      setNotifications(items);
    } catch {
      setNotifications([]);
    }
    setCount(0);
    setIsOpen(true);
  }

  function closeNotifications() {
    setIsOpen(false);
  }

  return (
    <NotificationsContext.Provider
      value={{ count, notifications, isOpen, openNotifications, closeNotifications }}
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
