import type { StudentStatus } from "@/types/user";

export type Student = {
  id: string;
  userId: string;
  studentId: string;
  fullName: string;
  className: string;
  section: string;
  hostel: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lastCall?: string;
};

