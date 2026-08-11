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
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { Contact, ContactRelationship } from "@/types/contact";

const relationships: ContactRelationship[] = ["Father", "Mother", "Brother", "Sister", "Guardian", "Company", "Other Approved Contact"];

type ContactFormState = {
  studentId: string;
  name: string;
  relationship: ContactRelationship;
  phoneNumber: string;
  isActive: boolean;
  displayOrder: number;
  label: string;
};

export default function AdminContactsPage() {
  const { contacts, students, upsertContact, deleteContact } = useApp();
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const [studentFilter, setStudentFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ContactFormState>({ studentId: students[0]?.id ?? "", name: "", relationship: "Father", phoneNumber: "", isActive: true, displayOrder: 1, label: "Primary Guardian" });

  const filtered = useMemo(() => contacts.filter((contact) => {
    const matchesStudent = studentFilter === "ALL" || contact.studentId === studentFilter;
    const matchesSearch = [contact.name, contact.relationship, contact.phoneNumber].join(" ").toLowerCase().includes(search.toLowerCase());
    return matchesStudent && matchesSearch;
  }), [contacts, search, studentFilter]);
  const pageSize = 25;
  const visibleContacts = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({ studentId: students[0]?.id ?? "", name: "", relationship: "Father", phoneNumber: "", isActive: true, displayOrder: 1, label: "Primary Guardian" });
    setOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setForm({ studentId: contact.studentId, name: contact.name, relationship: contact.relationship, phoneNumber: contact.phoneNumber, isActive: contact.isActive, displayOrder: contact.displayOrder, label: contact.label });
    setOpen(true);
  };

  const saveContact = () => {
    if (!currentUser) {
      notify({ title: "Session unavailable.", description: "Please login again to manage contacts.", variant: "error" });
      return;
    }
    if (!form.studentId || !form.name.trim() || !form.phoneNumber.trim() || !form.label.trim()) {
      notify({ title: "Missing contact details.", description: "Please fill all required contact fields before saving.", variant: "error" });
      return;
    }
    upsertContact({ id: editing?.id, ...form, name: form.name.trim(), phoneNumber: form.phoneNumber.trim(), label: form.label.trim() }, currentUser.id);
    notify({ title: editing ? "Contact updated successfully." : "Contact added successfully.", variant: "success" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contact Management</h1>
          <p className="mt-1 text-sm text-slate-500">Add, edit, activate, or remove approved calling contacts.</p>
        </div>
        <Button onClick={openCreate}>Add Contact</Button>
      </div>
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-[280px_1fr]">
          <StudentPicker students={students} value={studentFilter} onChange={(value) => { setStudentFilter(value); setPage(1); }} allowAll label="Select student for filter" />
          <Input placeholder="Search contacts" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        {filtered.length ? (<>
          <div className="table-scroll">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>{["Student","Name","Relationship","Phone Number","Status","Display Order","Actions"].map((item) => <th key={item} className="px-4 py-3 font-medium">{item}</th>)}</tr></thead>
              <tbody>
                {visibleContacts.map((contact) => (
                  <tr key={contact.id} className="border-t border-slate-100">
                    <td className="px-4 py-4">{students.find((student) => student.id === contact.studentId)?.fullName}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{contact.name}</td>
                    <td className="px-4 py-4">{contact.relationship}</td>
                    <td className="px-4 py-4">{contact.phoneNumber}</td>
                    <td className="px-4 py-4"><Badge label={contact.isActive ? "ACTIVE" : "INACTIVE"} tone={contact.isActive ? "ACTIVE" : "INACTIVE"} /></td>
                    <td className="px-4 py-4">{contact.displayOrder}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-brand-100 text-brand-800 hover:bg-brand-200" onClick={() => openEdit(contact)}>Edit</Button>
                        <Button className="bg-slate-700 text-white hover:bg-slate-800" onClick={() => {
                          if (!currentUser) {
                            notify({ title: "Session unavailable.", description: "Please login again to update contacts.", variant: "error" });
                            return;
                          }
                          upsertContact({ ...contact, isActive: !contact.isActive }, currentUser.id);
                          notify({ title: "Contact status updated.", variant: "success" });
                        }}>{contact.isActive ? "Deactivate" : "Activate"}</Button>
                        <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => {
                          if (!currentUser) {
                            notify({ title: "Session unavailable.", description: "Please login again to delete contacts.", variant: "error" });
                            return;
                          }
                          const confirmed = window.confirm("Delete this contact from the demo dataset?");
                          if (!confirmed) {
                            notify({ title: "Delete cancelled.", variant: "info" });
                            return;
                          }
                          deleteContact(contact.id, currentUser.id);
                          notify({ title: "Contact deleted.", variant: "success" });
                        }}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DirectoryPagination page={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
        </>) : <EmptyState title="No contacts found" description="Create a contact or adjust your filters." />}
      </Card>
      <Modal open={open} title={editing ? "Edit Contact" : "Add Contact"} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Student</label>
            <StudentPicker students={students} value={form.studentId} onChange={(value) => setForm((current) => ({ ...current, studentId: value }))} label="Select student" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Name</label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Relationship</label><Select value={form.relationship} onChange={(event) => setForm((current) => ({ ...current, relationship: event.target.value as ContactRelationship }))}>{relationships.map((item) => <option key={item} value={item}>{item}</option>)}</Select></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label><Input value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Label</label><Input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Display Order</label><Input type="number" value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Status</label><Select value={form.isActive ? "ACTIVE" : "INACTIVE"} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "ACTIVE" }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></Select></div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button className="bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => { setOpen(false); notify({ title: "Contact form closed.", variant: "info" }); }}>Cancel</Button>
          <Button onClick={saveContact}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
