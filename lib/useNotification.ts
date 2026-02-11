import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from './api';

export interface Notification {
  id: string | number;
  title: string;
  description: string;
  time: string;
  icon: string;
  read: boolean;
  type?: string;
  metadata?: Record<string, any>;
}

interface UseNotificationReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  getNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string | number) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string | number) => Promise<void>;
  clearError: () => void;
}

export const useNotification = (): UseNotificationReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notifications for a user
  const getNotifications = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/v1/notifications?userId=${userId}`, 'GET');
      
      if (Array.isArray(response)) {
        // Map API response to notification format
        const mappedNotifications = response.map((notif: any) => ({
          id: notif.id,
          title: notif.title || 'Notifikasi',
          description: notif.description || '',
          time: formatTime(notif.createdAt),
          icon: getIconByType(notif.type),
          read: notif.status === 'read',
          type: notif.type,
          metadata: notif.metadata,
        }));
        setNotifications(mappedNotifications);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string | number) => {
    try {
      await apiRequest(`/v1/notifications/${notificationId}/read`, 'PATCH');
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menandai notifikasi sebagai dibaca');
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (userId: string) => {
    try {
      await apiRequest(`/v1/notifications/${userId}/read-all`, 'PATCH');
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menandai semua notifikasi sebagai dibaca');
      console.error('Error marking all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string | number) => {
    try {
      await apiRequest(`/v1/notifications/${notificationId}`, 'DELETE');
      
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus notifikasi');
      console.error('Error deleting notification:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  };
};

/**
 * Helper function to format time difference
 */
function formatTime(createdAt: string): string {
  if (!createdAt) return 'Baru saja';

  const now = new Date();
  const notifTime = new Date(createdAt);
  const diffMs = now.getTime() - notifTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return notifTime.toLocaleDateString('id-ID');
}

/**
 * Get emoji icon based on notification type
 */
function getIconByType(type?: string): string {
  switch (type) {
    case 'reservasi_approved':
      return '✓';
    case 'reservasi_rejected':
      return '✗';
    case 'session_recorded':
      return '📋';
    case 'escalation_to_waka':
      return '⚠️';
    case 'decision_made':
      return '✓';
    case 'appeal_status_changed':
      return '📢';
    case 'system_notification':
      return '⚙️';
    default:
      return '🔔';
  }
}
