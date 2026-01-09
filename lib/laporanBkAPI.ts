import { API_URL } from './api';

// ==================== LAPORAN BK ====================

export async function getAllLaporanBk(token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk`;

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal mengambil data laporan');
  }

  return res.json();
}

export async function getLaporanBkById(id: number, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk/${id}`;

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal mengambil data laporan');
  }

  return res.json();
}

export async function createLaporanBk(data: any, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal membuat laporan');
  }

  return res.json();
}

export async function updateLaporanBk(id: number, data: any, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk/${id}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal memperbarui laporan');
  }

  return res.json();
}

export async function deleteLaporanBk(id: number, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal menghapus laporan');
  }

  return res.json();
}

export async function exportLaporanBkExcel(token?: string | null) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk/export/excel`;

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal export laporan');
  }

  // Return blob for file download
  return res.blob();
}

export async function downloadLaporanBkTemplate(token?: string | null) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk/template/download`;

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal download template');
  }

  // Return blob for file download
  return res.blob();
}

export async function importLaporanBkExcel(file: File, token?: string | null) {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_URL}/laporan-bk/import/excel`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal import laporan');
  }

  return res.json();
}
