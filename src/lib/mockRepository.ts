import { loadAllData, writeStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { createId, todayIso } from "@/lib/utils";
import type { Alert } from "@/types/alert";
import type { AuditLog, AuditAction } from "@/types/audit";
import type { CallRecord, CallStatus } from "@/types/call";
import type { Contact } from "@/types/contact";
import type { Student } from "@/types/student";
import type { User } from "@/types/user";

function sortByUpdated<T extends { updatedAt?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const left = a.updatedAt ?? a.createdAt ?? "";
    const right = b.updatedAt ?? b.createdAt ?? "";
    return right.localeCompare(left);
  });
}

export const studentRepository = {
  getAll: () => loadAllData().students,
  getById: (id: string) => loadAllData().students.find((student) => student.id === id),
  create: (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => {
    const data = loadAllData();
    const record: Student = { ...student, id: createId("student"), createdAt: todayIso(), updatedAt: todayIso() };
    writeStorage(STORAGE_KEYS.students, [record, ...data.students]);
    return record;
  },
  update: (id: string, updates: Partial<Student>) => {
    const data = loadAllData();
    const students = data.students.map((student) =>
      student.id === id ? { ...student, ...updates, updatedAt: todayIso() } : student,
    );
    writeStorage(STORAGE_KEYS.students, students);
    return students.find((student) => student.id === id) ?? null;
  },
  delete: (id: string) => {
    const data = loadAllData();
    writeStorage(
      STORAGE_KEYS.students,
      data.students.filter((student) => student.id !== id),
    );
  },
  deactivate: (id: string) => studentRepository.update(id, { status: "INACTIVE" }),
};

export const userRepository = {
  getAll: () => loadAllData().users,
  getById: (id: string) => loadAllData().users.find((user) => user.id === id),
  getByUsername: (username: string) => loadAllData().users.find((user) => user.username === username),
  create: (user: Omit<User, "id" | "createdAt">) => {
    const data = loadAllData();
    const record: User = { ...user, id: createId("user"), createdAt: todayIso() };
    writeStorage(STORAGE_KEYS.users, [record, ...data.users]);
    return record;
  },
  update: (id: string, updates: Partial<User>) => {
    const data = loadAllData();
    const users = data.users.map((user) => (user.id === id ? { ...user, ...updates } : user));
    writeStorage(STORAGE_KEYS.users, users);
    return users.find((user) => user.id === id) ?? null;
  },
  delete: (id: string) => {
    const data = loadAllData();
    writeStorage(
      STORAGE_KEYS.users,
      data.users.filter((user) => user.id !== id),
    );
  },
};

export const contactRepository = {
  getAll: () => sortByUpdated(loadAllData().contacts),
  getByStudentId: (studentId: string) =>
    loadAllData()
      .contacts.filter((contact) => contact.studentId === studentId)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  create: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    const data = loadAllData();
    const record: Contact = { ...contact, id: createId("contact"), createdAt: todayIso(), updatedAt: todayIso() };
    writeStorage(STORAGE_KEYS.contacts, [record, ...data.contacts]);
    return record;
  },
  update: (id: string, updates: Partial<Contact>) => {
    const data = loadAllData();
    const contacts = data.contacts.map((contact) =>
      contact.id === id ? { ...contact, ...updates, updatedAt: todayIso() } : contact,
    );
    writeStorage(STORAGE_KEYS.contacts, contacts);
    return contacts.find((contact) => contact.id === id) ?? null;
  },
  delete: (id: string) => {
    const data = loadAllData();
    writeStorage(
      STORAGE_KEYS.contacts,
      data.contacts.filter((contact) => contact.id !== id),
    );
  },
};

export const callRepository = {
  getAll: () => [...loadAllData().calls].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
  getByStudentId: (studentId: string) => callRepository.getAll().filter((call) => call.studentId === studentId),
  create: (call: Omit<CallRecord, "id">) => {
    const data = loadAllData();
    const record: CallRecord = { ...call, id: createId("call") };
    writeStorage(STORAGE_KEYS.calls, [record, ...data.calls]);
    return record;
  },
  update: (id: string, updates: Partial<CallRecord>) => {
    const data = loadAllData();
    const calls = data.calls.map((call) => (call.id === id ? { ...call, ...updates } : call));
    writeStorage(STORAGE_KEYS.calls, calls);
    return calls.find((call) => call.id === id) ?? null;
  },
  updateStatus: (id: string, status: CallStatus, updates: Partial<CallRecord> = {}) =>
    callRepository.update(id, { ...updates, status }),
};

export const alertRepository = {
  getAll: () => sortByUpdated(loadAllData().alerts),
  getForStudent: (studentId: string) => alertRepository.getAll().filter((alert) => alert.studentId === studentId),
  create: (alert: Omit<Alert, "id" | "createdAt" | "updatedAt">) => {
    const data = loadAllData();
    const record: Alert = { ...alert, id: createId("alert"), createdAt: todayIso(), updatedAt: todayIso() };
    writeStorage(STORAGE_KEYS.alerts, [record, ...data.alerts]);
    return record;
  },
  update: (id: string, updates: Partial<Alert>) => {
    const data = loadAllData();
    const alerts = data.alerts.map((alert) => (alert.id === id ? { ...alert, ...updates, updatedAt: todayIso() } : alert));
    writeStorage(STORAGE_KEYS.alerts, alerts);
    return alerts.find((alert) => alert.id === id) ?? null;
  },
  delete: (id: string) => {
    const data = loadAllData();
    writeStorage(
      STORAGE_KEYS.alerts,
      data.alerts.filter((alert) => alert.id !== id),
    );
  },
  markAsRead: (id: string) => alertRepository.update(id, { isRead: true }),
};

export const auditRepository = {
  getAll: () => [...loadAllData().auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
  getByStudentId: (studentId: string) =>
    auditRepository
      .getAll()
      .filter((entry) => entry.metadata?.studentId === studentId),
  create: (entry: Omit<AuditLog, "id" | "timestamp"> & { timestamp?: string }) => {
    const data = loadAllData();
    const record: AuditLog = {
      ...entry,
      id: createId("audit"),
      timestamp: entry.timestamp ?? todayIso(),
    };
    writeStorage(STORAGE_KEYS.auditLogs, [record, ...data.auditLogs]);
    return record;
  },
};

export function createAuditEntry(
  actorUserId: string,
  action: AuditAction,
  description: string,
  metadata?: Record<string, string | number | boolean | undefined>,
) {
  return auditRepository.create({ actorUserId, action, description, metadata });
}

