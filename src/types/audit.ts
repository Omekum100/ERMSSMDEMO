export type AuditAction =
  | "ADMIN_LOGIN"
  | "ADMIN_LOGOUT"
  | "STUDENT_LOGIN"
  | "STUDENT_LOGOUT"
  | "STUDENT_CREATED"
  | "STUDENT_UPDATED"
  | "STUDENT_DELETED"
  | "STUDENT_DEACTIVATED"
  | "CONTACT_CREATED"
  | "CONTACT_UPDATED"
  | "CONTACT_DELETED"
  | "LOGIN_CODE_RESET"
  | "CALL_INITIATED"
  | "CALL_CONNECTED"
  | "CALL_COMPLETED"
  | "CALL_CANCELLED"
  | "ALERT_CREATED"
  | "ALERT_UPDATED"
  | "ALERT_DELETED"
  | "ALERT_READ"
  | "DEMO_DATA_RESET";

export type AuditLog = {
  id: string;
  actorUserId: string;
  action: AuditAction;
  description: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | undefined>;
};

