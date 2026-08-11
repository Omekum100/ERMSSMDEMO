"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { mockSchool } from "@/data/mockSchool";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { formatDuration, formatPhone } from "@/lib/utils";
import type { Contact } from "@/types/contact";

export default function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const { students, contacts, currentCallSession, startSimulatedCall, endCurrentCall } = useApp();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const student = students.find((entry) => entry.id === currentUser?.studentId);
  const studentContacts = useMemo(
    () => contacts.filter((contact) => contact.studentId === currentUser?.studentId && contact.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
    [contacts, currentUser?.studentId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {student?.fullName}</h1>
        <p className="mt-1 text-sm text-slate-500">Select a contact to make a secured call from {mockSchool.shortName}.</p>
      </div>
      <Card className="border-brand-100 bg-brand-50">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-900">{mockSchool.name}</p>
            <p className="text-sm text-brand-700">{mockSchool.village}, {mockSchool.block}, {mockSchool.district} • {mockSchool.phone}</p>
            <p className="mt-2 text-sm text-brand-700">Calls are simulated inside the browser. No actual telephone call will be made.</p>
          </div>
          <Badge label="SIMULATED" tone="SIMULATED" />
        </div>
      </Card>
      {studentContacts.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {studentContacts.map((contact) => (
            <Card key={contact.id}>
              <p className="text-sm text-slate-500">{contact.relationship}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{contact.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{contact.label}</p>
              <p className="mt-4 font-medium text-slate-700">{formatPhone(contact.phoneNumber)}</p>
              <Button className="mt-6 w-full" onClick={() => setSelectedContact(contact)}>Call</Button>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="No contacts available" description="Please contact the school office to update your approved contacts." />}

      <Modal open={Boolean(selectedContact)} title="Start Secured Call?" onClose={() => setSelectedContact(null)}>
        {selectedContact ? (
          <div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p><span className="font-semibold">Contact:</span> {selectedContact.relationship}</p>
              <p className="mt-1">{formatPhone(selectedContact.phoneNumber)}</p>
              <p className="mt-3 text-slate-500">This is a simulated call from {mockSchool.shortName}. No actual phone call will be made.</p>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button className="bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => setSelectedContact(null)}>Cancel</Button>
              <Button onClick={() => {
                if (!currentUser?.studentId || !currentUser) return;
                startSimulatedCall(currentUser.studentId, selectedContact.id, currentUser.id);
                setSelectedContact(null);
              }}>Start Call</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(currentCallSession)} title="EMRS Calling Interface" onClose={() => {}} width="max-w-md">
        {currentCallSession ? (
          <div className="space-y-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">Simulation - No Real Call</p>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{mockSchool.shortName}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{currentCallSession.status === "CONNECTED" ? "Connected" : currentCallSession.status === "RINGING" ? "Calling..." : "Initiating..."}</h2>
              <p className="mt-3 text-lg font-medium text-slate-800">{currentCallSession.contact?.relationship}</p>
              <p className="mt-1 text-sm text-slate-500">{formatPhone(currentCallSession.contact?.phoneNumber ?? "")}</p>
            </div>
            <div>
              <p className="text-4xl font-semibold text-brand-700">{formatDuration(currentCallSession.elapsedSeconds)}</p>
              <p className="mt-2 text-sm text-slate-500">Status: {currentCallSession.status}</p>
            </div>
            <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => currentUser && endCurrentCall()}>End Call</Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
