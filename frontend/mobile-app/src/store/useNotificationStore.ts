import { create } from 'zustand';

import { DashboardAlert } from '../features/dashboard/types';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  source: 'system' | 'invoice' | 'financing' | 'orders';
};

type NotificationState = {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  seedFromDashboardAlerts: (alerts: DashboardAlert[]) => void;
};

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Invoice overdue alert',
    message: 'One or more invoices are overdue. Review and send reminders.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    source: 'invoice',
  },
  {
    id: 'notif-2',
    title: 'Financing status updated',
    message: 'A financing request moved to Approved status.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    source: 'financing',
  },
  {
    id: 'notif-3',
    title: 'Settlement posted',
    message: 'A recent payment has been posted to your balance.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    read: true,
    source: 'system',
  },
];

function countUnread(notifications: AppNotification[]) {
  return notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0);
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,
  unreadCount: countUnread(initialNotifications),
  markAsRead: (id) => {
    const next = get().notifications.map((item) => (item.id === id ? { ...item, read: true } : item));
    set({ notifications: next, unreadCount: countUnread(next) });
  },
  markAllAsRead: () => {
    const next = get().notifications.map((item) => ({ ...item, read: true }));
    set({ notifications: next, unreadCount: 0 });
  },
  seedFromDashboardAlerts: (alerts) => {
    if (alerts.length === 0) {
      return;
    }

    const existing = get().notifications;
    const existingTitles = new Set(existing.map((item) => item.title));
    const toAdd: AppNotification[] = alerts
      .filter((alert) => !existingTitles.has(alert.title))
      .map((alert) => ({
        id: `alert-${alert.id}`,
        title: alert.title,
        message: alert.description,
        createdAt: new Date().toISOString(),
        read: false,
        source: alert.tone === 'urgent' ? 'invoice' : 'system',
      }));

    if (toAdd.length === 0) {
      return;
    }

    const next = [...toAdd, ...existing];
    set({ notifications: next, unreadCount: countUnread(next) });
  },
}));