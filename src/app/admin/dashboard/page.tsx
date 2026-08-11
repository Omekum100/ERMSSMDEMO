"use client";

import { Bell, BookUser, Phone, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { mockSchool } from "@/data/mockSchool";
import { useApp } from "@/context/AppContext";

export default function AdminDashboardPage() {
  const { students, calls, alerts, auditLogs, contacts } = useApp();
  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student.status === "ACTIVE").length;
  const inactiveStudents = totalStudents - activeStudents;
  const today = new Date().toDateString();
  const callsToday = calls.filter((call) => new Date(call.startedAt).toDateString() === today).length;
  const unreadAlerts = alerts.filter((alert) => !alert.isRead).length;

  const recentCalls = calls.slice(0, 5);
  const recentActivity = auditLogs.slice(0, 6);

  const stats = [
    { label: "POC Student Records", value: totalStudents, icon: Users },
    { label: "School Capacity", value: mockSchool.totalStudents, icon: Users },
    { label: "Active Students", value: activeStudents, icon: Users },
    { label: "Calls Today", value: callsToday, icon: Phone },
    { label: "Total Calls", value: calls.length, icon: Phone },
    { label: "Unread Alerts", value: unreadAlerts, icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">School-specific administration console for {mockSchool.shortName}.</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Dashboard</h1>
      </div>

      <Card className="border-brand-100 bg-brand-50">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-brand-900">{mockSchool.name}</p>
            <p className="mt-2 text-sm text-brand-700">Village: {mockSchool.village}, Panchayat: {mockSchool.panchayat}, Block: {mockSchool.block}, District: {mockSchool.district}, PIN: {mockSchool.pinCode}</p>
            <p className="mt-2 text-sm text-brand-700">Phone: {mockSchool.phone} Ã¢â‚¬Â¢ Email: {mockSchool.email}</p>
          </div>
          <div><p className="text-xs uppercase tracking-[0.25em] text-brand-700">Boys</p><p className="mt-2 text-3xl font-semibold text-brand-900">{mockSchool.totalBoys}</p></div>
          <div><p className="text-xs uppercase tracking-[0.25em] text-brand-700">Girls</p><p className="mt-2 text-3xl font-semibold text-brand-900">{mockSchool.totalGirls}</p></div>
          <div><p className="text-xs uppercase tracking-[0.25em] text-brand-700">Principal In-Charge</p><p className="mt-2 text-xl font-semibold text-brand-900">{mockSchool.principalInCharge}</p></div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Calls</h2>
            <Link href="/admin/calls" className="text-sm font-medium text-brand-700">View all</Link>
          </div>
          {recentCalls.length ? (
            <div className="space-y-3">
              {recentCalls.map((call) => {
                const student = students.find((item) => item.id === call.studentId);
                const contact = contacts.find((item) => item.id === call.contactId);
                return (
                  <div key={call.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{student?.fullName ?? "Unknown student"}</p>
                        <p className="text-sm text-slate-500">{contact?.relationship} Ã¢â‚¬Â¢ {contact?.name}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-500">{call.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No calls yet" description="Simulated call activity will appear here." />
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              <Plus className="h-5 w-5 text-brand-700" />
            </div>
            <div className="grid gap-3">
              <Link href="/admin/students" className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Add Student / View Students</Link>
              <Link href="/admin/calls" className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50">View Call History</Link>
              <Link href="/admin/contacts" className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Manage Contacts</Link>
              <Link href="/admin/alerts" className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Create Alerts</Link>
            </div>
          </Card>
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Student Activity</h2>
              <BookUser className="h-5 w-5 text-brand-700" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-900">{item.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

