"use client";

import { X } from "lucide-react";

export function Modal({ open, title, children, onClose, width = "max-w-lg" }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void; width?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className={`w-full ${width} rounded-2xl bg-white p-6 shadow-panel`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

