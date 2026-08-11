"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatDuration, formatTime } from "@/lib/utils";

export default function StudentHistoryPage() {
  const { currentUser } = useAuth();
  const { calls, contacts } = useApp();
  const records = calls.filter((call) => call.studentId === currentUser?.studentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Call History</h1>
        <p className="mt-1 text-sm text-slate-500">Your personal simulated call records.</p>
      </div>
      {records.length ? (
        <Card>
          <div className="table-scroll border-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>{["Contact","Relationship","Date","Time","Duration","Status"].map((item) => <th key={item} className="px-4 py-3 font-medium">{item}</th>)}</tr></thead>
              <tbody>
                {records.map((call) => {
                  const contact = contacts.find((entry) => entry.id === call.contactId);
                  return (
                    <tr key={call.id} className="border-t border-slate-100">
                      <td className="px-4 py-4 font-medium text-slate-900">{contact?.name}</td>
                      <td className="px-4 py-4">{contact?.relationship}</td>
                      <td className="px-4 py-4">{formatDate(call.startedAt)}</td>
                      <td className="px-4 py-4">{formatTime(call.startedAt)}</td>
                      <td className="px-4 py-4">{formatDuration(call.durationSeconds)}</td>
                      <td className="px-4 py-4"><Badge label={call.status} tone={call.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : <EmptyState title="No call history available" description="Your simulated calls will appear here after you make one." />}
    </div>
  );
}

