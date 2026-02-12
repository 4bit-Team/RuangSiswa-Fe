import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketNotification {
  id: string | number;
  title: string;
  description: string;
  time: string;
  icon: string;
  read: boolean;
  type?: string;
  metadata?: Record<string, any>;
}

interface UseNotificationSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onNewNotification: (callback: (notification: SocketNotification) => void) => void;
  onNotificationRead: (callback: (notificationId: string | number) => void) => void;
  disconnect: () => void;
}

export const useNotificationSocket = (
  userId?: string | null,
  wsUrl?: string
): UseNotificationSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsConnected(false);
      return;
    }

    const url = wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

    try {
      socketRef.current = io(url, {
        auth: {
          userId,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('✓ WebSocket connected for notifications (userId:', userId, ')');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('✗ WebSocket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setIsConnected(false);
    }
  }, [userId, wsUrl]);

  const onNewNotification = (callback: (notification: SocketNotification) => void) => {
    if (socketRef.current) {
      socketRef.current.off('new_notification');
      socketRef.current.on('new_notification', (notification) => {
        const mappedNotification: SocketNotification = {
          id: notification.id,
          title: notification.title || 'Notifikasi',
          description: notification.message || notification.description || '',
          time: 'Baru saja',
          icon: getIconByType(notification.type),
          read: false,
          type: notification.type,
          metadata: notification.metadata,
        };
        console.log('📩 New notification received:', mappedNotification);
        callback(mappedNotification);
      });
    }
  };

  const onNotificationRead = (callback: (notificationId: string | number) => void) => {
    if (socketRef.current) {
      socketRef.current.off('notification_read');
      socketRef.current.on('notification_read', (data) => {
        callback(data.notificationId);
      });
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    onNewNotification,
    onNotificationRead,
    disconnect,
  };
};

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
    default:
      return '🔔';
  }
}
