import { apiRequest } from '../api';

export interface TardinessRecord {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  time: string;
  minutesLate: number;
  reason?: string;
  status: 'recorded' | 'verified' | 'appealed' | 'resolved';
}

export interface TardinessResponse {
  success: boolean;
  message: string;
  data: TardinessRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get tardiness records dengan filter
 */
export async function getTardinessRecords(
  filters?: {
    student_id?: number;
    class_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<TardinessResponse> {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_id) params.append('class_id', filters.class_id.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/kesiswaan/tardiness${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get tardiness summary untuk student tertentu dan bulan tertentu
 */
export async function getTardinessSummary(
  studentId: number,
  month?: string,
  token?: string | null
): Promise<any> {
  const params = new URLSearchParams();
  if (month) params.append('month', month);

  return apiRequest(
    `/v1/kesiswaan/tardiness/${studentId}/summary${
      params.toString() ? `?${params.toString()}` : ''
    }`,
    'GET',
    undefined,
    token
  );
}

/**
 * Sync tardiness data dari Walas (trigger manual)
 */
export async function syncTardinessFromWalas(
  startDate: string,
  endDate: string,
  forceSync?: boolean,
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/tardiness/sync',
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
 * Get tardiness history (last 6 months)
 */
export async function getTardinessHistory(
  studentId: number,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/tardiness/${studentId}/history`,
    'GET',
    undefined,
    token
  );
}

/**
 * Submit new tardiness record (by admin/staff)
 */
export async function submitTardiness(
  data: {
    student_id: number;
    student_name: string;
    class_id: number;
    tanggal: string;
    keterlambatan_menit: number;
    alasan?: string;
    bukti_foto?: string;
  },
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/tardiness',
    'POST',
    data,
    token
  );
}

/**
 * Appeal tardiness record (by student)
 */
export async function appealTardiness(
  tardinessId: number,
  data: {
    alasan_appeal: string;
    bukti_appeal?: string;
  },
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/tardiness/${tardinessId}/appeal`,
    'POST',
    data,
    token
  );
}
