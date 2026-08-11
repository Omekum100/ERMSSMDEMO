"use client";

import { ChevronLeft, ChevronRight, Filter, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatDateTime } from "@/lib/utils";
import type { Student } from "@/types/student";

type StudentFormState = {
  fullName: string; studentId: string; username: string; password: string; securityCode: string;
  className: string; section: string; hostel: string; status: "ACTIVE" | "INACTIVE";
};

const defaultForm: StudentFormState = { fullName: "", studentId: "", username: "", password: "Student@123", securityCode: "", className: "", section: "", hostel: "", status: "ACTIVE" };
const pageSizes = [25, 50, 100];

export default function AdminStudentsPage() {
  const { students, users, contacts, calls, alerts, auditLogs, addStudent, updateStudent, deactivateStudent, deleteStudent, resetLoginCode } = useApp();
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [form, setForm] = useState<StudentFormState>(defaultForm);

  const classNames = useMemo(() => Array.from(new Set(students.map((student) => student.className))).sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))), [students]);
  const sections = useMemo(() => Array.from(new Set(students.map((student) => student.section))).sort(), [students]);
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const classCounts = useMemo(() => classNames.map((className) => ({ className, count: students.filter((student) => student.className === className).length })), [classNames, students]);

  const filtered = useMemo(() => students
    .filter((student) => {
      const matchQuery = [student.fullName, student.studentId, student.className, student.section, student.hostel].join(" ").toLowerCase().includes(query.trim().toLowerCase());
      return matchQuery && (status === "ALL" || student.status === status) && (classFilter === "ALL" || student.className === classFilter) && (sectionFilter === "ALL" || student.section === sectionFilter);
    })
    .sort((left, right) => Number(left.className.replace(/\D/g, "")) - Number(right.className.replace(/\D/g, "")) || left.section.localeCompare(right.section) || left.fullName.localeCompare(right.fullName)), [students, query, status, classFilter, sectionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleStudents = filtered.slice((page - 1) * pageSize, page * pageSize);
  const rangeStart = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, filtered.length);
  const activeCount = students.filter((student) => student.status === "ACTIVE").length;

  useEffect(() => setPage(1), [query, status, classFilter, sectionFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const openCreate = () => { setEditingStudent(null); setForm({ ...defaultForm, securityCode: Math.floor(100000 + Math.random() * 900000).toString() }); setIsFormOpen(true); };
  const openEdit = (student: Student) => {
    const user = usersById.get(student.userId);
    setEditingStudent(student);
    setForm({ fullName: student.fullName, studentId: student.studentId, username: user?.username ?? "", password: user?.password ?? "Student@123", securityCode: user?.securityCode ?? "", className: student.className, section: student.section, hostel: student.hostel, status: student.status });
    setIsFormOpen(true);
  };
  const openProfile = (student: Student, tab = "Overview") => { setViewingStudent(student); setActiveTab(tab); };
  const saveStudent = () => {
    if (!currentUser) return notify({ title: "Session unavailable.", description: "Please login again to manage students.", variant: "error" });
    if (!form.fullName.trim() || !form.studentId.trim() || !form.username.trim() || !form.className.trim() || !form.section.trim() || !form.hostel.trim()) return notify({ title: "Missing student details.", description: "Please fill all required fields before saving.", variant: "error" });
    if (editingStudent) { updateStudent(editingStudent.id, { ...form, actorUserId: currentUser.id }); notify({ title: "Student updated successfully.", variant: "success" }); }
    else { addStudent({ ...form, actorUserId: currentUser.id }); notify({ title: "Student created successfully.", variant: "success" }); }
    setIsFormOpen(false); setForm(defaultForm);
  };
  const runAction = (student: Student, action: string) => {
    if (action === "view") openProfile(student);
    if (action === "contacts") openProfile(student, "Contacts");
    if (action === "edit") openEdit(student);
    if (action === "reset") {
      if (!currentUser) return notify({ title: "Session unavailable.", variant: "error" });
      notify({ title: "Security code reset.", description: `New code: ${resetLoginCode(student.id, currentUser.id)}`, variant: "success" });
    }
    if (action === "deactivate") {
      if (!currentUser || !window.confirm(`Deactivate ${student.fullName}?`)) return;
      deactivateStudent(student.id, currentUser.id); notify({ title: "Student deactivated.", variant: "success" });
    }
    if (action === "delete") {
      if (!currentUser || !window.confirm(`Permanently remove ${student.fullName} from the demo dataset?`)) return;
      deleteStudent(student.id, currentUser.id); notify({ title: "Student deleted.", variant: "success" });
    }
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div><h1 className="text-2xl font-semibold text-slate-900">Student Directory</h1><p className="mt-1 text-sm text-slate-500">A scalable, class-first view for the school&apos;s {students.length} student records.</p></div>
      <Button onClick={openCreate}>Add Student</Button>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card><p className="text-sm text-slate-500">Total students</p><p className="mt-1 text-3xl font-semibold">{students.length}</p></Card>
      <Card><p className="text-sm text-slate-500">Active accounts</p><p className="mt-1 text-3xl font-semibold text-emerald-700">{activeCount}</p></Card>
      <Card><p className="text-sm text-slate-500">Classes covered</p><p className="mt-1 text-3xl font-semibold">{classNames.length} <span className="text-base font-medium text-slate-500">(1–12)</span></p></Card>
      <Card><p className="text-sm text-slate-500">Filtered result</p><p className="mt-1 text-3xl font-semibold text-brand-700">{filtered.length}</p></Card>
    </div>

    <Card className="overflow-hidden">
      <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-brand-700" /><h2 className="font-semibold text-slate-900">Browse by class</h2><span className="text-sm text-slate-500">Select a class to focus the directory.</span></div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
        <button onClick={() => setClassFilter("ALL")} className={`rounded-xl border px-3 py-2 text-left text-sm ${classFilter === "ALL" ? "border-brand-500 bg-brand-50 text-brand-900" : "border-slate-200 hover:bg-slate-50"}`}><span className="block font-semibold">All</span><span className="text-xs">{students.length} students</span></button>
        {classCounts.map(({ className, count }) => <button key={className} onClick={() => setClassFilter(className)} className={`rounded-xl border px-3 py-2 text-left text-sm ${classFilter === className ? "border-brand-500 bg-brand-50 text-brand-900" : "border-slate-200 hover:bg-slate-50"}`}><span className="block font-semibold">{className.replace("Class ", "Class ")}</span><span className="text-xs">{count} students</span></button>)}
      </div>
    </Card>

    <Card>
      <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-9" placeholder="Search name, student ID, class, section, or hostel" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="ALL">All classes</option>{classNames.map((name) => <option key={name} value={name}>{name}</option>)}</Select>
        <Select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}><option value="ALL">All sections</option>{sections.map((name) => <option key={name} value={name}>Section {name}</option>)}</Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></Select>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><span><Filter className="mr-1 inline h-4 w-4" />Showing {rangeStart}–{rangeEnd} of {filtered.length} students</span><label className="flex items-center gap-2">Rows per page <Select className="w-20 py-1" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</Select></label></div>
      {filtered.length ? <>
        <div className="table-scroll"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["Student", "Class & hostel", "Account", "Recent activity", "Actions"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead><tbody>
          {visibleStudents.map((student) => { const user = usersById.get(student.userId); return <tr key={student.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60"><td className="px-4 py-3"><button onClick={() => openProfile(student)} className="text-left font-semibold text-slate-900 hover:text-brand-700">{student.fullName}</button><p className="mt-1 font-mono text-xs text-slate-500">{student.studentId}</p></td><td className="px-4 py-3"><p>{student.className} · Section {student.section}</p><p className="mt-1 text-xs text-slate-500">{student.hostel}</p></td><td className="px-4 py-3"><p className="text-slate-700">{user?.username ?? "—"}</p><div className="mt-1"><Badge label={student.status} tone={student.status} /></div></td><td className="px-4 py-3 text-xs text-slate-500"><p>Login: {formatDateTime(student.lastLogin)}</p><p className="mt-1">Call: {formatDateTime(student.lastCall)}</p></td><td className="px-4 py-3"><div className="flex min-w-[190px] items-center gap-2"><Button className="bg-slate-200 px-3 py-1.5 text-slate-800 hover:bg-slate-300" onClick={() => openProfile(student)}>View</Button><Select aria-label={`Actions for ${student.fullName}`} className="py-1.5" value="" onChange={(event) => { runAction(student, event.target.value); event.currentTarget.value = ""; }}><option value="" disabled>More actions</option><option value="edit">Edit student</option><option value="contacts">Manage contacts</option><option value="reset">Reset login code</option>{student.status === "ACTIVE" ? <option value="deactivate">Deactivate</option> : null}<option value="delete">Delete student</option></Select></div></td></tr>; })}
        </tbody></table></div>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm text-slate-500">Page {page} of {totalPages}</p><div className="flex gap-2"><Button className="bg-slate-200 px-3 text-slate-800 hover:bg-slate-300" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button><Button className="bg-slate-200 px-3 text-slate-800 hover:bg-slate-300" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight className="h-4 w-4" /></Button></div></div>
      </> : <EmptyState title="No students found" description="Try changing your search or directory filters." />}
    </Card>

    <Modal open={isFormOpen} title={editingStudent ? "Edit Student" : "Add Student"} onClose={() => setIsFormOpen(false)} width="max-w-2xl"><div className="grid gap-4 md:grid-cols-2">{[["Full Name", "fullName"], ["Student ID", "studentId"], ["Username", "username"], ["Password", "password"], ["Security Code", "securityCode"], ["Class", "className"], ["Section", "section"], ["Hostel/House", "hostel"]].map(([label, key]) => <div key={key}><label className="mb-2 block text-sm font-medium text-slate-700">{label}</label><Input value={form[key as keyof StudentFormState] as string} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></div>)}<div><label className="mb-2 block text-sm font-medium text-slate-700">Status</label><Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "ACTIVE" | "INACTIVE" }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></Select></div></div><div className="mt-5 flex justify-end gap-3"><Button className="bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button onClick={saveStudent}>Save</Button></div></Modal>

    <Modal open={Boolean(viewingStudent)} title={viewingStudent?.fullName ?? "Student Profile"} onClose={() => setViewingStudent(null)} width="max-w-4xl">{viewingStudent ? <div className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><Card><p className="text-sm text-slate-500">Student ID</p><p className="mt-2 font-semibold">{viewingStudent.studentId}</p></Card><Card><p className="text-sm text-slate-500">Class / Section</p><p className="mt-2 font-semibold">{viewingStudent.className} · {viewingStudent.section}</p></Card><Card><p className="text-sm text-slate-500">Hostel</p><p className="mt-2 font-semibold">{viewingStudent.hostel}</p></Card></div><Tabs tabs={["Overview", "Contacts", "Call History", "Activity", "Alerts"]} value={activeTab} onChange={setActiveTab} />{activeTab === "Overview" ? <div className="grid gap-4 md:grid-cols-2"><Card><p className="text-sm text-slate-500">Username</p><p className="mt-2 font-semibold">{usersById.get(viewingStudent.userId)?.username}</p></Card><Card><p className="text-sm text-slate-500">Status</p><div className="mt-2"><Badge label={viewingStudent.status} tone={viewingStudent.status} /></div></Card><Card><p className="text-sm text-slate-500">Last Login</p><p className="mt-2 font-semibold">{formatDateTime(viewingStudent.lastLogin)}</p></Card><Card><p className="text-sm text-slate-500">Created Date</p><p className="mt-2 font-semibold">{formatDateTime(viewingStudent.createdAt)}</p></Card></div> : null}{activeTab === "Contacts" ? <div className="space-y-3">{contacts.filter((contact) => contact.studentId === viewingStudent.id).map((contact) => <Card key={contact.id}><p className="font-semibold">{contact.relationship} · {contact.name}</p><p className="mt-1 text-sm text-slate-500">{contact.phoneNumber} · {contact.label}</p></Card>)}</div> : null}{activeTab === "Call History" ? <div className="space-y-3">{calls.filter((call) => call.studentId === viewingStudent.id).map((call) => <Card key={call.id}><p className="font-semibold">{contacts.find((entry) => entry.id === call.contactId)?.relationship}</p><p className="mt-1 text-sm text-slate-500">{formatDateTime(call.startedAt)} · {call.status}</p></Card>)}</div> : null}{activeTab === "Activity" ? <div className="space-y-3">{auditLogs.filter((entry) => entry.metadata?.studentId === viewingStudent.id).map((entry) => <Card key={entry.id}><p className="font-semibold">{entry.description}</p><p className="mt-1 text-sm text-slate-500">{formatDateTime(entry.timestamp)}</p></Card>)}</div> : null}{activeTab === "Alerts" ? <div className="space-y-3">{alerts.filter((alert) => alert.studentId === viewingStudent.id).map((alert) => <Card key={alert.id}><p className="font-semibold">{alert.title}</p><p className="mt-1 text-sm text-slate-500">{alert.message}</p></Card>)}</div> : null}</div> : null}</Modal>
  </div>;
}
