"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DirectoryPagination({ page, totalItems, pageSize, onPageChange }: { page: number; totalItems: number; pageSize: number; onPageChange: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = totalItems ? (safePage - 1) * pageSize + 1 : 0;
  const end = Math.min(safePage * pageSize, totalItems);
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><span>Showing {start}–{end} of {totalItems}</span><div className="flex items-center gap-2"><span>Page {safePage} of {totalPages}</span><Button className="bg-slate-200 px-3 text-slate-800 hover:bg-slate-300" disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button><Button className="bg-slate-200 px-3 text-slate-800 hover:bg-slate-300" disabled={safePage === totalPages} onClick={() => onPageChange(safePage + 1)}>Next <ChevronRight className="h-4 w-4" /></Button></div></div>;
}
