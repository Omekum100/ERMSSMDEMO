"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn, createId } from "@/lib/utils";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info";
};

type ToastContextValue = {
  notify: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((item: Omit<ToastItem, "id">) => {
    const toast = { ...item, id: createId("toast") };
    setToasts((current) => [toast, ...current].slice(0, 4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((entry) => entry.id !== toast.id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-panel",
              toast.variant === "success" && "border-emerald-200",
              toast.variant === "error" && "border-rose-200",
              toast.variant === "info" && "border-brand-100",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-slate-600">{toast.description}</p> : null}
              </div>
              <button onClick={() => setToasts((current) => current.filter((entry) => entry.id !== toast.id))}>
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

