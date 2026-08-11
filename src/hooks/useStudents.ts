import { useApp } from "@/context/AppContext";

export function useStudents() {
  const { students } = useApp();
  return students;
}

