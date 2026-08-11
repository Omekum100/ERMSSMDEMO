import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("tribal-surface p-5", className)}>
      <div className="tribal-divider absolute inset-x-0 top-0 h-[3px] animate-pulse-line" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
