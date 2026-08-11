import { useApp } from "@/context/AppContext";

export function useContacts() {
  const { contacts } = useApp();
  return contacts;
}

