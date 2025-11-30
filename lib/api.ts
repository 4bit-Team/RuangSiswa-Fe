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
