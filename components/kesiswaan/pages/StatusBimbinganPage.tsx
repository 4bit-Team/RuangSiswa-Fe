'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { BookOpen, CheckCircle, TrendingUp, Award, User, MessageSquare, Filter, AlertCircle, X } from 'lucide-react'
import SessionDetailModal from '../modals/SessionDetailModal'
import {
  getGuidanceReferrals,
  getGuidanceSessions,
  createGuidanceReferral,
  createGuidanceSession,
  getCriticalReferrals,
  syncGuidanceFromWalas,
  updateGuidanceReferral,
  deleteGuidanceReferral,
  deleteGuidanceSession,
  completeGuidanceSession,
} from '@/lib/backup/bimbinganAPI'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Referral {
  id: string
  student_id: number
  student_name: string
  class_id: number
  counselor_id?: string
  counselor_name?: string
  tahun: number
  status: string
  risk_level: string
  referral_reason: string
  referral_date: string
  assigned_date?: string
  completed_date?: string
  is_urgent?: boolean
  notes?: string
}

interface BimbinganSesi {
  id: string
  referral_id: string
  student_id: number
  student_name: string
  counselor_id: string
  counselor_name: string
  sesi_ke: number
  tanggal_sesi: string
  jam_sesi?: string
  durasi_menit?: number
  lokasi?: string
  topik_pembahasan: string
  catatan_sesi?: string
  status: string
  siswa_hadir: boolean
  orang_tua_hadir: boolean
  hasil_akhir?: string
}

interface CaseNote {
  id: string
  referral_id: string
  student_id: number
  counselor_id: string
  counselor_name: string
  jenis_catat: string
  isi_catat: string
  tanggal_catat: string
  tingkat_kerahasiaan: string
}

interface Intervention {
  id: string
  referral_id: string
  student_id: number
  jenis_intervensi: string
  deskripsi_intervensi: string
  tanggal_intervensi: string
  status: string
  efektivitas?: string
}

interface Progress {
  id: string
  referral_id: string
  student_id: number
  tanggal_evaluasi: string
  perilaku_skor?: number
  akademik_skor?: number
  emosi_skor?: number
  kehadiran_skor?: number
  status_keseluruhan: string
  sesi_total_dijalankan: number
}

interface GuidanceTarget {
  id: string
  referral_id: string
  student_id: number
  area_target: string
  target_spesifik: string
  tanggal_mulai: string
  tanggal_target: string
  status: string
}

interface BimbinganStatus {
  id: string
  student_id: number
  tahun: number
  status: string
  current_risk_level: string
  total_referrals: number
  total_sessions: number
  total_interventions: number
  first_referral_date?: string
  last_session_date?: string
  next_session_date?: string
}

interface CounselingSession extends BimbinganSesi {
  sessionNumber?: string
}

interface GuidanceProgress {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  progressPercentage: number
  currentFocus: string
}

interface Student {
  id: number
  name: string
  nisn: string
  className: string
  counselor: string
  status: 'Normal' | 'Peringatan' | 'Perlu Tindak Lanjut'
  lastSession: string
  notes: string
  spHistory: SPRecord[]
}

interface SPRecord {
  id: number
  date: string
  reason: string
  level: 'SP1' | 'SP2' | 'SP3'
  description: string
}

const SessionStatusBadge: React.FC<{ status: string }> = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Selesai': { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
    'Terjadwal': { bg: 'bg-blue-50', text: 'text-blue-700', icon: <BookOpen className="w-4 h-4" /> },
    'Dalam Proses': { bg: 'bg-orange-50', text: 'text-orange-700', icon: <TrendingUp className="w-4 h-4" /> },
  }

  const config = statusConfig[status] || statusConfig['Selesai']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  )
}

const GuidanceStatusBadge: React.FC<{ status: string }> = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Normal': { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
    'Peringatan': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <AlertCircle className="w-4 h-4" /> },
    'Perlu Tindak Lanjut': { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
  }

  const config = statusConfig[status] || statusConfig['Normal']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  )
}

const SessionCard: React.FC<
  BimbinganSesi & { onOpen: (session: CounselingSession) => void }
