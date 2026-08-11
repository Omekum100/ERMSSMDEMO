"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StudentPicker } from "@/components/shared/student-picker";
import { DirectoryPagination } from "@/components/shared/directory-pagination";
import { Select } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default function AdminCallsPage() {
  const { calls, students, contacts } = useApp();
  const [studentFilter, setStudentFilter] = useState("ALL");
  const [contactFilter, setContactFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const contactOptions = useMemo(() => {
    if (studentFilter === "ALL") return contacts;
    return contacts.filter((contact) => contact.studentId === studentFilter);
  }, [contacts, studentFilter]);

  const filtered = calls.filter((call) => {
    const matchesStudent = studentFilter === "ALL" || call.studentId === studentFilter;
    const matchesContact = contactFilter === "ALL" || call.contactId === contactFilter;
    const matchesStatus = statusFilter === "ALL" || call.status === statusFilter;
    const matchesDate = !dateFilter || call.startedAt.slice(0, 10) === dateFilter;
    return matchesStudent && matchesContact && matchesStatus && matchesDate;
  });
  const pageSize = 25;
  const visibleCalls = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Call History</h1>
        <p className="mt-1 text-sm text-slate-500">All call records are simulated and stored in localStorage.</p>
      </div>
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StudentPicker students={students} value={studentFilter} onChange={(value) => { setStudentFilter(value); setContactFilter("ALL"); setPage(1); }} allowAll label="Filter by student" />
          <Select value={contactFilter} onChange={(event) => { setContactFilter(event.target.value); setPage(1); }}><option value="ALL">All Contacts</option>{contactOptions.map((contact) => <option key={contact.id} value={contact.id}>{contact.relationship} - {contact.name}</option>)}</Select>
          <Select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="ALL">All Status</option>{["INITIATED","RINGING","CONNECTED","COMPLETED","CANCELLED","FAILED"].map((item) => <option key={item} value={item}>{item}</option>)}</Select>
          <Input type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setPage(1); }} />
        </div>
        {filtered.length ? (<>
          <div className="table-scroll">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>{["Student","Contact","Started","Ended","Duration","Status","Mode"].map((item) => <th key={item} className="px-4 py-3 font-medium">{item}</th>)}</tr></thead>
              <tbody>
                {visibleCalls.map((call) => {
                  const student = students.find((item) => item.id === call.studentId);
                  const contact = contacts.find((item) => item.id === call.contactId);
                  return (
                    <tr key={call.id} className="border-t border-slate-100">
                      <td className="px-4 py-4">{student?.fullName}</td>
                      <td className="px-4 py-4">{contact?.relationship} â€¢ {contact?.name}</td>
                      <td className="px-4 py-4">{formatDateTime(call.startedAt)}</td>
                      <td className="px-4 py-4">{formatDateTime(call.endedAt)}</td>
                      <td className="px-4 py-4">{formatDuration(call.durationSeconds)}</td>
                      <td className="px-4 py-4"><Badge label={call.status} tone={call.status} /></td>
                      <td className="px-4 py-4"><Badge label={call.mode} tone="SIMULATED" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DirectoryPagination page={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
        </>) : <EmptyState title="No call history available" description="Simulated calls will appear once students start calls." />}
      </Card>
    </div>
  );
}
