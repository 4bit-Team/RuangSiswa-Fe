'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { AlertTriangle, Plus, Trash2, Filter, Eye, AlertCircle, BookOpen, X, BarChart3, Upload } from 'lucide-react'
import ViolationDetailModal from '../modals/ViolationDetailModal'
import { useAuth } from '@/hooks/useAuth'
import { getPembinaan, fetchAndSyncPembinaan, updatePembinaan, createPembinaanReservasi, apiRequest } from '@/lib/api'

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
  nama_pelanggaran: string
  category_point: string
  bobot: number
  deskripsi?: string
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
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'ringan' | 'berat' | null>(null)
  const [actionData, setActionData] = useState({
    hasil_pembinaan: '',
    catatan_bk: '',
    recommendation: '',
    preferredDate: '',
    preferredTime: '',
    counselingType: 'khusus' as const,
  })
  // Point Library States
  const [points, setPoints] = useState<PointPelanggaran[]>([])
  const [pointLoading, setPointLoading] = useState(false)
  const [pointError, setPointError] = useState<string | null>(null)
  const [isPointFormOpen, setIsPointFormOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<PointPelanggaran | null>(null)
  const [pointFormData, setPointFormData] = useState({
    nama_pelanggaran: '',
    category_point: 'kehadiran',
    bobot: 10,
    deskripsi: '',
  })
  // PDF Import States
  const [isImportPdfOpen, setIsImportPdfOpen] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfImporting, setPdfImporting] = useState(false)
  const [pdfImportResult, setPdfImportResult] = useState<any>(null)

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
      setPointFormData({ nama_pelanggaran: '', category_point: 'kehadiran', bobot: 10, deskripsi: '' })
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
      setPointFormData({ nama_pelanggaran: '', category_point: 'kehadiran', bobot: 10, deskripsi: '' })
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

  // Handle PDF Import
  const handleImportPdf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) {
      alert('Pilih file PDF terlebih dahulu')
      return
    }

    try {
      setPdfImporting(true)
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
      alert(
        `Import berhasil! Diimport: ${result.total_imported}, Dilewati: ${result.total_skipped}, Error: ${result.errors.length}`,
      )
      setIsImportPdfOpen(false)
      setPdfFile(null)
      await fetchPoints()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengimport PDF')
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

  const filteredStudentsDropdown = useMemo(() => {
    if (selectedClass === 'all') return allStudents
    return allStudents.filter((s) => s.className === selectedClass)
  }, [selectedClass, allStudents])

  const handleOpenActionModal = (pembinaan: PembinaanRecord, type: 'ringan' | 'berat') => {
    setSelectedPembinaan(pembinaan)
    setActionType(type)
    setActionData({
      hasil_pembinaan: '',
      catatan_bk: '',
      recommendation: '',
      preferredDate: '',
      preferredTime: '',
      counselingType: 'khusus' as const,
    })
    setIsActionModalOpen(true)
  }

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPembinaan || !actionType || !user) return

    try {
      // Step 1: Update pembinaan status
      await updatePembinaan(selectedPembinaan.id, {
        status: 'in_progress',
        hasil_pembinaan: actionData.hasil_pembinaan,
        catatan_bk: actionData.catatan_bk,
      }, token)

      // Step 2: Create pembinaan reservasi
      const reservasiPayload = {
        pembinaan_id: selectedPembinaan.id,
        counselorId: user.id,
        pembinaanType: actionType,
        preferredDate: actionData.preferredDate || new Date().toISOString().split('T')[0],
        preferredTime: actionData.preferredTime || '09:00',
        type: 'tatap-muka',
        notes: actionData.catatan_bk,
      }

      await createPembinaanReservasi(reservasiPayload, token)

      alert(`Pembinaan ${actionType === 'ringan' ? 'ringan' : 'berat'} berhasil disimpan dan reservasi berhasil dibuat!`)
      setIsActionModalOpen(false)
      await fetchPembinaan()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan tindak lanjut')
      console.error('Error in handleSubmitAction:', err)
    }
  }

  return (
    <div className="space-y-6">
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
                {syncing ? 'Sinkronisasi...' : 'Sinkronisasi dari WALASU'}
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
                      setPointFormData({ nama_pelanggaran: '', category_point: 'kehadiran', bobot: 10, deskripsi: '' })
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
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Pelanggaran</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kategori</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Poin</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deskripsi</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {points.length > 0 ? (
                        points.map((point) => (
                          <tr key={point.id} className="hover:bg-gray-50 transition-colors">
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
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Belum ada point pelanggaran
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

      {/* Action Modal */}
      {isActionModalOpen && selectedPembinaan && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Pembinaan {actionType === 'ringan' ? 'Ringan' : 'Berat'}
                </h3>
                <button
                  onClick={() => setIsActionModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Siswa</p>
                <p className="text-lg font-semibold text-gray-900">{selectedPembinaan.siswas_name}</p>
                <p className="text-sm text-gray-600">Poin: {selectedPembinaan.point_pelanggaran?.bobot || 0}</p>
              </div>

              <form onSubmit={handleSubmitAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hasil Pembinaan<span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={actionData.hasil_pembinaan}
                    onChange={(e) =>
                      setActionData({ ...actionData, hasil_pembinaan: e.target.value })
                    }
                    rows={3}
                    placeholder="Jelaskan hasil pembinaan yang telah dilakukan..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catatan BK<span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={actionData.catatan_bk}
                    onChange={(e) => setActionData({ ...actionData, catatan_bk: e.target.value })}
                    rows={3}
                    placeholder="Catatan atau rekomendasi dari BK..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Jadwal
                    </label>
                    <input
                      type="date"
                      value={actionData.preferredDate}
                      onChange={(e) => setActionData({ ...actionData, preferredDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Waktu Jadwal
                    </label>
                    <input
                      type="time"
                      value={actionData.preferredTime}
                      onChange={(e) => setActionData({ ...actionData, preferredTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">ℹ️ Info:</span> Pembinaan ini akan{' '}
                    {actionType === 'ringan'
                      ? 'diteruskan ke BK untuk konseling lanjutan'
                      : 'diteruskan ke WAKA untuk keputusan SP3/DO'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsActionModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-semibold ${
                      actionType === 'ringan'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    Kirim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

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
                    <option value="kehadiran">Kehadiran</option>
                    <option value="pakaian">Pakaian</option>
                    <option value="kepribadian">Kepribadian</option>
                    <option value="ketertiban">Ketertiban</option>
                    <option value="kesehatan">Kesehatan</option>
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
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Import Tata Tertib dari PDF</h3>
                <button
                  onClick={() => {
                    setIsImportPdfOpen(false)
                    setPdfFile(null)
                    setPdfImportResult(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 mb-2">
                  <span className="font-semibold">ℹ️ Format PDF:</span>
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Halaman 1: Nama sekolah dengan tahun (misal: SMKN 1 Cbn-CabDin.Wil 1/2023)</li>
                  <li>Halaman 4-5: Tabel "DAFTAR KREDIT POIN PELANGGARAN SISWA"</li>
                  <li>Kolom: JENIS PELANGGARAN | KODE | BOBOT</li>
                </ul>
              </div>

              {pdfImportResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-green-800 mb-2">✅ Import Berhasil!</p>
                  <div className="text-xs text-green-700 space-y-1">
                    <p>Diimport: <span className="font-bold">{pdfImportResult.total_imported}</span></p>
                    <p>Dilewati: <span className="font-bold">{pdfImportResult.total_skipped}</span></p>
                    <p>Error: <span className="font-bold">{pdfImportResult.errors.length}</span></p>
                  </div>
                </div>
              )}

              <form onSubmit={handleImportPdf} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih File PDF<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  {pdfFile && (
                    <p className="text-xs text-gray-500 mt-2">
                      📄 {pdfFile.name} ({(pdfFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportPdfOpen(false)
                      setPdfFile(null)
                      setPdfImportResult(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={pdfImporting || !pdfFile}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {pdfImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengimport...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import
                      </>
                    )}
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

export default PelanggaranPage
