import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RealtimeNotification.css';

interface RealtimeNotificationProps {
  notification: { message: string; key: number } | null;
  onDismiss: () => void;
}

export function RealtimeNotification({ notification, onDismiss }: RealtimeNotificationProps) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.key}
          className="realtime-notification"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <span className="realtime-notification__dot" />
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
