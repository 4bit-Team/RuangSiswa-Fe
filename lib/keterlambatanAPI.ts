import { apiRequest } from './api';

export interface KeterlambatanRecord {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  time: string;
  minutesLate: number;
  reason?: string;
  status: 'recorded' | 'verified' | 'appealed' | 'resolved';
  walasId?: number;
  walasName?: string;
  verificationNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KeterlambatanResponse {
  success?: boolean;
  message?: string;
  data: KeterlambatanRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface KeterlambatanStats {
  totalTardiness: number;
  totalMinutesLate: number;
  averageMinutes: number;
  resolvedCount: number;
  unresolvedCount: number;
}

/**
 * Get all keterlambatan records dengan optional filters
 * GET /keterlambatan
 */
export async function getTardinessRecords(
  filters?: {
    start_date?: string;
    end_date?: string;
    student_id?: number;
    class_name?: string;
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<KeterlambatanResponse> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_name) params.append('class_name', filters.class_name);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/keterlambatan${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get keterlambatan by student ID
 * GET /keterlambatan/student/:studentId
 */
export async function getTardinessByStudent(
  studentId: number,
  filters?: {
    start_date?: string;
    end_date?: string;
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<KeterlambatanResponse> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/keterlambatan/student/${studentId}${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get keterlambatan by class
 * GET /keterlambatan/class/:className
 */
export async function getTardinessbyClass(
  className: string,
  filters?: {
    start_date?: string;
    end_date?: string;
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<KeterlambatanResponse> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/keterlambatan/class/${className}${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get keterlambatan statistics
 * GET /keterlambatan/stats
 */
export async function getTardinessStatistics(
  filters?: {
    start_date?: string;
    end_date?: string;
    student_id?: number;
    class_name?: string;
  },
  token?: string | null
): Promise<KeterlambatanStats> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_name) params.append('class_name', filters.class_name);

  return apiRequest(
    `/v1/keterlambatan/stats${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Sync keterlambatan dari Walas API
 * POST /keterlambatan/sync
 */
export async function syncTardinessFromWalas(
  startDate: string,
  endDate: string,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/keterlambatan/sync?start_date=${startDate}&end_date=${endDate}`,
    'POST',
    undefined,
    token
  );
}

/**
 * Create new keterlambatan record
 * POST /keterlambatan
 */
export async function createKeterlambatan(
  data: {
    studentId: number;
    studentName: string;
    className: string;
    date: string;
    time: string;
    minutesLate: number;
    reason?: string;
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    walasId?: number;
    walasName?: string;
  },
  token?: string | null
): Promise<KeterlambatanRecord> {
  return apiRequest('/v1/keterlambatan', 'POST', data, token);
}

/**
 * Update keterlambatan record
 * PATCH /keterlambatan/:id
 */
export async function updateKeterlambatan(
  id: number,
  data: {
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    reason?: string;
    verificationNotes?: string;
  },
  token?: string | null
): Promise<KeterlambatanRecord> {
  return apiRequest(`/v1/keterlambatan/${id}`, 'PATCH', data, token);
}

/**
 * Delete keterlambatan record
 * DELETE /keterlambatan/:id
 */
export async function deleteKeterlambatan(id: number, token?: string | null): Promise<void> {
  return apiRequest(`/v1/keterlambatan/${id}`, 'DELETE', undefined, token);
}
