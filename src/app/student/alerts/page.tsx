"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatDateTime } from "@/lib/utils";

export default function StudentAlertsPage() {
  const { currentUser } = useAuth();
  const { alerts, markAlertRead } = useApp();
  const { notify } = useToast();
  const studentAlerts = alerts.filter((alert) => alert.studentId === currentUser?.studentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Alerts</h1>
        <p className="mt-1 text-sm text-slate-500">Security and system notifications for your student account.</p>
      </div>
      {studentAlerts.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {studentAlerts.map((alert) => (
            <Card key={alert.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{alert.title}</h2>
                    <Badge label={alert.type} tone={alert.type} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
                  <p className="mt-3 text-xs text-slate-500">{formatDateTime(alert.createdAt)}</p>
                </div>
                {!alert.isRead ? (
                  <Button className="bg-brand-100 text-brand-800 hover:bg-brand-200" onClick={() => {
                    if (!currentUser) return;
                    markAlertRead(alert.id, currentUser.id);
                    notify({ title: "Alert marked as read.", variant: "success" });
                  }}>Mark Read</Button>
                ) : <Badge label="Read" tone="SUCCESS" />}
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="No alerts available" description="System and account notifications will appear here." />}
    </div>
  );
}

