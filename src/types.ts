export enum UserRole {
  PATIENT = "patient",
  STAFF = "staff",
  ADMIN = "admin",
  DOCTOR = "doctor",
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  phoneNumber?: string;
  specialty?: string; // For doctors
  bio?: string;
  photoURL?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  category: "staff" | "client" | "continuing-education";
}

export interface FormSubmission {
  id: string;
  userId: string;
  formType: "intake" | "type" | "sop" | "lead";
  data: any;
  submittedAt: string;
  status: "pending" | "reviewed" | "archived";
}

export interface TourBooking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  status: "pending" | "confirmed";
}
