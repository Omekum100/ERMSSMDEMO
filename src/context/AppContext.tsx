"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MockCallingProvider, type CallSessionState, type CallingSessionController } from "@/lib/calling";
import {
  alertRepository,
  callRepository,
  contactRepository,
  createAuditEntry,
  studentRepository,
  userRepository,
} from "@/lib/mockRepository";
import { initializeDemoData, loadAllData, resetMockData } from "@/lib/storage";
import { todayIso } from "@/lib/utils";
import type { Alert } from "@/types/alert";
import type { AuditLog } from "@/types/audit";
import type { CallRecord } from "@/types/call";
import type { Contact } from "@/types/contact";
import type { Student } from "@/types/student";
import type { User } from "@/types/user";

type StudentFormPayload = {
  fullName: string;
  studentId: string;
  username: string;
  password: string;
  securityCode: string;
  className: string;
  section: string;
  hostel: string;
  status: "ACTIVE" | "INACTIVE";
  actorUserId: string;
};

type StudentUpdatePayload = Partial<Pick<Student, "fullName" | "studentId" | "className" | "section" | "hostel" | "status">> & {
  username?: string;
  actorUserId: string;
};

type ContactPayload = Partial<Contact> & Pick<Contact, "studentId" | "name" | "relationship" | "phoneNumber" | "displayOrder" | "label">;

type AlertPayload = Partial<Alert> & {
  title: string;
  message: string;
  type: Alert["type"];
  studentIds: string[];
  actorUserId: string;
};

