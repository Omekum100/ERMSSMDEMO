"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookUser, History, LayoutDashboard, LogOut, Menu, Phone, Settings, Shield, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TribalMotif } from "@/components/shared/tribal-motif";
import { mockSchool } from "@/data/mockSchool";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { formatDuration } from "@/lib/utils";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/contacts", label: "Contacts", icon: BookUser },
  { href: "/admin/calls", label: "Call History", icon: Phone },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/activity", label: "Activity Logs", icon: History },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/history", label: "Call History", icon: Phone },
  { href: "/student/alerts", label: "Alerts", icon: Bell },
];

export function AppShell({ children, role }: { children: React.ReactNode; role: "ADMIN" | "STUDENT" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { calls, contacts } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showStudentSummary, setShowStudentSummary] = useState(false);

  const items = role === "ADMIN" ? adminNav : studentNav;
  const studentSummary = useMemo(() => {
    if (role !== "STUDENT" || !currentUser?.studentId) return null;
    const studentCalls = calls.filter((call) => call.studentId === currentUser.studentId);
    const latestCall = studentCalls[0];
    const latestContact = contacts.find((contact) => contact.id === latestCall?.contactId);
    return {
      callsMade: studentCalls.length,
      lastContact: latestContact?.relationship ?? "—",
      lastCall: formatDuration(latestCall?.durationSeconds),
      sessionDuration: "18 minutes",
    };
  }, [calls, contacts, currentUser, role]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (role === "STUDENT") {
      setShowStudentSummary(true);
      return;
    }
    logout();
  };

  return (
    <div className="min-h-screen bg-surface tribal-grid">
      <div className="flex min-h-screen">
        <aside className={`tribal-sidebar fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 px-5 py-6 text-white transition md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <TribalMotif className="tribal-motif right-[-40px] top-10 h-40 w-40 animate-drift text-amber-100" />
          <div className="relative z-10 mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100">{mockSchool.shortName}</p>
            <h1 className="mt-2 text-xl font-semibold">Secured Calling System</h1>
            <p className="mt-2 text-sm text-orange-50/80">{mockSchool.village}, {mockSchool.block}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-orange-50 backdrop-blur-sm">
              <p className="font-semibold">Demo Simulation Mode</p>
              <p className="mt-1 text-orange-100/80">Frontend-only POC with tribal-inspired Hat Gamharia theme.</p>
            </div>
          </div>
          <nav className="relative z-10 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-[#f8f4ee] text-tribal-charcoal shadow-sm" : "text-orange-50 hover:bg-white/10"}`} onClick={() => setIsOpen(false)}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button onClick={() => setShowLogoutConfirm(true)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-orange-50 transition hover:bg-white/10">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>

        <div className="flex-1 md:ml-0">
          <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
            <div className="tribal-divider h-[3px] w-full" />
            <div className="flex items-center justify-between px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button className="rounded-xl border border-line bg-white p-2 md:hidden" onClick={() => setIsOpen((value) => !value)}>
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8f6a46]">Protected Demo Panel</p>
                  <h2 className="text-lg font-semibold text-slate-900">{role === "ADMIN" ? "Administration Console" : "Student Calling Console"}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-[#fbf7f1] px-4 py-2 shadow-sm">
                <Shield className="h-4 w-4 text-tribal-clay" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{currentUser?.username}</p>
                  <p className="text-xs text-slate-500">{role} • {mockSchool.shortName}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>

      <Modal open={showLogoutConfirm} title="Logout" onClose={() => setShowLogoutConfirm(false)}>
        <p className="text-sm text-slate-600">Are you sure you want to logout?</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button className="bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </Modal>

      <Modal open={showStudentSummary} title="Session Summary" onClose={() => setShowStudentSummary(false)}>
        <div className="space-y-3 text-sm text-slate-700">
          <p><span className="font-semibold">Student:</span> {currentUser?.username}</p>
          <p><span className="font-semibold">Calls made:</span> {studentSummary?.callsMade ?? 0}</p>
          <p><span className="font-semibold">Last contact:</span> {studentSummary?.lastContact ?? "—"}</p>
          <p><span className="font-semibold">Last call:</span> {studentSummary?.lastCall ?? "—"}</p>
          <p><span className="font-semibold">Session duration:</span> {studentSummary?.sessionDuration ?? "—"}</p>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            onClick={() => {
              setShowStudentSummary(false);
              logout();
              router.push("/login");
            }}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
}
