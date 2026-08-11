"use client";

import { cn } from "@/lib/utils";

export function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => onChange(tab)} className={cn("rounded-lg px-3 py-2 text-sm font-medium", value === tab ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}>
          {tab}
        </button>
      ))}
    </div>
  );
}

