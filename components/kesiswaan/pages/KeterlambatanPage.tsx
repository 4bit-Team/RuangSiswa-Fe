'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Clock, AlertCircle, TrendingDown, Calendar, Filter, Loader } from 'lucide-react'
import TardinessDetailModal from '../modals/TardinessDetailModal'
import { getTardinessRecords } from '@/lib/tardinessAPI'
import { useAuth } from '@/hooks/useAuth'

interface TardinessRecord {
  id: number
  studentId: number
  studentName: string
  className: string
  date: string
  time: string
  minutesLate: number
  reason?: string
  status: 'recorded' | 'verified' | 'appealed' | 'resolved'
}

interface TardinessStats {
  totalTardiness: number
  thisMonth: number
  averageMinutes: number
  longestLate: number
}

// Helper function to map status to Indonesian
const mapStatusToIndonesian = (status: 'recorded' | 'verified' | 'appealed' | 'resolved'): 'Tercatat' | 'Termaafkan' => {
  if (status === 'resolved') {
    return 'Termaafkan'
  }
  return 'Tercatat'
}

const TardinessStatusBadge: React.FC<{ status: string }> = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    'recorded': { bg: 'bg-orange-50', text: 'text-orange-700' },
    'verified': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    'appealed': { bg: 'bg-blue-50', text: 'text-blue-700' },
    'resolved': { bg: 'bg-green-50', text: 'text-green-700' },
  }

  const config = statusConfig[status] || statusConfig['recorded']

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
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

const KeterlambatanPage: React.FC = () => {
  const { token } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [selectedTardiness, setSelectedTardiness] = useState<TardinessRecord | null>(null)
  
  // Data states
  const [tardinessRecords, setTardinessRecords] = useState<TardinessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<string[]>([])
  const [students, setStudents] = useState<any[]>([])

  // Fetch tardiness data saat mount atau filter berubah
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build filters
        const filters: any = {
          page: 1,
          limit: 100, // Fetch semua untuk filtering di frontend
        }

        if (selectedStudent !== 'all') {
          filters.student_id = parseInt(selectedStudent)
        }

        if (selectedClass !== 'all') {
          // Need class_id, not class name
          // Map dari class name ke ID (ini akan di-fetch dari backend metadata)
          // For now, use placeholder
          filters.class_name = selectedClass
        }

        // Get current month range
        const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
        const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)

        filters.date_from = monthStart.toISOString().split('T')[0]
        filters.date_to = monthEnd.toISOString().split('T')[0]

        // Call API
        const response = await getTardinessRecords(filters, token)

        if (response.success) {
          setTardinessRecords(response.data || [])
          
          // Extract unique classes dan students dari data
          const uniqueClasses = [...new Set(response.data.map((r: any) => r.className))]
          const uniqueStudents = [...new Map(
            response.data.map((r: any) => [r.studentId, { id: r.studentId, name: r.studentName, className: r.className }])
          ).values()]

          setClasses(uniqueClasses as string[])
          setStudents(uniqueStudents)
        } else {
          setError(response.message || 'Failed to fetch tardiness records')
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data')
        console.error('Error fetching tardiness:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, selectedStudent, selectedClass, token])

  // Calculate stats
  const stats: TardinessStats = useMemo(() => {
    const totalTardiness = tardinessRecords.length
    const thisMonth = tardinessRecords.filter((r: TardinessRecord) => {
      const recordDate = new Date(r.date)
      const currentMonth = new Date()
      return recordDate.getMonth() === currentMonth.getMonth() &&
        recordDate.getFullYear() === currentMonth.getFullYear()
    }).length

    const averageMinutes = totalTardiness > 0
      ? Math.round(tardinessRecords.reduce((sum: number, r: TardinessRecord) => sum + r.minutesLate, 0) / totalTardiness)
      : 0

    const longestLate = totalTardiness > 0
      ? Math.max(...tardinessRecords.map((r: TardinessRecord) => r.minutesLate))
      : 0

    return {
      totalTardiness,
      thisMonth,
      averageMinutes,
      longestLate,
    }
  }, [tardinessRecords])

  const handleDetailClick = (record: TardinessRecord) => {
    setSelectedTardiness(record)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Keterlambatan Masuk</h2>
              <p className="text-red-50">Data real-time dari sistem Walas</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard
            icon={<Clock className="w-12 h-12" />}
            label="Total Keterlambatan"
            value={loading ? '-' : stats.totalTardiness}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
          />
          <StatCard
            icon={<Calendar className="w-12 h-12" />}
            label="Bulan Ini"
            value={loading ? '-' : stats.thisMonth}
            color="bg-gradient-to-br from-red-400 to-red-600"
          />
          <StatCard
            icon={<TrendingDown className="w-12 h-12" />}
            label="Rata-rata (Menit)"
            value={loading ? '-' : stats.averageMinutes}
            color="bg-gradient-to-br from-yellow-400 to-yellow-600"
          />
          <StatCard
            icon={<AlertCircle className="w-12 h-12" />}
            label="Terlambat Terberat"
            value={loading ? '-' : `${stats.longestLate}m`}
            color="bg-gradient-to-br from-red-500 to-pink-600"
          />
        </div>

        {/* Filter Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((cls: string) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Siswa</label>
            <select
              value={selectedStudent}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Siswa</option>
              {students.map((student: any) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <input
              type="month"
              value={selectedMonth.toISOString().split('T')[0].slice(0, 7)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const [year, month] = e.target.value.split('-')
                setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1))
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
            <p className="ml-3 text-gray-600">Loading data tardiness dari Walas...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && tardinessRecords.length === 0 && (
          <div className="mt-8 text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Tidak ada data keterlambatan</p>
          </div>
        )}

        {/* Records Table */}
        {!loading && tardinessRecords.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Nama Siswa</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Kelas</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Jam</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Durasi (Menit)</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Keterangan</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tardinessRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{record.studentName}</td>
                    <td className="px-6 py-4 text-gray-600">{record.className}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(record.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.time}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-orange-600">{record.minutesLate}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.reason || '-'}</td>
                    <td className="px-6 py-4">
                      <TardinessStatusBadge status={record.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDetailClick(record)}
                        className="text-orange-600 hover:text-orange-800 font-medium text-sm"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedTardiness && isModalOpen && (
        <TardinessDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTardiness(null)
          }}
          date={selectedTardiness.date}
          time={selectedTardiness.time}
          minutesLate={selectedTardiness.minutesLate}
          reason={selectedTardiness.reason}
          status={mapStatusToIndonesian(selectedTardiness.status)}
        />
      )}
    </div>
  )
}

export default KeterlambatanPage
