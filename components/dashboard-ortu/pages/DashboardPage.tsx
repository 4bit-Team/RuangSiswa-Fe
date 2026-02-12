'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getPembinaanOrtuForParent } from '@/lib/api'
import { AlertCircle, FileText, Calendar, MapPin, MessageSquare, Check } from 'lucide-react'
import SuratPemanggilanCard from '../components/SuratPemanggilanCard'
import StatisticCard from '../components/StatisticCard'
import DetailModal from '../components/DetailModal'

interface PembinaanOrtu {
  id: number
  student_name: string
  student_class: string
  violation_details: string
  letter_content: string
  scheduled_date: Date | string
  scheduled_time?: string
  location?: string
  status: 'pending' | 'sent' | 'read' | 'responded' | 'closed'
  createdAt: Date | string
}

const DashboardPage = () => {
  const { token, user } = useAuth()
  const [pembinaanList, setPembinaanList] = useState<PembinaanOrtu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPembinaan, setSelectedPembinaan] = useState<PembinaanOrtu | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!user?.id) {
          setError('User tidak teridentifikasi')
          return
        }

        const data = await getPembinaanOrtuForParent(user.id, token)
        setPembinaanList(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data surat pemanggilan')
        console.error('Error fetching pembinaan ortu:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id && token) {
      fetchData()
    }
  }, [token, user?.id])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: pembinaanList.length,
      pending: pembinaanList.filter(p => p.status === 'pending').length,
      sent: pembinaanList.filter(p => p.status === 'sent').length,
      responded: pembinaanList.filter(p => p.status === 'responded').length,
      closed: pembinaanList.filter(p => p.status === 'closed').length,
    }
  }, [pembinaanList])

  // Sort by newest first
  const sortedPembinaan = useMemo(() => {
    return [...pembinaanList].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [pembinaanList])

  const handleViewDetail = (pembinaan: PembinaanOrtu) => {
    setSelectedPembinaan(pembinaan)
    setIsDetailOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu Dikirim', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      sent: { label: 'Sudah Dikirim', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      read: { label: 'Sudah Dibaca', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      responded: { label: 'Sudah Direspons', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      closed: { label: 'Selesai', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor}`}>{config.label}</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Portal Orang Tua</h1>
          <p className="text-slate-600">Kelola surat pemanggilan dan komunikasi dengan sekolah</p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatisticCard
            label="Total Surat"
            value={stats.total}
            icon="📋"
            color="bg-blue-50 text-blue-700"
          />
          <StatisticCard
            label="Menunggu Dikirim"
            value={stats.pending}
            icon="⏳"
            color="bg-yellow-50 text-yellow-700"
          />
          <StatisticCard
            label="Sudah Dikirim"
            value={stats.sent}
            icon="✉️"
            color="bg-cyan-50 text-cyan-700"
          />
          <StatisticCard
            label="Direspons"
            value={stats.responded}
            icon="💬"
            color="bg-purple-50 text-purple-700"
          />
          <StatisticCard
            label="Selesai"
            value={stats.closed}
            icon="✅"
            color="bg-green-50 text-green-700"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Terjadi Kesalahan</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && pembinaanList.length === 0 && (
          <div className="border border-slate-200 bg-white rounded-lg p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Tidak ada surat pemanggilan</h3>
            <p className="text-slate-600">Anda tidak memiliki surat pemanggilan dari sekolah saat ini</p>
          </div>
        )}

        {/* Surat Pemanggilan List */}
        {!loading && !error && pembinaanList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Surat Pemanggilan</h2>
              <span className="text-sm text-slate-600">{sortedPembinaan.length} surat</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedPembinaan.map(pembinaan => (
                <SuratPemanggilanCard
                  key={pembinaan.id}
                  pembinaan={pembinaan}
                  onViewDetail={handleViewDetail}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedPembinaan && (
        <DetailModal
          pembinaan={selectedPembinaan}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onRefresh={() => {
            if (user?.id) {
              getPembinaanOrtuForParent(user.id, token).then(data => {
                setPembinaanList(Array.isArray(data) ? data : data.data || [])
              })
            }
          }}
        />
      )}
    </div>
  )
}

export default DashboardPage
