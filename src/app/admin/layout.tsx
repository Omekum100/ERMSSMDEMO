import { AppShell } from "@/components/layout/app-shell";
import { RouteGuard } from "@/components/shared/route-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard role="ADMIN">
      <AppShell role="ADMIN">{children}</AppShell>
    </RouteGuard>
  );
}

