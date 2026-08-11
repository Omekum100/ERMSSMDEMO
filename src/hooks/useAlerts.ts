import { useApp } from "@/context/AppContext";

export function useAlerts() {
  const { alerts } = useApp();
  return alerts;
}

