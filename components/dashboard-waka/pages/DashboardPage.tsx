'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Clock, CheckCircle, Users } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface Statistics {
  pending: number
  inReview: number
  decided: number
  executed: number
  appealed: number
  sp3Total: number
  doTotal: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await apiRequest('/api/v1/pembinaan-waka/statistics')
      setStats(response.data || response)
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

  const statCards = [
    {
      label: 'Kasus Menunggu',
      value: stats?.pending || 0,
      color: 'bg-yellow-50',
      icon: AlertCircle,
      textColor: 'text-yellow-600'
    },
    {
      label: 'Dalam Review',
      value: stats?.inReview || 0,
      color: 'bg-blue-50',
      icon: Clock,
      textColor: 'text-blue-600'
    },
    {
      label: 'Sudah Diputuskan',
      value: stats?.decided || 0,
      color: 'bg-purple-50',
      icon: CheckCircle,
      textColor: 'text-purple-600'
    },
    {
      label: 'Sudah Dijalankan',
      value: stats?.executed || 0,
      color: 'bg-green-50',
      icon: CheckCircle,
      textColor: 'text-green-600'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard WAKA</h1>
        <p className="text-gray-600 mt-2">Selamat datang di sistem pengambilan keputusan pembinaan siswa</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className={`${card.color} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${card.textColor} opacity-60`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* SP3 Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">SP3 Issued</h3>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-orange-600">{stats?.sp3Total || 0}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Surat Peringatan Ketiga (SP3) yang telah dikeluarkan</p>
        </div>

        {/* Dropout Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dropout (DO)</h3>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-red-600">{stats?.doTotal || 0}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Peserta didik yang dimutasikan/drop out</p>
        </div>
      </div>

      {/* Action Background Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">SISTEM PENGAMBILAN KEPUTUSAN</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Telaah kasus pembinaan siswa yang diajukan oleh BK/Kesiswaan</li>
              <li>• Tentukan tindak lanjut: SP3 (Surat Peringatan 3) atau DO (Drop Out)</li>
              <li>• Notifikasi kepada siswa dan orang tua akan dikirimkan otomatis</li>
              <li>• Kelola appeals dari siswa yang tidak setuju dengan keputusan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
