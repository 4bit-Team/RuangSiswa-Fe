import { apiRequest } from './api';

export interface Referral {
  id: string;
  student_id: number;
  student_name: string;
  class_id: number;
  tahun: number;
  status: 'active' | 'completed' | 'closed';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  referral_reason: string;
  referral_date: string;
  assigned_date?: string;
  completed_date?: string;
  is_urgent?: boolean;
  notes?: string;
}

export interface BimbinganSesi {
  id: string;
  referral_id: string;
  student_id: number;
  student_name: string;
  counselor_id: string;
  counselor_name: string;
  sesi_ke: number;
  tanggal_sesi: string;
  jam_sesi?: string;
  topik_pembahasan: string;
  catatan_sesi?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface BimbinganResponse {
  success: boolean;
  message: string;
  data: Referral[] | BimbinganSesi[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get guidance referrals
 */
export async function getGuidanceReferrals(
  filters?: {
    student_id?: number;
    class_id?: number;
    status?: string;
    risk_level?: string;
    page?: number;
    limit?: number;
  },
  token?: string | null
): Promise<BimbinganResponse> {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', filters.student_id.toString());
  if (filters?.class_id) params.append('class_id', filters.class_id.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.risk_level) params.append('risk_level', filters.risk_level);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest(
    `/v1/kesiswaan/bimbingan${params.toString() ? `?${params.toString()}` : ''}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Get guidance referral detail
 */
export async function getGuidanceReferralDetail(
  referralId: string,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/${referralId}`,
    'GET',
    undefined,
    token
  );
}

/**
 * Create guidance referral (manual)
 */
export async function createGuidanceReferral(
  data: {
    student_id: number;
    student_name: string;
    class_id: number;
    tahun: number;
    referral_reason: string;
    risk_level: string;
    notes?: string;
  },
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/bimbingan',
    'POST',
    data,
    token
  );
}

/**
 * Sync guidance from Walas integration (case notes, home visits, achievements)
 */
export async function syncGuidanceFromWalas(
  startDate: string,
  endDate: string,
  forceSync?: boolean,
  token?: string | null
): Promise<any> {
  return apiRequest(
    '/v1/kesiswaan/bimbingan/sync',
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
 * Get sessions for a referral
 */
export async function getGuidanceSessions(
  referralId: string,
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/${referralId}/sessions`,
    'GET',
    undefined,
    token
  );
}

/**
 * Create guidance session
 */
export async function createGuidanceSession(
  referralId: string,
  data: {
    student_id: number;
    counselor_id: string;
    counselor_name: string;
    tanggal_sesi: string;
    topik_pembahasan: string;
  },
  token?: string | null
): Promise<any> {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/${referralId}/sessions`,
    'POST',
    data,
    token
  );
}

/**
 * Get critical referrals (urgent cases)
 */
export async function getCriticalReferrals(
  token?: string | null
): Promise<BimbinganResponse> {
  return apiRequest(
    '/v1/kesiswaan/bimbingan/stats/critical',
    'GET',
    undefined,
    token
  );
}
