import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Toast.css';

export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export type ToastPlacement = 'bottom-right' | 'top-center';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  autoDismissMs: number;
}

function Toast({ toast, onDismiss, autoDismissMs }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), autoDismissMs);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss, autoDismissMs]);

  return (
    <motion.div
      className={`nx-toast nx-toast--${toast.type}`}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => onDismiss(toast.id)}
    >
      <span className="nx-toast__dot" />
      <span className="nx-toast__message">{toast.message}</span>
    </motion.div>
  );
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  placement?: ToastPlacement;
  autoDismissMs?: number;
}

export function ToastStack({
  toasts,
  onDismiss,
  placement = 'bottom-right',
  autoDismissMs = 3000,
}: ToastStackProps) {
  return (
    <div className={`nx-toast-stack nx-toast-stack--${placement}`} aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} autoDismissMs={autoDismissMs} />
        ))}
      </AnimatePresence>
    </div>
  );
}
