"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TribalMotif } from "@/components/shared/tribal-motif";
import { mockSchool } from "@/data/mockSchool";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { notify } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");

  const fillDemoCredentials = (role: "admin" | "student") => {
    const credentials = role === "admin"
      ? { username: "admin", password: "Admin@123", securityCode: "123456" }
      : { username: "raj001", password: "Student@123", securityCode: "111111" };

    setUsername(credentials.username);
    setPassword(credentials.password);
    setSecurityCode(credentials.securityCode);
  };

  const submit = () => {
    const result = login({ username, password, securityCode });
    notify({ title: result.success ? "Access granted" : "Login failed", description: result.message, variant: result.success ? "success" : "error" });
  };

  return (
    <div className="flex min-h-screen items-center bg-surface px-4 py-6 tribal-grid lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="tribal-hero relative h-full overflow-hidden rounded-[28px] p-8 text-white shadow-tribal lg:p-12">
          <TribalMotif className="tribal-motif right-[-20px] top-8 h-52 w-52 animate-drift text-amber-100" />
          <TribalMotif className="tribal-motif bottom-[-20px] left-[-10px] h-44 w-44 text-orange-100" />
          <div className="relative z-10 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" /> Demo Authentication
          </div>
          <div className="relative z-10 mt-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-100">{mockSchool.shortName}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">Secured Telephone Calling System</h1>
            <p className="mt-5 max-w-xl text-orange-50/90">
              A refined, school-specific proof of concept with quiet inspiration from Jharkhand mural traditions and earthy institutional tones.
            </p>
          </div>
          <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-orange-50 backdrop-blur-sm">
            <p><span className="font-semibold">Address:</span> Village {mockSchool.village}, Panchayat {mockSchool.panchayat}, Block {mockSchool.block}, PIN {mockSchool.pinCode}</p>
            <p className="mt-2"><span className="font-semibold">Contact:</span> {mockSchool.phone} • {mockSchool.email}</p>
            <p className="mt-2"><span className="font-semibold">Published School Stats:</span> {mockSchool.totalStudents} students ({mockSchool.totalBoys} boys, {mockSchool.totalGirls} girls)</p>
          </div>
          <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold">Admin Console</p>
              <p className="mt-2 text-sm text-orange-100/90">Manage students, contacts, alerts, audit logs, and demo data reset for Hat Gamharia.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold">Student Calling Panel</p>
              <p className="mt-2 text-sm text-orange-100/90">Select approved contacts, simulate calls, and review secure activity.</p>
            </div>
          </div>
        </div>
        <Card className="flex h-full flex-col justify-center border-[#e5d4bc] p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f6a46]">Protected Access</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Login to {mockSchool.shortName}</h2>
          <p className="mt-2 text-sm text-slate-500">Use demo credentials only. This POC has no real backend authentication.</p>
          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter username" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Security Code</label>
              <Input value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} placeholder="6-digit code" />
            </div>
            <Button className="w-full" onClick={submit}>Login</Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                className="w-full border border-[#d7b892] bg-white text-[#7b4b2a] shadow-none hover:bg-[#fbf7f1]"
                onClick={() => fillDemoCredentials("admin")}
                type="button"
              >
                Fill Admin Demo
              </Button>
              <Button
                className="w-full border border-[#d7b892] bg-white text-[#7b4b2a] shadow-none hover:bg-[#fbf7f1]"
                onClick={() => fillDemoCredentials("student")}
                type="button"
              >
                Fill Student Demo
              </Button>
            </div>
            <div className="rounded-xl border border-dashed border-line bg-[#fbf7f1] p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Demo Credentials</p>
              <p className="mt-2">Admin - admin / Admin@123 / 123456</p>
              <p className="mt-1">Student - raj001 / Student@123 / 111111</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
