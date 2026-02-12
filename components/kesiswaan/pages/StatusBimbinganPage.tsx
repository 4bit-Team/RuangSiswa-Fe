'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, AlertCircle, Search, CheckCircle, TrendingUp } from 'lucide-react'
import { getAllLaporanBk } from '@/lib/laporanBkAPI'
import { useAuth } from '@/hooks/useAuth'
import { LaporanBk } from '@/types'

interface GuidanceProgress {
  totalReports: number
  completedReports: number
  draftReports: number
  progressPercentage: number
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
  const [laporanBk, setLaporanBk] = useState<LaporanBk[]>([])
  const [selectedReport, setSelectedReport] = useState<LaporanBk | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ===== DATA LOADING =====
  useEffect(() => {
    loadLaporanBk()
  }, [token])

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
      default:
        return status || 'Tidak Diketahui'
    }
  }

  const filteredReports = laporanBk.filter(
    (laporan) =>
      laporan.namaKonseling?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laporan.deskripsiKasusMasalah?.toLowerCase().includes(searchQuery.toLowerCase()),
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
                <h2 className="text-3xl font-bold mb-2">Laporan BK</h2>
                <p className="text-pink-50">Lihat laporan bimbingan konseling dari tim BK</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<BookOpen className="w-12 h-12" />}
              label="Total Laporan"
              value={progressData.totalReports}
              color="bg-gradient-to-br from-blue-400 to-blue-600"
            />
            <StatCard
              icon={<CheckCircle className="w-12 h-12" />}
              label="Selesai"
              value={progressData.completedReports}
              color="bg-gradient-to-br from-green-400 to-green-600"
            />
            <StatCard
              icon={<TrendingUp className="w-12 h-12" />}
              label="Progress"
              value={`${progressData.progressPercentage}%`}
              color="bg-gradient-to-br from-orange-400 to-orange-600"
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari laporan berdasarkan nama konseling atau deskripsi kasus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          {/* Laporan BK Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {filteredReports.length > 0 ? (
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
                    {filteredReports.map((laporan) => (
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
            )}
          </div>

          {/* Detail Modal */}
          {showDetailModal && selectedReport && (
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
