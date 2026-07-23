"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@toolshare/lib";
import { useMounted } from "./use-mounted";

/**
 * Toast
 * ----------------------------------------------------------------------
 * Imperative notification system. Wrap the app once with <ToastProvider>,
 * then call useToast().show(...) from anywhere (e.g. after a successful
 * borrow request) to surface a transient message.
 */
export type ToastVariant = "default" | "success" | "warning" | "danger";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-stone-900 text-stone-50",
  success: "bg-success-600 text-white",
  warning: "bg-warning-600 text-white",
  danger: "bg-danger-600 text-white",
};

let toastAutoId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const mounted = useMounted();

  const show = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = ++toastAutoId;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end"
            aria-live="polite"
            aria-atomic="true"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                role="status"
                className={cn(
                  "w-full max-w-sm rounded-md px-4 py-3 shadow-lg",
                  variantStyles[t.variant]
                )}
              >
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-current/85">
                    {t.description}
                  </p>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
