export type UserRole = "ADMIN" | "STUDENT";

export type StudentStatus = "ACTIVE" | "INACTIVE";

export type User = {
  id: string;
  username: string;
  password: string;
  securityCode: string;
  role: UserRole;
  isActive: boolean;
  studentId?: string;
  createdAt: string;
  lastLogin?: string;
};

export type AuthSession = {
  userId: string;
  role: UserRole;
  loginAt: string;
};

