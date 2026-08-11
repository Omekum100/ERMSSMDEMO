import { mockSchool } from "@/data/mockSchool";
import type { SchoolMetadata } from "@/types/school";

export const schoolScale: SchoolMetadata = {
  ...mockSchool,
  totalStudents: 300,
  totalBoys: 150,
  totalGirls: 150,
};
