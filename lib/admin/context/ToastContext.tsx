"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer, ToastType } from "@/components/admin/ui/Toast";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message, description }]);
    },
    [],
  );

  const success = useCallback(
    (message: string, description?: string) => {
      showToast("success", message, description);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, description?: string) => {
      showToast("error", message, description);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, description?: string) => {
      showToast("info", message, description);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, description?: string) => {
      showToast("warning", message, description);
    },
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
