'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { AlertTriangle, Plus, Trash2, Filter, Eye, AlertCircle, BookOpen, X, BarChart3, Upload } from 'lucide-react'
import ViolationDetailModal from '../modals/ViolationDetailModal'
import { BKActionModal, OrtuActionModal, WakaActionModal } from '../modals/PembinaanModal'

// Scanning animation styles
const scanningStyles = `
  @keyframes scanLine {
    0% {
      transform: translateY(-100%);
      opacity: 1;
    }
    100% {
      transform: translateY(100%);
      opacity: 0.3;
    }
  }
  
  @keyframes scanPulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
    }
  }
  
  .scan-active {
    animation: scanPulse 2s infinite;
  }
`
import { useAuth } from '@/hooks/useAuth'
import { getPembinaan, fetchAndSyncPembinaan, updatePembinaan, createPembinaanReservasi, apiRequest, createPembinaanRingan, createPembinaanOrtu, createPembinaanBerat } from '@/lib/api'

interface PembinaanRecord {
  id: number
  walas_id: number
  walas_name: string
  siswas_id: number
  siswas_name: string
  kasus: string
  tindak_lanjut: string
  keterangan: string
  tanggal_pembinaan: string
  class_id?: number
  class_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
  match_type: 'exact' | 'keyword' | 'category' | 'manual' | 'none'
  match_confidence: number
  match_explanation: string
  point_pelanggaran_id?: number
  point_pelanggaran?: {
    id: number
    nama_pelanggaran: string
    category_point: string
    bobot: number
    deskripsi?: string
  }
}

interface Student {
  id: number
  name: string
  nisn: string
  className: string
}

interface PointPelanggaran {
  id: number
  kode: string
  nama_pelanggaran: string
  category_point: string
  bobot: number
  deskripsi?: string
  isSanksi?: boolean
  isDo?: boolean
}

const PointBadge: React.FC<{ bobot: number; nama: string }> = ({ bobot, nama }) => {
  const getBgColor = (bobot: number) => {
    if (bobot >= 80) return 'bg-red-100 text-red-800'
    if (bobot >= 50) return 'bg-orange-100 text-orange-800'
    if (bobot >= 30) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${getBgColor(bobot)}`}>
      <span className="text-lg">{bobot}</span> poin - {nama}
    </div>
  )
}

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors: Record<string, string> = {
    kehadiran: 'bg-blue-100 text-blue-800',
    pakaian: 'bg-purple-100 text-purple-800',
    kepribadian: 'bg-pink-100 text-pink-800',
    ketertiban: 'bg-indigo-100 text-indigo-800',
    kesehatan: 'bg-green-100 text-green-800',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[category] || colors.kehadiran}`}>
      {category}
    </span>
  )
}

