"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function AdminSettingsPage() {
  const { resetDemoData } = useApp();
  const { currentUser, logout } = useAuth();
  const { notify } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Demo tools, reset options, and environment limitations.</p>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Reset Demo Data</h2>
        <p className="mt-2 text-sm text-slate-500">Reset all application data to the original demo state. This includes students, contacts, calls, alerts, audit logs, and users.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => {
            if (!currentUser) {
              notify({ title: "Session unavailable.", description: "Please login again to reset demo data.", variant: "error" });
              return;
            }
            const confirmed = window.confirm("Reset all application data to the original demo state?");
            if (!confirmed) {
              notify({ title: "Reset cancelled.", variant: "info" });
              return;
            }
            resetDemoData(currentUser.id);
            notify({ title: "Demo data reset completed.", description: "You have been logged out for a clean restart.", variant: "success" });
            logout();
          }}>Reset Demo Data</Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">POC Limitations</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Authentication is mock-only and stored in browser localStorage.</li>
          <li>No backend APIs, database, or server-side authorization are implemented.</li>
          <li>All calls are simulated. No real phone integration exists.</li>
        </ul>
      </Card>
    </div>
  );
}
