import { apiRequest } from './api';

export interface KehadiranRecord {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  time?: string;
  notes?: string;
  walasId?: number;
  walasName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KehadiranResponse {
  success?: boolean;
  message?: string;
  data: KehadiranRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface KehadiranStats {
  totalRecords: number;
  totalHadir: number;
  totalSakit: number;
  totalIzin: number;
  totalAlpa: number;
  attendancePercentage: number;
}

/**
 * Get all kehadiran records dengan optional filters
 * GET /kehadiran
 */
export async function getAttendanceRecords(
  filters?: {
    start_date?: string;
    end_date?: string;
    student_id?: number;
    class_name?: string;
    status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<KehadiranResponse> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_name) params.append('class_name', filters.class_name);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/kehadiran${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get kehadiran by student ID
 * GET /kehadiran/student/:studentId
 */
export async function getAttendanceByStudent(
  studentId: number,
  filters?: {
    start_date?: string;
    end_date?: string;
    status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<KehadiranResponse> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/kehadiran/student/${studentId}${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get kehadiran by class
 * GET /kehadiran/class/:className
 */
export async function getAttendanceByClass(
  className: string,
  filters?: {
    start_date?: string;
    end_date?: string;
    status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<KehadiranResponse> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/kehadiran/class/${className}${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get kehadiran statistics
 * GET /kehadiran/stats
 */
export async function getAttendanceStatistics(
  filters?: {
    start_date?: string;
    end_date?: string;
    student_id?: number;
    class_name?: string;
  },
  token?: string | null
): Promise<KehadiranStats> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_name) params.append('class_name', filters.class_name);

  return apiRequest(
    `/v1/kehadiran/stats${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Sync kehadiran dari Walas API
 * POST /kehadiran/sync
 */
export async function syncAttendanceFromWalas(
  startDate: string,
  endDate: string,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kehadiran/sync?start_date=${startDate}&end_date=${endDate}`,
    'POST',
    undefined,
    token
  );
}

/**
 * Create new kehadiran record
 * POST /kehadiran
 */
export async function createKehadiran(
  data: {
    studentId: number;
    studentName: string;
    className: string;
    date: string;
    status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    time?: string;
    notes?: string;
    walasId?: number;
    walasName?: string;
  },
  token?: string | null
): Promise<KehadiranRecord> {
  return apiRequest('/v1/kehadiran', 'POST', data, token);
}

/**
 * Update kehadiran record
 * PATCH /kehadiran/:id
 */
export async function updateKehadiran(
  id: number,
  data: {
    status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    time?: string;
    notes?: string;
  },
  token?: string | null
): Promise<KehadiranRecord> {
  return apiRequest(`/v1/kehadiran/${id}`, 'PATCH', data, token);
}

/**
 * Delete kehadiran record
 * DELETE /kehadiran/:id
 */
export async function deleteKehadiran(id: number, token?: string | null): Promise<void> {
  return apiRequest(`/v1/kehadiran/${id}`, 'DELETE', undefined, token);
}
