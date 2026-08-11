"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { currentUser, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    router.replace(currentUser.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
  }, [currentUser, isReady, router]);

  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Launching EMRS secure portal...</div>;
}

