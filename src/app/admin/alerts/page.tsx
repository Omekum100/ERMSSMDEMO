"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { StudentPicker } from "@/components/shared/student-picker";
import { DirectoryPagination } from "@/components/shared/directory-pagination";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { Alert } from "@/types/alert";

export default function AdminAlertsPage() {
  const { alerts, students, upsertAlert, deleteAlert } = useApp();
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Alert | null>(null);
  const [audience, setAudience] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<Alert["type"]>("INFO");
  const [studentSearch, setStudentSearch] = useState("");
  const [page, setPage] = useState(1);

  const visibleAlerts = useMemo(() => {
    if (!studentSearch.trim()) return alerts;
    const query = studentSearch.toLowerCase();
    return alerts.filter((alert) => {
      const student = students.find((entry) => entry.id === alert.studentId);
      return [alert.title, alert.message, student?.fullName, student?.studentId].join(" ").toLowerCase().includes(query);
    });
  }, [alerts, studentSearch, students]);
  const pageSize = 24;
  const pagedAlerts = visibleAlerts.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setAudience("ALL");
    setSelectedStudent(students[0]?.id ?? "");
    setTitle("");
    setMessage("");
    setType("INFO");
    setOpen(true);
  };

  const openEdit = (alert: Alert) => {
    setEditing(alert);
    setAudience("SPECIFIC");
    setSelectedStudent(alert.studentId);
    setTitle(alert.title);
    setMessage(alert.message);
    setType(alert.type);
    setOpen(true);
  };

  const saveAlert = () => {
    if (!currentUser) {
      notify({ title: "Session unavailable.", description: "Please login again to manage alerts.", variant: "error" });
      return;
    }
    if (!title.trim() || !message.trim()) {
      notify({ title: "Missing alert details.", description: "Title and message are required.", variant: "error" });
      return;
    }
    const studentIds = audience === "ALL" && !editing ? students.map((student) => student.id) : [selectedStudent];
    if (!studentIds.length || studentIds.some((studentId) => !studentId)) {
      notify({ title: "No audience selected.", description: "Choose at least one student for this alert.", variant: "error" });
      return;
    }

    upsertAlert({ id: editing?.id, title: title.trim(), message: message.trim(), type, studentIds, actorUserId: currentUser.id });
    notify({
      title: editing ? "Alert updated successfully." : "Alert created successfully.",
      description: editing ? "The alert changes are now visible in the demo data." : `Alert sent to ${studentIds.length} student${studentIds.length > 1 ? "s" : ""}.`,
      variant: "success",
    });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Alert Management</h1>
          <p className="mt-1 text-sm text-slate-500">Create demo notifications for all students or a specific student.</p>
        </div>
        <Button onClick={openCreate}>Create Alert</Button>
      </div>
      <Card>
        <Input placeholder="Search alerts by student, title, or message" value={studentSearch} onChange={(event) => { setStudentSearch(event.target.value); setPage(1); }} />
      </Card>
      {visibleAlerts.length ? (<>
        <div className="grid gap-4 lg:grid-cols-2">
          {pagedAlerts.map((alert) => (
            <Card key={alert.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                    <Badge label={alert.type} tone={alert.type} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
                  <p className="mt-3 text-xs text-slate-500">Student: {students.find((student) => student.id === alert.studentId)?.fullName}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button className="bg-brand-100 text-brand-800 hover:bg-brand-200" onClick={() => openEdit(alert)}>Edit</Button>
                  <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => {
                    if (!currentUser) {
                      notify({ title: "Session unavailable.", description: "Please login again to delete alerts.", variant: "error" });
                      return;
                    }
                    const confirmed = window.confirm("Delete this alert from the demo dataset?");
                    if (!confirmed) {
                      notify({ title: "Delete cancelled.", variant: "info" });
                      return;
                    }
                    deleteAlert(alert.id, currentUser.id);
                    notify({ title: "Alert deleted.", variant: "success" });
                  }}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <DirectoryPagination page={page} totalItems={visibleAlerts.length} pageSize={pageSize} onPageChange={setPage} />
      </>) : <EmptyState title="No alerts available" description="Create your first demo alert." />}

      <Modal open={open} title={editing ? "Edit Alert" : "Create Alert"} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          {!editing ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Audience</label>
              <Select value={audience} onChange={(event) => setAudience(event.target.value)}>
                <option value="ALL">All Students</option>
                <option value="SPECIFIC">Specific Student</option>
              </Select>
            </div>
          ) : null}
          {(audience === "SPECIFIC" || editing) ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Student</label>
              <StudentPicker students={students} value={selectedStudent} onChange={setSelectedStudent} label="Select student" />
            </div>
          ) : null}
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Title</label><Input value={title} onChange={(event) => setTitle(event.target.value)} /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Message</label><Textarea value={message} onChange={(event) => setMessage(event.target.value)} /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Type</label><Select value={type} onChange={(event) => setType(event.target.value as Alert["type"])}>{["INFO","WARNING","SUCCESS","SECURITY"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button className="bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => { setOpen(false); notify({ title: "Alert form closed.", variant: "info" }); }}>Cancel</Button>
          <Button onClick={saveAlert}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
