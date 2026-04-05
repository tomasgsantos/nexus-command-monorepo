import { AnimatePresence, motion } from 'framer-motion';
import type { Toast } from '../hooks/use-event-toast';
import './EventToast.css';

interface EventToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function EventToast({ toasts, onDismiss }: EventToastProps) {
  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => onDismiss(toast.id)}
          >
            <span className="toast__dot" />
            <span className="toast__message">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
