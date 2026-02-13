'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Calendar, Check, X, Clock, TrendingUp, Filter, AlertCircle } from 'lucide-react'
import AttendanceDetailModal from '../modals/AttendanceDetailModal'
import { getAttendanceRecords, syncAttendanceFromWalas, getAttendanceStatistics } from '@/lib/kehadiranAPI'
import { useAuth } from '../../../hooks/useAuth'

interface AttendanceRecord {
  id: number
  studentId: number
  studentName: string
  className: string
  date: string
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
  time?: string
  notes?: string
}

interface AttendanceStats {
  totalHadir: number
  totalSakit: number
  totalIzin: number
  totalAlpa: number
  attendancePercentage: number
}

const AttendanceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Hadir': { bg: 'bg-green-50', text: 'text-green-700', icon: <Check className="w-4 h-4" /> },
    'Sakit': { bg: 'bg-orange-50', text: 'text-orange-700', icon: <Clock className="w-4 h-4" /> },
    'Izin': { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Clock className="w-4 h-4" /> },
    'Alpa': { bg: 'bg-red-50', text: 'text-red-700', icon: <X className="w-4 h-4" /> },
  }

  const config = statusConfig[status] || statusConfig['Hadir']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
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

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to map status codes to full names
const mapStatusCode = (code: string): 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' => {
  const statusMap: Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'> = {
    'H': 'Hadir',
    'S': 'Sakit',
    'I': 'Izin',
    'A': 'Alpa',
  }
  return statusMap[code] || 'Hadir'
}