type AppContextValue = {
  students: Student[];
  contacts: Contact[];
  calls: CallRecord[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  users: User[];
  loading: boolean;
  refreshData: () => void;
  addStudent: (payload: StudentFormPayload) => void;
  updateStudent: (studentId: string, updates: StudentUpdatePayload) => void;
  deactivateStudent: (studentId: string, actorUserId: string) => void;
  deleteStudent: (studentId: string, actorUserId: string) => void;
  resetLoginCode: (studentId: string, actorUserId: string) => string;
  upsertContact: (contact: ContactPayload, actorUserId: string) => void;
  deleteContact: (contactId: string, actorUserId: string) => void;
  upsertAlert: (payload: AlertPayload) => void;
  deleteAlert: (alertId: string, actorUserId: string) => void;
  markAlertRead: (alertId: string, actorUserId: string) => void;
  startSimulatedCall: (studentId: string, contactId: string, actorUserId: string) => void;
  endCurrentCall: () => void;
  currentCallSession: (CallSessionState & { contact?: Contact }) | null;
  resetDemoData: (actorUserId: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);
const callingProvider = new MockCallingProvider();

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCallSession, setCurrentCallSession] = useState<(CallSessionState & { contact?: Contact }) | null>(null);
  const [controller, setController] = useState<CallingSessionController | null>(null);

  const refreshData = () => {
    const data = loadAllData();
    setStudents(data.students);
    setContacts(data.contacts);
    setCalls(callRepository.getAll());
    setAlerts(alertRepository.getAll());
    setAuditLogs([...data.auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    setUsers(data.users);
  };

  useEffect(() => {
    initializeDemoData();
    refreshData();
    setLoading(false);
  }, []);

  const addStudent = (payload: StudentFormPayload) => {
    const user = userRepository.create({
      username: payload.username,
      password: payload.password,
      securityCode: payload.securityCode,
      role: "STUDENT",
      isActive: payload.status === "ACTIVE",
      studentId: "",
      lastLogin: undefined,
    });
    const student = studentRepository.create({
      userId: user.id,
      studentId: payload.studentId,
      fullName: payload.fullName,
      className: payload.className,
      section: payload.section,
      hostel: payload.hostel,
      status: payload.status,
      lastLogin: undefined,
      lastCall: undefined,
    });
    userRepository.update(user.id, { studentId: student.id });
    createAuditEntry(payload.actorUserId, "STUDENT_CREATED", `Created student ${payload.fullName}.`, { studentId: student.id });
    refreshData();
  };

  const updateStudent = (studentId: string, updates: StudentUpdatePayload) => {
    const { username, actorUserId, ...studentUpdates } = updates;
    const student = studentRepository.update(studentId, studentUpdates);
    if (!student) return;
    const user = userRepository.getById(student.userId);
    if (user) {
      userRepository.update(user.id, {
        username: username ?? user.username,
        isActive: student.status === "ACTIVE",
      });
    }
    createAuditEntry(actorUserId, "STUDENT_UPDATED", `Updated student ${student.fullName}.`, { studentId: student.id });
    refreshData();
  };

  const deactivateStudent = (studentId: string, actorUserId: string) => {
    const student = studentRepository.deactivate(studentId);
    if (!student) return;
    userRepository.update(student.userId, { isActive: false });
    createAuditEntry(actorUserId, "STUDENT_DEACTIVATED", `Deactivated student ${student.fullName}.`, { studentId });
    refreshData();
  };

  const deleteStudent = (studentId: string, actorUserId: string) => {
    const student = students.find((entry) => entry.id === studentId);
    if (!student) return;
    studentRepository.delete(studentId);
    userRepository.delete(student.userId);
    contacts.filter((contact) => contact.studentId === studentId).forEach((contact) => contactRepository.delete(contact.id));
    alerts.filter((alert) => alert.studentId === studentId).forEach((alert) => alertRepository.delete(alert.id));
    createAuditEntry(actorUserId, "STUDENT_DELETED", `Deleted student ${student.fullName} from demo data.`, { studentId });
    refreshData();
  };

  const resetLoginCode = (studentId: string, actorUserId: string) => {
    const student = students.find((entry) => entry.id === studentId);
    if (!student) return "";
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    userRepository.update(student.userId, { securityCode: newCode });
    createAuditEntry(actorUserId, "LOGIN_CODE_RESET", `Reset security code for ${student.fullName}.`, { studentId, newCode });
    refreshData();
    return newCode;
  };

  const upsertContact = (contact: ContactPayload, actorUserId: string) => {
    const student = students.find((entry) => entry.id === contact.studentId);
    if (contact.id) {
      contactRepository.update(contact.id, contact);
      createAuditEntry(actorUserId, "CONTACT_UPDATED", `Updated contact for ${student?.fullName ?? "student"}.`, { studentId: contact.studentId, contactId: contact.id });
    } else {
      const created = contactRepository.create({
        studentId: contact.studentId,
        name: contact.name,
        relationship: contact.relationship,
        phoneNumber: contact.phoneNumber,
        isActive: contact.isActive ?? true,
        displayOrder: contact.displayOrder,
        label: contact.label,
      });
      createAuditEntry(actorUserId, "CONTACT_CREATED", `Added contact for ${student?.fullName ?? "student"}.`, { studentId: contact.studentId, contactId: created.id });
    }
    refreshData();
  };

  const deleteContact = (contactId: string, actorUserId: string) => {
    const contact = contacts.find((entry) => entry.id === contactId);
    if (!contact) return;
    contactRepository.delete(contactId);
    createAuditEntry(actorUserId, "CONTACT_DELETED", `Deleted contact ${contact.name}.`, { studentId: contact.studentId, contactId });
    refreshData();
  };

  const upsertAlert = (payload: AlertPayload) => {
    if (payload.id) {
      alertRepository.update(payload.id, {
        title: payload.title,
        message: payload.message,
        type: payload.type,
        studentId: payload.studentIds[0] ?? payload.studentId ?? "",
      });
      createAuditEntry(payload.actorUserId, "ALERT_UPDATED", `Updated alert ${payload.title}.`, { alertId: payload.id });
    } else {
      payload.studentIds.forEach((studentId) => {
        alertRepository.create({
          studentId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          isRead: false,
        });
      });
      createAuditEntry(payload.actorUserId, "ALERT_CREATED", `Created alert ${payload.title}.`, { audienceCount: payload.studentIds.length });
    }
    refreshData();
  };

  const deleteAlert = (alertId: string, actorUserId: string) => {
    alertRepository.delete(alertId);
    createAuditEntry(actorUserId, "ALERT_DELETED", "Deleted a demo alert.");
    refreshData();
  };

  const markAlertRead = (alertId: string, actorUserId: string) => {
    const alert = alertRepository.markAsRead(alertId);
    if (!alert) return;
    createAuditEntry(actorUserId, "ALERT_READ", `Read alert ${alert.title}.`, { alertId });
    refreshData();
  };

  const startSimulatedCall = (studentId: string, contactId: string, actorUserId: string) => {
    const contact = contacts.find((entry) => entry.id === contactId);
    const call = callRepository.create({
      studentId,
      contactId,
      status: "INITIATED",
      mode: "SIMULATED",
      startedAt: todayIso(),
    });
    createAuditEntry(actorUserId, "CALL_INITIATED", `Started simulated call with ${contact?.name ?? "contact"}.`, { studentId, contactId, callId: call.id });
    const nextController = callingProvider.startCall(call, {
      onStatusChange: (state) => {
        setCurrentCallSession({ ...state, contact });
        if (state.status === "CONNECTED") {
          createAuditEntry(actorUserId, "CALL_CONNECTED", `Simulated call connected with ${contact?.name ?? "contact"}.`, { studentId, contactId, callId: call.id });
        }
        refreshData();
      },
      onFinish: (state) => {
        setCurrentCallSession({ ...state, contact });
        studentRepository.update(studentId, { lastCall: state.call.endedAt ?? todayIso() });
        createAuditEntry(
          actorUserId,
          state.status === "COMPLETED" ? "CALL_COMPLETED" : "CALL_CANCELLED",
          state.status === "COMPLETED"
            ? `Simulated call completed with ${contact?.name ?? "contact"}.`
            : `Simulated call cancelled with ${contact?.name ?? "contact"}.`,
          { studentId, contactId, callId: call.id, durationSeconds: state.elapsedSeconds },
        );
        window.setTimeout(() => setCurrentCallSession(null), 1200);
        setController(null);
        refreshData();
      },
    });
    setController(nextController);
    refreshData();
  };

  const endCurrentCall = () => {
    controller?.endCall();
  };

  const handleResetDemoData = (actorUserId: string) => {
    resetMockData();
    createAuditEntry(actorUserId, "DEMO_DATA_RESET", "Reset all demo data to the original seed state.");
    refreshData();
  };

  const value: AppContextValue = {
    students,
    contacts,
    calls,
    alerts,
    auditLogs,
    users,
    loading,
    refreshData,
    addStudent,
    updateStudent,
    deactivateStudent,
    deleteStudent,
    resetLoginCode,
    upsertContact,
    deleteContact,
    upsertAlert,
    deleteAlert,
    markAlertRead,
    startSimulatedCall,
    endCurrentCall,
    currentCallSession,
    resetDemoData: handleResetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