// Category to code mapping (A-K)
const CATEGORY_CODE_ORDER: Record<string, string> = {
  'Keterlambatan': 'A',
  'Kehadiran': 'B',
  'Pakaian': 'C',
  'Kepribadian': 'D',
  'Ketertiban': 'E',
  'Merokok': 'F',
  'Pornografi': 'G',
  'Senjata Tajam': 'H',
  'Narkoba': 'I',
  'Berkelahi': 'J',
  'Intimidasi': 'K',
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({
  icon,
  label,
  value,
  color,
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

const PelanggaranPage: React.FC = () => {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pembinaan' | 'point-library'>('pembinaan')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [pembinaans, setPembinaans] = useState<PembinaanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [selectedPembinaan, setSelectedPembinaan] = useState<PembinaanRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isBKModalOpen, setIsBKModalOpen] = useState(false)
  const [isOrtuModalOpen, setIsOrtuModalOpen] = useState(false)
  const [isWakaModalOpen, setIsWakaModalOpen] = useState(false)
  // Point Library States
  const [points, setPoints] = useState<PointPelanggaran[]>([])
  const [pointLoading, setPointLoading] = useState(false)
  const [pointError, setPointError] = useState<string | null>(null)
  const [isPointFormOpen, setIsPointFormOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<PointPelanggaran | null>(null)
  const [pointFormData, setPointFormData] = useState({
    nama_pelanggaran: '',
    category_point: '',
    bobot: 10,
    deskripsi: '',
  })
  // PDF Import States
  const [isImportPdfOpen, setIsImportPdfOpen] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfImporting, setPdfImporting] = useState(false)
  const [pdfImportResult, setPdfImportResult] = useState<any>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfScanProgress, setPdfScanProgress] = useState<{
    isScanning: boolean
    currentPage: number
    pointsPerPage: { [key: number]: number }
    totalPointsFound: number
    debugLog: string[]
  }>({
    isScanning: false,
    currentPage: 0,
    pointsPerPage: {},
    totalPointsFound: 0,
    debugLog: [],
  })
  // Point Library Filter States
  const [pointSearchTerm, setPointSearchTerm] = useState('')
  const [pointSelectedCategory, setPointSelectedCategory] = useState('all')
  const [pointSortOrder, setPointSortOrder] = useState<'asc' | 'desc'>('asc')

  // Fetch pembinaan data dari backend
  const fetchPembinaan = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPembinaan(token)
      setPembinaans(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pembinaan')
      console.error('Error fetching pembinaan:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPembinaan()
    fetchPoints()
  }, [token])

  // Fetch Point Pelanggaran
  const fetchPoints = async () => {
    try {
      setPointLoading(true)
      setPointError(null)
      const data = await apiRequest('/point-pelanggaran', 'GET', undefined, token)
      setPoints(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setPointError(err instanceof Error ? err.message : 'Gagal memuat point pelanggaran')
      console.error('Error fetching points:', err)
    } finally {
      setPointLoading(false)
    }
  }

  // Create Point Pelanggaran
  const handleCreatePoint = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiRequest('/point-pelanggaran', 'POST', pointFormData, token)
      alert('Point pelanggaran berhasil ditambahkan!')
      setIsPointFormOpen(false)
      setPointFormData({ nama_pelanggaran: '', category_point: '', bobot: 10, deskripsi: '' })
      await fetchPoints()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuat point pelanggaran')
    }
  }

  // Update Point Pelanggaran
  const handleUpdatePoint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPoint) return
    try {
      await apiRequest(`/point-pelanggaran/${editingPoint.id}`, 'PUT', pointFormData, token)
      alert('Point pelanggaran berhasil diperbarui!')
      setIsPointFormOpen(false)
      setEditingPoint(null)
      setPointFormData({ nama_pelanggaran: '', category_point: '', bobot: 10, deskripsi: '' })
      await fetchPoints()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengupdate point pelanggaran')
    }
  }

  // Delete Point Pelanggaran
  const handleDeletePoint = async (pointId: number) => {
    if (!confirm('Yakin ingin menghapus point pelanggaran ini?')) return
    try {
      await apiRequest(`/point-pelanggaran/${pointId}`, 'DELETE', undefined, token)
      alert('Point pelanggaran berhasil dihapus!')
      await fetchPoints()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus point pelanggaran')
    }
  }

  // Handle edit point
  const handleEditPoint = (point: PointPelanggaran) => {
    setEditingPoint(point)
    setPointFormData({
      nama_pelanggaran: point.nama_pelanggaran,
      category_point: point.category_point,
      bobot: point.bobot,
      deskripsi: point.deskripsi || '',
    })
    setIsPointFormOpen(true)
  }

  // Handle PDF file selection with preview
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFile(file)
      // Create URL for PDF preview
      const url = URL.createObjectURL(file)
      setPdfPreviewUrl(url)
    }
  }

  // Handle PDF Import with real-time progress
  const handleImportPdf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) {
      alert('Pilih file PDF terlebih dahulu')
      return
    }

    try {
      setPdfImporting(true)
      setPdfScanProgress({
        isScanning: true,
        currentPage: 0,
        pointsPerPage: {},
        totalPointsFound: 0,
        debugLog: ['📂 Memulai scan PDF...'],
      })

      const formData = new FormData()
      formData.append('file', pdfFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/point-pelanggaran/import-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Gagal mengimport PDF')
      }

      const result = await response.json()
      setPdfImportResult(result)
      
      // Build detailed debug log
      const debugLog: string[] = ['📂 Memulai scan PDF...']
      
      if (result.debugLog) {
        debugLog.push(``)
        debugLog.push(`=== DEBUG INFORMATION ===`)
        debugLog.push(`📊 Total points ditemukan: ${result.debugLog.totalExtracted}`)
        debugLog.push(``)
        debugLog.push(`📄 Data Per Halaman:`)
        Object.entries(result.debugLog.pointsPerPage).forEach(([page, count]) => {
          debugLog.push(`   Halaman ${page}: ${count} point(s)`)
        })
      }

      debugLog.push(``)
      debugLog.push(`✅ Scan selesai!`)
      debugLog.push(``)
      debugLog.push(`📊 HASIL IMPORT:`)
      debugLog.push(`Total points ditemukan: ${result.debugLog?.totalExtracted || result.total_imported + result.total_skipped}`)
      debugLog.push(`✅ Berhasil diimport: ${result.total_imported}`)
      debugLog.push(`⏭️  Dilewati (sudah ada): ${result.total_skipped}`)
      debugLog.push(`❌ Error: ${result.errors.length}`)

      // Update progress dengan hasil final
      setPdfScanProgress((prev) => ({
        ...prev,
        isScanning: false,
        totalPointsFound: result.debugLog?.totalExtracted || result.total_imported + result.total_skipped,
        pointsPerPage: result.debugLog?.pointsPerPage || {},
        debugLog,
      }))

      alert(
        `Import berhasil! Diimport: ${result.total_imported}, Dilewati: ${result.total_skipped}, Error: ${result.errors.length}`,
      )
      
      // Tutup form setelah delay
      // setTimeout(() => {
      //   setIsImportPdfOpen(false)
      //   setPdfFile(null)
      //   setPdfPreviewUrl(null)
      //   setPdfScanProgress({
      //     isScanning: false,
      //     currentPage: 0,
      //     pointsPerPage: {},
      //     totalPointsFound: 0,
      //     debugLog: [],
      //   })
      // }, 2000)

      await fetchPoints()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengimport PDF'
      alert(errorMsg)
      setPdfScanProgress((prev) => ({
        ...prev,
        isScanning: false,
        debugLog: [...prev.debugLog, `❌ Error: ${errorMsg}`],
      }))
    } finally {
      setPdfImporting(false)
    }
  }

  // Handle sync from WALASU
  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)

      const result = await fetchAndSyncPembinaan(token)
      console.log('Fetch-sync result:', result)

      // Refresh data
      await fetchPembinaan()
      alert(`Sinkronisasi pembinaan berhasil! Synced: ${result.synced}, Skipped: ${result.skipped}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal sinkronisasi pembinaan'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
    } finally {
      setSyncing(false)
    }
  }

  // Extract unique students and classes
  const allStudents = useMemo(() => {
    const map = new Map()
    pembinaans.forEach((p) => {
      if (!map.has(p.siswas_id)) {
        map.set(p.siswas_id, {
          id: p.siswas_id,
          name: p.siswas_name,
          nisn: p.siswas_name,
          className: p.class_name,
        })
      }
    })
    return Array.from(map.values())
  }, [pembinaans])

  const classes = useMemo(() => {
    return Array.from(new Set(pembinaans.map((p) => p.class_name).filter(Boolean)))
  }, [pembinaans])

  const statuses = ['pending', 'in_progress', 'completed', 'archived']

  // Calculate statistics
  const stats = useMemo(
    () => ({
      total: pembinaans.length,
      pending: pembinaans.filter((p) => p.status === 'pending').length,
      inProgress: pembinaans.filter((p) => p.status === 'in_progress').length,
      highPoint: pembinaans.filter((p) => p.point_pelanggaran?.bobot !== undefined && p.point_pelanggaran.bobot >= 50).length,
    }),
    [pembinaans],
  )

  // Filter pembinaan
  const filteredPembinaan = useMemo(() => {
    return pembinaans.filter((p) => {
      const classMatch = selectedClass === 'all' || p.class_name === selectedClass
      const studentMatch = selectedStudent === 'all' || p.siswas_id.toString() === selectedStudent
      const statusMatch = selectedStatus === 'all' || p.status === selectedStatus
      return classMatch && studentMatch && statusMatch
    })
  }, [pembinaans, selectedClass, selectedStudent, selectedStatus])

  // Filter and sort points library
  const filteredAndSortedPoints = useMemo(() => {
    let filtered = points.filter((point) => {
      const categoryMatch = pointSelectedCategory === 'all' || point.category_point === pointSelectedCategory
      const searchMatch =
        pointSearchTerm === '' ||
        point.nama_pelanggaran.toLowerCase().includes(pointSearchTerm.toLowerCase()) ||
        point.category_point.toLowerCase().includes(pointSearchTerm.toLowerCase()) ||
        point.kode.toLowerCase().includes(pointSearchTerm.toLowerCase())
      return categoryMatch && searchMatch
    })

    // Sort by bobot
    filtered.sort((a, b) => {
      if (pointSortOrder === 'asc') {
        return a.bobot - b.bobot
      } else {
        return b.bobot - a.bobot
      }
    })

    return filtered
  }, [points, pointSelectedCategory, pointSearchTerm, pointSortOrder])

  // Get unique categories from points, sorted by code (A-K)
  const pointCategories = useMemo(() => {
    const categories = Array.from(new Set(points.map((p) => p.category_point).filter(Boolean)))
    
    // Sort by code order (A-K)
    return categories.sort((a, b) => {
      const codeA = CATEGORY_CODE_ORDER[a] || 'Z'
      const codeB = CATEGORY_CODE_ORDER[b] || 'Z'
      return codeA.localeCompare(codeB)
    })
  }, [points])

  const filteredStudentsDropdown = useMemo(() => {
    if (selectedClass === 'all') return allStudents
    return allStudents.filter((s) => s.className === selectedClass)
  }, [selectedClass, allStudents])

  const handleOpenActionModal = (pembinaan: PembinaanRecord, type: 'ringan' | 'ortu' | 'berat') => {
    setSelectedPembinaan(pembinaan)
    if (type === 'ringan') setIsBKModalOpen(true)
    else if (type === 'ortu') setIsOrtuModalOpen(true)
    else if (type === 'berat') setIsWakaModalOpen(true)
  }

  const handleBKSubmit = async (data: any) => {
    if (!selectedPembinaan || !user) return

    try {
      // Create pembinaan ringan record with SP level
      await createPembinaanRingan({
        pembinaan_id: selectedPembinaan.id,
        student_id: selectedPembinaan.siswas_id,
        student_name: selectedPembinaan.siswas_name,
        counselor_id: data.counselor_id,
        hasil_pembinaan: data.hasil_pembinaan || '',
        catatan_bk: data.catatan_bk || '',
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        sp_level: data.sp_level || null,
      }, token)

      // Update pembinaan status
      await updatePembinaan(selectedPembinaan.id, {
        status: 'in_progress',
        hasil_pembinaan: data.hasil_pembinaan,
        catatan_bk: data.catatan_bk,
      }, token)

      alert('Pembinaan ringan berhasil dibuat dan dikirim ke BK!')
      setIsBKModalOpen(false)
      await fetchPembinaan()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuat pembinaan ringan')
      console.error('Error in handleBKSubmit:', err)
    }
  }

  const handleOrtuSubmit = async (data: any) => {
    if (!selectedPembinaan || !user) return

    try {
      // Create pembinaan ortu record
      await createPembinaanOrtu({
        pembinaan_id: selectedPembinaan.id,
        student_id: selectedPembinaan.siswas_id,
        student_name: selectedPembinaan.siswas_name,
        student_class: selectedPembinaan.class_name,
        parent_id: data.parent_id,
        parent_name: data.parent_name,
        parent_phone: data.parent_phone,
        violation_details: data.violation_details,
        letter_content: data.letter_content,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time || '',
        location: data.location || '',
        communication_method: data.communication_method,
      }, token)

      // Update pembinaan status
      await updatePembinaan(selectedPembinaan.id, {
        status: 'in_progress',
      }, token)

      alert('Surat pemanggilan berhasil dibuat dan akan dikirim ke orang tua!')
      setIsOrtuModalOpen(false)
      await fetchPembinaan()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuat pemanggilan ortu')
      console.error('Error in handleOrtuSubmit:', err)
    }
  }

  const handleWakaSubmit = async (data: any) => {
    if (!selectedPembinaan || !user) return

    try {
      // Create pembinaan berat record
      await createPembinaanBerat({
        pembinaan_id: selectedPembinaan.id,
        recommendation: data.recommendation || '',
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
      }, token)

      // Update pembinaan status
      await updatePembinaan(selectedPembinaan.id, {
        status: 'in_progress',
      }, token)

      alert('Pembinaan berat berhasil dibuat dan dikirim ke WAKA!')
      setIsWakaModalOpen(false)
      await fetchPembinaan()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuat pembinaan berat')
      console.error('Error in handleWakaSubmit:', err)
    }
  }

  return (
    <div className="space-y-6">
      <style>{scanningStyles}</style>
      
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-2 text-blue-900 font-medium">Memuat data pembinaan...</p>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Pencatatan Pelanggaran</h2>
                  <p className="text-blue-50">Kelola pembinaan siswa berdasarkan sistem poin tata tertib</p>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all"
              >
                {syncing ? 'Sinkronisasi...' : 'Sinkronisasi dari WALAS'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<BarChart3 className="w-12 h-12" />}
              label="Total Pembinaan"
              value={stats.total}
              color="bg-gradient-to-br from-blue-400 to-blue-600"
            />
            <StatCard
              icon={<AlertCircle className="w-12 h-12" />}
              label="Menunggu"
              value={stats.pending}
              color="bg-gradient-to-br from-yellow-400 to-yellow-600"
            />
            <StatCard
              icon={<BarChart3 className="w-12 h-12" />}
              label="Dalam Proses"
              value={stats.inProgress}
              color="bg-gradient-to-br from-orange-400 to-orange-600"
            />
            <StatCard
              icon={<AlertTriangle className="w-12 h-12" />}
              label="Poin Tinggi (≥50)"
              value={stats.highPoint}
              color="bg-gradient-to-br from-red-400 to-red-600"
            />
          </div>

          {/* Filter Section */}
          {activeTab === 'pembinaan' && (
            <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Filter Data Pembinaan</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value)
                      setSelectedStudent('all')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="all">Semua Kelas</option>
                    {classes.map((kls) => (
                      <option key={kls} value={kls}>
                        {kls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Siswa</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="all">Semua Siswa</option>
                    {filteredStudentsDropdown.map((s) => (
                      <option key={s.id} value={s.id.toString()}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="all">Semua Status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Point Library Filter Section */}
          {activeTab === 'point-library' && (
            <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Filter Point Library</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cari</label>
                  <input
                    type="text"
                    value={pointSearchTerm}
                    onChange={(e) => setPointSearchTerm(e.target.value)}
                    placeholder="Cari nama atau kategori pelanggaran..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                  <select
                    value={pointSelectedCategory}
                    onChange={(e) => setPointSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="all">Semua Kategori</option>
                    {pointCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Urutkan Poin</label>
                  <select
                    value={pointSortOrder}
                    onChange={(e) => setPointSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="asc">Terkecil ke Terbesar</option>
                    <option value="desc">Terbesar ke Terkecil</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pembinaan')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'pembinaan'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Pembinaan
            </button>
            <button
              onClick={() => setActiveTab('point-library')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'point-library'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⭐ Point Library
            </button>
          </div>

          {/* Pembinaan Tab */}
          {activeTab === 'pembinaan' && (
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Siswa</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kasus</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Poin</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kategori</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Match Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPembinaan.length > 0 ? (
                      filteredPembinaan.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{p.siswas_name}</p>
                              <p className="text-xs text-gray-600">{p.class_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{p.kasus}</td>
                          <td className="px-6 py-4">
                            {p.point_pelanggaran ? (
                              <PointBadge bobot={p.point_pelanggaran.bobot} nama={p.point_pelanggaran.nama_pelanggaran} />
                            ) : (
                              <span className="text-gray-500 text-sm">Belum ditugaskan</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {p.point_pelanggaran?.category_point ? (
                              <CategoryBadge category={p.point_pelanggaran.category_point} />
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                                {p.match_type}
                              </span>
                              <span className="text-xs text-gray-600">{p.match_confidence}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                p.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : p.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPembinaan(p)
                                  setIsDetailOpen(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(p, 'ringan')}
                                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg transition-colors font-semibold"
                                title="Pembinaan Ringan ke BK"
                              >
                                Ringan
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(p, 'ortu')}
                                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded-lg transition-colors font-semibold"
                                title="Pemanggilan Orang Tua"
                              >
                                Ortu
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(p, 'berat')}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors font-semibold"
                                title="Pembinaan Berat ke WAKA"
                              >
                                Berat
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          Tidak ada data pembinaan yang sesuai
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Point Library Tab */}
          {activeTab === 'point-library' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Manajemen Point Pelanggaran</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImportPdfOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Upload className="w-4 h-4" />
                    Import dari PDF
                  </button>
                  <button
                    onClick={() => {
                      setEditingPoint(null)
                      setPointFormData({ nama_pelanggaran: '', category_point: '', bobot: 10, deskripsi: '' })
                      setIsPointFormOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Point
                  </button>
                </div>
              </div>

              {pointError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{pointError}</p>
                </div>
              )}

              {pointLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-gray-600">Memuat data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kode</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Pelanggaran</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kategori</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Poin</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deskripsi</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAndSortedPoints.length > 0 ? (
                        filteredAndSortedPoints.map((point) => (
                          <tr key={point.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                                {point.kode}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">{point.nama_pelanggaran}</td>
                            <td className="px-6 py-4">
                              <CategoryBadge category={point.category_point} />
                            </td>
                            <td className="px-6 py-4">
                              <PointBadge bobot={point.bobot} nama="" />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{point.deskripsi || '-'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditPoint(point)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <BookOpen className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePoint(point.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            {points.length === 0 ? 'Belum ada point pelanggaran' : 'Tidak ada hasil yang sesuai dengan filter'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedPembinaan && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Detail Pembinaan</h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Informasi Siswa</h4>
                  <p className="text-gray-700">
                    <span className="font-semibold">Nama:</span> {selectedPembinaan.siswas_name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Kelas:</span> {selectedPembinaan.class_name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Walas:</span> {selectedPembinaan.walas_name}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Kasus & Poin</h4>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Kasus:</span> {selectedPembinaan.kasus}
                  </p>
                  {selectedPembinaan.point_pelanggaran && (
                    <div>
                      <p className="text-gray-700 mb-1">
                        <span className="font-semibold">Poin Tata Tertib:</span>{' '}
                        {selectedPembinaan.point_pelanggaran.nama_pelanggaran}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-red-600">
                          {selectedPembinaan.point_pelanggaran.bobot}
                        </span>
                        {selectedPembinaan.point_pelanggaran.category_point && (
                          <CategoryBadge category={selectedPembinaan.point_pelanggaran.category_point} />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Pencocokan Otomatis</h4>
                  <p className="text-gray-700">
                    <span className="font-semibold">Tipe Match:</span> {selectedPembinaan.match_type}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Confidence:</span> {selectedPembinaan.match_confidence}%
                  </p>
                  <p className="text-gray-700 mt-2">{selectedPembinaan.match_explanation}</p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Tindak Lanjut</h4>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Catatan Walas:</span> {selectedPembinaan.tindak_lanjut}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Keterangan:</span> {selectedPembinaan.keterangan}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      )}

      {/* Action Modals - BK, Ortu, WAKA */}
      <BKActionModal
        isOpen={isBKModalOpen}
        pembinaan={selectedPembinaan}
        onClose={() => setIsBKModalOpen(false)}
        onSubmit={handleBKSubmit}
      />

      <OrtuActionModal
        isOpen={isOrtuModalOpen}
        pembinaan={selectedPembinaan}
        onClose={() => setIsOrtuModalOpen(false)}
        onSubmit={handleOrtuSubmit}
      />

      <WakaActionModal
        isOpen={isWakaModalOpen}
        pembinaan={selectedPembinaan}
        onClose={() => setIsWakaModalOpen(false)}
        onSubmit={handleWakaSubmit}
      />

      {/* Point Form Modal */}
      {isPointFormOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPoint ? 'Edit Point Pelanggaran' : 'Tambah Point Pelanggaran'}
                </h3>
                <button
                  onClick={() => {
                    setIsPointFormOpen(false)
                    setEditingPoint(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingPoint ? handleUpdatePoint : handleCreatePoint} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Pelanggaran<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={pointFormData.nama_pelanggaran}
                    onChange={(e) =>
                      setPointFormData({ ...pointFormData, nama_pelanggaran: e.target.value })
                    }
                    placeholder="Misal: Terlambat masuk sekolah"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori<span className="text-red-600">*</span>
                  </label>
                  <select
                    value={pointFormData.category_point}
                    onChange={(e) =>
                      setPointFormData({ ...pointFormData, category_point: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {pointCategories.length > 0 ? (
                      pointCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Keterlambatan">A - Keterlambatan</option>
                        <option value="Kehadiran">B - Kehadiran</option>
                        <option value="Pakaian">C - Pakaian</option>
                        <option value="Kepribadian">D - Kepribadian</option>
                        <option value="Ketertiban">E - Ketertiban</option>
                        <option value="Merokok">F - Merokok</option>
                        <option value="Pornografi">G - Pornografi</option>
                        <option value="Senjata Tajam">H - Senjata Tajam</option>
                        <option value="Narkoba">I - Narkoba</option>
                        <option value="Berkelahi">J - Berkelahi</option>
                        <option value="Intimidasi">K - Intimidasi</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poin<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={pointFormData.bobot}
                    onChange={(e) =>
                      setPointFormData({ ...pointFormData, bobot: parseInt(e.target.value) })
                    }
                    min="1"
                    max="100"
                    placeholder="Misal: 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Skala 1-100 poin</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    value={pointFormData.deskripsi}
                    onChange={(e) =>
                      setPointFormData({ ...pointFormData, deskripsi: e.target.value })
                    }
                    rows={3}
                    placeholder="Jelaskan deskripsi singkat pelanggaran..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPointFormOpen(false)
                      setEditingPoint(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    {editingPoint ? 'Perbarui' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* PDF Import Modal */}
      {isImportPdfOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Import Point dari PDF</h2>
                <button
                  onClick={() => {
                    setIsImportPdfOpen(false)
                    setPdfFile(null)
                    setPdfPreviewUrl(null)
                    setPdfScanProgress({
                      isScanning: false,
                      currentPage: 0,
                      pointsPerPage: {},
                      totalPointsFound: 0,
                      debugLog: [],
                    })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* PDF Preview Section */}
                <div className="lg:col-span-1 space-y-4">
                  <div className={`bg-gray-50 rounded-lg p-4 border-2 min-h-[400px] flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                    pdfScanProgress.isScanning 
                      ? 'border-blue-500 border-dashed scan-active' 
                      : 'border-dashed border-gray-300'
                  }`}>
                    {pdfScanProgress.isScanning && (
                      <>
                        <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-transparent to-transparent animate-pulse"></div>
                          
                          {/* Scanning line that moves down */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" style={{
                            animation: 'scanLine 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite'
                          }}></div>
                          
                          {/* Multiple scan lines for effect */}
                          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-blue-400/30" style={{
                            animation: 'scanLine 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
                            animationDelay: '0.3s'
                          }}></div>
                          
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-300/20" style={{
                            animation: 'scanLine 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
                            animationDelay: '0.6s'
                          }}></div>
                        </div>
                      </>
                    )}
                    
                    {pdfPreviewUrl ? (
                      <div className="w-full h-full space-y-2 relative z-10">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-700 mb-2">PDF Dipilih</p>
                          <p className="text-xs text-gray-600">{pdfFile?.name}</p>
                          <p className="text-xs text-gray-600">
                            Ukuran: {((pdfFile?.size || 0) / 1024).toFixed(2)} KB
                          </p>
                          {pdfScanProgress.isScanning && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs font-semibold text-blue-900">
                                🔍 Sedang scan: Halaman {pdfScanProgress.currentPage}
                              </p>
                              <div className="w-full h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-300 rounded animate-pulse"
                                  style={{ width: '100%' }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <iframe
                            src={pdfPreviewUrl + '#toolbar=0&navpanes=0'}
                            className={`w-full h-80 rounded border transition-all ${
                              pdfScanProgress.isScanning
                                ? 'border-blue-400 shadow-lg shadow-blue-400/50'
                                : 'border-gray-300'
                            }`}
                            style={{ minHeight: '400px' }}
                          />
                          
                          {/* Scanning line overlay on PDF */}
                          {pdfScanProgress.isScanning && (
                            <div 
                              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent pointer-events-none"
                              style={{
                                top: '50%',
                                animation: 'scanLine 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite'
                              }}
                            ></div>
                          )}
                        </div>
                        {pdfScanProgress.isScanning && (
                          <div className="text-center mt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                              Memindai... ({Object.keys(pdfScanProgress.pointsPerPage).length} halaman ditemukan)
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Pilih file PDF untuk preview</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan Progress & Debug Info Section */}
                <div className="lg:col-span-2 space-y-4">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">File PDF</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfFileChange}
                      disabled={pdfImporting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {pdfFile && (
                      <p className="text-xs text-green-600">{pdfFile.name} siap untuk diimport</p>
                    )}
                  </div>

                  {/* Scan Progress */}
                  {pdfScanProgress.isScanning && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <p className="text-sm font-semibold text-blue-900">Sedang memindai PDF...</p>
                      </div>
                      <p className="text-xs text-blue-800">Halaman: {pdfScanProgress.currentPage}</p>
                    </div>
                  )}

                  {/* Debug Log Section */}
                  {/* <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      Debug Scan Information
                    </h4>
                    <div className="bg-white border border-gray-200 rounded p-3 max-h-80 overflow-y-auto font-mono text-xs space-y-1 relative">
                      {pdfScanProgress.isScanning && (
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" style={{
                          top: `${(pdfScanProgress.debugLog.length % 10) * 10}%`,
                          transition: 'top 0.3s ease-in-out'
                        }}></div>
                      )}
                      
                      {pdfScanProgress.debugLog.length === 0 ? (
                        <p className="text-gray-400">Log akan ditampilkan saat scan dimulai...</p>
                      ) : (
                        pdfScanProgress.debugLog.map((log, idx) => (
                          <div 
                            key={idx} 
                            className={`transition-colors ${
                              pdfScanProgress.isScanning && idx === pdfScanProgress.debugLog.length - 1
                                ? 'bg-blue-100 text-blue-900 px-2 py-1 rounded font-semibold'
                                : 'text-gray-700'
                            }`}
                          >
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div> */}

                  {/* Points Per Page Summary */}
                  {Object.keys(pdfScanProgress.pointsPerPage).length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-green-900">Data Ditemukan Per Halaman</h4>
                      <div className="space-y-2">
                        {Object.entries(pdfScanProgress.pointsPerPage).map(([page, count]) => (
                          <div key={page} className="bg-white rounded p-3 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Halaman {page}</p>
                                <p className="text-lg font-bold text-green-600">{count} point(s)</p>
                              </div>
                              {pdfScanProgress.isScanning && (
                                <div className="animate-pulse">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300 rounded-full"
                                style={{ width: '100%' }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white rounded p-3 border border-green-200">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Total Points Ditemukan</p>
                        <p className="text-2xl font-bold text-green-600">{pdfScanProgress.totalPointsFound}</p>
                      </div>
                    </div>
                  )}

                  {/* Form & Submit */}
                  <form onSubmit={handleImportPdf} className="space-y-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={!pdfFile || pdfImporting}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      {pdfImporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sedang mengimport...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Import PDF
                        </>
                      )}
                    </button>
                  </form>

                  {/* Import Result */}
                  {pdfImportResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-green-900">Hasil Import</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white rounded p-2 border border-green-200">
                          <p className="text-gray-600">Berhasil Diimport</p>
                          <p className="text-xl font-bold text-green-600">{pdfImportResult.total_imported}</p>
                        </div>
                        <div className="bg-white rounded p-2 border border-green-200">
                          <p className="text-gray-600">Dilewati</p>
                          <p className="text-xl font-bold text-yellow-600">{pdfImportResult.total_skipped}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PelanggaranPage
