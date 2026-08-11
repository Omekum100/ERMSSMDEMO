"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Student } from "@/types/student";

export function StudentPicker({
  students,
  value,
  onChange,
  allowAll = false,
  label,
  allLabel = "All Students",
}: {
  students: Student[];
  value: string;
  onChange: (value: string) => void;
  allowAll?: boolean;
  label: string;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = students.find((student) => student.id === value);
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return students.filter((student) =>
      [student.fullName, student.studentId, student.className, student.section, student.hostel]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, students]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 focus:border-brand-500"
      >
        <span className="truncate">
          {value === "ALL" && allowAll
            ? allLabel
            : selected
              ? `${selected.fullName} â€¢ ${selected.studentId} â€¢ ${selected.className}`
              : label}
        </span>
        <Search className="h-4 w-4 text-slate-400" />
      </button>
      <Modal open={open} title={label} onClose={() => setOpen(false)} width="max-w-2xl">
        <div className="space-y-4">
          <Input placeholder="Search by name, student ID, class, hostel" value={query} onChange={(event) => setQuery(event.target.value)} />
          {allowAll ? (
            <button
              type="button"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                onChange("ALL");
                setOpen(false);
              }}
            >
              {allLabel}
            </button>
          ) : null}
          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {filtered.map((student) => (
              <button
                key={student.id}
                type="button"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                onClick={() => {
                  onChange(student.id);
                  setOpen(false);
                }}
              >
                <p className="text-sm font-semibold text-slate-900">{student.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {student.studentId} â€¢ {student.className} {student.section} â€¢ {student.hostel}
                </p>
              </button>
            ))}
            {!filtered.length ? <p className="py-8 text-center text-sm text-slate-500">No students found.</p> : null}
          </div>
          <div className="flex justify-end">
            <Button className="bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
