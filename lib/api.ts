// /lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string | null
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Always use API_URL from env for all requests
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Terjadi kesalahan");
  }

  return res.json();
}

// ==================== RESERVASI FEEDBACK ====================

export async function submitFeedback(
  reservasiId: number,
  rating: number,
  comment: string,
  token: string | null
) {
  return apiRequest(
    '/reservasi/feedback',
    'POST',
    { reservasiId, rating, comment },
    token
  );
}

export async function getFeedbackByReservasi(
  reservasiId: number,
  token: string | null
) {
  return apiRequest(
    `/reservasi/feedback/${reservasiId}`,
    'GET',
    undefined,
    token
  );
}

export async function getCounselorFeedback(
  counselorId: number,
  token: string | null
) {
  return apiRequest(
    `/reservasi/counselor/${counselorId}/feedback`,
    'GET',
    undefined,
    token
  );
}

export async function getStudentFeedback(
  studentId: number,
  token: string | null
) {
  return apiRequest(
    `/reservasi/student/${studentId}/feedback`,
    'GET',
    undefined,
    token
  );
}

// ==================== QR CODE & ATTENDANCE ====================

export async function confirmAttendance(
  reservasiId: number,
  qrData: string,
  token?: string | null
) {
  return apiRequest(
    `/reservasi/${reservasiId}/confirm-attendance`,
    'POST',
    { qrData },
    token
  );
}

export async function markSessionComplete( 
  reservasiId: number,
  token?: string | null
) {
  return apiRequest(
    `/reservasi/${reservasiId}/complete`,
    'PATCH',
    undefined,
    token
  );
}

// ==================== KESISWAAN ATTENDANCE ====================

export async function getAttendanceRecords(filters?: {
  student_id?: number;
  class_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.class_id) params.append('class_id', String(filters.class_id));
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/attendance?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function getAttendanceSummary(studentId: number, month: string, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/attendance/${studentId}/summary?month=${month}`,
    'GET',
    undefined,
    token
  );
}

export async function getAttendanceHistory(studentId: number, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/attendance/${studentId}/history`,
    'GET',
    undefined,
    token
  );
}

// ==================== KESISWAAN TARDINESS ====================

export async function getTardinessRecords(filters?: {
  student_id?: number;
  class_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.class_id) params.append('class_id', String(filters.class_id));
  if (filters?.status) params.append('status', filters.status);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/tardiness?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function getTardinessSummary(studentId: number, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/tardiness/${studentId}/summary`,
    'GET',
    undefined,
    token
  );
}

// ==================== KESISWAAN VIOLATIONS ====================

export async function getViolations(filters?: {
  student_id?: number;
  class_id?: number;
  category_id?: string;
  processed?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.class_id) params.append('class_id', String(filters.class_id));
  if (filters?.category_id) params.append('category_id', filters.category_id);
  if (filters?.processed !== undefined) params.append('processed', String(filters.processed));
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/violations?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function reportViolation(data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/violations`,
    'POST',
    data,
    token
  );
}

export async function getViolationStatistics(token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/violations/statistics`,
    'GET',
    undefined,
    token
  );
}

// ==================== KESISWAAN BIMBINGAN ====================

// Referral Management
export async function getReferrals(filters?: {
  student_id?: number;
  counselor_id?: string;
  status?: string;
  risk_level?: string;
  tahun?: number;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.counselor_id) params.append('counselor_id', filters.counselor_id);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.risk_level) params.append('risk_level', filters.risk_level);
  if (filters?.tahun) params.append('tahun', String(filters.tahun));
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/bimbingan/referrals?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function createReferral(data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/referrals`,
    'POST',
    data,
    token
  );
}

// Session Management
export async function getSessions(filters?: {
  referral_id?: string;
  student_id?: number;
  counselor_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.referral_id) params.append('referral_id', filters.referral_id);
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.counselor_id) params.append('counselor_id', filters.counselor_id);
  if (filters?.status) params.append('status', filters.status);
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/bimbingan/sesi?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function createSession(data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/sesi`,
    'POST',
    data,
    token
  );
}

export async function completeSession(sesiId: string, data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/sesi/${sesiId}/complete`,
    'PATCH',
    data,
    token
  );
}

// Case Notes Management
export async function getCaseNotes(filters?: {
  referral_id?: string;
  student_id?: number;
  counselor_id?: string;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.referral_id) params.append('referral_id', filters.referral_id);
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.counselor_id) params.append('counselor_id', filters.counselor_id);
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/bimbingan/catat?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function createCaseNote(data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/catat`,
    'POST',
    data,
    token
  );
}

// Intervention Management
export async function getInterventions(filters?: {
  referral_id?: string;
  student_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.referral_id) params.append('referral_id', filters.referral_id);
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.status) params.append('status', filters.status);
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/bimbingan/intervensi?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function createIntervention(data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/intervensi`,
    'POST',
    data,
    token
  );
}

export async function evaluateIntervention(intervensiId: string, data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/intervensi/${intervensiId}/evaluate`,
    'PATCH',
    data,
    token
  );
}

// Progress Management
export async function getProgress(filters?: {
  referral_id?: string;
  student_id?: number;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.referral_id) params.append('referral_id', filters.referral_id);
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/bimbingan/perkembangan?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function createProgress(data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/perkembangan`,
    'POST',
    data,
    token
  );
}

// Target Management
export async function getTargets(filters?: {
  referral_id?: string;
  student_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}, token?: string | null) {
  const params = new URLSearchParams();
  if (filters?.referral_id) params.append('referral_id', filters.referral_id);
  if (filters?.student_id) params.append('student_id', String(filters.student_id));
  if (filters?.status) params.append('status', filters.status);
  params.append('page', String(filters?.page || 1));
  params.append('limit', String(filters?.limit || 20));

  return apiRequest(
    `/v1/kesiswaan/bimbingan/target?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function createTarget(data: any, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/target`,
    'POST',
    data,
    token
  );
}

// Status Management
export async function getBimbinganStatus(studentId: number, tahun?: number, token?: string | null) {
  const params = new URLSearchParams();
  if (tahun) params.append('tahun', String(tahun));

  return apiRequest(
    `/v1/kesiswaan/bimbingan/status/${studentId}?${params.toString()}`,
    'GET',
    undefined,
    token
  );
}

export async function getBimbinganSessions(referralId: string, token?: string | null) {
  return apiRequest(
    `/v1/kesiswaan/bimbingan/referrals/${referralId}/sessions`,
    'GET',
    undefined,
    token
  );
}

// ==================== API CLIENT WRAPPER ====================

const api = {
  get: async (endpoint: string, config?: any) => {
    let url = endpoint;
    if (config?.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url = `${endpoint}?${params.toString()}`;
    }
    return apiRequest(url, 'GET', undefined, config?.token);
  },
  post: async (endpoint: string, data?: any, config?: any) => {
    return apiRequest(endpoint, 'POST', data, config?.token);
  },
  patch: async (endpoint: string, data?: any, config?: any) => {
    return apiRequest(endpoint, 'PATCH', data, config?.token);
  },
  put: async (endpoint: string, data?: any, config?: any) => {
    return apiRequest(endpoint, 'PUT', data, config?.token);
  },
  delete: async (endpoint: string, config?: any) => {
    return apiRequest(endpoint, 'DELETE', undefined, config?.token);
  },
};

export default api;

