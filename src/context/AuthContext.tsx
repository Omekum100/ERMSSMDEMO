"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession, saveSession } from "@/lib/storage";
import { createAuditEntry, studentRepository, userRepository } from "@/lib/mockRepository";
import { todayIso } from "@/lib/utils";
import type { AuthSession, User } from "@/types/user";

type LoginPayload = {
  username: string;
  password: string;
  securityCode: string;
};

type AuthContextValue = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (payload: LoginPayload) => { success: boolean; message: string; role?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = loadSession();
    if (session) {
      const user = userRepository.getById(session.userId) ?? null;
      setCurrentUser(user);
    }
    setIsReady(true);
  }, []);

  const login = ({ username, password, securityCode }: LoginPayload) => {
    const user = userRepository.getByUsername(username);
    if (!user || !user.isActive) {
      return { success: false, message: "Invalid demo credentials or account inactive." };
    }
    if (user.password !== password || user.securityCode !== securityCode) {
      return { success: false, message: "Username, password, or security code is incorrect." };
    }
    if (user.role === "STUDENT" && user.studentId) {
      studentRepository.update(user.studentId, { lastLogin: todayIso() });
    }
    const updatedUser = userRepository.update(user.id, { lastLogin: todayIso() }) ?? user;
    const session: AuthSession = { userId: user.id, role: user.role, loginAt: todayIso() };
    saveSession(session);
    setCurrentUser(updatedUser);
    createAuditEntry(
      user.id,
      user.role === "ADMIN" ? "ADMIN_LOGIN" : "STUDENT_LOGIN",
      user.role === "ADMIN" ? "Admin logged into the demo application." : `${username} logged into the secured calling portal.`,
      { studentId: user.studentId },
    );
    router.push(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    return { success: true, message: "Login successful.", role: user.role };
  };

  const logout = () => {
    if (currentUser) {
      createAuditEntry(
        currentUser.id,
        currentUser.role === "ADMIN" ? "ADMIN_LOGOUT" : "STUDENT_LOGOUT",
        currentUser.role === "ADMIN" ? "Admin logged out of the demo application." : `${currentUser.username} logged out of the secured calling portal.`,
        { studentId: currentUser.studentId },
      );
    }
    saveSession(null);
    setCurrentUser(null);
    router.push("/login");
  };

  const value: AuthContextValue = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isReady,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
