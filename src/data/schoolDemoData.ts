import type { Alert } from "@/types/alert";
import type { AuditLog } from "@/types/audit";
import type { CallRecord } from "@/types/call";
import type { Contact, ContactRelationship } from "@/types/contact";
import type { Student } from "@/types/student";
import type { User } from "@/types/user";

const firstNames = [
  "Birsa", "Phulo", "Sushil", "Manki", "Lakhiram", "Sukhram", "Dayamani", "Koyal", "Somra", "Kisku",
  "Taramani", "Rupi", "Budhram", "Sita", "Dulari", "Sagun", "Soren", "Purnima", "Jema", "Baha",
  "Nirmala", "Ajay", "Mangal", "Rakesh", "Anita", "Sunita", "Komal", "Asha", "Suraj", "Geeta",
];
const lastNames = [
  "Hembrom", "Murmu", "Tudu", "Soy", "Purty", "Sinku", "Kisku", "Hansda", "Baskey", "Toppo",
  "Kujur", "Kandulana", "Bedia", "Ho", "Gagrai", "Birua", "Lugun", "Munda", "Bodra", "Jamuda",
];
const villages = ["Sialjora", "Jaipur", "Hat Gamharia", "Manjhari", "Tirilposi", "Kendposi"];
const sections = ["A", "B", "C"];
const boysHostels = ["Sialjora Boys Hostel", "Jaipur Boys Hostel", "Senior Boys Hostel"];
const girlsHostels = ["Sialjora Girls Hostel", "Jaipur Girls Hostel", "Senior Girls Hostel"];
const relationships: ContactRelationship[] = ["Father", "Mother", "Guardian"];

const baseDate = new Date("2026-08-01T09:00:00.000Z").getTime();

function isoAt(offsetMinutes: number) {
  return new Date(baseDate + offsetMinutes * 60_000).toISOString();
}

function pad(value: number) {
  return value.toString().padStart(3, "0");
}

function fullNameAt(index: number) {
  const first = firstNames[index % firstNames.length];
  const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return `${first} ${last}`;
}

function parentNameAt(index: number, relationship: ContactRelationship) {
  const offset = relationship === "Father" ? 3 : relationship === "Mother" ? 7 : 11;
  return `${firstNames[(index + offset) % firstNames.length]} ${lastNames[(index + offset * 2) % lastNames.length]}`;
}

const generatedStudents: Student[] = [];
const generatedUsers: User[] = [
  {
    id: "user_admin_001",
    username: "admin",
    password: "Admin@123",
    securityCode: "123456",
    role: "ADMIN",
    isActive: true,
    createdAt: isoAt(0),
    lastLogin: "2026-08-10T08:30:00.000Z",
  },
];
const generatedContacts: Contact[] = [];
const generatedCalls: CallRecord[] = [];
const generatedAlerts: Alert[] = [];
const generatedAuditLogs: AuditLog[] = [];

