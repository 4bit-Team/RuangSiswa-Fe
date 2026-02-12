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

// ==================== PEMBINAAN ENDPOINTS ====================

export async function getPembinaan(token: string | null) {
  return apiRequest('/v1/pembinaan/', 'GET', undefined, token);
}

export async function getPembinaanById(id: number, token: string | null) {
  return apiRequest(`/v1/pembinaan/${id}/`, 'GET', undefined, token);
}

export async function updatePembinaan(
  id: number,
  data: { status?: string; hasil_pembinaan?: string; catatan_bk?: string },
  token: string | null
) {
  return apiRequest(`/v1/pembinaan/${id}/`, 'PATCH', data, token);
}

export async function fetchAndSyncPembinaan(token: string | null) {
  return apiRequest('/v1/pembinaan/fetch-sync', 'POST', {}, token);
}

export async function syncPembinaan(token: string | null) {
  return apiRequest('/v1/pembinaan/sync', 'POST', {}, token);
}

// ==================== PEMBINAAN RINGAN (BK) ENDPOINTS ====================

export async function createPembinaanRingan(
  data: {
    reservasi_id: number;
    pembinaan_id: number;
    student_id: number;
    student_name: string;
    counselor_id: number;
    hasil_pembinaan: string;
    catatan_bk: string;
    scheduled_date: string;
    scheduled_time: string;
  },
  token: string | null
) {
  return apiRequest('/v1/pembinaan-ringan', 'POST', data, token);
}

export async function getPembinaanRingan(token: string | null) {
  return apiRequest('/v1/pembinaan-ringan', 'GET', undefined, token);
}

export async function getPembinaanRinganById(id: number, token: string | null) {
  return apiRequest(`/v1/pembinaan-ringan/${id}`, 'GET', undefined, token);
}

export async function getPendingPembinaanRingan(token: string | null) {
  return apiRequest('/v1/pembinaan-ringan/pending', 'GET', undefined, token);
}

export async function approvePembinaanRingan(
  id: number,
  data: { status: 'approved' | 'rejected'; bk_feedback?: string; bk_notes?: string },
  token: string | null
) {
  return apiRequest(`/v1/pembinaan-ringan/${id}/approve`, 'PATCH', data, token);
}

export async function completePembinaanRingan(
  id: number,
  data: {
    status: 'completed';
    bk_feedback: string;
    bk_notes?: string;
    has_follow_up?: boolean;
    follow_up_notes?: string;
  },
  token: string | null
) {
  return apiRequest(`/v1/pembinaan-ringan/${id}/complete`, 'PATCH', data, token);
}

// ==================== PEMBINAAN ORTU (ORANG TUA) ENDPOINTS ====================

export async function createPembinaanOrtu(
  data: {
    pembinaan_id: number;
    student_id: number;
    student_name: string;
    student_class: string;
    parent_id?: number;
    parent_name: string;
    parent_phone?: string;
    violation_details: string;
    letter_content: string;
    scheduled_date: string;
    scheduled_time?: string;
    location?: string;
    communication_method?: 'sms' | 'whatsapp' | 'email' | 'manual';
    kesiswaan_notes?: string;
  },
  token: string | null
) {
  return apiRequest('/v1/pembinaan-ortu', 'POST', data, token);
}

export async function getPembinaanOrtu(token: string | null) {
  return apiRequest('/v1/pembinaan-ortu', 'GET', undefined, token);
}

export async function getPembinaanOrtuById(id: number, token: string | null) {
  return apiRequest(`/v1/pembinaan-ortu/${id}`, 'GET', undefined, token);
}

export async function getPembinaanOrtuForParent(parentId: number, token: string | null) {
  return apiRequest(`/v1/pembinaan-ortu/parent/${parentId}`, 'GET', undefined, token);
}

export async function sendLetterToParent(
  id: number,
  data: { communication_method: 'sms' | 'whatsapp' | 'email' | 'manual' },
  token: string | null
) {
  return apiRequest(`/v1/pembinaan-ortu/${id}/send-letter`, 'POST', data, token);
}

export async function recordParentResponse(
  id: number,
  data: { parent_response: string },
  token: string | null
) {
  return apiRequest(`/v1/pembinaan-ortu/${id}/parent-response`, 'POST', data, token);
}

export async function recordMeetingWithParent(
  id: number,
  data: {
    meeting_result: string;
    parent_response?: string;
    requires_follow_up?: boolean;
    follow_up_notes?: string;
  },
  token: string | null
) {
  return apiRequest(`/v1/pembinaan-ortu/${id}/record-meeting`, 'POST', data, token);
}

// ==================== PEMBINAAN BERAT (WAKA) ENDPOINTS ====================

export async function createPembinaanWaka(
  data: {
    reservasi_id: number;
    pembinaan_id: number;
    waka_id: number;
  },
  token: string | null
) {
  return apiRequest('/v1/pembinaan-berat', 'POST', data, token);
}

export async function createPembinaanBerat(
  data: {
    pembinaan_id: number;
    recommendation?: string;
    preferred_date: string;
    preferred_time?: string;
  },
  token: string | null
) {
  return apiRequest('/v1/pembinaan-berat', 'POST', data, token);
}

export async function getPembinaanBerat(token: string | null) {
  return apiRequest('/v1/pembinaan-berat', 'GET', undefined, token);
}

export async function getPembinaanBeratById(id: number, token: string | null) {
  return apiRequest(`/v1/pembinaan-berat/${id}`, 'GET', undefined, token);
}

export async function getPendingPembinaanBerat(token: string | null) {
  return apiRequest('/v1/pembinaan-berat/pending', 'GET', undefined, token);
}

export async function decidePembinaanBerat(
  id: number,
  data: { wak_decision: 'sp3' | 'do'; decision_reason: string; notes?: string },
  token: string | null
) {
  return apiRequest(`/v1/pembinaan-berat/${id}/decide`, 'PATCH', data, token);
}

export async function createPembinaanReservasi(
  data: {
    pembinaan_id: number;
    counselorId: number;
    pembinaanType: 'ringan' | 'berat';
    preferredDate: string;
    preferredTime: string;
    type: string;
    notes: string;
  },
  token: string | null
) {
  return apiRequest('/reservasi/pembinaan', 'POST', data, token);
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

