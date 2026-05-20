"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({
  id,
  type,
  message,
  description,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  };

  const styles = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  const textStyles = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
    warning: "text-yellow-900",
  };

  return (
    <div
      className={`${styles[type]} border rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 animate-slide-in-right max-w-md`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${textStyles[type]}`}>{message}</p>
        {description && (
          <p className={`text-sm mt-1 ${textStyles[type]} opacity-90`}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 ${textStyles[type]} opacity-70 hover:opacity-100 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    description?: string;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
