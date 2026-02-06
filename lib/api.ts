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

