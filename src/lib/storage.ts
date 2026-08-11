import { mockAlerts } from "@/data/mockAlerts";
import { mockAuditLogs } from "@/data/mockAuditLogs";
import { mockCalls } from "@/data/mockCalls";
import { mockContacts } from "@/data/mockContacts";
import { mockStudents } from "@/data/mockStudents";
import { mockUsers } from "@/data/mockUsers";
import { DEMO_SEED_VERSION, STORAGE_KEYS } from "@/lib/storageKeys";
import type { Alert } from "@/types/alert";
import type { AuditLog } from "@/types/audit";
import type { CallRecord } from "@/types/call";
import type { Contact } from "@/types/contact";
import type { Student } from "@/types/student";
import type { AuthSession, User } from "@/types/user";

export type AppDataCollections = {
  students: Student[];
  contacts: Contact[];
  calls: CallRecord[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  users: User[];
};

const defaults: AppDataCollections = {
  students: mockStudents,
  contacts: mockContacts,
  calls: mockCalls,
  alerts: mockAlerts,
  auditLogs: mockAuditLogs,
  users: mockUsers,
};

export function isBrowser() {
  return typeof window !== "undefined";
}

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function writeDefaults() {
  writeStorage(STORAGE_KEYS.students, defaults.students);
  writeStorage(STORAGE_KEYS.contacts, defaults.contacts);
  writeStorage(STORAGE_KEYS.calls, defaults.calls);
  writeStorage(STORAGE_KEYS.alerts, defaults.alerts);
  writeStorage(STORAGE_KEYS.auditLogs, defaults.auditLogs);
  writeStorage(STORAGE_KEYS.users, defaults.users);
  writeStorage(STORAGE_KEYS.seedVersion, DEMO_SEED_VERSION);
}

export function initializeDemoData() {
  if (!isBrowser()) return;
  const currentVersion = window.localStorage.getItem(STORAGE_KEYS.seedVersion);
  if (currentVersion !== DEMO_SEED_VERSION) {
    writeDefaults();
    window.localStorage.removeItem(STORAGE_KEYS.currentUser);
    return;
  }
  const entries: Array<[string, unknown]> = [
    [STORAGE_KEYS.students, defaults.students],
    [STORAGE_KEYS.contacts, defaults.contacts],
    [STORAGE_KEYS.calls, defaults.calls],
    [STORAGE_KEYS.alerts, defaults.alerts],
    [STORAGE_KEYS.auditLogs, defaults.auditLogs],
    [STORAGE_KEYS.users, defaults.users],
  ];
  entries.forEach(([key, data]) => {
    if (!window.localStorage.getItem(key)) {
      writeStorage(key, data);
    }
  });
}

export function loadAllData(): AppDataCollections {
  return {
    students: readStorage(STORAGE_KEYS.students, defaults.students),
    contacts: readStorage(STORAGE_KEYS.contacts, defaults.contacts),
    calls: readStorage(STORAGE_KEYS.calls, defaults.calls),
    alerts: readStorage(STORAGE_KEYS.alerts, defaults.alerts),
    auditLogs: readStorage(STORAGE_KEYS.auditLogs, defaults.auditLogs),
    users: readStorage(STORAGE_KEYS.users, defaults.users),
  };
}

export function resetMockData() {
  if (!isBrowser()) return;
  writeDefaults();
  window.localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export function saveSession(session: AuthSession | null) {
  if (!isBrowser()) return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEYS.currentUser);
    return;
  }
  writeStorage(STORAGE_KEYS.currentUser, session);
}

export function loadSession() {
  return readStorage<AuthSession | null>(STORAGE_KEYS.currentUser, null);
}
