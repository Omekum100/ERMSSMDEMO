import { useApp } from "@/context/AppContext";

export function useCalls() {
  const { calls } = useApp();
  return calls;
}

