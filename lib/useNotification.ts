import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from './api';
import { useNotificationSocket } from './useNotificationSocket';
import { useAuth } from '../hooks/useAuth';

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
  isSocketConnected: boolean;
}

export const useNotification = (): UseNotificationReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isConnected: isSocketConnected, onNewNotification } = useNotificationSocket(
    user?.id?.toString() || null
  );

  // Setup WebSocket listener for real-time notifications
  useEffect(() => {
    onNewNotification((notification) => {
      // Add new notification to the list
      const newNotif: Notification = {
        id: notification.id,
        title: notification.title,
        description: notification.description,
        time: 'Baru saja',
        icon: notification.icon,
        read: false,
        type: notification.type,
        metadata: notification.metadata,
      };
      
      // Add to beginning of array so newest appears first
      setNotifications(prev => [newNotif, ...prev]);
      console.log('✅ Notification added to list via WebSocket:', newNotif.title);
    });
  }, [onNewNotification]);

  // Fetch all notifications for a user
  const getNotifications = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Call correct endpoint: /v1/notifications (uses JWT auth, no userId param needed)
      const response = await apiRequest('/v1/notifications?limit=50&offset=0', 'GET');
      
      // Response structure: { data: [...], total: number }
      if (response && response.data && Array.isArray(response.data)) {
        // Map API response to notification format
        const mappedNotifications = response.data.map((notif: any) => ({
          id: notif.id,
          title: notif.title || 'Notifikasi',
          description: notif.description || notif.message || '',
          time: formatTime(notif.created_at || notif.createdAt),
          icon: getIconByType(notif.type),
          read: notif.status === 'read',
          type: notif.type,
          metadata: notif.metadata,
        }));
        setNotifications(mappedNotifications);
        console.log(`✅ Loaded ${mappedNotifications.length} notifications from API`);
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi');
      console.error('❌ Error fetching notifications:', err);
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
      console.log(`✅ Notification ${notificationId} marked as read`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menandai notifikasi sebagai dibaca');
      console.error('❌ Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (userId: string) => {
    try {
      // Correct endpoint: /v1/notifications/read-all (no userId param needed)
      await apiRequest('/v1/notifications/read-all', 'PATCH');
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      console.log(`✅ All notifications marked as read`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menandai semua notifikasi sebagai dibaca');
      console.error('❌ Error marking all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string | number) => {
    try {
      await apiRequest(`/v1/notifications/${notificationId}`, 'DELETE');
      
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
      console.log(`✅ Notification ${notificationId} deleted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus notifikasi');
      console.error('❌ Error deleting notification:', err);
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
    isSocketConnected,
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
    case 'pelanggaran_baru':
      return '⚠️';
    case 'sp_dibuat':
      return '📄';
    case 'reservasi_pembinaan_dibuat':
      return '📝';
    case 'pembinaan_disetujui':
      return '✓';
    case 'parent_notification':
      return '👨‍👩‍👧';
    case 'general':
      return '📢';
    default:
      return '🔔';
  }
}
