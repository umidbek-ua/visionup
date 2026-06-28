import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastContainer } from "../components/ToastContainer";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
};

type ToastOptions = {
  title?: string;
  duration?: number;
};

type ToastContextValue = {
  notify: (type: ToastType, message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4200;

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current[id];

    if (timer) {
      window.clearTimeout(timer);
      delete timersRef.current[id];
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastType, message: string, options: ToastOptions = {}) => {
      const id = createToastId();
      const duration = options.duration ?? DEFAULT_DURATION;

      setToasts((current) => [
        {
          id,
          type,
          title: options.title,
          message,
          duration,
        },
        ...current,
      ].slice(0, 4));

      if (duration > 0) {
        timersRef.current[id] = window.setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const clear = useCallback(() => {
    Object.values(timersRef.current).forEach((timer) => window.clearTimeout(timer));
    timersRef.current = {};
    setToasts([]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (message, options) => notify("success", message, options),
      error: (message, options) => notify("error", message, options),
      warning: (message, options) => notify("warning", message, options),
      info: (message, options) => notify("info", message, options),
      dismiss,
      clear,
    }),
    [clear, dismiss, notify]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
