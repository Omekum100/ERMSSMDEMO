"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DirectoryPagination } from "@/components/shared/directory-pagination";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDateTime } from "@/lib/utils";

export default function AdminActivityPage() {
  const { auditLogs } = useApp();
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const visibleLogs = auditLogs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Activity Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Frontend audit log for demo actions, student activity, and simulated calling.</p>
      </div>
      {auditLogs.length ? (
        <div className="space-y-4">
          {visibleLogs.map((entry) => (
            <Card key={entry.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{entry.description}</p>
                    <Badge label={entry.action} tone={entry.action.includes("CALL") ? "COMPLETED" : entry.action.includes("LOGIN") ? "INFO" : "SIMULATED"} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{formatDateTime(entry.timestamp)}</p>
                </div>
                <p className="text-xs text-slate-500">Actor: {entry.actorUserId}</p>
              </div>
            </Card>
          ))}
          <DirectoryPagination page={page} totalItems={auditLogs.length} pageSize={pageSize} onPageChange={setPage} />
        </div>
      ) : <EmptyState title="No activity logs" description="Audit entries will appear as users interact with the POC." />}
    </div>
  );
}

