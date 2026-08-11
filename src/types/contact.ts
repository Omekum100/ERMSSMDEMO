export type ContactRelationship =
  | "Father"
  | "Mother"
  | "Brother"
  | "Sister"
  | "Guardian"
  | "Company"
  | "Other Approved Contact";

export type Contact = {
  id: string;
  studentId: string;
  name: string;
  relationship: ContactRelationship;
  phoneNumber: string;
  isActive: boolean;
  displayOrder: number;
  label: string;
  createdAt: string;
  updatedAt: string;
};

