import type { ToastItem } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const toastIcon: Record<ToastItem["type"], string> = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
};

const toastTitle: Record<ToastItem["type"], string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type}`}>
          <div className="toast-icon" aria-hidden="true">
            {toastIcon[toast.type]}
          </div>

          <div className="toast-content">
            <strong>{toast.title ?? toastTitle[toast.type]}</strong>
            <p>{toast.message}</p>
          </div>

          <button
            type="button"
            className="toast-close"
            aria-label="Close notification"
            onClick={() => onDismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
