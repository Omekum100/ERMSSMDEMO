import { cn } from "@/lib/utils";

const styles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-200 text-slate-700",
  INFO: "bg-blue-100 text-blue-700",
  WARNING: "bg-amber-100 text-amber-700",
  SUCCESS: "bg-emerald-100 text-emerald-700",
  SECURITY: "bg-rose-100 text-rose-700",
  INITIATED: "bg-slate-200 text-slate-700",
  RINGING: "bg-amber-100 text-amber-700",
  CONNECTED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  FAILED: "bg-rose-100 text-rose-700",
  SIMULATED: "bg-brand-100 text-brand-700",
} as const;

export function Badge({ label, tone }: { label: string; tone: keyof typeof styles }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[tone])}>{label}</span>;
}

