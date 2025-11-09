export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface ServicePrice {
  serviceName: string;
  price: number;
}

export interface MillingCenter {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Technician {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  skills: string[];
  // Fix: Added pricing to Technician type to be used across the app.
  pricing: ServicePrice[];
}

export enum CaseStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  READY_FOR_REVIEW = 'Ready for Review',
  FINISHED = 'Finished',
  NEEDS_EDIT = 'Needs Edit',
  MILLED = 'Milled',
  DELIVERED = 'Delivered',
}

export type CasePriority = 'Normal' | 'Urgent';

export interface CaseFile {
  id: string;
  name: string;
  url: string; // Simulated file URL
  previewUrl?: string; // For image previews
  uploadedById: string;
  uploadedByName: string;
}

export interface CaseNote {
  id:string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export type AuditLogType = 'creation' | 'status_change' | 'note' | 'file_change' | 'general';

export interface AuditLog {
    id: string;
    timestamp: string;
    activity: string;
    authorName: string;
    type: AuditLogType;
}

export interface Order {
    serviceName: string;
    price: number;
    quantity: number;
    teeth: string[];
}

export interface Case {
  id: string;
  caseName: string;
  dueDate: string;
  technicianId: string;
  status: CaseStatus;
  priority: CasePriority;
  files: CaseFile[];
  notes: CaseNote[];
  createdAt: string;
  orders: Order[];
  activityLog: AuditLog[];
  completedAt?: string;
  doctor: string;
  branch: string;
  color?: string;
}

export interface Payment {
  id: string;
  technicianId: string;
  amount: number;
  date: string;
  caseIds: string[];
}

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    link: string;
    recipientId?: string;
}