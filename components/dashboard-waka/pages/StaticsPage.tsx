'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'

interface Statistics {
  pending: number
  inReview: number
  decided: number
  executed: number
  appealed: number
  sp3Total: number
  doTotal: number
}

export default function StaticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      // Simulate API call - in production use getApi
      const response = { data: {
        pending: 5,
        inReview: 2,
        decided: 8,
        executed: 12,
        appealed: 1,
        sp3Total: 10,
        doTotal: 2
      }}
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statusFlow = [
    { label: 'Menunggu', value: stats?.pending || 0, color: 'bg-yellow-100', textColor: 'text-yellow-700' },
    { label: 'Review', value: stats?.inReview || 0, color: 'bg-blue-100', textColor: 'text-blue-700' },
    { label: 'Diputuskan', value: stats?.decided || 0, color: 'bg-purple-100', textColor: 'text-purple-700' },
    { label: 'Dijalankan', value: stats?.executed || 0, color: 'bg-green-100', textColor: 'text-green-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistik Pembinaan</h1>
        <p className="text-gray-600 mt-2">Analisis lengkap keputusan dan tindak lanjut pembinaan siswa</p>
      </div>

      {/* Status Flow */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Alur Status Kasus</h2>
        <div className="space-y-4">
          {statusFlow.map((status, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24">
                <p className="text-sm font-medium text-gray-700">{status.label}</p>
              </div>
              <div className="flex-1 relative">
                <div className="flex items-center gap-4">
                  <div className={`${status.color} rounded-lg px-4 py-3 flex-grow flex items-center gap-3`}>
                    <div className={`text-3xl font-bold ${status.textColor}`}>{status.value}</div>
                    <div className="flex-grow">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${status.color}`}
                          style={{ width: `${Math.min((status.value / 15) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Types */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">SP3 (Surat Peringatan 3)</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{stats?.sp3Total || 0}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-200" />
          </div>
          <p className="text-xs text-gray-600">Keputusan memberikan surat peringatan terakhir</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">DO (Drop Out)</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{stats?.doTotal || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-red-200" />
          </div>
          <p className="text-xs text-gray-600">Keputusan mutasi/putus sekolah</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Ringkasan Keputusan</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-gray-600 font-medium">Total Kasus Selesai</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{(stats?.sp3Total || 0) + (stats?.doTotal || 0)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-gray-600 font-medium">Appeal Masuk</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats?.appealed || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-gray-600 font-medium">Tingkat Keputusan</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {stats?.decided ? ((stats.decided / ((stats.pending || 0) + (stats.decided || 0) + (stats.decided || 0))) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