> = ({
  id,
  sesi_ke,
  tanggal_sesi,
  topik_pembahasan,
  catatan_sesi,
  status,
  counselor_name,
  onOpen,
}: BimbinganSesi & { onOpen: (session: CounselingSession) => void }) => {
  const statusMap: Record<string, 'Selesai' | 'Terjadwal' | 'Dalam Proses'> = {
    completed: 'Selesai',
    scheduled: 'Terjadwal',
    in_progress: 'Dalam Proses',
  }

  return (
    <div
      onClick={() =>
        onOpen({
          id,
          sesi_ke,
          tanggal_sesi,
          topik_pembahasan,
          catatan_sesi,
          status: statusMap[status] || 'Terjadwal',
          counselor_name,
          referral_id: '',
          student_id: 0,
          student_name: '',
          counselor_id: '',
          jam_sesi: '',
          durasi_menit: 0,
          lokasi: '',
          siswa_hadir: false,
          orang_tua_hadir: false,
          hasil_akhir: '',
        })
      }
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-purple-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-900">Sesi {sesi_ke}</h4>
          <p className="text-sm text-gray-600">
            {new Date(tanggal_sesi).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <SessionStatusBadge
          status={statusMap[status] || 'Terjadwal'}
        />
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Topik Pembahasan</p>
          <p className="text-sm font-semibold text-gray-900">
            {topik_pembahasan}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Konselor</p>
          <p className="text-sm text-gray-700">{counselor_name}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          Catatan Sesi
        </p>
        <p className="text-sm text-gray-700 line-clamp-3">
          {catatan_sesi || '-'}
        </p>
      </div>
    </div>
  )
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string }> = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
}) => (
  <div className={`${color} rounded-xl p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-white/40">{icon}</div>
    </div>
  </div>
)

const StatusBimbinganPage: React.FC = () => {
  // ===== AUTH =====
  const { token } = useAuth()

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'notes' | 'progress'>('overview')

  // Data states
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [sessions, setSessions] = useState<BimbinganSesi[]>([])
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [targets, setTargets] = useState<GuidanceTarget[]>([])
  const [statuses, setStatuses] = useState<BimbinganStatus[]>([])

  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null)
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)

  // Filter states
  const [selectedName, setSelectedName] = useState('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Form states
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    referral_reason: '',
    risk_level: 'yellow',
  })

  const [sessionFormData, setSessionFormData] = useState({
    tanggal_sesi: '',
    jam_sesi: '',
    topik_pembahasan: '',
  })

  // ===== DATA LOADING =====
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([
        loadReferrals(),
        loadSessions(),
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data bimbingan')
    } finally {
      setLoading(false)
    }
  }

  const loadReferrals = async () => {
    try {
      const response = await getGuidanceReferrals({ page: 1, limit: 100 })
      setReferrals((response.data as Referral[]) || [])
    } catch (error) {
      console.error('Gagal memuat data referral', error)
    }
  }

  const loadSessions = async () => {
    try {
      // Load sessions for each referral
      if (referrals.length > 0) {
        const allSessions: BimbinganSesi[] = []
        for (const referral of referrals) {
          try {
            const response = await getGuidanceSessions(referral.id)
            if (response.data && Array.isArray(response.data)) {
              allSessions.push(...(response.data as BimbinganSesi[]))
            }
          } catch (err) {
            console.error(`Gagal memuat sesi untuk referral ${referral.id}`, err)
          }
        }
        setSessions(allSessions)
      }
    } catch (error) {
      console.error('Gagal memuat data sesi', error)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const monthEnd = new Date()
      const formatDate = (date: Date) => date.toISOString().split('T')[0]
      
      await syncGuidanceFromWalas(formatDate(monthStart), formatDate(monthEnd))
      // Refresh data after sync
      await loadAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal sinkronisasi data')
      console.error('Error syncing guidance:', err)
    } finally {
      setSyncing(false)
    }
  }

  const loadTargets = async () => {
    try {
      const response = await apiRequest('/v1/kesiswaan/bimbingan/target?limit=100')
      if (response.success) {
        setTargets(response.data)
      }
    } catch (error) {
      console.error('Gagal memuat target', error)
    }
  }

  const loadStatuses = async () => {
    try {
      const response = await apiRequest('/v1/kesiswaan/bimbingan/statuses?limit=100')
      if (response.success) {
        setStatuses(response.data)
      }
    } catch (error) {
      console.error('Gagal memuat status', error)
    }
  }

  // ===== FORM HANDLERS =====
  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      const response = await createGuidanceReferral({
        student_id: parseInt(formData.student_id),
        student_name: formData.student_name,
        class_id: 1, // Adjust if needed
        tahun: new Date().getFullYear(),
        referral_reason: formData.referral_reason,
        risk_level: formData.risk_level,
      }, token)

      if (response.success) {
        alert('Referral berhasil dibuat')
        setShowReferralForm(false)
        setFormData({ student_id: '', student_name: '', referral_reason: '', risk_level: 'yellow' })
        await loadReferrals()
      } else {
        throw new Error(response.message || 'Gagal membuat referral')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal membuat referral'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
      console.error('Error creating referral:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReferral) {
      alert('Pilih referral terlebih dahulu')
      return
    }
    try {
      setSubmitting(true)
      setError(null)

      const response = await createGuidanceSession(
        selectedReferral.id,
        {
          student_id: selectedReferral.student_id,
          counselor_id: 'system', // Adjust if needed
          counselor_name: 'System',
          tanggal_sesi: sessionFormData.tanggal_sesi,
          topik_pembahasan: sessionFormData.topik_pembahasan,
        },
        token
      )

      if (response.success) {
        alert('Sesi berhasil dijadwalkan')
        setShowSessionForm(false)
        setSessionFormData({ tanggal_sesi: '', jam_sesi: '', topik_pembahasan: '' })
        await loadSessions()
      } else {
        throw new Error(response.message || 'Gagal menjadwalkan sesi')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal menjadwalkan sesi'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
      console.error('Error creating session:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteSession = async (sesiId: string) => {
    if (!confirm('Tandai sesi ini sebagai selesai?')) return
    
    if (!selectedReferral) {
      alert('Referral tidak ditemukan')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await completeGuidanceSession(
        selectedReferral.id,
        sesiId,
        {
          siswa_hadir: true,
          hasil_akhir: 'Sesi selesai',
        },
        token
      )

      if (response.success) {
        alert('Sesi berhasil ditandai selesai')
        await loadSessions()
      } else {
        throw new Error(response.message || 'Gagal menyelesaikan sesi')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal menyelesaikan sesi'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
      console.error('Error completing session:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReferral = async (referralId: string) => {
    if (!confirm('Hapus referral ini? Tindakan ini tidak dapat dibatalkan.')) return

    try {
      setSubmitting(true)
      setError(null)

      const response = await deleteGuidanceReferral(referralId, token)

      if (response.success) {
        alert('Referral berhasil dihapus')
        await loadReferrals()
      } else {
        throw new Error(response.message || 'Gagal menghapus referral')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal menghapus referral'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
      console.error('Error deleting referral:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Hapus sesi ini? Tindakan ini tidak dapat dibatalkan.')) return

    if (!selectedReferral) {
      alert('Referral tidak ditemukan')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await deleteGuidanceSession(selectedReferral.id, sessionId, token)

      if (response.success) {
        alert('Sesi berhasil dihapus')
        await loadSessions()
      } else {
        throw new Error(response.message || 'Gagal menghapus sesi')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal menghapus sesi'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
      console.error('Error deleting session:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // ===== HELPERS =====
  const calculateProgress = () => {
    const completed = sessions.filter((s: BimbinganSesi) => s.status === 'completed').length
    const total = sessions.length || 1
    return Math.round((completed / total) * 100)
  }

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
    }
    return colors[risk] || colors.yellow
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Normal: 'bg-green-100 text-green-800',
      Peringatan: 'bg-yellow-100 text-yellow-800',
      'Perlu Tindak Lanjut': 'bg-red-100 text-red-800',
    }
    return colors[status] || colors.Normal
  }

  const filteredStudents = useMemo(() => {
    let filtered: any[] = statuses.map((status: BimbinganStatus) => {
      const lastRef = referrals.find((r: Referral) => r.student_id === status.student_id)
      const lastSess = sessions.find((s: BimbinganSesi) => s.student_id === status.student_id)
      return {
        id: status.student_id,
        name: lastRef?.student_name || `Student ${status.student_id}`,
        nisn: `NISN${status.student_id}`,
        className: `Class${status.student_id}`,
        counselor: lastRef?.counselor_name || '-',
        status:
          status.current_risk_level === 'red'
            ? 'Perlu Tindak Lanjut'
            : status.current_risk_level === 'orange'
              ? 'Peringatan'
              : 'Normal',
        lastSession: lastSess?.tanggal_sesi || '-',
        notes: lastRef?.referral_reason || '-',
        spHistory: [],
      }
    })

    if (selectedName !== 'all') {
      filtered = filtered.filter((s) => s.id.toString() === selectedName)
    }
    if (selectedClass !== 'all') {
      filtered = filtered.filter((s) => s.className === selectedClass)
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === selectedStatus)
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [statuses, referrals, sessions, selectedName, selectedClass, selectedStatus])

  const uniqueClasses = Array.from(new Set(filteredStudents.map((s: any) => s.className))).sort()

  const progressData: GuidanceProgress = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter((s: BimbinganSesi) => s.status === 'completed').length,
    upcomingSessions: sessions.filter((s: BimbinganSesi) => s.status === 'scheduled').length,
    progressPercentage: calculateProgress(),
    currentFocus: 'Manajemen Stress dan Waktu',
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-2 text-blue-900 font-medium">Memuat data bimbingan...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Terjadi Kesalahan</h4>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Status Bimbingan</h2>
                <p className="text-pink-50">
                  Progres dan riwayat sesi bimbingan dengan data real-time dari konselor BK
                </p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="mt-4 px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 transition-colors disabled:cursor-not-allowed font-medium"
            >
              {syncing ? 'Sinkronisasi...' : 'Sinkronisasi dari Walas'}
            </button>
          </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          <StatCard
            icon={<BookOpen className="w-12 h-12" />}
            label="Total Sesi"
            value={progressData.totalSessions}
            color="bg-gradient-to-br from-blue-400 to-blue-600"
          />
          <StatCard
            icon={<CheckCircle className="w-12 h-12" />}
            label="Selesai"
            value={progressData.completedSessions}
            color="bg-gradient-to-br from-green-400 to-green-600"
          />
          <StatCard
            icon={<TrendingUp className="w-12 h-12" />}
            label="Akan Datang"
            value={progressData.upcomingSessions}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
          />
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Ringkasan' },
              { id: 'referrals', label: 'Referral' },
              { id: 'notes', label: 'Catatan' },
              { id: 'progress', label: 'Perkembangan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as 'overview' | 'referrals' | 'notes' | 'progress'
                  )
                }
                className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Progress Summary */}
            {/* <section className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Ringkasan Progress Bimbingan
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Penyelesaian Sesi Bimbingan
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Anda telah menyelesaikan {progressData.completedSessions} dari{' '}
                        {progressData.totalSessions} sesi yang direncanakan
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {progressData.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${progressData.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fokus Utama Saat Ini</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {progressData.currentFocus}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Referral</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {referrals.length}
                    </p>
                  </div>
                </div>
              </div>
            </section> */}

            {/* Current Status */}
            <section>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Status Bimbingan Anda
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Anda sedang dalam program bimbingan yang aktif. Total {referrals.length}{' '}
                      referral dengan{' '}
                      {sessions.filter((s) => s.status === 'completed').length} sesi telah
                      selesai.
                    </p>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Chat dengan Konselor
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Sessions */}
            <section>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-lg">Riwayat Sesi Bimbingan</h3>
                  <button
                    onClick={() => setShowSessionForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                  >
                    + Jadwalkan Sesi
                  </button>
                </div>
                {sessions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sessions.slice(0, 4).map((session) => (
                      <SessionCard
                        key={session.id}
                        {...session}
                        onOpen={(s) => {
                          setSelectedSession(s)
                          setIsModalOpen(true)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada sesi bimbingan
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Daftar Referral</h3>
              <button
                onClick={() => setShowReferralForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
              >
                + Referral Baru
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Nama Siswa
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Alasan
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Risiko
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Konselor
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {referrals.length > 0 ? (
                      referrals.map((ref) => (
                        <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(ref.referral_date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {ref.student_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {ref.referral_reason}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                                ref.risk_level
                              )}`}
                            >
                              {ref.risk_level?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {ref.counselor_name || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedReferral(ref)
                                setShowSessionForm(true)
                              }}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                            >
                              Jadwalkan
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Tidak ada referral
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <section className="mt-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Catatan Kasus</h3>
            <div className="space-y-4">
              {caseNotes.length > 0 ? (
                caseNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{note.jenis_catat}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(note.tanggal_catat).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        {note.tingkat_kerahasiaan}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {note.isi_catat}
                    </p>
                    <p className="text-xs text-gray-600 mt-4">
                      Oleh: {note.counselor_name}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Tidak ada catatan</div>
              )}
            </div>
          </section>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <section className="mt-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Perkembangan Siswa</h3>
            <div className="space-y-4">
              {progress.length > 0 ? (
                progress.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">
                        Evaluasi {new Date(p.tanggal_evaluasi).toLocaleDateString('id-ID')}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.status_keseluruhan === 'improving'
                            ? 'bg-green-100 text-green-800'
                            : p.status_keseluruhan === 'declining'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.status_keseluruhan?.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Perilaku</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {p.perilaku_skor || '-'}/5
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Akademik</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {p.akademik_skor || '-'}/5
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Emosi</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {p.emosi_skor || '-'}/5
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Kehadiran</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {p.kehadiran_skor || '-'}/5
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Tidak ada data perkembangan</div>
              )}
            </div>
          </section>
        )}

        {/* Filter Section */}
        <section className="mt-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Filter Data Bimbingan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Siswa
                </label>
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="all">Semua Siswa</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id.toString()}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setSelectedName('all')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="all">Semua Kelas</option>
                  {uniqueClasses.map((kls) => (
                    <option key={kls} value={kls}>
                      {kls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Bimbingan
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="all">Semua Status</option>
                  <option value="Normal">Normal</option>
                  <option value="Peringatan">Peringatan</option>
                  <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut</option>
                </select>
              </div>
            </div>

            {(selectedName !== 'all' || selectedClass !== 'all' || selectedStatus !== 'all') && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <span>Filter aktif: </span>
                {selectedName !== 'all' && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Siswa:{' '}
                    {filteredStudents.find((s) => s.id.toString() === selectedName)?.name}
                  </span>
                )}
                {selectedClass !== 'all' && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Kelas: {selectedClass}
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Status: {selectedStatus}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Student Guidance Table */}
        <section className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Konselor
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Sesi Terakhir
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-600">{student.nisn}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{student.className}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{student.counselor}</td>
                        <td className="px-6 py-4">
                          <GuidanceStatusBadge status={student.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {typeof student.lastSession === 'string'
                            ? new Date(student.lastSession).toLocaleDateString('id-ID')
                            : student.lastSession}
                        </td>
                        <td className="px-6 py-4">
                          <button className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
                            <MessageSquare className="w-4 h-4" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada data bimbingan yang sesuai dengan filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-green-900 mb-3">✨ Rekomendasi Konselor</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ Terus terapkan teknik manajemen waktu yang sudah diajarkan</li>
              <li>✓ Catat perkembangan harian dalam jurnal untuk evaluasi lebih baik</li>
              <li>✓ Jangan ragu untuk menghubungi konselor jika ada kendala</li>
              <li>✓ Diskusikan pencapaian Anda dengan orang tua</li>
              <li>✓ Rencanakan tujuan jangka panjang pada sesi berikutnya</li>
            </ul>
          </div>
        </section>
      </div>
      )}

      {/* Session Detail Modal */}
      {isModalOpen && selectedSession && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <SessionDetailModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              sessionNumber={`Sesi ${selectedSession.sesi_ke}`}
              counselor={selectedSession.counselor_name}
              date={new Date(selectedSession.tanggal_sesi).toLocaleDateString('id-ID')}
              title={selectedSession.topik_pembahasan}
              topic={selectedSession.topik_pembahasan}
              notes={selectedSession.catatan_sesi || ''}
              status={
                selectedSession.status === 'completed'
                  ? 'Selesai'
                  : selectedSession.status === 'scheduled'
                    ? 'Terjadwal'
                    : 'Dalam Proses'
              }
            />
          </div>
        </>
      )}

      {/* Referral Form Modal */}
      {showReferralForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Buat Referral Bimbingan</h3>
                <button
                  onClick={() => setShowReferralForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReferral} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    ID Siswa
                  </label>
                  <input
                    type="number"
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Siswa
                  </label>
                  <input
                    type="text"
                    value={formData.student_name}
                    onChange={(e) =>
                      setFormData({ ...formData, student_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Alasan Referral
                  </label>
                  <textarea
                    value={formData.referral_reason}
                    onChange={(e) =>
                      setFormData({ ...formData, referral_reason: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tingkat Risiko
                  </label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) =>
                      setFormData({ ...formData, risk_level: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="green">Hijau (Rendah)</option>
                    <option value="yellow">Kuning (Sedang)</option>
                    <option value="orange">Oranye (Tinggi)</option>
                    <option value="red">Merah (Sangat Tinggi)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReferralForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Buat Referral
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Session Form Modal */}
      {showSessionForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Jadwalkan Sesi Bimbingan</h3>
                <button
                  onClick={() => setShowSessionForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                {selectedReferral && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Siswa:</strong> {selectedReferral.student_name}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tanggal Sesi
                  </label>
                  <input
                    type="date"
                    value={sessionFormData.tanggal_sesi}
                    onChange={(e) =>
                      setSessionFormData({
                        ...sessionFormData,
                        tanggal_sesi: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Jam
                  </label>
                  <input
                    type="time"
                    value={sessionFormData.jam_sesi}
                    onChange={(e) =>
                      setSessionFormData({
                        ...sessionFormData,
                        jam_sesi: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Topik Pembahasan
                  </label>
                  <textarea
                    value={sessionFormData.topik_pembahasan}
                    onChange={(e) =>
                      setSessionFormData({
                        ...sessionFormData,
                        topik_pembahasan: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSessionForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Jadwalkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StatusBimbinganPage
