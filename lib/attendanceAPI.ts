import { apiRequest } from './api';

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  status: 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa
  notes?: string;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get attendance records
 */
export async function getAttendanceRecords(
  filters?: {
    student_id?: number;
    class_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<AttendanceResponse> {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_id) params.append('class_id', filters.class_id.toString());
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/kesiswaan/attendance${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get attendance summary
 */
export async function getAttendanceSummary(
  studentId: number,
  month?: string,
  token?: string | null
): Promise<any> {
  const params = new URLSearchParams();
  if (month) params.append('month', month);

  return apiRequest(
    `/v1/kesiswaan/attendance/${studentId}/summary${
      params.toString() ? `?${params.toString()}` : ''
    }`,
    'GET',
    undefined,
    token
  );
}

/**
 * Sync attendance from Walas (Admin action)
 */
export async function syncAttendanceFromWalas(
  startDate: string,
  endDate: string,
  forceSync?: boolean,
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/attendance/sync',
    'POST',
    {
      start_date: startDate,
      end_date: endDate,
      force_sync: forceSync || false,
    },
    token
  );
}

/**
 * Get attendance history
 */
export async function getAttendanceHistory(
  studentId: number,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/attendance/${studentId}/history`,
    'GET',
    undefined,
    token
  );
}
