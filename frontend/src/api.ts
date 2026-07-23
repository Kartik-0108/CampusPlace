import { User, StudentProfile, CompanyProfile, Job, Application, Interview, AnalyticsStats, Department, Notification } from './types.ts';

const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api';
  }
  // If the user specified a custom URL but did not include '/api' at the end, append it
  if (!envUrl.endsWith('/api') && !envUrl.endsWith('/api/')) {
    return envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
  }
  return envUrl;
};

const API_BASE = getApiBase();

// Retrieve token/userId from localStorage
export function getSavedToken(): string | null {
  return localStorage.getItem('spms_token');
}

export function saveToken(userId: string): void {
  localStorage.setItem('spms_token', userId);
}

export function removeToken(): void {
  localStorage.removeItem('spms_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getSavedToken();
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data: any = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      console.error('Error parsing JSON response', e);
      data = { message: 'Failed to parse server response as JSON' };
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text || 'An error occurred during the request.' };
    } catch (e) {
      data = { message: 'An error occurred during the request.' };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during the request.');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password?: string) => 
    request<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'password' }), // default to 'password' for sandbox accounts for backwards compatibility
    }),

  register: (payload: { email: string; password?: string; name: string; role: 'student' | 'company' | 'admin'; details?: any }) =>
    request<{ success: boolean; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    request<{ success: boolean; user: User; profile: any }>('/auth/me'),

  // Departments
  getDepartments: () =>
    request<{ success: boolean; departments: Department[] }>('/departments'),
  createDepartment: (payload: { name: string; code: string }) =>
    request<{ success: boolean; department: Department }>('/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteDepartment: (id: string) =>
    request<{ success: boolean }>(`/departments/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () =>
    request<{ success: boolean; notifications: Notification[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    }),

  // Students
  getStudents: (filters?: { minCgpa?: number; department?: string; placedStatus?: string }) => {
    const params = new URLSearchParams();
    if (filters?.minCgpa) params.set('minCgpa', filters.minCgpa.toString());
    if (filters?.department) params.set('department', filters.department);
    if (filters?.placedStatus) params.set('placedStatus', filters.placedStatus);
    return request<{ success: boolean; students: StudentProfile[] }>(`/students?${params.toString()}`);
  },

  getStudentProfile: (userId: string) =>
    request<{ success: boolean; student: StudentProfile }>(`/students/${userId}`),

  updateStudentProfile: (userId: string, profile: Partial<StudentProfile>) =>
    request<{ success: boolean; student: StudentProfile }>(`/students/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  // Companies
  getCompanies: () =>
    request<{ success: boolean; companies: CompanyProfile[] }>('/companies'),

  approveCompany: (userId: string) =>
    request<{ success: boolean; company: CompanyProfile }>(`/companies/${userId}/approve`, {
      method: 'PUT',
    }),

  // Jobs / Drives
  getJobs: () =>
    request<{ success: boolean; jobs: Job[] }>('/jobs'),

  postJob: (job: Omit<Job, 'id' | 'companyId' | 'companyName' | 'postedDate' | 'status'>) =>
    request<{ success: boolean; job: Job }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    }),

  updateJob: (id: string, updates: Partial<Job>) =>
    request<{ success: boolean; job: Job }>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Applications
  getApplications: () =>
    request<{ success: boolean; applications: Application[] }>('/applications'),

  applyJob: (jobId: string) =>
    request<{ success: boolean; application: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    }),

  updateApplicationStatus: (id: string, status: string, remarks?: string) =>
    request<{ success: boolean; application: Application }>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks }),
    }),

  // Interviews
  getInterviews: () =>
    request<{ success: boolean; interviews: Interview[] }>('/interviews'),

  scheduleInterview: (payload: { applicationId: string; dateTime: string; mode: 'Online' | 'In-Person'; linkOrVenue: string }) =>
    request<{ success: boolean; interview: Interview }>('/interviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateInterview: (id: string, updates: Partial<Interview>) =>
    request<{ success: boolean; interview: Interview }>(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Analytics
  getAnalytics: () =>
    request<{ success: boolean; stats: AnalyticsStats }>('/analytics'),
};
