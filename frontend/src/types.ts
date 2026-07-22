export type UserRole = 'student' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  passwordHash?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string; // e.g., 'CT', 'IT', 'CE'
}

export interface StudentProfile {
  userId: string;
  name: string;
  email: string;
  rollNumber: string;
  departmentId: string; // Foreign key
  department?: string; // Legacy / populated name
  cgpa: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  backlogs: number;
  skills: string[];
  projects: {
    title: string;
    description: string;
    url?: string;
  }[];
  resumeUrl: string;
  placedStatus: 'Unplaced' | 'Placed';
  placementCompany?: string;
  placementPackage?: number; // LPA
}

export interface CompanyProfile {
  userId: string;
  name: string;
  email: string;
  industry: string;
  website: string;
  location: string;
  description: string;
  isApproved: boolean;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string; // Rich text
  requirements: string[];
  cgpaCutoff: number;
  backlogsAllowed: number;
  allowedDepartments: string[]; // Array of Department IDs
  allowedGraduationYears?: string[];
  packageAmount: number; // LPA
  jobType: 'Full-Time' | 'Internship' | 'Intern + Full-Time';
  location: string;
  workMode?: 'On-Site' | 'Remote' | 'Hybrid';
  postedDate: string;
  lastDateToApply: string;
  selectionProcess?: string;
  numberOfRounds?: number;
  hrContact?: string;
  status: 'Draft' | 'Open' | 'Closed' | 'Completed';
  applicationCount?: number;
}

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Assessment' | 'Interview' | 'HR Round' | 'Offer' | 'Placed' | 'Rejected';

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentDepartment: string;
  studentCgpa: number;
  studentResumeUrl: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  appliedDate: string;
  status: ApplicationStatus;
  remarks?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  dateTime: string;
  mode: 'Online' | 'In-Person';
  linkOrVenue: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  placementPercentage: number;
  averagePackage: number;
  highestPackage: number;
  departmentStats: {
    department: string;
    total: number;
    placed: number;
    averagePackage: number;
  }[];
  companyStats: {
    companyName: string;
    recruitedCount: number;
    packageAmount: number;
  }[];
  recentPlacements: {
    studentName: string;
    department: string;
    companyName: string;
    packageAmount: number;
  }[];
}