for (let index = 0; index < 300; index += 1) {
  const sequence = index + 1;
  const studentKey = `student_${pad(sequence)}`;
  const userKey = `user_student_${pad(sequence)}`;
  const isFirstDemoStudent = sequence === 1;
  const isGirl = index % 2 === 1;
  const classNumber = (index % 12) + 1;
  // Advance sections by class-cycle so every class is spread across A, B, and C.
  // Using index % 3 here would assign each class to only one section because 12 is divisible by 3.
  const section = sections[Math.floor(index / 12) % sections.length];
  const hostelPool = isGirl ? girlsHostels : boysHostels;
  const hostel = classNumber <= 5 ? hostelPool[0] : classNumber <= 8 ? hostelPool[1] : hostelPool[2];
  const isInactive = sequence % 17 === 0;
  const createdAt = isoAt(10 + index * 3);
  const lastLogin = sequence <= 210 ? isoAt(2000 + index * 17) : undefined;
  const lastCall = sequence <= 180 ? isoAt(2400 + index * 19) : undefined;
  const username = isFirstDemoStudent ? "raj001" : `hg${pad(sequence)}`;
  const securityCode = isFirstDemoStudent ? "111111" : (100000 + ((sequence * 913) % 900000)).toString();
  const studentName = isFirstDemoStudent ? "Birsa Sinku" : fullNameAt(index);

  generatedUsers.push({
    id: userKey,
    username,
    password: "Student@123",
    securityCode,
    role: "STUDENT",
    isActive: !isInactive,
    studentId: studentKey,
    createdAt,
    lastLogin,
  });

  generatedStudents.push({
    id: studentKey,
    userId: userKey,
    studentId: `HG-EMRS-2026-${pad(sequence)}`,
    fullName: studentName,
    className: `Class ${classNumber}`,
    section,
    hostel,
    status: isInactive ? "INACTIVE" : "ACTIVE",
    createdAt,
    updatedAt: lastLogin ?? createdAt,
    lastLogin,
    lastCall,
  });

  relationships.forEach((relationship, relationIndex) => {
    generatedContacts.push({
      id: `contact_${pad(sequence)}_${relationIndex + 1}`,
      studentId: studentKey,
      name: relationship === "Guardian" && sequence % 5 === 0 ? "EMRS Hat Gamharia Office" : parentNameAt(index, relationship),
      relationship,
      phoneNumber: relationship === "Guardian" && sequence % 5 === 0 ? "+918674943374" : `+9199${(10000000 + sequence * 37 + relationIndex * 211).toString().slice(0, 8)}`,
      isActive: relationIndex < 2 || sequence % 9 === 0,
      displayOrder: relationIndex + 1,
      label: relationship === "Father" ? "Primary Guardian" : relationship === "Mother" ? "Parent / Guardian" : "Approved School Contact",
      createdAt,
      updatedAt: createdAt,
    });
  });

  generatedAlerts.push({
    id: `alert_${pad(sequence)}`,
    studentId: studentKey,
    title: sequence % 4 === 0 ? "Calling facility active" : "Hat Gamharia contact update",
    message:
      sequence % 4 === 0
        ? `Calling facility is available for ${studentName} during the scheduled hostel hours.`
        : `Approved contact information for ${studentName} has been refreshed in the demo system.`,
    type: sequence % 6 === 0 ? "SECURITY" : sequence % 4 === 0 ? "SUCCESS" : "INFO",
    isRead: sequence % 3 === 0,
    createdAt: isoAt(3000 + index * 9),
    updatedAt: isoAt(3000 + index * 9),
  });

  generatedAuditLogs.push({
    id: `audit_login_${pad(sequence)}`,
    actorUserId: userKey,
    action: "STUDENT_LOGIN",
    description: `${studentName} logged into the secured calling portal.`,
    timestamp: lastLogin ?? createdAt,
    metadata: { studentId: studentKey, className: `Class ${classNumber}` },
  });

  if (sequence <= 180) {
    const contactId = `contact_${pad(sequence)}_${(sequence % 3) + 1}`;
    const callId = `call_${pad(sequence)}`;
    const startedAt = isoAt(3600 + index * 13);
    const connectedAt = isoAt(3601 + index * 13);
    const durationSeconds = 60 + ((sequence * 23) % 420);
    const endedAt = new Date(new Date(connectedAt).getTime() + durationSeconds * 1000).toISOString();

    generatedCalls.push({
      id: callId,
      studentId: studentKey,
      contactId,
      status: sequence % 12 === 0 ? "CANCELLED" : "COMPLETED",
      mode: "SIMULATED",
      startedAt,
      connectedAt: sequence % 12 === 0 ? undefined : connectedAt,
      endedAt,
      durationSeconds: sequence % 12 === 0 ? 0 : durationSeconds,
    });

    generatedAuditLogs.push({
      id: `audit_call_${pad(sequence)}`,
      actorUserId: userKey,
      action: sequence % 12 === 0 ? "CALL_CANCELLED" : "CALL_COMPLETED",
      description: sequence % 12 === 0 ? `${studentName} cancelled a simulated call.` : `${studentName} completed a simulated call.`,
      timestamp: endedAt,
      metadata: { studentId: studentKey, contactId, durationSeconds },
    });
  }
}

generatedAuditLogs.unshift({
  id: "audit_admin_001",
  actorUserId: "user_admin_001",
  action: "ADMIN_LOGIN",
  description: "Admin logged into the demo application.",
  timestamp: "2026-08-10T08:30:00.000Z",
  metadata: { role: "ADMIN" },
});

export const generatedDemoUsers = generatedUsers;
export const generatedDemoStudents = generatedStudents;
export const generatedDemoContacts = generatedContacts;
export const generatedDemoCalls = generatedCalls.sort((left, right) => right.startedAt.localeCompare(left.startedAt));
export const generatedDemoAlerts = generatedAlerts.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
export const generatedDemoAuditLogs = generatedAuditLogs.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
