export type CallStatus =
  | "INITIATED"
  | "RINGING"
  | "CONNECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export type CallRecord = {
  id: string;
  studentId: string;
  contactId: string;
  status: CallStatus;
  mode: "SIMULATED";
  startedAt: string;
  connectedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
};

