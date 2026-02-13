'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, AlertCircle, Search, CheckCircle, TrendingUp, FileText } from 'lucide-react'
import { getAllLaporanBk } from '@/lib/laporanBkAPI'
import { getPembinaanRingan } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { LaporanBk } from '@/types'

interface GuidanceProgress {
  totalReports: number
  completedReports: number
  draftReports: number
  progressPercentage: number
}

interface PembinaanRingan {
  id: number
  siswas_name: string
  class_name: string
  kasus: string
  status: string
  scheduled_date: string
  scheduled_time: string
  sp_level?: 'SP1' | 'SP2' | null
  hasil_pembinaan?: string
  catatan_bk?: string
}

const StatCard = ({ icon, label, value, color }: any) => (
  <div className={`${color} rounded-xl p-6 text-white shadow-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className="opacity-20">{icon}</div>
    </div>
  </div>
)

const StatusBimbinganPage: React.FC = () => {
  // ===== AUTH =====
  const { token } = useAuth()

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pembinaan' | 'laporan'>('pembinaan')
  const [laporanBk, setLaporanBk] = useState<LaporanBk[]>([])
  const [pembinaanRingan, setPembinaanRingan] = useState<PembinaanRingan[]>([])
  const [selectedReport, setSelectedReport] = useState<LaporanBk | null>(null)
  const [selectedPembinaan, setSelectedPembinaan] = useState<PembinaanRingan | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ===== DATA LOADING =====
  useEffect(() => {
    loadData()
  }, [token])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!token) return
      
      // Load both laporan BK and pembinaan ringan
      const [laporanData, pembinaanData] = await Promise.all([
        getAllLaporanBk(token),
        getPembinaanRingan(token)
      ])
      
      setLaporanBk(Array.isArray(laporanData) ? laporanData : [])
      setPembinaanRingan(Array.isArray(pembinaanData) ? pembinaanData : [])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal memuat data'
      setError(errorMsg)
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLaporanBk = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!token) return
      const data = await getAllLaporanBk(token)
      setLaporanBk(Array.isArray(data) ? data : [])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal memuat laporan BK'
      setError(errorMsg)
      console.error('Error loading laporan BK:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== HELPERS =====
  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'selesai':
        return 'bg-green-100 text-green-800'
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
      case 'ongoing':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-purple-100 text-purple-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'selesai':
        return 'Selesai'
      case 'draft':
        return 'Draft'
      case 'pending':
        return 'Pending'
      case 'in_progress':
      case 'ongoing':
        return 'Sedang Berjalan'
      case 'approved':
        return 'Disetujui'
      case 'rejected':
        return 'Ditolak'
      default:
        return status || 'Tidak Diketahui'
    }
  }

  const getSPBadgeColor = (spLevel?: string | null) => {
    switch (spLevel) {
      case 'SP1':
        return 'bg-yellow-100 text-yellow-800'
      case 'SP2':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const filteredLaporanBk = laporanBk.filter(
    (laporan) =>
      laporan.namaKonseling?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laporan.deskripsiKasusMasalah?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPembinaan = pembinaanRingan.filter(
    (pembinaan) =>
      pembinaan.siswas_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pembinaan.kasus?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getProgressData = (): GuidanceProgress => {
    const completed = laporanBk.filter(
      (r) =>
        r.statusPerkembanganPesertaDidik === 'completed' ||
        r.statusPerkembanganPesertaDidik === 'selesai',
    ).length
    const total = laporanBk.length
    return {
      totalReports: total,
      completedReports: completed,
      draftReports: laporanBk.filter((r) => r.statusPerkembanganPesertaDidik === 'draft').length,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }

  // Note: progressData not used in new tab-based design, but kept for future reference
  const progressData = getProgressData()

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
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Status Bimbingan</h2>
                <p className="text-pink-50">Lihat histori pembinaan dan laporan bimbingan konseling dari tim BK</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pembinaan')}
              className={`py-3 px-6 font-semibold transition-all border-b-2 ${
                activeTab === 'pembinaan'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                History Pembinaan
              </div>
            </button>
            <button
              onClick={() => setActiveTab('laporan')}
              className={`py-3 px-6 font-semibold transition-all border-b-2 ${
                activeTab === 'laporan'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Laporan BK
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'pembinaan'
                  ? 'Cari pembinaan berdasarkan nama siswa atau kasus...'
                  : 'Cari laporan berdasarkan nama konseling atau deskripsi kasus...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          {/* Laporan BK Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {activeTab === 'pembinaan' ? (
              // TAB 1: HISTORY PEMBINAAN
              filteredPembinaan.length > 0 ? (
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
                          Kasus
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          SP
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Jadwal
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPembinaan.map((pembinaan) => (
                        <tr key={pembinaan.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {pembinaan.siswas_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {pembinaan.class_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <span title={pembinaan.kasus}>
                              {pembinaan.kasus?.substring(0, 40)}
                              {pembinaan.kasus && pembinaan.kasus.length > 40 ? '...' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getSPBadgeColor(
                                pembinaan.sp_level,
                              )}`}
                            >
                              {pembinaan.sp_level || 'Tidak ada SP'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                pembinaan.status,
                              )}`}
                            >
                              {getStatusLabel(pembinaan.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {pembinaan.scheduled_date && pembinaan.scheduled_time
                              ? `${new Date(pembinaan.scheduled_date).toLocaleDateString('id-ID')} ${pembinaan.scheduled_time}`
                              : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedPembinaan(pembinaan)
                                setShowDetailModal(true)
                              }}
                              className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-semibold"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-semibold mb-1">Belum ada history pembinaan</p>
                  <p className="text-sm">
                    {searchQuery ? 'Coba gunakan kata kunci yang berbeda' : 'Pembinaan akan muncul di sini'}
                  </p>
                </div>
              )
            ) : (
              // TAB 2: LAPORAN BK
              filteredLaporanBk.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Nama Konseling
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Tanggal Diproses
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Deskripsi Kasus
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLaporanBk.map((laporan) => (
                        <tr key={laporan.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {laporan.namaKonseling}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {laporan.tanggalDiprosesAiBk
                              ? new Date(laporan.tanggalDiprosesAiBk).toLocaleDateString('id-ID')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <span title={laporan.deskripsiKasusMasalah}>
                              {laporan.deskripsiKasusMasalah?.substring(0, 50)}
                              {laporan.deskripsiKasusMasalah &&
                              laporan.deskripsiKasusMasalah.length > 50
                                ? '...'
                                : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                laporan.statusPerkembanganPesertaDidik,
                              )}`}
                            >
                              {getStatusLabel(laporan.statusPerkembanganPesertaDidik)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedReport(laporan)
                                setShowDetailModal(true)
                              }}
                              className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-semibold mb-1">Belum ada laporan BK</p>
                  <p className="text-sm">
                    {searchQuery ? 'Coba gunakan kata kunci yang berbeda' : 'Laporan akan muncul di sini'}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Detail Modal - Pembinaan */}
          {showDetailModal && selectedPembinaan && activeTab === 'pembinaan' && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={() => setShowDetailModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedPembinaan.siswas_name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Kelas {selectedPembinaan.class_name}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Status Pembinaan</h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                            selectedPembinaan.status,
                          )}`}
                        >
                          {getStatusLabel(selectedPembinaan.status)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Tingkat SP</h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getSPBadgeColor(
                            selectedPembinaan.sp_level,
                          )}`}
                        >
                          {selectedPembinaan.sp_level || 'Tidak ada SP'}
                        </span>
                      </div>
                    </div>

                    {/* Kasus */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Deskripsi Kasus</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedPembinaan.kasus}
                      </p>
                    </div>

                    {/* Jadwal */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Jadwal Pembinaan</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Tanggal</p>
                          <p className="font-semibold text-gray-900">
                            {selectedPembinaan.scheduled_date
                              ? new Date(selectedPembinaan.scheduled_date).toLocaleDateString('id-ID')
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Waktu</p>
                          <p className="font-semibold text-gray-900">
                            {selectedPembinaan.scheduled_time || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hasil & Catatan */}
                    {selectedPembinaan.hasil_pembinaan && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Hasil Pembinaan</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedPembinaan.hasil_pembinaan}
                        </p>
                      </div>
                    )}

                    {selectedPembinaan.catatan_bk && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Catatan BK</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedPembinaan.catatan_bk}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Detail Modal - Laporan BK */}
          {showDetailModal && selectedReport && activeTab === 'laporan' && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={() => setShowDetailModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedReport.namaKonseling}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedReport.tanggalDiprosesAiBk
                          ? new Date(selectedReport.tanggalDiprosesAiBk).toLocaleDateString(
                              'id-ID',
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            )
                          : '-'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Status */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                          selectedReport.statusPerkembanganPesertaDidik,
                        )}`}
                      >
                        {getStatusLabel(selectedReport.statusPerkembanganPesertaDidik)}
                      </span>
                    </div>

                    {/* Deskripsi Kasus */}
                    {selectedReport.deskripsiKasusMasalah && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Deskripsi Kasus</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedReport.deskripsiKasusMasalah}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default StatusBimbinganPage
