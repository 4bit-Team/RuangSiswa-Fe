import { apiRequest } from '../api';

export interface ViolationRecord {
  id: string;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  violation_category_id: string;
  violation_category: string;
  description: string;
  severity: number; // 1-5
  status: 'reported' | 'verified' | 'excused' | 'resolved';
  bukti_foto?: string;
  catatan_petugas?: string;
  created_by: string;
  created_at: string;
}

export interface ViolationResponse {
  success: boolean;
  message: string;
  data: ViolationRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SPLetter {
  id: string;
  student_id: number;
  student_name: string;
  violation_count: number;
  sp_level: 1 | 2 | 3 | 4; // SP1, SP2, SP3, Expulsion
  issued_date: string;
  effective_until: string;
  status: 'active' | 'expired' | 'revoked';
}

/**
 * Get violation records
 */
export async function getViolationRecords(
  filters?: {
    student_id?: number;
    class_id?: number;
    status?: string;
    severity?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<ViolationResponse> {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_id) params.append('class_id', filters.class_id.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.severity) params.append('severity', filters.severity.toString());
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/kesiswaan/violations${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Report new violation
 */
export async function reportViolation(
  data: {
    student_id: number;
    student_name: string;
    class_id: number;
    violation_category_id: string;
    description: string;
    tanggal_pelanggaran: string;
    severity?: number;
    bukti_foto?: string;
    catatan_petugas?: string;
  },
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/violations',
    'POST',
    data,
    token
  );
}

/**
 * Get SP letters for a student
 */
export async function getSPLetters(
  studentId: number,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/violations/${studentId}/sp-letters`,
    'GET',
    undefined,
    token
  );
}

/**
 * Generate SP letter (auto or manual)
 */
export async function generateSPLetter(
  studentId: number,
  data?: {
    sp_level?: number;
    reason?: string;
  },
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/violations/${studentId}/generate-sp`,
    'POST',
    data || {},
    token
  );
}

/**
 * Download SP letter as PDF
 */
export async function downloadSPLetterPDF(
  spLetterId: string,
  token?: string | null
): Promise<Blob> {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/kesiswaan/violations/sp/${spLetterId}/download-pdf`,
    {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  ).then((res) => res.blob());
}

/**
 * Get violation statistics
 */
export async function getViolationStats(
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/violations/stats',
    'GET',
    undefined,
    token
  );
}

/**
 * Sync violations from Walas (if applicable)
 */
export async function syncViolationsFromWalas(
  startDate: string,
  endDate: string,
  forceSync?: boolean,
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/violations/sync',
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
 * Get critical violations (high severity, repeat offenders)
 */
export async function getCriticalViolations(
  token?: string | null
): Promise<ViolationResponse> {
  return apiRequest(
    '/v1/kesiswaan/violations/critical',
    'GET',
    undefined,
    token
  );
}

/**
 * Update violation record
 */
export async function updateViolation(
  violationId: string | number,
  data: {
    description?: string;
    severity?: number;
    status?: string;
    catatan_petugas?: string;
  },
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/violations/${violationId}`,
    'PATCH',
    data,
    token
  );
}

/**
 * Delete violation record
 */
export async function deleteViolation(
  violationId: string | number,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/violations/${violationId}`,
    'DELETE',
    undefined,
    token
  );
}
