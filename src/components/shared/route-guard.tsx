"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function RouteGuard({ role, children }: { role?: "ADMIN" | "STUDENT"; children: React.ReactNode }) {
  const { currentUser, isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role && currentUser?.role !== role) {
      router.replace(currentUser?.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [currentUser, isAuthenticated, isReady, role, router, pathname]);

  if (!isReady) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading secure session...</div>;
  }

  if (!isAuthenticated) return null;
  if (role && currentUser?.role !== role) return null;
  return <>{children}</>;
}

