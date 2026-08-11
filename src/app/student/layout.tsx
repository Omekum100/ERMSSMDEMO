import { AppShell } from "@/components/layout/app-shell";
import { RouteGuard } from "@/components/shared/route-guard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard role="STUDENT">
      <AppShell role="STUDENT">{children}</AppShell>
    </RouteGuard>
  );
}