const KehadiranPage: React.FC = () => {
  const { token } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [selectedAttendance, setSelectedAttendance] = useState<{
    date: string
    status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
    time?: string
    notes?: string
  } | null>(null)

  // API State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    totalHadir: 0,
    totalSakit: 0,
    totalIzin: 0,
    totalAlpa: 0,
    attendancePercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        setError(null)
        const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
        const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
        
        const response = await getAttendanceRecords({
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          page: 1,
          limit: 1000,
        }, token)

        const attendanceData = response.data || []
        setAttendanceRecords(attendanceData)

        // Extract unique classes from records
        const uniqueClasses = Array.from(new Set(attendanceData?.map((r: AttendanceRecord) => r.className) || []))
        setClasses(uniqueClasses as string[])

        // Calculate stats
        const totalHadir = attendanceData?.filter((r: AttendanceRecord) => r.status === 'Hadir').length || 0
        const totalSakit = attendanceData?.filter((r: AttendanceRecord) => r.status === 'Sakit').length || 0
        const totalIzin = attendanceData?.filter((r: AttendanceRecord) => r.status === 'Izin').length || 0
        const totalAlpa = attendanceData?.filter((r: AttendanceRecord) => r.status === 'Alpa').length || 0
        const total = attendanceData?.length || 0

        setStats({
          totalHadir,
          totalSakit,
          totalIzin,
          totalAlpa,
          attendancePercentage: total > 0 ? Math.round((totalHadir / total) * 100) : 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch attendance data')
        console.error('Error fetching attendance:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [selectedMonth, token])

  // Handle sync from Walas
  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
      
      await syncAttendanceFromWalas(formatDate(startDate), formatDate(endDate), token)
      
      // Refresh data after sync
      const response = await getAttendanceRecords({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        page: 1,
        limit: 1000,
      }, token)
      
      const attendanceData = response.data || []
      setAttendanceRecords(attendanceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync attendance')
      console.error('Error syncing attendance:', err)
    } finally {
      setSyncing(false)
    }
  }

  // Filter records based on selected class and student
  const filteredRecords = useMemo(() => {
    let filtered = attendanceRecords

    if (selectedClass !== 'all') {
      filtered = filtered.filter((r: AttendanceRecord) => r.className === selectedClass)
    }

    if (selectedStudent !== 'all') {
      filtered = filtered.filter((r: AttendanceRecord) => r.studentId.toString() === selectedStudent)
    }

    return filtered.sort((a: AttendanceRecord, b: AttendanceRecord) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [attendanceRecords, selectedClass, selectedStudent])

  // Get unique students from filtered records by class
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return []
    const students = attendanceRecords.filter((r: AttendanceRecord) => r.className === selectedClass)
    const uniqueMap = new Map()
    students.forEach((s: AttendanceRecord) => {
      if (!uniqueMap.has(s.studentId)) {
        uniqueMap.set(s.studentId, { id: s.studentId, name: s.studentName, className: s.className })
      }
    })
    return Array.from(uniqueMap.values())
  }, [attendanceRecords, selectedClass])

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-2 text-blue-900 font-medium">Memuat data kehadiran...</p>
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

      {/* Main Content */}
      {!loading && !error && (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Kehadiran Kelas</h2>
              <p className="text-blue-50">Rekap kehadiran dan statistik kehadiran Anda</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <StatCard icon={<Check className="w-12 h-12" />} label="Hadir" value={stats.totalHadir} color="bg-gradient-to-br from-green-400 to-green-600" />
          <StatCard icon={<Clock className="w-12 h-12" />} label="Sakit" value={stats.totalSakit} color="bg-gradient-to-br from-orange-400 to-orange-600" />
          <StatCard icon={<Clock className="w-12 h-12" />} label="Izin" value={stats.totalIzin} color="bg-gradient-to-br from-blue-400 to-blue-600" />
          <StatCard icon={<X className="w-12 h-12" />} label="Alpa" value={stats.totalAlpa} color="bg-gradient-to-br from-red-400 to-red-600" />
          <StatCard
            icon={<TrendingUp className="w-12 h-12" />}
            label="Persentase"
            value={stats.attendancePercentage}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
          />
        </div>

        {/* Attendance Progress - simplified */}
        <section className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Target Kehadiran Bulanan</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Target: 95%</span>
                <span className="text-sm font-bold text-green-600">Tercapai: 95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Class Summary Section */}
        <section className="mt-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Rekapitulasi Kehadiran Per Kelas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((kls: string) => {
              const classRecords = attendanceRecords.filter((r: AttendanceRecord) => r.className === kls)
              const classHadir = classRecords.filter((r: AttendanceRecord) => r.status === 'Hadir').length
              const classSakit = classRecords.filter((r: AttendanceRecord) => r.status === 'Sakit').length
              const classIzin = classRecords.filter((r: AttendanceRecord) => r.status === 'Izin').length
              const classAlpa = classRecords.filter((r: AttendanceRecord) => r.status === 'Alpa').length
              const classTotal = classRecords.length
              const classPercentage = classTotal > 0 ? Math.round((classHadir / classTotal) * 100) : 0

              return (
                <div key={kls} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{kls}</h4>
                    <span className="text-2xl font-bold text-blue-600">{classPercentage}%</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">✓ Hadir</span>
                      <span className="font-semibold text-green-600">{classHadir}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">🤒 Sakit</span>
                      <span className="font-semibold text-orange-600">{classSakit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">📋 Izin</span>
                      <span className="font-semibold text-blue-600">{classIzin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">✗ Alpa</span>
                      <span className="font-semibold text-red-600">{classAlpa}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: `${classPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Attendance Records */}
        <section className="mt-6">
          <div className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Riwayat Kehadiran</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors disabled:cursor-not-allowed"
                  >
                    {syncing ? 'Sinkronisasi...' : 'Sinkronisasi dari Walas'}
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </button>
                </div>
              </div>

              {/* Filter Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Pilih Kelas
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value)
                      setSelectedStudent('all') // Reset student when class changes
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">Semua Kelas</option>
                    {classes.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Siswa</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">Semua Siswa</option>
                    {filteredStudents.map(student => (
                      <option key={student.id} value={student.id.toString()}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Info */}
              {(selectedClass !== 'all' || selectedStudent !== 'all') && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  📊 Menampilkan {filteredRecords.length} record kehadiran
                  {selectedClass !== 'all' && ` untuk kelas ${selectedClass}`}
                  {selectedStudent !== 'all' && ` siswa ${filteredStudents.find(s => s.id.toString() === selectedStudent)?.name}`}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Siswa / Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Waktu Masuk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr 
                        key={record.id}
                        onClick={() => {
                          setSelectedAttendance({
                            date: record.date,
                            status: record.status,
                            time: record.time,
                            notes: record.notes,
                          })
                          setIsModalOpen(true)
                        }}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          <div>{record.studentName}</div>
                          <div className="text-xs text-gray-500">{record.className}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <AttendanceStatusBadge status={record.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.time || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        <p className="font-medium">Tidak ada data kehadiran</p>
                        <p className="text-sm">Coba ubah filter untuk melihat data lainnya</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Info Box */}
        <section className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Informasi Kehadiran</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Kehadiran setiap hari dicatat otomatis oleh sistem</li>
              <li>• Jika Anda sakit atau izin, harap informasikan ke guru piket</li>
              <li>• Target kehadiran minimum adalah 95% per semester</li>
              <li>• Kehadiran berpengaruh pada nilai rapor akhir</li>
            </ul>
          </div>
        </section>
      </div>
      )}

      {/* Attendance Detail Modal (grouped, render only when open) */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          {selectedAttendance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <AttendanceDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                attendanceDate={selectedAttendance.date}
                status={selectedAttendance.status}
                time={selectedAttendance.time}
                notes={selectedAttendance.notes}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default KehadiranPage
