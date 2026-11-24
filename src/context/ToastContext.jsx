import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

// Global event bus so non-React modules (like Axios interceptor) can trigger toasts
const toastListeners = new Set();

export const showGlobalToast = (type, message, duration = 4000) => {
  toastListeners.forEach((listener) => listener({ type, message, duration }));
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const newToast = { id, type, message, duration };

    setToasts((prev) => {
      // Prevent exact duplicate error messages within rapid succession
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      return [...prev, newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  // Subscribe to global non-react events
  useEffect(() => {
    const handler = ({ type, message, duration }) => {
      addToast(type, message, duration);
    };
    toastListeners.add(handler);
    return () => {
      toastListeners.delete(handler);
    };
  }, [addToast]);

  const success = useCallback((msg, duration) => addToast('success', msg, duration), [addToast]);
  const error = useCallback((msg, duration) => addToast('error', msg, duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast('warning', msg, duration), [addToast]);
  const info = useCallback((msg, duration) => addToast('info', msg, duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          const icon = isError ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-brand-primary shrink-0" />
          );

          const borderClass = isError
            ? 'border-red-500/30 dark:border-red-500/40'
            : isSuccess
            ? 'border-emerald-500/30 dark:border-emerald-500/40'
            : isWarning
            ? 'border-amber-500/30 dark:border-amber-500/40'
            : 'border-brand-primary/30 dark:border-brand-primary/40';

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md bg-bg-card/95 text-text-primary transition-all duration-200 animate-fade-in-up ${borderClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-xs leading-relaxed font-medium break-words">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-primary p-0.5 rounded-md hover:bg-bg-hover transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
