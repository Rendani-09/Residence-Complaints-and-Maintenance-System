export type UserRole = 'student' | 'admin';

export type ComplaintStatus = 'Pending' | 'Assigned' | 'Completed';
export type ComplaintCategory = 'Structural' | 'Electrical' | 'Plumbing' | 'Hygiene';
export type Priority = 'Low' | 'Medium' | 'High';
export type LocationType = 'Room' | 'Facility';
export type Facility = 'Kitchen' | 'Toilet' | 'Shower' | 'Laundry';

export interface User {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  studentNumber?: string;
  role: UserRole;
}

export interface Contractor {
  id: string;
  name: string;
  specialty: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  block: string;
  locationType: LocationType;
  room?: number;
  facility?: Facility;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  dateSubmitted: string;
  studentId: string;
  studentName: string;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string[];
}

export const BLOCKS = [
  ...Array.from({ length: 22 }, (_, i) => `Block ${String(i + 1).padStart(2, '0')}`),
  'Block 23 (Laundry)',
];

export const ROOMS = Array.from({ length: 10 }, (_, i) => i + 1);
export const FACILITIES: Facility[] = ['Kitchen', 'Toilet', 'Shower', 'Laundry'];
export const CATEGORIES: ComplaintCategory[] = ['Structural', 'Electrical', 'Plumbing', 'Hygiene'];
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
