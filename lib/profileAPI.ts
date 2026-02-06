import { API_URL, apiRequest } from './api'

export type StudentCardData = {
  user_id: string;
  kelas: string;
  nama: string;
  nis: string;
  nisn: string;
  ttl: string;
  gender: string;
  jurusan: string;
};

export type StudentCardViewProps = {
  userId: string;
};

export type StudentStatistics = {
  totalSessions: number;
  totalConsultations: number;
  totalConsultationHours: number;
};

export type HistoryItem = {
  id: string | number;
  title: string;
  counselor: string;
  date: string;
  status: 'Selesai' | 'Pending' | 'Ditolak';
  statusColor: string;
};

export const kelasLabel = (kelas: string) => {
  if (/10/.test(kelas)) return 'Kelas 10';
  if (/11/.test(kelas)) return 'Kelas 11';
  if (/12/.test(kelas)) return 'Kelas 12';
  return kelas;
};

export const genderLabel = (gender: string) => {
  if (!gender) return '-';
  const g = gender.trim().toLowerCase();
  if (g === 'laki-laki' || g === 'l' || g === 'male') return 'L';
  if (g === 'perempuan' || g === 'p' || g === 'female') return 'P';
  return gender;
};

export const fetchStudentCardData = async (userId: string): Promise<StudentCardData[]> => {
  try {
    const response = await fetch(`${API_URL}/student-card/extracted_data`)
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const data: StudentCardData[] = await response.json()
    const userIdStr = userId?.toString()
    return data.filter(card => card.user_id?.toString() === userIdStr)
  } catch (err) {
    console.error('Gagal memuat data kartu pelajar:', err)
    return []
  }
}

export const fetchStudentStatistics = async (userId: string): Promise<StudentStatistics> => {
  try {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

    // Get reservasi (sessions)
    const reservasiRes = await fetch(`${API_URL}/reservasi/student/${userId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
    })
    
    let totalSessions = 0
    let totalConsultations = 0
    let totalConsultationHours = 0

    // Count completed reservasi
    if (reservasiRes.ok) {
      const reservasiData = await reservasiRes.json()
      const completedSessions = Array.isArray(reservasiData)
        ? reservasiData.filter((r: any) => r.status === 'completed').length
        : 0
      totalSessions = completedSessions

      // Calculate hours from completed reservasi (assuming each session is ~1 hour based on duration field)
      if (Array.isArray(reservasiData)) {
        totalConsultationHours = reservasiData
          .filter((r: any) => r.status === 'completed')
          .reduce((sum: number, r: any) => {
            // Estimate hours based on duration or default to 1 hour
            const durationMinutes = r.duration || 60
            return sum + (durationMinutes / 60)
          }, 0)
      }
    }

    // Count user's consultations (questions posted + answers given)
    const konsultasiRes = await fetch(`${API_URL}/v1/konsultasi`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
    })
    
    if (konsultasiRes.ok) {
      const konsultasiData = await konsultasiRes.json()
      // This counts participation in consultations
      // You may need to adjust based on actual API response structure
      totalConsultations = konsultasiData?.pagination?.total || 0
    }

    return {
      totalSessions: Math.round(totalSessions),
      totalConsultations: Math.round(totalConsultations),
      totalConsultationHours: Math.round(totalConsultationHours * 10) / 10 // Round to 1 decimal
    }
  } catch (err) {
    console.error('Gagal memuat statistik:', err)
    return {
      totalSessions: 0,
      totalConsultations: 0,
      totalConsultationHours: 0
    }
  }
}

export const fetchCounselingHistory = async (userId: string, limit: number = 5): Promise<HistoryItem[]> => {
  try {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    
    const response = await fetch(`${API_URL}/reservasi/student/${userId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    
    const data = await response.json()
    if (!Array.isArray(data)) return []

    // Sort by date (newest first) and take only completed/pending records
    const sorted = data
      .filter((r: any) => r.status === 'completed' || r.status === 'approved' || r.status === 'pending')
      .sort((a: any, b: any) => {
        const dateA = new Date(a.completedAt || a.approvedAt || a.createdAt || 0).getTime()
        const dateB = new Date(b.completedAt || b.approvedAt || b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, limit)

    return sorted.map((r: any) => {
      const dateStr = r.completedAt || r.approvedAt || r.createdAt
      const date = new Date(dateStr)
      const formattedDate = date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })

      let status: 'Selesai' | 'Pending' | 'Ditolak' = 'Pending'
      let statusColor = 'text-yellow-600'

      if (r.status === 'completed') {
        status = 'Selesai'
        statusColor = 'text-green-600'
      } else if (r.status === 'rejected') {
        status = 'Ditolak'
        statusColor = 'text-red-600'
      }

      return {
        id: r.id,
        title: r.type === 'group' ? 'Konseling Kelompok' : 'Konseling Pribadi',
        counselor: r.counselor?.username || r.counselor?.name || 'Konselor',
        date: formattedDate,
        status,
        statusColor
      }
    })
  } catch (err) {
    console.error('Gagal memuat riwayat konseling:', err)
    return []
  }
}

export const handleLogout = async () => {
  try {
    await apiRequest('/auth/logout', 'POST')
  } catch (err) {
    // ignore errors but continue to clear client state
    console.error('Logout gagal:', err)
  }

  localStorage.clear()
  sessionStorage.clear()

  // clear common cookies (best-effort)
  try {
    document.cookie = 'auth_profile=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'access_token=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  } catch (e) {
    // ignore
  }

  // navigate to login
  window.location.replace('/login')
}

export const updateUserProfile = async (userId: string | number, updateData: any): Promise<any> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (err: any) {
    console.error('Gagal mengubah profil:', err)
    throw err
  }
}

