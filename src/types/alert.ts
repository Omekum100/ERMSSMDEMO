export type AlertType = "INFO" | "WARNING" | "SUCCESS" | "SECURITY";

export type Alert = {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: AlertType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

